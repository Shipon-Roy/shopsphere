import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import mongoose from "mongoose";

// GET /api/categories/[id] — public single category
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

    await connectDB();
    const category = await CategoryModel.findOne({ _id: id, isActive: true }).lean();
    if (!category)
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "OK", data: category }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
