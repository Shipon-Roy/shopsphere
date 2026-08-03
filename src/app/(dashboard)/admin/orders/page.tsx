"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from "@/constants";
import type { IOrder, PaginatedResponse } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  pending: "warning", processing: "info", shipped: "default",
  delivered: "success", cancelled: "destructive",
};
const PAYMENT_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  pending: "warning", paid: "success", failed: "destructive", refunded: "info",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<IOrder>["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "__all__") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const json: PaginatedResponse<IOrder> = await res.json();
      setOrders(json.data ?? []);
      setPagination(json.pagination ?? null);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const columns: Column<IOrder>[] = [
    {
      key: "orderNumber",
      header: "Order",
      cell: (o) => (
        <div>
          <p className="font-medium">#{o.orderNumber}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (o) => (
        <div>
          <p className="font-medium text-sm truncate max-w-[140px]">{o.user?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{o.user?.email}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (o) => <span className="text-sm">{o.items.length} item{o.items.length !== 1 ? "s" : ""}</span>,
    },
    {
      key: "total",
      header: "Total",
      cell: (o) => <span className="font-semibold">{fmt(o.total)}</span>,
    },
    {
      key: "orderStatus",
      header: "Order Status",
      cell: (o) => (
        <Badge variant={STATUS_VARIANT[o.orderStatus] ?? "secondary"}>
          {ORDER_STATUS_CONFIG[o.orderStatus]?.label ?? o.orderStatus}
        </Badge>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      cell: (o) => (
        <Badge variant={PAYMENT_VARIANT[o.paymentStatus] ?? "secondary"}>
          {PAYMENT_STATUS_CONFIG[o.paymentStatus]?.label ?? o.paymentStatus}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-16",
      cell: (o) => (
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/admin/orders/${o._id}`} aria-label="View order"><Eye className="h-4 w-4" /></Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Orders" description="Manage customer orders" breadcrumbs={[{ label: "Orders" }]} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order # or customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} emptyTitle="No orders found" />
      {pagination && <Pagination pagination={pagination} className="mt-2" />}
    </div>
  );
}
