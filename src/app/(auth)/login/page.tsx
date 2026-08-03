import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: `Sign In | ${APP_NAME}`,
  description: "Sign in to your ShopSphere account",
};

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  return <LoginForm callbackUrl={callbackUrl ?? "/"} />;
}
