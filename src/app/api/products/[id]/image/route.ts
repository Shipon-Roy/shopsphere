import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import mongoose from "mongoose";

// GET /api/products/[id]/image — serve product image by product ID (first image, index 0)
// Supports ?index=N for multiple images
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const index = Math.max(0, Number(searchParams.get("index") ?? 0));

    await connectDB();
    const product = await ProductModel.findById(id).select("images").lean();

    if (!product || !product.images || product.images.length === 0) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const img = product.images[Math.min(index, product.images.length - 1)];
    if (!img?.data) {
      return new NextResponse("Image not found", { status: 404 });
    }

    return new NextResponse(img.data as unknown as Buffer, {
      status: 200,
      headers: {
        "Content-Type": img.contentType ?? "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
