import { PageHeader } from "@/components/shared/PageHeader";
import { CategoryForm } from "@/components/forms/CategoryForm";

export default function AdminNewCategoryPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Add Category"
        breadcrumbs={[{ label: "Categories", href: "/admin/categories" }, { label: "New" }]}
      />
      <CategoryForm mode="create" />
    </div>
  );
}
