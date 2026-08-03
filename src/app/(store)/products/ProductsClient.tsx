"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/cards/ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { PRODUCT_SORT_OPTIONS } from "@/constants";
import type { IProduct, ICategory, PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

export function ProductsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [pagination, setPagination] = useState<null | {
    page: number; limit: number; total: number; totalPages: number;
    hasNextPage: boolean; hasPrevPage: boolean;
  }>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);

  // Derived filter state from URL
  const page = Number(searchParams.get("page") ?? 1);
  const sort = searchParams.get("sort") ?? "createdAt:desc";
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const featured = searchParams.get("featured") ?? "";

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset page on filter change
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const clearFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const hasActiveFilters = !!(category || minPrice || maxPrice || featured || searchParams.get("search"));

  // Sync debounced search to URL
  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debouncedSearch !== current) {
      updateParam("search", debouncedSearch);
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const json: PaginatedResponse<IProduct> = await res.json();
        setProducts(json.data ?? []);
        setPagination(json.pagination);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories?limit=50")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
      .catch(() => {/* silent */});
  }, []);

  const addToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error();
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
            aria-label="Search products"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(hasActiveFilters && "border-primary text-primary")}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                !
              </Badge>
            )}
            <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", filtersOpen && "rotate-180")} />
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} aria-label="Clear all filters">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {filtersOpen && (
        <div className="rounded-xl border bg-card p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Category
            </label>
            <Select value={category} onValueChange={(v) => updateParam("category", v === "__all__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Min Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Min Price ($)
            </label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={minPrice}
              onChange={(e) => updateParam("minPrice", e.target.value)}
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Max Price ($)
            </label>
            <Input
              type="number"
              min={0}
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => updateParam("maxPrice", e.target.value)}
            />
          </div>

          {/* Featured */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Show
            </label>
            <Select value={featured || "__all__"} onValueChange={(v) => updateParam("featured", v === "__all__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All products</SelectItem>
                <SelectItem value="true">Featured only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* ── Active filter chips ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchParams.get("search") && (
            <Badge variant="secondary" className="gap-1.5">
              Search: {searchParams.get("search")}
              <button onClick={() => { setSearchInput(""); updateParam("search", ""); }} aria-label="Remove search filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="gap-1.5">
              Category: {categories.find(c => c.slug === category)?.name ?? category}
              <button onClick={() => updateParam("category", "")} aria-label="Remove category filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {minPrice && (
            <Badge variant="secondary" className="gap-1.5">
              Min: ${minPrice}
              <button onClick={() => updateParam("minPrice", "")} aria-label="Remove min price filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {maxPrice && (
            <Badge variant="secondary" className="gap-1.5">
              Max: ${maxPrice}
              <button onClick={() => updateParam("maxPrice", "")} aria-label="Remove max price filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {featured && (
            <Badge variant="secondary" className="gap-1.5">
              Featured only
              <button onClick={() => updateParam("featured", "")} aria-label="Remove featured filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={{ label: "Clear filters", onClick: clearFilters }}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {pagination?.total ?? products.length} product{(pagination?.total ?? products.length) !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
          {pagination && (
            <Pagination pagination={pagination} className="mt-4" />
          )}
        </>
      )}
    </div>
  );
}
