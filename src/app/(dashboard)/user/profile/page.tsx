import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileForm } from "@/components/forms/ProfileForm";
import type { IUser } from "@/types";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = { title: `My Profile | ${APP_NAME}` };

async function getFullUser(userId: string): Promise<IUser | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/me/profile`, {
      cache: "no-store",
      headers: { Cookie: "" }, // will be resolved by internal fetch
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function UserProfilePage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  // Build a minimal IUser from JWT payload for the form
  // (full profile is fetched client-side by ProfileForm if needed)
  const user: IUser = {
    _id: authUser.userId,
    name: authUser.email.split("@")[0],
    email: authUser.email,
    role: authUser.role,
    isBlocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Profile"
        description="Manage your account details and password"
      />
      <ProfileForm user={user} />
    </div>
  );
}
