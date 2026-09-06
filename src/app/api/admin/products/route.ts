import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/lib/ensureModels";
import { ProductModel } from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { serializeProduct } from "@/lib/productSerializer";
import { DEFAULT_LIMIT } from "@/constants";
import type { PaginationMeta } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(Number(searchParams.get("limit") ?? DEFAULT_LIMIT), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") ?? "";

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const [rawProducts, total] = await Promise.all([
      ProductModel.find(filter)
        .populate("category", "name slug")
        .populate("brand", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(filter),
    ]);

    const products = rawProducts.map(serializeProduct);

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };

    return NextResponse.json({ success: true, message: "OK", data: products, pagination }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    await connectDB();

    // Auto-generate a unique SKU if not provided or if it clashes
    if (!body.sku || body.sku.trim() === "") {
      const prefix = (body.name as string ?? "PROD")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 5);
      body.sku = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
    }

    // Check for duplicate SKU and append suffix if needed
    const existing = await ProductModel.findOne({ sku: body.sku });
    if (existing) {
      body.sku = `${body.sku}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    }

    const product = await ProductModel.create(body);
    return NextResponse.json({ success: true, message: "Product created", data: serializeProduct(product) }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    // Handle MongoDB duplicate key error specifically
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { success: false, message: "A product with this SKU already exists. Please use a different SKU." },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: (error as Error).message ?? "Internal server error" }, { status: 500 });
  }
}
