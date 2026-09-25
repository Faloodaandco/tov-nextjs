# Taste of Village — Next.js Web Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)
[![Square](https://img.shields.io/badge/Square-Payments-006AFF?logo=square)](https://squareup.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

Standalone marketing and direct-ordering website for **Taste of Village**, an authentic Pakistani restaurant brand with two branches in Hayes and Slough.

## Architecture

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Hosting** | Vercel (auto-deploy from `master` on `Faloodaandco/tov-nextjs`) |
| **Database & Auth** | Firebase Firestore & Firebase Auth (`taste-of-village-21052`) |
| **Payments** | Square Web Payments SDK + server-side order creation via `/api/checkout/square` |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Testing** | Playwright (E2E) |
| **Analytics** | Google Analytics 4, Microsoft Clarity |

> **Client Decoupled Standard:** This repo is the public-facing website only. Zero in-store POS, KDS screens, thermal printers, or edge hardware belong here.

## Branches

| Location | Route Prefix | Square Tenant | Address |
|----------|-------------|---------------|---------|
| Hayes | `/hayes/*` | `f0b00da2-...-000000000004` | 766B Uxbridge Rd, Hayes UB4 0RU |
| Slough | `/slough/*` | `f0b00da2-...-000000000005` | 260 Farnham Road, Slough SL1 4XL |

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

See [`.env.example`](.env.example) for all required variables.

## Project Structure

```
tov-nextjs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locationId]/       # Branch-specific routes (hayes, slough)
│   │   │   └── menu/           # Interactive ordering menu
│   │   ├── api/
│   │   │   ├── checkout/square/ # Square payment + order creation
│   │   │   ├── delivery/quote/  # Postcodes.io geocoding + delivery fees
│   │   │   ├── loyalty/         # Square Loyalty check & enrollment
│   │   │   ├── orders/[orderId]/ # Order tracking (sanitized, no PII)
│   │   │   └── webhooks/square/  # Square payment webhook handler
│   │   ├── book/               # Table booking
│   │   ├── review/             # Review gate (4-5★ → Google, 1-3★ → private)
│   │   ├── track/[orderId]/    # Order status tracker
│   │   └── (SEO pages)         # Area-specific landing pages
│   ├── components/             # Shared UI components
│   ├── config/shopConfig.ts    # Branch config, delivery zones, hours
│   ├── lib/firebase.ts         # Firebase client initialization
│   ├── services/               # Firestore service layer
│   └── types.ts                # Shared TypeScript interfaces
├── public/                     # Static assets, icons, sitemap
├── CONTEXT.md                  # Canonical architectural context for agents
├── AGENTS.md                   # Agent behavior rules
├── firebase.json               # Firestore rules deployment config
├── firestore.rules             # Firestore security rules
└── next.config.ts              # Redirects, image remote patterns
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Playwright tests |
| `npm run test:e2e` | Run Playwright E2E tests |

## Deployment

Deployments are fully automated via Vercel's GitHub integration:

1. Push to `master` branch
2. Vercel builds and deploys automatically
3. Production domain: `tasteofvillagerestaurants.co.uk`

No manual deploy commands needed. No Firebase Hosting deployment — this project uses Vercel exclusively.

## Documentation

- [`CONTEXT.md`](CONTEXT.md) — Canonical architectural specification
- [`AGENTS.md`](AGENTS.md) — Agent behavior rules and configuration
- [`docs/adr/`](docs/adr/) — Architecture Decision Records
