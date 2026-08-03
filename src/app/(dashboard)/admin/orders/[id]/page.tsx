"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from "@/constants";
import type { IOrder, OrderStatus } from "@/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  pending: "warning", processing: "info", shipped: "default",
  delivered: "success", cancelled: "destructive",
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j) => { setOrder(j.data); setNewStatus(j.data?.orderStatus ?? ""); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || !order) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Order status updated");
      setOrder((prev) => prev ? { ...prev, orderStatus: newStatus as OrderStatus } : prev);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    </div>
  );
  if (error || !order) return <ErrorState title="Order not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${order.orderNumber}`}
        description={`Placed on ${new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[{ label: "Orders", href: "/admin/orders" }, { label: `#${order.orderNumber}` }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order items */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold">
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-sm shrink-0">{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
          </CardContent>
          <div className="px-6 py-4 space-y-2 border-t bg-muted/30">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{order.shippingFee === 0 ? "Free" : fmt(order.shippingFee)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{fmt(order.tax)}</span></div>
            <Separator />
            <div className="flex justify-between font-bold"><span>Total</span><span>{fmt(order.total)}</span></div>
          </div>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Order Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={STATUS_VARIANT[order.orderStatus] ?? "secondary"} className="w-full justify-center py-1">
                {ORDER_STATUS_CONFIG[order.orderStatus]?.label ?? order.orderStatus}
              </Badge>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full" size="sm" onClick={handleStatusUpdate} loading={updatingStatus} disabled={newStatus === order.orderStatus}>
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Payment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{PAYMENT_METHOD_CONFIG[order.paymentMethod]?.label ?? order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "destructive" : "warning"}>
                  {PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label ?? order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Customer</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.user?.name}</p>
              <p className="text-muted-foreground">{order.user?.email}</p>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Shipping Address</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              <p>{order.shippingAddress.country}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
