import { PageHeader } from "@/components/shared/PageHeader";
import { BannerForm } from "@/components/forms/BannerForm";

export default function AdminNewBannerPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Add Banner"
        breadcrumbs={[{ label: "Banners", href: "/admin/banners" }, { label: "New" }]}
      />
      <BannerForm mode="create" />
    </div>
  );
}
