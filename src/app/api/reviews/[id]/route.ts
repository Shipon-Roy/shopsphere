import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ReviewModel } from "@/models/Review";
import { ProductModel } from "@/models/Product";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

// PATCH /api/reviews/[id] — user updates their own review
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    await connectDB();

    const review = await ReviewModel.findOneAndUpdate(
      { _id: id, user: authUser.userId },
      { ...body, status: "pending" }, // reset to pending on edit
      { new: true, runValidators: true }
    ).lean();

    if (!review)
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Review updated", data: review }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] — user deletes their own review
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

    await connectDB();
    const review = await ReviewModel.findOneAndDelete({ _id: id, user: authUser.userId });
    if (!review)
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });

    // Recalculate product rating after deletion
    const agg = await ReviewModel.aggregate([
      { $match: { product: review.product, status: "approved" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await ProductModel.findByIdAndUpdate(review.product, {
      "ratings.average": agg[0]?.avg ?? 0,
      "ratings.count": agg[0]?.count ?? 0,
    });

    return NextResponse.json({ success: true, message: "Review deleted" }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
