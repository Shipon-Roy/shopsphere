"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { ShieldOff, ShieldCheck, Mail, Calendar, Package } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { OrderCard } from "@/components/cards/OrderCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IUser, IOrder } from "@/types";

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<IUser | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users/${id}`).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`/api/admin/orders?userId=${id}&limit=5`).then((r) => r.json()),
    ])
      .then(([userJson, ordersJson]) => {
        setUser(userJson.data);
        setOrders(ordersJson.data ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleBlock = async () => {
    if (!user) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !user.isBlocked }),
      });
      if (!res.ok) throw new Error();
      setUser((prev) => prev ? { ...prev, isBlocked: !prev.isBlocked } : prev);
      toast.success(user.isBlocked ? "User unblocked" : "User blocked");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
  if (error || !user) return <ErrorState title="User not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        description={user.email}
        breadcrumbs={[{ label: "Users", href: "/admin/users" }, { label: user.name }]}
        actions={
          <Button
            variant={user.isBlocked ? "outline" : "destructive"}
            size="sm"
            onClick={toggleBlock}
            loading={toggling}
          >
            {user.isBlocked ? (
              <><ShieldCheck className="mr-2 h-4 w-4" /> Unblock</>
            ) : (
              <><ShieldOff className="mr-2 h-4 w-4" /> Block</>
            )}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User info */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{user.name}</p>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-0.5">
                  {user.role}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm pt-2 border-t">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />{user.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user.isBlocked ? "destructive" : "success"}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent orders */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <OrderCard key={order._id} order={order} href={`/admin/orders/${order._id}`} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
