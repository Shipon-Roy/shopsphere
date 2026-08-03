import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CartModel } from "@/models/Cart";
import { ProductModel } from "@/models/Product";
import { requireAuth } from "@/lib/auth";

// GET /api/cart — get user's cart
export async function GET() {
  try {
    const authUser = await requireAuth();
    await connectDB();

    const cart = await CartModel.findOne({ user: authUser.userId })
      .populate("items.product", "name price stock slug images sku")
      .lean();

    return NextResponse.json(
      { success: true, message: "OK", data: cart ?? { user: authUser.userId, items: [] } },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/cart — add item (or increase quantity)
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const { productId, quantity = 1 } = await request.json();

    if (!productId || quantity < 1) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
    }

    await connectDB();

    const product = await ProductModel.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    if (product.stock < quantity) {
      return NextResponse.json({ success: false, message: "Insufficient stock" }, { status: 400 });
    }

    let cart = await CartModel.findOne({ user: authUser.userId });
    if (!cart) {
      cart = await CartModel.create({
        user: authUser.userId,
        items: [{ product: productId, quantity, price: product.price }],
      });
    } else {
      const existingIdx = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (existingIdx >= 0) {
        const newQty = cart.items[existingIdx].quantity + quantity;
        if (newQty > product.stock) {
          return NextResponse.json({ success: false, message: "Insufficient stock" }, { status: 400 });
        }
        cart.items[existingIdx].quantity = newQty;
        cart.items[existingIdx].price = product.price;
      } else {
        cart.items.push({ product: product._id, quantity, price: product.price });
      }
      await cart.save();
    }

    return NextResponse.json({ success: true, message: "Added to cart", data: cart }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/cart — update item quantity
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const { productId, quantity } = await request.json();

    if (!productId || typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
    }

    await connectDB();

    const cart = await CartModel.findOne({ user: authUser.userId });
    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    const idx = cart.items.findIndex((item) => item.product.toString() === productId);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: "Item not in cart" }, { status: 404 });
    }

    if (quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      const product = await ProductModel.findById(productId);
      if (product && quantity > product.stock) {
        return NextResponse.json({ success: false, message: "Insufficient stock" }, { status: 400 });
      }
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
