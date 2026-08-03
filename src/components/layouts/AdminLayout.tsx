"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { AdminNavbar } from "@/components/shared/AdminNavbar";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  user: { name: string; email: string };
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — always visible on lg+, drawer on mobile */}
      <AdminSidebar
        className={cn(
          "hidden lg:flex shrink-0 flex-col h-full",
        )}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
          <div className="relative z-50 flex h-full">
            <AdminSidebar className="flex" />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminNavbar
          user={user}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
