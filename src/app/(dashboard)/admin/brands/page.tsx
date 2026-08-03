"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { IBrand } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/brands?${params}`);
      const json = await res.json();
      setBrands(json.data ?? []);
    } catch {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/brands/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Brand deleted");
      setDeleteId(null);
      fetchBrands();
    } catch {
      toast.error("Failed to delete brand");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<IBrand>[] = [
    {
      key: "name",
      header: "Name",
      cell: (b) => <p className="font-medium">{b.name}</p>,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (b) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{b.slug}</code>,
    },
    {
      key: "description",
      header: "Description",
      cell: (b) => (
        <p className="text-sm text-muted-foreground truncate max-w-xs">{b.description || "—"}</p>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (b) => (
        <Badge variant={b.isActive ? "success" : "secondary"}>
          {b.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-20",
      cell: (b) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/admin/brands/${b._id}/edit`} aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
          </Button>
          <Button
            variant="ghost" size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(b._id)}
            aria-label="Delete"
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
        title="Brands"
        description="Manage product brands"
        breadcrumbs={[{ label: "Brands" }]}
        actions={
          <Button asChild>
            <Link href="/admin/brands/new"><Plus className="mr-2 h-4 w-4" /> Add Brand</Link>
          </Button>
        }
      />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search brands…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <DataTable columns={columns} data={brands} loading={loading} emptyTitle="No brands found" />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete brand?"
        description="This will permanently remove the brand."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
