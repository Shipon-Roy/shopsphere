import { PageHeader } from "@/components/shared/PageHeader";
import { ProductForm } from "@/components/forms/ProductForm";

export default function AdminNewProductPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Add Product"
        description="Create a new product listing"
        breadcrumbs={[{ label: "Products", href: "/admin/products" }, { label: "New Product" }]}
      />
      <ProductForm mode="create" />
    </div>
  );
}
