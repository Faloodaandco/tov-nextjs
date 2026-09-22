import type { Metadata } from "next";
import Script from "next/script";
import { Cinzel, Outfit, Jost } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Taste of Village | Authentic Pakistani Cuisine",
    template: "%s | Taste of Village",
  },
  description:
    "Authentic Lahori & Gujranwala cuisine. Order Chicken Karahi, Lamb Karahi, Haleem, Nihari, Samosa Chaat and sizzling BBQ platters. Halal certified.",
  keywords: [
    "Pakistani restaurant",
    "halal takeaway",
    "Karahi",
    "Lahori food London",
    "Nihari",
    "Haleem",
    "Biryani",
    "Taste of Village",
  ],
  metadataBase: new URL("https://tasteofvillagerestaurants.co.uk"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Taste of Village | Authentic Pakistani Cuisine (Hayes & Slough)",
    description:
      "Authentic Lahori & Gujranwala cuisine in Hayes & Slough. Slow-simmered Karahi, Nihari, Haleem & sizzling BBQ. Order online for collection.",
    url: "https://tasteofvillagerestaurants.co.uk",
    siteName: "Taste of Village",
    locale: "en_GB",
    images: [
      {
        url: "/assets/og-share-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Taste of Village Sizzling Karahi & Naan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taste of Village | Authentic Pakistani Cuisine (Hayes & Slough)",
    description:
      "Authentic Lahori & Gujranwala cuisine in Hayes & Slough. Slow-simmered Karahi, Nihari, Haleem & sizzling BBQ. Order online for collection.",
    images: ["/assets/og-share-preview.jpg"],
  },
  icons: {
    icon: [
      { url: "/assets/tov-tree.svg", type: "image/svg+xml" },
      { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/tov-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/assets/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${outfit.variable} ${jost.variable}`}>
      <head>
        {/* Schema.org Restaurant Structured Data — Both Branches */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Restaurant",
                name: "Taste of Village Hayes",
                alternateName: "Taste of Village",
                image: "https://tasteofvillagerestaurants.co.uk/assets/chicken_karahi_hero.webp",
                url: "https://tasteofvillagerestaurants.co.uk/hayes",
                telephone: "+442034093786",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "766B Uxbridge Road",
                  addressLocality: "Hayes",
                  addressRegion: "London",
                  postalCode: "UB4 0RU",
                  addressCountry: "GB",
                },
                geo: { "@type": "GeoCoordinates", latitude: 51.5127, longitude: -0.4211 },
                openingHoursSpecification: {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                  opens: "12:00",
                  closes: "23:00",
                },
                servesCuisine: ["Pakistani", "Halal", "South Asian", "Lahori"],
                priceRange: "££",
                menu: "https://tasteofvillagerestaurants.co.uk/hayes/menu",
                acceptsReservations: "True",
                hasMenu: { "@type": "Menu", name: "Hayes Menu", url: "https://tasteofvillagerestaurants.co.uk/hayes/menu" },
                sameAs: [
                  "https://www.instagram.com/tasteofvillagehayes/",
                  "https://www.facebook.com/p/Taste-of-Village-61551672639808/",
                  "https://www.tiktok.com/@tasteofvillage1",
                ],
                "hasCredential": {
                  "@type": "EducationalOccupationalCredential",
                  "name": "Food Hygiene Rating",
                  "credentialCategory": "Food Hygiene Rating Scheme (FHRS)",
                  "recognizedBy": {
                    "@type": "GovernmentOrganization",
                    "name": "Food Standards Agency",
                    "url": "https://www.food.gov.uk/"
                  },
                  "url": "https://ratings.food.gov.uk/business/1963386/taste-of-village-slough"
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Restaurant",
                name: "Taste of Village Slough",
                alternateName: "Taste of Village Farnham Road",
                image: "https://tasteofvillagerestaurants.co.uk/assets/chicken_karahi_hero.webp",
                url: "https://tasteofvillagerestaurants.co.uk/slough",
                telephone: "+441234567890",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "260 Farnham Road",
                  addressLocality: "Slough",
                  addressRegion: "Berkshire",
                  postalCode: "SL1 4XL",
                  addressCountry: "GB",
                },
                geo: { "@type": "GeoCoordinates", latitude: 51.5273, longitude: -0.6128 },
                openingHoursSpecification: {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                  opens: "12:00",
                  closes: "23:00",
                },
                servesCuisine: ["Pakistani", "Halal", "South Asian", "Gujranwala"],
                priceRange: "££",
                menu: "https://tasteofvillagerestaurants.co.uk/slough/menu",
                acceptsReservations: "True",
                hasMenu: { "@type": "Menu", name: "Slough Menu", url: "https://tasteofvillagerestaurants.co.uk/slough/menu" },
                sameAs: [
                  "https://www.instagram.com/tasteofvillageslough/",
                ],
                "hasCredential": {
                  "@type": "EducationalOccupationalCredential",
                  "name": "Food Hygiene Rating",
                  "credentialCategory": "Food Hygiene Rating Scheme (FHRS)",
                  "recognizedBy": {
                    "@type": "GovernmentOrganization",
                    "name": "Food Standards Agency",
                    "url": "https://www.food.gov.uk/"
                  },
                  "url": "https://ratings.food.gov.uk/business/1963386/taste-of-village-slough"
                },
              },
            ]),
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        {/* Microsoft Clarity */}
        <Script
          id="clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "ydv01vt483");`
          }}
        />
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DLX86F7LBK"
          strategy="afterInteractive"
        />
        <Script
          id="ga4-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','G-DLX86F7LBK');`
          }}
        />
      </body>
    </html>
  );
}
