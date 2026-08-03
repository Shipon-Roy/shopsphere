import Link from "next/link";
import { ShoppingCart, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IProduct } from "@/types";

interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function getDiscountPercent(price: number, comparePrice: number) {
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? getDiscountPercent(product.price, product.comparePrice!)
    : 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      {/* Image area */}
      <Link href={`/products/${product._id}`} className="block aspect-square overflow-hidden bg-muted">
        {product.images?.length > 0 ? (
          <img
            src={`/api/products/${product._id}/image`}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Tag className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs">
              -{discountPct}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="text-xs bg-amber-500 hover:bg-amber-500/80">
              Featured
            </Badge>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category */}
        {product.category && typeof product.category === "object" && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide truncate">
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <Link
          href={`/products/${product._id}`}
          className="font-semibold text-sm leading-snug line-clamp-2 hover:text-primary transition-colors"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product.ratings.count > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{product.ratings.average.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.ratings.count})</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.comparePrice!)}
              </span>
            )}
          </div>

          {isLowStock && !isOutOfStock && (
            <span className="text-xs text-warning font-medium">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Add to Cart */}
        {onAddToCart && (
          <Button
            size="sm"
            className="w-full mt-1"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product._id)}
          >
            <ShoppingCart className="mr-2 h-3.5 w-3.5" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        )}
      </div>
    </div>
  );
}
