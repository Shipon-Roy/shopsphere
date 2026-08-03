import type { Metadata } from "next";
import { Suspense } from "react";
import { APP_NAME, PRODUCT_SORT_OPTIONS } from "@/constants";
import { ProductsClient } from "./ProductsClient";

export const metadata: Metadata = {
  title: `Products | ${APP_NAME}`,
  description: "Browse all products in our store",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="text-muted-foreground mt-1">
          Browse our full catalog
        </p>
      </div>
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsClient />
      </Suspense>
    </div>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="w-full lg:w-56 shrink-0">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      </aside>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
