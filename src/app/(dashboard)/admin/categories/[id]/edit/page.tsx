"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import type { ICategory } from "@/types";

export default function AdminEditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [category, setCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/categories/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j) => setCategory(j.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Edit Category"
        breadcrumbs={[{ label: "Categories", href: "/admin/categories" }, { label: "Edit" }]}
      />
      {loading ? (
        <Skeleton className="h-64 w-full max-w-xl rounded-xl" />
      ) : error || !category ? (
        <ErrorState title="Category not found" />
      ) : (
        <CategoryForm category={category} mode="edit" />
      )}
    </div>
  );
}
