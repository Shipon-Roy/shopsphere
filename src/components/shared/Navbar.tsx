"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart, Search, Menu, X,
  LogOut, LayoutDashboard, Package,
  User, ChevronDown, MapPin,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryDrawer } from "./CategoryDrawer";
import { APP_NAME } from "@/constants";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user?: { name: string; email: string; role: string } | null;
  cartCount?: number;
}

export const CART_UPDATED_EVENT = "cart:updated";

// Category nav links (excluding "All" — that opens the drawer)
const NAV_LINKS = [
  { href: "/products?category=electronics", label: "Electronics" },
  { href: "/products?category=clothing", label: "Clothing" },
  { href: "/products?category=home-garden", label: "Home & Garden" },
  { href: "/products?category=sports", label: "Sports" },
  { href: "/products?category=books", label: "Books" },
  { href: "/products?category=toys", label: "Toys" },
  { href: "/products?featured=true", label: "Today's Deals", highlight: true },
];

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (!user) { setCartCount(0); return; }
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) { setCartCount(0); return; }
      const json = await res.json();
      const items: Array<{ quantity: number }> = json.data?.items ?? [];
      setCartCount(items.reduce((s, i) => s + i.quantity, 0));
    } catch { setCartCount(0); }
  }, [user]);

  useEffect(() => { fetchCartCount(); }, [fetchCartCount]);
  useEffect(() => { fetchCartCount(); }, [pathname, fetchCartCount]);
  useEffect(() => {
    const h = () => fetchCartCount();
    window.addEventListener(CART_UPDATED_EVENT, h);
    return () => window.removeEventListener(CART_UPDATED_EVENT, h);
  }, [fetchCartCount]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim())
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCartCount(0);
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Amazon-style slide drawer */}
      <CategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <header className="sticky top-0 z-50 w-full">
        {/* ── Top bar ── */}
        <div className="amazon-header text-white">
          <div className="mx-auto max-w-[1500px] px-2 sm:px-4">
            <div className="flex h-14 items-center gap-2 sm:gap-3">

              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded border border-transparent hover:border-white transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
                  <Package className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-base text-white hidden sm:block">{APP_NAME}</span>
              </Link>

              {/* Deliver to */}
              <div className="hidden lg:flex items-end gap-1 px-2 py-1 rounded border border-transparent hover:border-white cursor-pointer transition-colors shrink-0">
                <MapPin className="h-4 w-4 mb-0.5 text-gray-300" />
                <div className="leading-tight">
                  <p className="text-[11px] text-gray-300">Deliver to</p>
                  <p className="text-xs font-bold text-white">Bangladesh</p>
                </div>
              </div>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="flex flex-1 min-w-0 h-10 rounded-md overflow-hidden border-2 border-primary"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 min-w-0 bg-white text-gray-900 text-sm px-4 focus:outline-none"
                />
                <button
                  type="submit"
                  className="amazon-search-btn flex items-center justify-center w-12 shrink-0 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-gray-900" />
                </button>
              </form>

              {/* Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex flex-col items-start px-2 py-1 rounded border border-transparent hover:border-white transition-colors shrink-0 leading-tight">
                      <span className="text-[11px] text-gray-300">Hello, {user.name.split(" ")[0]}</span>
                      <span className="text-xs font-bold text-white flex items-center gap-0.5">
                        Account &amp; Lists <ChevronDown className="h-3 w-3" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <div className="px-3 py-2 border-b">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <LayoutDashboard className="mr-2 h-4 w-4" />Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/user/profile"><User className="mr-2 h-4 w-4" />My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/user/orders"><Package className="mr-2 h-4 w-4" />Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex flex-col items-start px-2 py-1 shrink-0 leading-tight">
                  <span className="text-[11px] text-gray-300">Hello, sign in</span>
                  <Link
                    href="/login"
                    className="text-xs font-bold text-white flex items-center gap-0.5 hover:text-primary transition-colors"
                  >
                    Account &amp; Lists <ChevronDown className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Returns & Orders */}
              <Link
                href={user ? "/user/orders" : "/login"}
                className="hidden md:flex flex-col items-start px-2 py-1 rounded border border-transparent hover:border-white transition-colors shrink-0 leading-tight"
              >
                <span className="text-[11px] text-gray-300">Returns</span>
                <span className="text-xs font-bold text-white">&amp; Orders</span>
              </Link>

              {/* Cart */}
              <Link
                href="/user/cart"
                className="flex items-end gap-1 px-2 py-1 rounded border border-transparent hover:border-white transition-colors shrink-0"
                aria-label={`Cart (${cartCount})`}
              >
                <div className="relative">
                  <ShoppingCart className="h-7 w-7 text-white" />
                  <span className={cn(
                    "absolute -top-1.5 left-3 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[11px] font-bold",
                    cartCount > 0 ? "bg-primary text-primary-foreground" : "bg-transparent text-transparent"
                  )}>
                    {cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : "0"}
                  </span>
                </div>
                <span className="text-xs font-bold text-white hidden sm:block mb-0.5">Cart</span>
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-1.5 rounded border border-transparent hover:border-white transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Category nav bar ── */}
        <div className="bg-[hsl(var(--navy-light))] text-white hidden md:block">
          <div className="mx-auto max-w-[1500px] px-2 sm:px-4">
            <div className="flex items-center overflow-x-auto scrollbar-hide h-10">

              {/* All — opens drawer */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:bg-white/10 rounded transition-colors shrink-0 border border-transparent hover:border-white/30"
              >
                <Menu className="h-4 w-4" />
                All
              </button>

              {/* Category links */}
              {NAV_LINKS.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium hover:bg-white/10 rounded transition-colors shrink-0 whitespace-nowrap border border-transparent hover:border-white/30",
                    "highlight" in cat && cat.highlight && "text-primary font-semibold"
                  )}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile menu (simple list — drawer handles full nav) ── */}
        {mobileOpen && (
          <div className="amazon-header border-t border-white/10 md:hidden">
            <div className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  <div className="text-white font-semibold py-2">Hello, {user.name}</div>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white py-2">
                      <LayoutDashboard className="h-4 w-4" />Admin Dashboard
                    </Link>
                  )}
                  <Link href="/user/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white py-2">
                    <User className="h-4 w-4" />My Account
                  </Link>
                  <Link href="/user/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white py-2">
                    <Package className="h-4 w-4" />My Orders
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 py-2 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-semibold text-white">
                  Sign in to your account →
                </Link>
              )}

              <div className="border-t border-white/10 pt-2 mt-2">
                <button
                  onClick={() => { setMobileOpen(false); setDrawerOpen(true); }}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white py-2 w-full text-left"
                >
                  <Menu className="h-4 w-4" />Browse All Categories
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
