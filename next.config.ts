import type { NextConfig } from "next";

const nextConfig: NextConfig = {

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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://www.googletagmanager.com https://www.clarity.ms https://pay.google.com; connect-src 'self' https://connect.squareup.com https://pci-connect.squareup.com https://api.postcodes.io https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com https://www.google-analytics.com https://api.squareup.com; frame-src https://web.squarecdn.com https://sandbox.web.squarecdn.com https://pay.google.com https://www.google.com; img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://firebasestorage.googleapis.com https://tasteofvillagerestaurants.co.uk; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'payment=(self "https://web.squarecdn.com"), camera=(), microphone=(), geolocation=(self)'
          }
        ]
      }
    ];
  },

  // URL redirects for backward compatibility
  async redirects() {
    return [
      { source: "/privacy", destination: "/info?tab=privacy", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/checkin", destination: "/check-in", permanent: true },
      { source: "/print-qrs", destination: "/print-qr", permanent: true },
      { source: "/qr", destination: "/links", permanent: true },
      { source: "/menu", destination: "/hayes/menu", permanent: false },
      { source: "/order", destination: "/hayes/menu", permanent: true },
      { source: "/:locationId/order", destination: "/:locationId/menu", permanent: true },
    ];
  },
};

export default nextConfig;
