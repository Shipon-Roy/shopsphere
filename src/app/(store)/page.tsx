import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Truck, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, APP_DESCRIPTION } from "@/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — Modern E-Commerce`,
  description: APP_DESCRIPTION,
};

// Feature highlights shown below the hero
const FEATURES = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $100",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% protected transactions",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day hassle-free returns",
  },
  {
    icon: ShoppingBag,
    title: "Quality Products",
    description: "Curated selection just for you",
  },
];

// Static category tiles (will be dynamic once API is wired)
const CATEGORIES = [
  { name: "Electronics", emoji: "💻", href: "/products?category=electronics" },
  { name: "Clothing", emoji: "👕", href: "/products?category=clothing" },
  { name: "Home & Garden", emoji: "🏡", href: "/products?category=home-garden" },
  { name: "Sports", emoji: "⚽", href: "/products?category=sports" },
  { name: "Books", emoji: "📚", href: "/products?category=books" },
  { name: "Toys", emoji: "🧸", href: "/products?category=toys" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 sm:py-28">
        {/* Background decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            🎉 New arrivals every week
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Shop Smarter with{" "}
            <span className="gradient-text">{APP_NAME}</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10">
            Discover thousands of products across every category — delivered fast,
            priced right, and backed by excellent support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="xl">
              <Link href="/products">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/products?featured=true">
                Featured Products
              </Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: "10K+", label: "Products" },
              { value: "50K+", label: "Happy Customers" },
              { value: "4.9★", label: "Average Rating" },
              { value: "24/7", label: "Customer Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ───────────────────────────────── */}
      <section className="border-y bg-muted/30 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{feat.title}</p>
                    <p className="text-xs text-muted-foreground">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Shop by Category ─────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Shop by Category</h2>
              <p className="text-muted-foreground mt-1">Find exactly what you&apos;re looking for</p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/products">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 hover:border-primary hover:shadow-md transition-all duration-200 text-center"
              >
                <span className="text-3xl" role="img" aria-hidden="true">
                  {cat.emoji}
                </span>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products Banner ─────────────────────────── */}
      <section className="py-12 bg-gradient-to-r from-primary to-primary/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-primary-foreground">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                New Arrivals Are Here
              </h2>
              <p className="mt-2 opacity-90">
                Check out the latest products added to our collection
              </p>
            </div>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="shrink-0 bg-white text-primary hover:bg-white/90"
            >
              <Link href="/products?sort=createdAt:desc">
                Shop New Arrivals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why ShopSphere ───────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Why Choose {APP_NAME}?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-12">
            We&apos;re committed to making your shopping experience exceptional at every step.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                emoji: "🚀",
                title: "Lightning Fast Delivery",
                body: "Get your orders delivered quickly with our optimized logistics network.",
              },
              {
                emoji: "💎",
                title: "Premium Quality",
                body: "Every product is carefully vetted to ensure the highest quality standards.",
              },
              {
                emoji: "🤝",
                title: "Trusted by Thousands",
                body: "Join our growing community of satisfied customers around the world.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
                  <span role="img" aria-hidden="true">{item.emoji}</span>
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Create an account today and get access to exclusive deals and personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="xl">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
