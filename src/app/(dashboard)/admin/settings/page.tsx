import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsForm } from "@/components/forms/SettingsForm";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description="Configure your store preferences"
        breadcrumbs={[{ label: "Settings" }]}
      />
      <SettingsForm />
    </div>
  );
}
