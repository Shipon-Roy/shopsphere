import { PageHeader } from "@/components/shared/PageHeader";
import { BrandForm } from "@/components/forms/BrandForm";

export default function AdminNewBrandPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Add Brand"
        breadcrumbs={[{ label: "Brands", href: "/admin/brands" }, { label: "New" }]}
      />
      <BrandForm mode="create" />
    </div>
  );
}
