import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BannerModel } from "@/models/Banner";
import { requireAdmin } from "@/lib/auth";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

function err(error: unknown): NextResponse {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    await connectDB();
    const item = await BannerModel.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "OK", data: item }, { status: 200 });
  } catch (e) { return err(e); }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    const body = await request.json();
    await connectDB();
    const item = await BannerModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Banner updated", data: item }, { status: 200 });
  } catch (e) { return err(e); }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    await connectDB();
    const item = await BannerModel.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Banner deleted" }, { status: 200 });
  } catch (e) { return err(e); }
}
