import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/stats/orders-chart?months=7
// Returns monthly order count and revenue for the last N months
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const months = Math.min(Number(searchParams.get("months") ?? 7), 24);

    const since = new Date();
    since.setMonth(since.getMonth() - months + 1);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const results = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const data = results.map((r) => ({
      month: MONTHS[(r._id.month as number) - 1],
      year: r._id.year,
      orders: r.orders,
      revenue: Math.round(r.revenue * 100) / 100,
    }));

    return NextResponse.json(
      { success: true, message: "OK", data },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
