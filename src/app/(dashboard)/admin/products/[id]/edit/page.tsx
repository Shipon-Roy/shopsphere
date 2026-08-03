import { PageHeader } from "@/components/shared/PageHeader";
import { ProductEditClient } from "./ProductEditClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <PageHeader
        title="Edit Product"
        description="Update product details"
        breadcrumbs={[{ label: "Products", href: "/admin/products" }, { label: "Edit" }]}
      />
      <ProductEditClient id={id} />
    </div>
  );
}
