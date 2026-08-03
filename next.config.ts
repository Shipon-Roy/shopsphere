import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images served from our own API routes (MongoDB Buffer images)
  images: {
    remotePatterns: [],
    // We serve images via /api/*/image routes as base64 or binary,
    // so next/image is used with unoptimized for those cases
  },

  // Suppress specific warnings from mongoose / mongodb in edge/server environments
  serverExternalPackages: ["mongoose"],

  experimental: {
    // Enable server actions (already on by default in Next 15, kept for clarity)
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
