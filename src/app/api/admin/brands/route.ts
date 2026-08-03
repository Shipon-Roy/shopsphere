import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BrandModel } from "@/models/Brand";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
    const filter: Record<string, unknown> = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    const brands = await BrandModel.find(filter).sort({ name: 1 }).limit(limit).lean();
    return NextResponse.json({ success: true, message: "OK", data: brands }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    await connectDB();
    const brand = await BrandModel.create(body);
    return NextResponse.json({ success: true, message: "Brand created", data: brand }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: (error as Error).message ?? "Internal server error" }, { status: 500 });
  }
}
