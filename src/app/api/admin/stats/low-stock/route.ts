import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/lib/ensureModels";
import { ProductModel } from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { LOW_STOCK_THRESHOLD } from "@/constants";

// GET /api/admin/stats/low-stock?limit=10
// Returns products with stock at or below LOW_STOCK_THRESHOLD
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
    const threshold = Number(searchParams.get("threshold") ?? LOW_STOCK_THRESHOLD);

    const products = await ProductModel.find({
      stock: { $lte: threshold },
      isActive: true,
    })
      .select("name sku stock price category")
      .populate("category", "name")
      .sort({ stock: 1 })
      .limit(limit)
      .lean();

    return NextResponse.json(
      { success: true, message: "OK", data: products },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
