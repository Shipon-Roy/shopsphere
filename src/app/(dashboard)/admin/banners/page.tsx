"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { IBanner } from "@/types";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners?limit=50");
      const json = await res.json();
      setBanners(json.data ?? []);
    } catch {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/banners/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Banner deleted");
      setDeleteId(null);
      fetchBanners();
    } catch {
      toast.error("Failed to delete banner");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<IBanner>[] = [
    {
      key: "order",
      header: "#",
      headerClassName: "w-12",
      cell: (b) => <span className="font-mono text-sm text-muted-foreground">{b.order}</span>,
    },
    {
      key: "title",
      header: "Banner",
      cell: (b) => (
        <div>
          <p className="font-medium">{b.title}</p>
          {b.subtitle && <p className="text-xs text-muted-foreground truncate max-w-xs">{b.subtitle}</p>}
        </div>
      ),
    },
    {
      key: "link",
      header: "Link",
      cell: (b) => b.link ? (
        <a href={b.link} target="_blank" rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1 max-w-[180px] truncate">
          <ExternalLink className="h-3 w-3 shrink-0" />
          {b.link}
        </a>
      ) : <span className="text-muted-foreground text-sm">—</span>,
    },
    {
      key: "buttonText",
      header: "Button",
      cell: (b) => <span className="text-sm">{b.buttonText || "—"}</span>,
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
            <Link href={`/admin/banners/${b._id}/edit`} aria-label="Edit banner">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost" size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(b._id)}
            aria-label="Delete banner"
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
        title="Banners"
        description="Manage homepage banners and promotions"
        breadcrumbs={[{ label: "Banners" }]}
        actions={
          <Button asChild>
            <Link href="/admin/banners/new"><Plus className="mr-2 h-4 w-4" /> Add Banner</Link>
          </Button>
        }
      />
      <DataTable columns={columns} data={banners} loading={loading} emptyTitle="No banners yet" emptyDescription="Create a banner to promote products on the homepage." />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete banner?"
        description="This banner will be permanently removed from the storefront."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
