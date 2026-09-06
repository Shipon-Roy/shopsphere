"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ArrowLeft, Tag, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ErrorState } from "@/components/shared/ErrorState";
import { cn } from "@/lib/utils";
import type { IProduct } from "@/types";

interface Props { id: string; }

// Image type returned by API (base64 url injected by serializeProduct)
interface ProductImage {
  url: string | null;
  contentType: string;
  originalName: string;
  size: number;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${i < Math.round(rating) ? "text-[#FFA41C]" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer">
        {rating.toFixed(1)} ({count.toLocaleString()} ratings)
      </span>
    </div>
  );
}

export function ProductDetailClient({ id }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j) => { setProduct(j.data); setActiveImg(0); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: qty }),
      });
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error();
      toast.success("Added to Cart!");
      window.dispatchEvent(new Event("cart:updated"));
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const buyNow = async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: qty }),
      });
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error();
      window.dispatchEvent(new Event("cart:updated"));
      router.push("/user/cart");
    } catch {
      toast.error("Failed to proceed");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return null;
  if (error || !product) return <ErrorState title="Product not found" description="This product doesn't exist or has been removed." />;

  // Cast images to the serialized shape
  const images = (product.images ?? []) as unknown as ProductImage[];
  const validImages = images.filter((img) => img.url);

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const pct = hasDiscount ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) : 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const categoryName = typeof product.category === "object" ? product.category.name : "Products";
  const categorySlug = typeof product.category === "object" ? product.category.slug : "";
  const brandName = typeof product.brand === "object" ? product.brand?.name : "";

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="mx-auto max-w-[1500px] px-4 py-4">
        {/* Breadcrumb */}
        <div className="mb-3">
          <Breadcrumb
            items={[
              { label: "Products", href: "/products" },
              { label: categoryName, href: `/products?category=${categorySlug}` },
              { label: product.name },
            ]}
          />
        </div>

        {/* Main product area */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── Image column ── */}
            <div className="lg:col-span-4 space-y-3">
              {/* Main image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center p-4">
                {validImages.length > 0 ? (
                  <img
                    src={validImages[activeImg]?.url ?? validImages[0].url!}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Tag className="h-24 w-24 text-gray-200" />
                )}
              </div>

              {/* Thumbnail strip — only shown when >1 image */}
              {validImages.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {validImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImg(idx)}
                      className={cn(
                        "w-14 h-14 rounded border-2 overflow-hidden bg-white flex-shrink-0 transition-all",
                        activeImg === idx
                          ? "border-primary shadow-sm"
                          : "border-gray-200 hover:border-gray-400"
                      )}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={img.url!}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain p-0.5"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Details column ── */}
            <div className="lg:col-span-5 space-y-4">
              {brandName && (
                <p className="text-sm text-[#007185]">Brand: <span className="hover:underline cursor-pointer">{brandName}</span></p>
              )}

              <h1 className="text-xl sm:text-2xl font-medium text-gray-900 leading-snug">
                {product.name}
              </h1>

              {product.ratings.count > 0 && (
                <StarRating rating={product.ratings.average} count={product.ratings.count} />
              )}

              <div className="border-t border-gray-200 pt-4" />

              {/* Price */}
              <div className="space-y-1">
                {hasDiscount && (
                  <p className="text-sm text-gray-500">
                    List Price: <span className="line-through">${product.comparePrice!.toFixed(2)}</span>
                    <span className="ml-2 text-[#CC0C39] font-medium">
                      Save {pct}% (${(product.comparePrice! - product.price).toFixed(2)})
                    </span>
                  </p>
                )}
                <div className="flex items-baseline gap-1">
                  {pct > 0 && <span className="text-sm text-[#B12704] align-super">-{pct}%</span>}
                  <span className="text-3xl font-medium text-[#B12704] ml-1">
                    <span className="text-base align-super">$</span>
                    {Math.floor(product.price)}
                    <span className="text-base">.{(product.price % 1 * 100).toFixed(0).padStart(2, "0")}</span>
                  </span>
                </div>
                {product.price >= 100 && (
                  <p className="text-sm text-[#007600]">FREE delivery on this order</p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4" />

              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About this item</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400">SKU: {product.sku}</p>
            </div>

            {/* ── Buy box ── */}
            <div className="lg:col-span-3">
              <div className="border border-gray-300 rounded-lg p-4 space-y-3 sticky top-20">
                <div className="text-2xl font-medium text-[#B12704]">
                  <span className="text-sm align-super">$</span>
                  {Math.floor(product.price)}
                  <span className="text-sm">.{(product.price % 1 * 100).toFixed(0).padStart(2, "0")}</span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Truck className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[#007600] font-medium">
                      {product.price >= 100 ? "FREE Delivery" : "Standard Delivery"}
                    </p>
                    <p className="text-gray-500 text-xs">Ships in 2-5 business days</p>
                  </div>
                </div>

                <div>
                  {isOutOfStock ? (
                    <p className="text-[#CC0C39] font-medium">Currently Unavailable</p>
                  ) : isLowStock ? (
                    <p className="text-[#CC0C39] font-medium text-sm">
                      Only {product.stock} left in stock — order soon
                    </p>
                  ) : (
                    <p className="text-[#007600] font-medium text-sm">In Stock</p>
                  )}
                </div>

                {!isOutOfStock && (
                  <>
                    <div className="flex items-center gap-0 border border-gray-300 rounded-lg overflow-hidden w-fit">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        className="flex h-8 w-8 items-center justify-center hover:bg-gray-100 transition-colors border-r border-gray-300 disabled:opacity-40"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="h-8 w-10 flex items-center justify-center text-sm font-medium">{qty}</span>
                      <button
                        onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                        disabled={qty >= product.stock}
                        className="flex h-8 w-8 items-center justify-center hover:bg-gray-100 transition-colors border-l border-gray-300 disabled:opacity-40"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={addToCart}
                      disabled={adding}
                      className="w-full bg-primary hover:bg-amber-500 text-gray-900 font-semibold py-2.5 rounded-full text-sm transition-colors border border-amber-600/30 disabled:opacity-60"
                    >
                      {adding ? "Adding…" : "Add to Cart"}
                    </button>

                    <button
                      onClick={buyNow}
                      disabled={adding}
                      className="w-full bg-[#FF9900] hover:bg-[#e88c00] text-gray-900 font-semibold py-2.5 rounded-full text-sm transition-colors border border-[#c45500] disabled:opacity-60"
                    >
                      Buy Now
                    </button>
                  </>
                )}

                <div className="pt-2 space-y-1.5 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#007600] shrink-0" />
                    Secure transaction
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <RefreshCw className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                    30-day easy returns
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-[#007185] hover:text-[#C7511F] hover:underline mt-4">
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Link>
      </div>
    </div>
  );
}
