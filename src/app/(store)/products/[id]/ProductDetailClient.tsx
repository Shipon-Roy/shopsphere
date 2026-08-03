"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Star, Tag, Minus, Plus, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ErrorState } from "@/components/shared/ErrorState";
import type { IProduct } from "@/types";

interface Props { id: string; }

export function ProductDetailClient({ id }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((j) => setProduct(j.data))
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
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return null; // Suspense handles skeleton
  if (error || !product) {
    return <ErrorState title="Product not found" description="This product doesn't exist or has been removed." />;
  }

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;
  const isOutOfStock = product.stock === 0;
  const categoryName = typeof product.category === "object" ? product.category.name : "Products";
  const categorySlug = typeof product.category === "object" ? product.category.slug : "";

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Products", href: "/products" },
          { label: categoryName, href: `/products?category=${categorySlug}` },
          { label: product.name },
        ]}
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Image ── */}
        <div className="aspect-square rounded-xl overflow-hidden bg-muted border">
          {product.images?.length > 0 ? (
            <img
              src={`/api/products/${product._id}/image`}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Tag className="h-24 w-24 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="flex flex-col gap-4">
          {/* Category + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">{categoryName}</span>
            {product.isFeatured && (
              <Badge className="bg-amber-500 hover:bg-amber-500/80">Featured</Badge>
            )}
            {isOutOfStock && <Badge variant="secondary">Out of Stock</Badge>}
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold leading-snug">{product.name}</h1>

          {/* Rating */}
          {product.ratings.count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.ratings.average) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-medium">{product.ratings.average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.ratings.count} reviews)</span>
            </div>
          )}

          <Separator />

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{fmt(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">{fmt(product.comparePrice!)}</span>
                <Badge variant="destructive">-{discountPct}%</Badge>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <Separator />

          {/* Stock info */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            {isOutOfStock ? (
              <span className="text-destructive font-medium">Out of stock</span>
            ) : product.stock <= 10 ? (
              <span className="text-warning font-medium">Only {product.stock} left in stock</span>
            ) : (
              <span className="text-success font-medium">In stock</span>
            )}
          </div>

          {/* SKU */}
          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Decrease quantity"
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="flex h-9 w-9 items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Increase quantity"
                  disabled={qty >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                className="flex-1"
                onClick={addToCart}
                loading={adding}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}

          <Button variant="ghost" asChild className="w-fit">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
