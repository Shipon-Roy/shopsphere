import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/lib/ensureModels";
import { OrderModel } from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

// GET /api/orders/[id] — user's own order detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid order ID" }, { status: 400 });
    }

    await connectDB();
    const order = await OrderModel.findOne({ _id: id, user: authUser.userId })
      .populate("user", "name email")
      .lean();

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "OK", data: order }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
