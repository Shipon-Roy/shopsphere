import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BrandModel } from "@/models/Brand";
import mongoose from "mongoose";

// GET /api/brands/[id] — public single brand
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

    await connectDB();
    const brand = await BrandModel.findOne({ _id: id, isActive: true }).lean();
    if (!brand)
      return NextResponse.json({ success: false, message: "Brand not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "OK", data: brand }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
