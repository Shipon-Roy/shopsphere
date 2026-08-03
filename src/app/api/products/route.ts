import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { CategoryModel } from "@/models/Category";
import { DEFAULT_LIMIT } from "@/constants";
import type { PaginationMeta } from "@/types";

// GET /api/products — public product list with filtering, sorting, pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(Number(searchParams.get("limit") ?? DEFAULT_LIMIT), 100);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const featured = searchParams.get("featured");
    const sortParam = searchParams.get("sort") ?? "createdAt:desc";

    // Build filter
    const filter: Record<string, unknown> = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      // Support slug or ObjectId
      const cat = await CategoryModel.findOne({ slug: category }).lean();
      if (cat) filter.category = cat._id;
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      filter.price = priceFilter;
    }

    if (featured === "true") filter.isFeatured = true;

    // Sort
    const [sortField, sortDir] = sortParam.split(":");
    const sort: Record<string, 1 | -1> = {};
    sort[sortField ?? "createdAt"] = sortDir === "asc" ? 1 : -1;

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .populate("category", "name slug")
        .populate("brand", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return NextResponse.json(
      { success: true, message: "OK", data: products, pagination },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
