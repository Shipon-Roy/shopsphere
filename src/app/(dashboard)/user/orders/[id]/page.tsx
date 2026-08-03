"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from "@/constants";
import type { IOrder } from "@/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  pending: "warning", processing: "info", shipped: "default",
  delivered: "success", cancelled: "destructive",
};

export default function UserOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j) => setOrder(j.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
  if (error || !order) return <ErrorState title="Order not found" description="This order doesn't exist or you don't have access to it." />;

  const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus];
  const steps = ["pending", "processing", "shipped", "delivered"] as const;
  const currentStep = order.orderStatus === "cancelled" ? -1 : steps.indexOf(order.orderStatus);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${order.orderNumber}`}
        description={`Placed ${new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        breadcrumbs={[{ label: "My Orders", href: "/user/orders" }, { label: `#${order.orderNumber}` }]}
      />

      {/* Progress tracker */}
      {order.orderStatus !== "cancelled" && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => {
                const done = idx <= currentStep;
                const active = idx === currentStep;
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      } ${active ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                        {idx + 1}
                      </div>
                      <span className={`text-xs font-medium text-center ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                        {ORDER_STATUS_CONFIG[step]?.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-colors ${idx < currentStep ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {order.orderStatus === "cancelled" && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-2 text-sm text-destructive">
          <Package className="h-4 w-4 shrink-0" />
          This order has been cancelled.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Items */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Order Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground font-bold text-sm">
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {fmt(item.price)}</p>
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

        {/* Side info */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Badge variant={STATUS_VARIANT[order.orderStatus] ?? "secondary"} className="w-full justify-center py-1">
                {statusConfig?.label ?? order.orderStatus}
              </Badge>
              <p className="text-xs text-muted-foreground text-center">{statusConfig?.description}</p>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader><CardTitle className="text-sm">Shipping To</CardTitle></CardHeader>
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

      <Button variant="ghost" asChild className="w-fit">
        <Link href="/user/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to orders</Link>
      </Button>
    </div>
  );
}
