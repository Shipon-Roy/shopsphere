import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BrandModel } from "@/models/Brand";

// GET /api/brands — public list
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
    const search = searchParams.get("search") ?? "";

    const filter: Record<string, unknown> = { isActive: true };
    if (search) filter.name = { $regex: search, $options: "i" };

    const brands = await BrandModel.find(filter)
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, message: "OK", data: brands }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
