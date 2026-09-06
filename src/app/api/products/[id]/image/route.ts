import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import mongoose from "mongoose";

// GET /api/products/[id]/image?index=0
// Returns product image stored as Buffer in MongoDB.
// Uses web-standard Blob → Response to avoid Next.js buffer serialization issues.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response("Invalid ID", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const index = Math.max(0, Number(searchParams.get("index") ?? 0));

    await connectDB();

    // Use lean with explicit projection to get the actual Buffer data
    // Note: lean() bypasses toJSON transforms, so we get the raw MongoDB data
    const product = await ProductModel.findById(id).select("images");

    if (!product || !product.images || product.images.length === 0) {
      return new Response("Image not found", { status: 404 });
    }

    const safeIndex = Math.min(index, product.images.length - 1);
    const img = product.images[safeIndex];

    if (!img || !img.data) {
      return new Response("Image not found", { status: 404 });
    }

    // img.data is a Node.js Buffer — copy to a fresh ArrayBuffer to satisfy Blob's strict typing
    const rawBuf = img.data as unknown as Buffer;
    // Buffer.from creates a new Buffer with its own ArrayBuffer (no SharedArrayBuffer)
    const safeBuf = Buffer.from(rawBuf);
    const contentType = img.contentType || "image/jpeg";
    const blob = new Blob([safeBuf.buffer as ArrayBuffer], { type: contentType });

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[GET /api/products/[id]/image]", err);
    return new Response("Internal server error", { status: 500 });
  }
}
