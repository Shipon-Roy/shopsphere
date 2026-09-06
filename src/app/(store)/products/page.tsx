import type { Metadata } from "next";
import { Suspense } from "react";
import { APP_NAME } from "@/constants";
import { ProductsClient } from "./ProductsClient";

export const metadata: Metadata = {
  title: `All Products | ${APP_NAME}`,
  description: "Browse all products in our store",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="mx-auto max-w-[1500px] px-2 sm:px-4 py-4">
        <Suspense fallback={<ProductsPageSkeleton />}>
          <ProductsClient />
        </Suspense>
      </div>
    </div>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="flex gap-4">
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="bg-white rounded-lg p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
      </aside>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
