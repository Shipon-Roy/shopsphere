"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { StatsCard } from "@/components/cards/StatsCard";
import { OrderCard } from "@/components/cards/OrderCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS_CONFIG } from "@/constants";
import type { IOrder } from "@/types";

// ── Mock summary data (replace with real API) ────────────────────────────────
const REVENUE_DATA = [
  { month: "Jan", revenue: 4200, orders: 38 },
  { month: "Feb", revenue: 5800, orders: 52 },
  { month: "Mar", revenue: 7200, orders: 67 },
  { month: "Apr", revenue: 6100, orders: 55 },
  { month: "May", revenue: 8900, orders: 80 },
  { month: "Jun", revenue: 11200, orders: 98 },
  { month: "Jul", revenue: 9800, orders: 87 },
];

const TOP_PRODUCTS = [
  { name: "Wireless Headphones", sales: 142, revenue: 14158 },
  { name: "Smart Watch", sales: 98, revenue: 24402 },
  { name: "USB-C Hub", sales: 210, revenue: 8358 },
  { name: "Laptop Stand", sales: 176, revenue: 7036 },
  { name: "Mechanical Keyboard", sales: 63, revenue: 9387 },
];

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    fetch("/api/admin/dashboard/stats")
      .then((r) => r.json())
      .then((j) => setStats(j.data))
      .catch(() =>
        setStats({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 })
      )
      .finally(() => setLoadingStats(false));

    // Fetch recent orders
    fetch("/api/admin/orders?limit=5&page=1")
      .then((r) => r.json())
      .then((j) => setRecentOrders(j.data ?? []))
      .catch(() => setRecentOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back — here's what's happening in your store."
      />

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Revenue"
              value={fmt(stats?.totalRevenue ?? 0)}
              icon={DollarSign}
              trend={{ value: 12.5 }}
              iconColor="text-success"
              iconBg="bg-success/10"
            />
            <StatsCard
              title="Total Orders"
              value={stats?.totalOrders ?? 0}
              icon={ShoppingCart}
              trend={{ value: 8.2 }}
              iconColor="text-primary"
              iconBg="bg-primary/10"
            />
            <StatsCard
              title="Total Products"
              value={stats?.totalProducts ?? 0}
              icon={Package}
              trend={{ value: 3.1 }}
              iconColor="text-info"
              iconBg="bg-info/10"
            />
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              icon={Users}
              trend={{ value: 5.7 }}
              iconColor="text-warning"
              iconBg="bg-warning/10"
            />
          </>
        )}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Revenue Overview</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" /> Last 7 months
            </Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                  formatter={(v) => [fmt(typeof v === "number" ? v : Number(v) || 0), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by month */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Orders by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-primary hover:underline">
              View all
            </a>
          </div>
          {loadingOrders ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No orders yet.</p>
          ) : (
            recentOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                href={`/admin/orders/${order._id}`}
              />
            ))
          )}
        </div>

        {/* Top Products */}
        <div className="space-y-3">
          <h2 className="font-semibold">Top Products</h2>
          <Card>
            <CardContent className="p-0">
              {TOP_PRODUCTS.map((p, idx) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
                >
                  <span className="text-xs font-bold text-muted-foreground w-4">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sales} sales</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">
                    {fmt(p.revenue)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
