"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart, Users, Package, DollarSign, TrendingUp, AlertTriangle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { StatsCard } from "@/components/cards/StatsCard";
import { OrderCard } from "@/components/cards/OrderCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { IOrder } from "@/types";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

interface ChartPoint { month: string; revenue: number; orders: number; }
interface TopProduct { name: string; sales: number; revenue: number; }
interface LowStockProduct { _id: string; name: string; sku: string; stock: number; }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, chartRes, topRes, lowRes, ordersRes] = await Promise.allSettled([
          fetch("/api/admin/dashboard/stats").then((r) => r.json()),
          fetch("/api/admin/stats/orders-chart?months=7").then((r) => r.json()),
          fetch("/api/admin/stats/top-products?limit=5").then((r) => r.json()),
          fetch("/api/admin/stats/low-stock?limit=5").then((r) => r.json()),
          fetch("/api/admin/orders?limit=5&page=1").then((r) => r.json()),
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
        if (chartRes.status === "fulfilled") setChartData(chartRes.value.data ?? []);
        if (topRes.status === "fulfilled") setTopProducts(topRes.value.data ?? []);
        if (lowRes.status === "fulfilled") setLowStock(lowRes.value.data ?? []);
        if (ordersRes.status === "fulfilled") setRecentOrders(ordersRes.value.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
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
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Revenue"
              value={fmt(stats?.totalRevenue ?? 0)}
              icon={DollarSign}
              iconColor="text-success"
              iconBg="bg-success/10"
            />
            <StatsCard
              title="Total Orders"
              value={stats?.totalOrders ?? 0}
              icon={ShoppingCart}
              iconColor="text-primary"
              iconBg="bg-primary/10"
            />
            <StatsCard
              title="Total Products"
              value={stats?.totalProducts ?? 0}
              icon={Package}
              iconColor="text-info"
              iconBg="bg-info/10"
            />
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              icon={Users}
              iconColor="text-warning"
              iconBg="bg-warning/10"
            />
          </>
        )}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue + Orders chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Revenue Overview</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" /> Last 7 months
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
            )}
          </CardContent>
        </Card>

        {/* Orders by month bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Orders by Month</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Recent Orders */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-primary hover:underline">View all</a>
          </div>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No orders yet.</p>
          ) : (
            recentOrders.map((order) => (
              <OrderCard key={order._id} order={order} href={`/admin/orders/${order._id}`} />
            ))
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Top Products</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">No sales data yet.</p>
              ) : (
                topProducts.map((p, idx) => (
                  <div key={p.name} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
                    <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sales} sold</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{fmt(p.revenue)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <CardTitle className="text-sm">Low Stock</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">All products are well-stocked.</p>
              ) : (
                lowStock.map((p) => (
                  <div key={p._id} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku}</p>
                    </div>
                    <Badge variant={p.stock === 0 ? "destructive" : "warning"} className="shrink-0 ml-2">
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
