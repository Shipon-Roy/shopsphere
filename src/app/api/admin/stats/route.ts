import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { ProductModel } from "@/models/Product";
import { OrderModel } from "@/models/Order";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [totalUsers, totalProducts, orderAgg] = await Promise.all([
      UserModel.countDocuments(),
      ProductModel.countDocuments({ isActive: true }),
      OrderModel.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders: orderAgg[0]?.totalOrders ?? 0,
      totalRevenue: orderAgg[0]?.totalRevenue ?? 0,
    };

    return NextResponse.json({ success: true, message: "OK", data: stats }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
