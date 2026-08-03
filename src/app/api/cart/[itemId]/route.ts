import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CartModel } from "@/models/Cart";
import { requireAuth } from "@/lib/auth";

// DELETE /api/cart/[itemId] — remove item from cart by productId
// PATCH  /api/cart/[itemId]  — update quantity for a cart item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { itemId } = await params;
    const { quantity } = await request.json();

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json({ success: false, message: "Invalid quantity" }, { status: 400 });
    }

    await connectDB();
    const cart = await CartModel.findOne({ user: authUser.userId });
    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    const idx = cart.items.findIndex((item) => item.product.toString() === itemId);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: "Item not in cart" }, { status: 404 });
    }

    if (quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    await cart.save();
    return NextResponse.json({ success: true, message: "Cart updated", data: cart }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { itemId } = await params;

    await connectDB();
    const cart = await CartModel.findOne({ user: authUser.userId });
    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    const before = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== itemId
    ) as typeof cart.items;

    if (cart.items.length === before) {
      return NextResponse.json({ success: false, message: "Item not found in cart" }, { status: 404 });
    }

    await cart.save();
    return NextResponse.json({ success: true, message: "Item removed from cart" }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
