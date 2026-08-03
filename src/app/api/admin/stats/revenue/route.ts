import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/stats/revenue?period=month|week|year
// Returns revenue breakdown for the given period vs previous period
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "month";

    const now = new Date();
    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    if (period === "week") {
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 7);
      previousStart = new Date(now);
      previousStart.setDate(now.getDate() - 14);
      previousEnd = new Date(currentStart);
    } else if (period === "year") {
      currentStart = new Date(now.getFullYear(), 0, 1);
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
    } else {
      // month (default)
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(currentStart);
    }

    const [current, previous] = await Promise.all([
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: currentStart, $lte: now },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
      ]),
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: previousStart, $lt: previousEnd },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const currentRevenue = current[0]?.revenue ?? 0;
    const previousRevenue = previous[0]?.revenue ?? 0;
    const change =
      previousRevenue === 0
        ? 100
        : Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100 * 10) / 10;

    return NextResponse.json(
      {
        success: true,
        message: "OK",
        data: {
          period,
          current: {
            revenue: Math.round(currentRevenue * 100) / 100,
            orders: current[0]?.orders ?? 0,
          },
          previous: {
            revenue: Math.round(previousRevenue * 100) / 100,
            orders: previous[0]?.orders ?? 0,
          },
          change,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
