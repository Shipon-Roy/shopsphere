import type { Metadata } from "next";
import { APP_NAME } from "@/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: `Auth | ${APP_NAME}`,
    template: `%s | ${APP_NAME}`,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      {children}
    </div>
  );
}
