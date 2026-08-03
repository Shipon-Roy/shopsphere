import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IOrder } from "@/types";
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from "@/constants";

interface OrderCardProps {
  order: IOrder;
  href?: string;
  className?: string;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "muted"> = {
  pending: "warning",
  processing: "info",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
};

const PAYMENT_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "muted"> = {
  pending: "warning",
  paid: "success",
  failed: "destructive",
  refunded: "info",
};

export function OrderCard({ order, href, className }: OrderCardProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus];
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];
  const linkHref = href ?? `/user/orders/${order._id}`;

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4">
        <Link href={linkHref} className="block">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">#{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[order.orderStatus] ?? "secondary"}>
              {statusConfig?.label ?? order.orderStatus}
            </Badge>
            <Badge variant={PAYMENT_VARIANT[order.paymentStatus] ?? "secondary"}>
              {paymentConfig?.label ?? order.paymentStatus}
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
            <span className="font-bold">{formatPrice(order.total)}</span>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
