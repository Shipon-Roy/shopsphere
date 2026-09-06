"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/cards/ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { PRODUCT_SORT_OPTIONS } from "@/constants";
import type { IProduct, ICategory, PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

const PRICE_RANGES = [
  { label: "Under $25", min: "", max: "25" },
  { label: "$25 to $50", min: "25", max: "50" },
  { label: "$50 to $100", min: "50", max: "100" },
  { label: "$100 to $200", min: "100", max: "200" },
  { label: "$200 & Above", min: "200", max: "" },
];

const STAR_OPTIONS = [
  { label: "4★ & above", value: "4" },
  { label: "3★ & above", value: "3" },
  { label: "2★ & above", value: "2" },
];

export function ProductsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<IProduct>["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);

  const sort = searchParams.get("sort") ?? "createdAt:desc";
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const featured = searchParams.get("featured") ?? "";

  const setParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    value ? p.set(key, value) : p.delete(key);
    p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  }, [searchParams, pathname, router]);

  const clearAll = () => { setSearchInput(""); router.push(pathname); };

  // Sync debounced search
  useEffect(() => {
    const curr = searchParams.get("search") ?? "";
    if (debouncedSearch !== curr) setParam("search", debouncedSearch);
  }, [debouncedSearch]); // eslint-disable-line

  // Fetch products
  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?${searchParams.toString()}`)
      .then((r) => r.json())
      .then((j: PaginatedResponse<IProduct>) => {
        setProducts(j.data ?? []);
        setPagination(j.pagination ?? null);
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories?limit=50")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
      .catch(() => {});
  }, []);

  const addToCart = async (productId: string) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (res.status === 401) { router.push("/login"); return; }
    if (!res.ok) { toast.error("Failed to add to cart"); return; }
    toast.success("Added to cart!");
    window.dispatchEvent(new Event("cart:updated"));
  };

  const hasFilters = !!(category || minPrice || maxPrice || featured || searchParams.get("search"));
  const total = pagination?.total ?? products.length;

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="w-full lg:w-60 shrink-0 space-y-1">
      {/* Department */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b">Department</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam("category", "")}
              className={cn("text-sm w-full text-left px-1 py-0.5 hover:text-[#C7511F] transition-colors",
                !category ? "font-bold text-[#C7511F]" : "text-[#007185]")}
            >
              All Departments
            </button>
          </li>
          {categories.map((c) => (
            <li key={c._id}>
              <button
                onClick={() => setParam("category", c.slug === category ? "" : c.slug)}
                className={cn("text-sm w-full text-left px-1 py-0.5 hover:text-[#C7511F] transition-colors",
                  category === c.slug ? "font-bold text-[#C7511F]" : "text-[#007185]")}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b">Price</h3>
        <ul className="space-y-1">
          {PRICE_RANGES.map((r) => {
            const active = minPrice === r.min && maxPrice === r.max;
            return (
              <li key={r.label}>
                <button
                  onClick={() => { setParam("minPrice", active ? "" : r.min); setParam("maxPrice", active ? "" : r.max); }}
                  className={cn("text-sm w-full text-left px-1 py-0.5 hover:text-[#C7511F] transition-colors",
                    active ? "font-bold text-[#C7511F]" : "text-[#007185]")}
                >
                  {r.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Featured */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b">Special Offers</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured === "true"}
            onChange={(e) => setParam("featured", e.target.checked ? "true" : "")}
            className="accent-primary w-4 h-4"
          />
          <span className="text-sm text-gray-700">Featured products</span>
        </label>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="w-full text-sm text-[#C7511F] hover:underline py-1 text-left px-4"
        >
          ✕ Clear all filters
        </button>
      )}
    </aside>
  );

  return (
    <div>
      {/* ── Search + Sort bar ── */}
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mb-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* Search */}
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-gray-600 shrink-0 hidden sm:block">
              {total.toLocaleString()} result{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-gray-600 hidden sm:block">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary bg-white"
          >
            {PRODUCT_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-3">
          {searchParams.get("search") && (
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded-full">
              Search: {searchParams.get("search")}
              <button onClick={() => { setSearchInput(""); setParam("search", ""); }}><X className="h-3 w-3" /></button>
            </span>
          )}
          {category && categories.find(c => c.slug === category) && (
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded-full">
              {categories.find(c => c.slug === category)?.name}
              <button onClick={() => setParam("category", "")}><X className="h-3 w-3" /></button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded-full">
              {minPrice && maxPrice ? `$${minPrice}–$${maxPrice}` : minPrice ? `Over $${minPrice}` : `Under $${maxPrice}`}
              <button onClick={() => { setParam("minPrice", ""); setParam("maxPrice", ""); }}><X className="h-3 w-3" /></button>
            </span>
          )}
          {featured && (
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded-full">
              Featured
              <button onClick={() => setParam("featured", "")}><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* ── Mobile filters drawer ── */}
      {mobileFiltersOpen && (
        <div className="lg:hidden mb-3">
          <Sidebar />
        </div>
      )}

      <div className="flex gap-3 items-start">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse border border-gray-200">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-5 bg-gray-200 rounded w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200">
              <EmptyState
                title="No results found"
                description="Try adjusting your search or filter to find what you're looking for."
                action={{ label: "Clear all filters", onClick: clearAll }}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
                ))}
              </div>
              {pagination && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                  <Pagination pagination={pagination} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
