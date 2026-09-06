import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileForm } from "@/components/forms/ProfileForm";
import type { IUser } from "@/types";
import { APP_NAME } from "@/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: `My Profile | ${APP_NAME}` };

export default async function UserProfilePage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  // Fetch real name from DB — JWT only stores email+role, not the latest name
  await connectDB();
  const dbUser = await UserModel.findById(authUser.userId).lean();

  const user: IUser = {
    _id: authUser.userId,
    name: dbUser?.name ?? authUser.email.split("@")[0],
    email: authUser.email,
    role: authUser.role,
    isBlocked: false,
    createdAt: dbUser?.createdAt
      ? new Date(dbUser.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: dbUser?.updatedAt
      ? new Date(dbUser.updatedAt).toISOString()
      : new Date().toISOString(),
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
