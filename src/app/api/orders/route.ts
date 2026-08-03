import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CartModel } from "@/models/Cart";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { requireAuth } from "@/lib/auth";
import { TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, DEFAULT_LIMIT } from "@/constants";
import type { PaginationMeta } from "@/types";
import mongoose from "mongoose";

// Shape of a populated cart item product (after Mongoose populate)
interface PopulatedProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
}

// GET /api/orders — current user's orders
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(Number(searchParams.get("limit") ?? DEFAULT_LIMIT), 50);
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = { user: authUser.userId };
    if (status) filter.orderStatus = status;

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page, limit, total, totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return NextResponse.json({ success: true, message: "OK", data: orders, pagination }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/orders — place order from cart
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const { shippingAddress, paymentMethod, notes } = await request.json();

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Shipping address and payment method are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Load cart with populated products
    const cart = await CartModel.findOne({ user: authUser.userId }).populate<{
      items: Array<{
        product: PopulatedProduct;
        quantity: number;
        price: number;
      }>;
    }>("items.product", "name price stock isActive _id");

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: "Your cart is empty" }, { status: 400 });
    }

    // Build order items and validate stock
    const orderItems: Array<{
      product: mongoose.Types.ObjectId;
      name: string;
      price: number;
      quantity: number;
    }> = [];

    for (const item of cart.items) {
      const product = item.product as PopulatedProduct;

      if (!product || !product._id) {
        return NextResponse.json({ success: false, message: "Product data missing" }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for "${product.name}"` },
          { status: 400 }
        );
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
      });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + shippingFee + tax) * 100) / 100;

    // Create the order
    const order = await OrderModel.create({
      user: authUser.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      subtotal,
      shippingFee,
      tax,
      total,
      notes,
    });

    // Decrement stock for each ordered product
    await Promise.all(
      orderItems.map((item) =>
        ProductModel.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    // Clear the cart
    cart.items = [] as typeof cart.items;
    await cart.save();

    const populated = await OrderModel.findById(order._id)
      .populate("user", "name email")
      .lean();

    return NextResponse.json(
      { success: true, message: "Order placed successfully", data: populated },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
