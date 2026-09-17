import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TS/ESLint errors during migration — remove after fixing
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "tasteofvillagerestaurants.co.uk",
      },
    ],
  },

  // URL redirects for backward compatibility
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/checkin", destination: "/check-in", permanent: true },
      { source: "/print-qrs", destination: "/print-qr", permanent: true },
      { source: "/qr", destination: "/links", permanent: true },
      { source: "/menu", destination: "/hayes/menu", permanent: false },
      { source: "/order", destination: "/hayes/order", permanent: false },
    ];
  },
};

export default nextConfig;
