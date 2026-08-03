"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import type { IProduct, PaginatedResponse } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<IProduct>["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/products?${params}`);
      const json: PaginatedResponse<IProduct> = await res.json();
      setProducts(json.data ?? []);
      setPagination(json.pagination ?? null);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Product deleted");
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const columns: Column<IProduct>[] = [
    {
      key: "name",
      header: "Product",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            {p.images?.length > 0 ? (
              <img src={`/api/images/${p._id}/0`} alt={p.name} className="h-full w-full object-cover rounded-lg" />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[200px]">{p.name}</p>
            <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (p) => (
        <span className="text-sm">
          {typeof p.category === "object" ? p.category.name : "—"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (p) => (
        <div>
          <p className="font-medium">{fmt(p.price)}</p>
          {p.comparePrice && (
            <p className="text-xs text-muted-foreground line-through">{fmt(p.comparePrice)}</p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (p) => (
        <Badge variant={p.stock === 0 ? "destructive" : p.stock <= 10 ? "warning" : "success"}>
          {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={p.isActive ? "success" : "secondary"}>
            {p.isActive ? "Active" : "Inactive"}
          </Badge>
          {p.isFeatured && <Badge variant="default" className="bg-amber-500">Featured</Badge>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-20",
      cell: (p) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/admin/products/${p._id}/edit`} aria-label="Edit product">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(p._id)}
            aria-label="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        breadcrumbs={[{ label: "Products" }]}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyTitle="No products found"
        emptyDescription="Add your first product to get started."
      />

      {pagination && (
        <Pagination
          pagination={pagination}
          className="mt-2"
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete product?"
        description="This action cannot be undone. The product will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
