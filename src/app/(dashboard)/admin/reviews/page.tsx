"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, EyeOff, Trash2, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { REVIEW_STATUS_CONFIG } from "@/constants";
import type { IReview, PaginatedResponse } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

const STATUS_VARIANT: Record<string, "warning" | "success" | "muted"> = {
  pending: "warning", approved: "success", hidden: "muted",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<IReview>["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "__all__") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/reviews?${params}`);
      const json: PaginatedResponse<IReview> = await res.json();
      setReviews(json.data ?? []);
      setPagination(json.pagination ?? null);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const updateStatus = async (id: string, status: "approved" | "hidden") => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Review deleted");
      setDeleteId(null);
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<IReview>[] = [
    {
      key: "user",
      header: "Customer",
      cell: (r) => (
        <div>
          <p className="font-medium text-sm">{r.user.name}</p>
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} aria-hidden="true" />
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "review",
      header: "Review",
      cell: (r) => (
        <div className="max-w-xs">
          {r.title && <p className="font-medium text-sm truncate">{r.title}</p>}
          <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Badge variant={STATUS_VARIANT[r.status] ?? "secondary"}>
          {REVIEW_STATUS_CONFIG[r.status]?.label ?? r.status}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => (
        <span className="text-sm text-muted-foreground">
          {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-28",
      cell: (r) => (
        <div className="flex items-center gap-1 justify-end">
          {r.status !== "approved" && (
            <Button
              variant="ghost" size="icon-sm"
              className="text-success hover:text-success"
              onClick={() => updateStatus(r._id, "approved")}
              aria-label="Approve review"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {r.status !== "hidden" && (
            <Button
              variant="ghost" size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => updateStatus(r._id, "hidden")}
              aria-label="Hide review"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost" size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(r._id)}
            aria-label="Delete review"
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
        title="Reviews"
        description="Moderate customer product reviews"
        breadcrumbs={[{ label: "Reviews" }]}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by customer or review…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {Object.entries(REVIEW_STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={reviews} loading={loading} emptyTitle="No reviews found" />
      {pagination && <Pagination pagination={pagination} className="mt-2" />}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete review?"
        description="This review will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
