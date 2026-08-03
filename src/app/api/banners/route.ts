import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BannerModel } from "@/models/Banner";

// GET /api/banners — public active banners
export async function GET() {
  try {
    await connectDB();
    const banners = await BannerModel.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    return NextResponse.json({ success: true, message: "OK", data: banners }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
