import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/lib/ensureModels";
import { ProductModel } from "@/models/Product";
import { serializeProduct } from "@/lib/productSerializer";
import mongoose from "mongoose";

// GET /api/products/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 });
    }

    await connectDB();
    const product = await ProductModel.findById(id)
      .populate("category", "name slug")
      .populate("brand", "name slug");

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "OK", data: serializeProduct(product) }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
