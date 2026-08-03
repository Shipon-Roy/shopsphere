import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/lib/ensureModels";
import { OrderModel } from "@/models/Order";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_LIMIT } from "@/constants";
import type { PaginationMeta } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(Number(searchParams.get("limit") ?? DEFAULT_LIMIT), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const filter: Record<string, unknown> = {};
    if (status) filter.orderStatus = status;
    if (userId) filter.user = userId;

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };

    return NextResponse.json({ success: true, message: "OK", data: orders, pagination }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
