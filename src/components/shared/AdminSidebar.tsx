"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  Building2,
  ShoppingCart,
  Users,
  Star,
  Image,
  Settings,
  Package2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME, ADMIN_NAV_ITEMS } from "@/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  Tag,
  Building2,
  ShoppingCart,
  Users,
  Star,
  Image,
  Settings,
};

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col w-64 bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Package2 className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm text-sidebar-primary-foreground">{APP_NAME}</p>
          <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-0.5" aria-label="Admin navigation">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const isActive = "exact" in item && item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
