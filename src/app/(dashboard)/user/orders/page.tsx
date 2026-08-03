"use client";

import { useEffect, useState, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { OrderCard } from "@/components/cards/OrderCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS_CONFIG } from "@/constants";
import type { IOrder, PaginatedResponse } from "@/types";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<IOrder>["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "8" });
      if (statusFilter !== "__all__") params.set("status", statusFilter);
      const res = await fetch(`/api/orders?${params}`);
      const json: PaginatedResponse<IOrder> = await res.json();
      setOrders(json.data ?? []);
      setPagination(json.pagination ?? null);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  return (
    <div className="space-y-4">
      <PageHeader title="My Orders" description="Track and manage your orders" />

      <div className="flex justify-end">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All orders</SelectItem>
            {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="When you place your first order, it will appear here."
          action={{ label: "Start Shopping", href: "/products" }}
        />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} href={`/user/orders/${order._id}`} />
            ))}
          </div>
          {pagination && <Pagination pagination={pagination} className="mt-4" />}
        </>
      )}
    </div>
  );
}
