"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { USER_NAV_ITEMS } from "@/constants";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  ShoppingBag,
  ShoppingCart,
};

interface UserLayoutProps {
  children: React.ReactNode;
  user: { name: string; email: string };
}

export function UserLayout({ children, user }: UserLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 shrink-0">
          {/* User info card */}
          <div className="rounded-xl border bg-card p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1" aria-label="User navigation">
            {USER_NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
