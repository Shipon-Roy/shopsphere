"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BannerForm } from "@/components/forms/BannerForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import type { IBanner } from "@/types";

export default function AdminEditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [banner, setBanner] = useState<IBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/banners/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j) => setBanner(j.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Edit Banner"
        breadcrumbs={[{ label: "Banners", href: "/admin/banners" }, { label: "Edit" }]}
      />
      {loading ? (
        <Skeleton className="h-64 w-full max-w-xl rounded-xl" />
      ) : error || !banner ? (
        <ErrorState title="Banner not found" />
      ) : (
        <BannerForm banner={banner} mode="edit" />
      )}
    </div>
  );
}
