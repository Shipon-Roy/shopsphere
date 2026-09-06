import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ChevronRight } from "lucide-react";
import { APP_NAME, APP_DESCRIPTION } from "@/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — Shop Online`,
  description: APP_DESCRIPTION,
};

const CATEGORIES = [
  { name: "Electronics", emoji: "💻", href: "/products?category=electronics", color: "bg-blue-50" },
  { name: "Clothing", emoji: "👕", href: "/products?category=clothing", color: "bg-pink-50" },
  { name: "Home & Garden", emoji: "🏡", href: "/products?category=home-garden", color: "bg-green-50" },
  { name: "Sports", emoji: "⚽", href: "/products?category=sports", color: "bg-orange-50" },
  { name: "Books", emoji: "📚", href: "/products?category=books", color: "bg-yellow-50" },
  { name: "Toys", emoji: "🧸", href: "/products?category=toys", color: "bg-purple-50" },
];

const FEATURES = [
  { icon: Truck, title: "FREE Delivery", desc: "On orders over $100" },
  { icon: Shield, title: "Secure Payment", desc: "100% protected" },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

const DEALS = [
  { label: "Up to 40% off", sub: "Electronics", color: "from-blue-600 to-blue-800", href: "/products?category=electronics" },
  { label: "New Season Styles", sub: "Clothing & Fashion", color: "from-pink-500 to-rose-700", href: "/products?category=clothing" },
  { label: "Home Essentials", sub: "Refresh your space", color: "from-emerald-600 to-teal-800", href: "/products?category=home-garden" },
  { label: "Sports & Outdoors", sub: "Gear up & go", color: "from-orange-500 to-amber-700", href: "/products?category=sports" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="w-full h-[420px] sm:h-[500px] bg-gradient-to-br from-[#232F3E] via-[#1a2332] to-[#0d1b2a] flex items-center"
        >
          {/* Decorative circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-[1500px] px-4 sm:px-8 w-full">
            <div className="max-w-2xl">
              <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-3">
                🔥 Limited Time Deals
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                Shop Smarter,<br />
                <span className="text-primary">Save Bigger</span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 max-w-lg">
                Discover thousands of products across every category. Fast delivery, unbeatable prices.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded transition-colors text-sm"
                >
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products?featured=true"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded transition-colors border border-white/20 text-sm"
                >
                  Today&apos;s Deals
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to grey bg */}
        <div className="h-12 bg-gradient-to-b from-transparent to-[#EAEDED] absolute bottom-0 inset-x-0" />
      </section>

      <div className="mx-auto max-w-[1500px] px-2 sm:px-4 space-y-4 pb-12">

        {/* ── Deal Cards Grid ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 -mt-6 relative z-10">
          {DEALS.map((deal) => (
            <Link
              key={deal.label}
              href={deal.href}
              className={`group rounded-lg overflow-hidden bg-gradient-to-br ${deal.color} p-5 text-white hover:opacity-95 transition-opacity shadow-md`}
            >
              <p className="font-bold text-lg leading-snug">{deal.label}</p>
              <p className="text-sm opacity-80 mt-0.5 mb-3">{deal.sub}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors">
                Shop now <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>

        {/* ── Features Strip ───────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-center gap-3 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{f.title}</p>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Shop by Category ─────────────────────────────── */}
        <section className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
            <Link href="/products" className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium flex items-center gap-1">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`group flex flex-col items-center gap-2 rounded-lg ${cat.color} p-4 hover:shadow-md transition-shadow text-center border border-transparent hover:border-primary/20`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Banner Row ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/products?sort=createdAt:desc"
            className="group relative rounded-lg overflow-hidden bg-gradient-to-r from-[#232F3E] to-[#374151] p-8 text-white hover:opacity-95 transition-opacity shadow-sm"
          >
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/20 to-transparent" />
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Just Landed</p>
            <h3 className="text-2xl font-bold mb-2">New Arrivals</h3>
            <p className="text-gray-400 text-sm mb-4">Fresh products added daily</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
              Shop new arrivals <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            href="/products?featured=true"
            className="group relative rounded-lg overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white hover:opacity-95 transition-opacity shadow-sm"
          >
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/10 to-transparent" />
            <p className="text-xs font-semibold text-amber-100 uppercase tracking-widest mb-2">Handpicked</p>
            <h3 className="text-2xl font-bold mb-2">Featured Products</h3>
            <p className="text-amber-100 text-sm mb-4">Our top-rated selections</p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-white group-hover:gap-2 transition-all">
              View featured <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        {/* ── Stats Row ────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            {[
              { value: "10,000+", label: "Products", icon: "📦" },
              { value: "50,000+", label: "Happy Customers", icon: "😊" },
              { value: "4.9 / 5", label: "Avg. Rating", icon: "⭐" },
              { value: "24 / 7", label: "Customer Support", icon: "🎧" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center py-6 gap-1 text-center">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="bg-[#232F3E] rounded-lg shadow-sm px-8 py-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Start Shopping Today</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
            Create a free account and get access to exclusive deals, order tracking, and personalized recommendations.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-primary hover:bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded transition-colors text-sm"
            >
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border border-gray-500 hover:border-gray-300 text-gray-300 hover:text-white font-semibold px-8 py-3 rounded transition-colors text-sm"
            >
              Browse Products
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
