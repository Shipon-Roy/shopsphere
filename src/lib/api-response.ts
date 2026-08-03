// ─────────────────────────────────────────────────────────────────────────────
// Standardized API Response Helpers
// All API routes must use these to return consistent JSON shapes.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { ApiResponse, PaginatedResponse, PaginationMeta } from "@/types";

/**
 * Return a successful JSON response
 */
export function successResponse<T>(
  data: T,
  message = "Success",
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

/**
 * Return a paginated JSON response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message = "Success"
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    { success: true, message, data, pagination },
    { status: 200 }
  );
}

/**
 * Return an error JSON response
 */
export function errorResponse(
  message: string,
  status = 500,
  error?: string
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: error ?? message,
    },
    { status }
  );
}

/**
 * Build pagination meta from query params and total count
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Parse and sanitize pagination query params from a URL
 */
export function parsePaginationParams(url: string): {
  page: number;
  limit: number;
  skip: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
} {
  const { searchParams } = new URL(url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10))
  );
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

  return { page, limit, skip, search, sortBy, sortOrder };
}
