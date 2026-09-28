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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://*.squarecdn.com https://*.squareup.com https://*.squareupsandbox.com https://www.googletagmanager.com https://www.clarity.ms https://pay.google.com https://www.google.com https://www.gstatic.com",
              "connect-src 'self' https://connect.squareup.com https://pci-connect.squareup.com https://api.squareup.com https://*.squareup.com https://*.squarecdn.com https://*.squareupsandbox.com https://*.on.aws https://*.apple.com https://apple-pay-gateway.apple.com https://pay.google.com https://*.google.com https://www.google.com https://api.postcodes.io https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com https://*.google-analytics.com",
              "frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://*.squareup.com https://*.squareupsandbox.com https://*.squarecdn.com https://pay.google.com https://*.apple.com https://www.google.com",
              "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://firebasestorage.googleapis.com https://tasteofvillagerestaurants.co.uk https://*.wikimedia.org",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.squarecdn.com https://*.squareup.com",
              "font-src 'self' https://fonts.gstatic.com https://*.squarecdn.com",
            ].join('; ')
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
