import Link from "next/link";
import { Package } from "lucide-react";
import { APP_NAME } from "@/constants"; 
import { BackToTop } from "./BackToTop";

const FOOTER_LINKS = [
  {
    title: "Get to Know Us",
    links: [
      { href: "/", label: "About Us" },
      { href: "/", label: "Careers" },
      { href: "/", label: "Press Releases" },
      { href: "/", label: "Blog" },
    ],
  },
  {
    title: "Make Money with Us",
    links: [
      { href: "/", label: "Sell on ShopSphere" },
      { href: "/", label: "Become an Affiliate" },
      { href: "/", label: "Advertise Your Products" },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { href: "/user/profile", label: "Your Account" },
      { href: "/user/orders", label: "Your Orders" },
      { href: "/", label: "Shipping Rates & Policies" },
      { href: "/", label: "Returns & Replacements" },
      { href: "/", label: "Help" },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      {/* Back to top */}
      <BackToTop />

      {/* Main footer */}
      <div className="bg-[hsl(var(--navy))] text-gray-300">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                  <Package className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-white">{APP_NAME}</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your one-stop modern e-commerce platform. Fast delivery, unbeatable prices, and exceptional service.
              </p>
            </div>

            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[hsl(var(--navy))] border-t border-white/10">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Package className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-white font-bold text-sm">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition-colors">Conditions of Use</Link>
            <Link href="/" className="hover:text-gray-300 transition-colors">Privacy Notice</Link>
            <Link href="/" className="hover:text-gray-300 transition-colors">Interest-Based Ads</Link>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
