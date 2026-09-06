import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/lib/ensureModels";
import { ProductModel } from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import mongoose from "mongoose";
import { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_TYPES, MAX_PRODUCT_IMAGES } from "@/constants";

// POST /api/admin/products/[id]/images — upload images (multipart/form-data)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 });
    }

    await connectDB();
    const product = await ProductModel.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "No images provided" }, { status: 400 });
    }

    // Check total image limit
    const remaining = MAX_PRODUCT_IMAGES - product.images.length;
    if (remaining <= 0) {
      return NextResponse.json(
        { success: false, message: `Maximum ${MAX_PRODUCT_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    const toUpload = files.slice(0, remaining);
    const errors: string[] = [];

    for (const file of toUpload) {
      // Validate type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        errors.push(`${file.name}: unsupported type (${file.type})`);
        continue;
      }

      // Validate size
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        errors.push(`${file.name}: exceeds 5MB limit`);
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      product.images.push({
        data: buffer,
        contentType: file.type,
        originalName: file.name,
        size: file.size,
      });
    }

    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: `${toUpload.length - errors.length} image(s) uploaded`,
        data: {
          imageCount: product.images.length,
          errors: errors.length > 0 ? errors : undefined,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    console.error("[POST /api/admin/products/[id]/images]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]/images?index=0 — remove a single image by index
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const index = Number(searchParams.get("index") ?? -1);

    await connectDB();
    const product = await ProductModel.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    if (index < 0 || index >= product.images.length) {
      return NextResponse.json({ success: false, message: "Invalid image index" }, { status: 400 });
    }

    product.images.splice(index, 1);
    await product.save();

    return NextResponse.json(
      { success: true, message: "Image deleted", data: { imageCount: product.images.length } },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
