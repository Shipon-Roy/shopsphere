import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: `Create Account | ${APP_NAME}`,
  description: "Create your ShopSphere account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
