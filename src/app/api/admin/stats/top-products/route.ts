import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/stats/top-products?limit=5
// Returns top selling products by units sold
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 5), 20);

    const results = await OrderModel.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: 1,
          sales: 1,
          revenue: { $round: ["$revenue", 2] },
        },
      },
    ]);

    return NextResponse.json(
      { success: true, message: "OK", data: results },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
