"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/forms/ProductForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import type { IProduct } from "@/types";

export function ProductEditClient({ id }: { id: string }) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j) => setProduct(j.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="space-y-4 max-w-3xl">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
  if (error || !product) return <ErrorState title="Product not found" />;

  return <ProductForm product={product} mode="edit" />;
}
