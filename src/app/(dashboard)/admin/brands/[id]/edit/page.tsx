"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BrandForm } from "@/components/forms/BrandForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import type { IBrand } from "@/types";

export default function AdminEditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/brands/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j) => setBrand(j.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Edit Brand"
        breadcrumbs={[{ label: "Brands", href: "/admin/brands" }, { label: "Edit" }]}
      />
      {loading ? (
        <Skeleton className="h-64 w-full max-w-xl rounded-xl" />
      ) : error || !brand ? (
        <ErrorState title="Brand not found" />
      ) : (
        <BrandForm brand={brand} mode="edit" />
      )}
    </div>
  );
}
