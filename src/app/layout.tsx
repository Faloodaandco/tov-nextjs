import type { Metadata } from "next";
import Script from "next/script";
import { Cinzel, Outfit } from "next/font/google";
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
    <html lang="en-GB" className={`${cinzel.variable} ${outfit.variable}`}>
      <head>
        {/* Schema.org Restaurant Structured Data — Both Branches */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Restaurant",
                  "@id": "https://tasteofvillagerestaurants.co.uk/hayes#restaurant",
                  name: "Taste of Village Hayes",
                  alternateName: "Taste of Village",
                  image: [
                    "https://tasteofvillagerestaurants.co.uk/assets/chicken_karahi_hero.webp",
                    "https://tasteofvillagerestaurants.co.uk/assets/lamb_karahi_hero.webp",
                    "https://tasteofvillagerestaurants.co.uk/assets/mix_grill_hero.webp",
                    "https://tasteofvillagerestaurants.co.uk/assets/nihari_hero.webp",
                    "https://tasteofvillagerestaurants.co.uk/assets/haleem_hero.webp"
                  ],
                  logo: {
                    "@type": "ImageObject",
                    "url": "https://tasteofvillagerestaurants.co.uk/assets/tov-icon-512.png",
                    "width": 512,
                    "height": 512
                  },
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
                    opens: "10:00",
                    closes: "02:00",
                  },
                  servesCuisine: ["Pakistani", "Indian", "Halal", "South Asian", "Lahori"],
                  priceRange: "££",
                  menu: "https://tasteofvillagerestaurants.co.uk/hayes/menu",
                  acceptsReservations: true,
                  hasMenu: { "@type": "Menu", name: "Hayes Menu", url: "https://tasteofvillagerestaurants.co.uk/hayes/menu" },
                  sameAs: [
                    "https://www.instagram.com/tasteofvillagehayes/",
                    "https://www.facebook.com/p/Taste-of-Village-61551672639808/",
                    "https://www.tiktok.com/@tasteofvillage1",
                  ],
                  "hasCredential": {
                    "@type": "EducationalOccupationalCredential",
                    "name": "Food Hygiene Rating 4 — Good",
                    "credentialCategory": "Food Hygiene Rating Scheme (FHRS)",
                    "recognizedBy": {
                      "@type": "GovernmentOrganization",
                      "name": "Food Standards Agency",
                      "url": "https://www.food.gov.uk/"
                    },
                    "url": "https://ratings.food.gov.uk/business/653844/a-taste-of-village"
                  },
                },
                {
                  "@type": "Restaurant",
                  "@id": "https://tasteofvillagerestaurants.co.uk/slough#restaurant",
                  name: "Taste of Village Slough",
                  alternateName: "Taste of Village Farnham Road",
                  image: [
                    "https://tasteofvillagerestaurants.co.uk/assets/chicken_karahi_hero.webp",
                    "https://tasteofvillagerestaurants.co.uk/assets/lamb_karahi_hero.webp",
                    "https://tasteofvillagerestaurants.co.uk/assets/mix_grill_hero.webp",
                    "https://tasteofvillagerestaurants.co.uk/assets/nihari_hero.webp",
                    "https://tasteofvillagerestaurants.co.uk/assets/haleem_hero.webp"
                  ],
                  logo: {
                    "@type": "ImageObject",
                    "url": "https://tasteofvillagerestaurants.co.uk/assets/tov-icon-512.png",
                    "width": 512,
                    "height": 512
                  },
                  url: "https://tasteofvillagerestaurants.co.uk/slough",
                  telephone: "+441753326341",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "260 Farnham Road",
                    addressLocality: "Slough",
                    addressRegion: "Berkshire",
                    postalCode: "SL1 4XQ",
                    addressCountry: "GB",
                  },
                  geo: { "@type": "GeoCoordinates", latitude: 51.5273, longitude: -0.6128 },
                  openingHoursSpecification: {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    opens: "10:00",
                    closes: "02:00",
                  },
                  servesCuisine: ["Pakistani", "Indian", "Halal", "South Asian", "Gujranwala"],
                  priceRange: "££",
                  menu: "https://tasteofvillagerestaurants.co.uk/slough/menu",
                  acceptsReservations: true,
                  hasMenu: { "@type": "Menu", name: "Slough Menu", url: "https://tasteofvillagerestaurants.co.uk/slough/menu" },
                  sameAs: [
                    "https://www.instagram.com/tasteofvillageslough/",
                  ],
                  "hasCredential": {
                    "@type": "EducationalOccupationalCredential",
                    "name": "Food Hygiene Rating 5 — Very Good",
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
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "Is the food at Taste of Village Halal?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, all meat served at both our Hayes and Slough branches is 100% Halal certified.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What is the delivery radius?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "We deliver within a 5-mile radius of each branch. Hayes serves UB, W7, W13 and surrounding areas. Slough serves SL, TW and nearby postcodes.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do you accept table bookings?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, you can book a table online at tasteofvillagerestaurants.co.uk/book for either our Hayes or Slough branch. Walk-ins are also welcome subject to availability.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is there parking available?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Hayes: Limited street parking on Uxbridge Road with pay-and-display bays nearby. Slough: Free parking available on Farnham Road and surrounding residential streets.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What allergen information do you provide?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "We comply with UK Natasha's Law. Allergen information for all 14 FSA-listed allergens is available for every dish. For specific queries, please call Hayes on 020 3409 3786 or Slough on 01753 326341.",
                      },
                    },
                  ],
                },
              ]
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-pine focus:text-white focus:rounded-lg focus:text-sm">Skip to main content</a>
        <Providers><main id="main-content">{children}</main></Providers>
        {/* Microsoft Clarity */}
        <Script
          id="clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "ymj4wrzgfx");`
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
