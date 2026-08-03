import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BannerModel } from "@/models/Banner";
import mongoose from "mongoose";

// GET /api/banners/[id] — public single banner
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }
    await connectDB();
    const banner = await BannerModel.findOne({ _id: id, isActive: true }).lean();
    if (!banner) {
      return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "OK", data: banner }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
