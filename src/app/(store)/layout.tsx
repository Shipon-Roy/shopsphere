import { getCurrentUser } from "@/lib/auth";
import { StoreLayout } from "@/components/layouts/StoreLayout";

export default async function StoreGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const displayUser = user
    ? {
        name: user.email.split("@")[0],
        email: user.email,
        role: user.role,
      }
    : null;

  return <StoreLayout user={displayUser}>{children}</StoreLayout>;
}
