import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/lib/ensureModels";
import { ReviewModel } from "@/models/Review";
import { ProductModel } from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

function err(error: unknown): NextResponse {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    const { status } = await request.json();
    await connectDB();
    const review = await ReviewModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!review) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Review updated", data: review }, { status: 200 });
  } catch (e) { return err(e); }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    await connectDB();
    const review = await ReviewModel.findByIdAndDelete(id);
    if (!review) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    // Recalculate product rating
    const productId = review.product;
    const agg = await ReviewModel.aggregate([
      { $match: { product: productId, status: "approved" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await ProductModel.findByIdAndUpdate(productId, {
      "ratings.average": agg[0]?.avg ?? 0,
      "ratings.count": agg[0]?.count ?? 0,
    });

    return NextResponse.json({ success: true, message: "Review deleted" }, { status: 200 });
  } catch (e) { return err(e); }
}
