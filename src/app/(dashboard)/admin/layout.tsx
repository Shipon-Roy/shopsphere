import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (user.role !== "admin") {
    redirect("/user/profile");
  }

  // Fetch user details for display
  // For now we use the JWT payload data directly
  const displayUser = {
    name: user.email.split("@")[0],
    email: user.email,
  };

  return <AdminLayout user={displayUser}>{children}</AdminLayout>;
}
