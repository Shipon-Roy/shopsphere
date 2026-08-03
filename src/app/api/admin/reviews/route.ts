import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ReviewModel } from "@/models/Review";
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
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [reviews, total] = await Promise.all([
      ReviewModel.find(filter)
        .populate("user", "name email")
        .populate("product", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };

    return NextResponse.json({ success: true, message: "OK", data: reviews, pagination }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
