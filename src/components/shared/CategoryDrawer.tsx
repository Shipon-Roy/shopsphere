"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Package, User, LogOut, LayoutDashboard, ShoppingBag, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  user?: { name: string; email: string; role: string } | null;
  onLogout: () => void;
}

const DEPARTMENTS = [
  { label: "All Departments", href: "/products" },
  { label: "Electronics", href: "/products?category=electronics", icon: "💻" },
  { label: "Clothing", href: "/products?category=clothing", icon: "👕" },
  { label: "Home & Garden", href: "/products?category=home-garden", icon: "🏡" },
  { label: "Sports", href: "/products?category=sports", icon: "⚽" },
  { label: "Books", href: "/products?category=books", icon: "📚" },
  { label: "Toys", href: "/products?category=toys", icon: "🧸" },
];

const HELP_LINKS = [
  { label: "Help", href: "/" },
  { label: "Return Center", href: "/user/orders" },
  { label: "Shipping Rates", href: "/" },
  { label: "Contact Us", href: "/" },
];

export function CategoryDrawer({ open, onClose, user, onLogout }: CategoryDrawerProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed top-0 left-0 z-[70] h-full w-[320px] max-w-[85vw] bg-white shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Browse categories"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[hsl(var(--navy))] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {user ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <span className="text-white font-semibold text-sm">
              {user ? `Hello, ${user.name}` : "Hello, sign in"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-1"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Shop By Department */}
          <div className="py-2">
            <p className="px-4 py-2 text-sm font-bold text-gray-900 border-b border-gray-200">
              Shop By Department
            </p>
            {DEPARTMENTS.map((dept) => (
              <Link
                key={dept.href}
                href={dept.href}
                onClick={onClose}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-3">
                  {"icon" in dept && <span className="text-base">{dept.icon}</span>}
                  {dept.label}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>

          {/* Today's Deals */}
          <div className="border-t border-gray-200 py-2">
            <Link
              href="/products?featured=true"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-[#C7511F] hover:bg-gray-100 transition-colors"
            >
              <span>🔥 Today&apos;s Deals</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products?sort=createdAt:desc"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-[#007185] hover:bg-gray-100 transition-colors"
            >
              <span>✨ New Arrivals</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Account */}
          <div className="border-t border-gray-200 py-2">
            <p className="px-4 py-2 text-sm font-bold text-gray-900 border-b border-gray-200">
              {user ? "My Account" : "Sign In"}
            </p>
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link href="/admin" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors">
                    <LayoutDashboard className="h-4 w-4 text-gray-500" />
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/user/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors">
                  <User className="h-4 w-4 text-gray-500" />
                  My Profile
                </Link>
                <Link href="/user/orders" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors">
                  <ShoppingBag className="h-4 w-4 text-gray-500" />
                  My Orders
                </Link>
                <button
                  onClick={() => { onLogout(); onClose(); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#007185] hover:bg-gray-100 transition-colors">
                Sign in to your account →
              </Link>
            )}
          </div>

          {/* Help */}
          <div className="border-t border-gray-200 py-2">
            <p className="px-4 py-2 text-sm font-bold text-gray-900 border-b border-gray-200">
              Help &amp; Settings
            </p>
            {HELP_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer branding */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <Package className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-xs text-gray-500 font-medium">ShopSphere</span>
        </div>
      </div>
    </>
  );
}
