import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

interface StoreLayoutProps {
  children: React.ReactNode;
  user?: { name: string; email: string; role: string } | null;
  cartCount?: number;
}

export function StoreLayout({ children, user, cartCount }: StoreLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
