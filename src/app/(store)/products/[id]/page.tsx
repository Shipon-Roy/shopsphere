import type { Metadata } from "next";
import { Suspense } from "react";
import { APP_NAME } from "@/constants";
import { ProductDetailClient } from "./ProductDetailClient";

export const metadata: Metadata = {
  title: `Product | ${APP_NAME}`,
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailClient id={id} />
      </Suspense>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="aspect-square rounded-xl bg-muted animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-5 rounded bg-muted animate-pulse" style={{ width: `${90 - i * 10}%` }} />
        ))}
      </div>
    </div>
  );
}
