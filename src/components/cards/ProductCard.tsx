import Link from "next/link";
import { ShoppingCart, Star, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IProduct } from "@/types";

interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

function fmt(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

function discountPct(price: number, comparePrice: number) {
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

function StarRating({ average, count }: { average: number; count: number }) {
  const full = Math.floor(average);
  const half = average % 1 >= 0.5;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" aria-label={`${average} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={cn("h-3.5 w-3.5", i < full ? "text-[#FFA41C]" : i === full && half ? "text-[#FFA41C]" : "text-gray-300")} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[11px] text-[#007185]">{count.toLocaleString()}</span>
    </div>
  );
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const pct = hasDiscount ? discountPct(product.price, product.comparePrice!) : 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div className={cn(
      "group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col",
      className
    )}>
      {/* Image */}
      <Link href={`/products/${product._id}`} className="relative block bg-white overflow-hidden border-b border-gray-100">
        <div className="aspect-square flex items-center justify-center p-4">
          {product.images?.length > 0 && (product.images[0] as unknown as { url?: string }).url ? (
            <img
              src={(product.images[0] as unknown as { url: string }).url}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <Tag className="h-16 w-16 text-gray-200" />
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && pct >= 10 && (
            <span className="deal-badge">-{pct}%</span>
          )}
          {product.isFeatured && (
            <span className="bg-[#007185] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              #1 Pick
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-500">Currently unavailable</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        {/* Sponsored / category */}
        {product.category && typeof product.category === "object" && (
          <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1 truncate">
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <Link
          href={`/products/${product._id}`}
          className="text-sm text-gray-900 hover:text-[#C7511F] leading-snug line-clamp-2 mb-2 transition-colors flex-1"
        >
          {product.name}
        </Link>

        {/* Brand */}
        {product.brand && typeof product.brand === "object" && (
          <p className="text-xs text-[#007185] mb-1">by {product.brand.name}</p>
        )}

        {/* Rating */}
        {product.ratings.count > 0 && (
          <div className="mb-2">
            <StarRating average={product.ratings.average} count={product.ratings.count} />
          </div>
        )}

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {hasDiscount && (
              <span className="text-xs text-gray-500">
                <span className="text-[10px] align-super">$</span>
                <span className="line-through">{(product.comparePrice!).toFixed(2)}</span>
              </span>
            )}
            <span className="text-sm text-gray-500">{hasDiscount ? `Save ${pct}%` : ""}</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-medium text-[#B12704]">
              <span className="text-sm align-super">$</span>
              {Math.floor(product.price)}
              <span className="text-sm">.{(product.price % 1 * 100).toFixed(0).padStart(2, "0")}</span>
            </span>
          </div>

          {/* Delivery */}
          {!isOutOfStock && (
            <p className="text-[11px] text-[#007600] mt-0.5">
              {product.price >= 100 ? "FREE delivery" : "Eligible for delivery"}
            </p>
          )}

          {/* Low stock */}
          {isLowStock && (
            <p className="text-[11px] text-[#CC0C39] font-medium mt-0.5">
              Only {product.stock} left in stock
            </p>
          )}

          {/* Add to cart */}
          {onAddToCart && !isOutOfStock && (
            <button
              onClick={() => onAddToCart(product._id)}
              className="w-full mt-2 bg-primary hover:bg-amber-500 text-gray-900 font-semibold text-xs py-2 rounded-full transition-colors flex items-center justify-center gap-1.5 border border-amber-600/30"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </button>
          )}
          {isOutOfStock && (
            <Link
              href={`/products/${product._id}`}
              className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-xs py-2 rounded-full transition-colors flex items-center justify-center gap-1.5 border border-gray-300"
            >
              See alternatives
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
