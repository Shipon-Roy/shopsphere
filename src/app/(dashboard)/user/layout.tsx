import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { StoreLayout } from "@/components/layouts/StoreLayout";
import { UserLayout } from "@/components/layouts/UserLayout";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/user/profile");
  }

  const displayUser = {
    name: user.email.split("@")[0],
    email: user.email,
    role: user.role,
  };

  return (
    <StoreLayout user={displayUser}>
      <UserLayout user={displayUser}>{children}</UserLayout>
    </StoreLayout>
  );
}
