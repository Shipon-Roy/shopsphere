import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/lib/ensureModels";
import { ReviewModel } from "@/models/Review";
import { ProductModel } from "@/models/Product";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import mongoose from "mongoose";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

// GET /api/reviews?productId=xxx  — public list of approved reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Valid productId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const reviews = await ReviewModel.find({
      product: productId,
      status: "approved",
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, message: "OK", data: reviews },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/reviews — authenticated user creates a review
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid input";
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }

    const { productId, rating, title, comment } = parsed.data;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Confirm product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check for existing review (one per user per product)
    const existing = await ReviewModel.findOne({
      user: authUser.userId,
      product: productId,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    const review = await ReviewModel.create({
      user: authUser.userId,
      product: productId,
      rating,
      title,
      comment,
      status: "pending", // requires admin approval
    });

    const populated = await ReviewModel.findById(review._id)
      .populate("user", "name")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted and pending approval",
        data: populated,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
