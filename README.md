# Taste of Village (TOV) — Web Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting_%26_Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Elements-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tests-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

The official, high-performance customer web platform and Progressive Web App (PWA) for **Taste of Village** restaurants. Serves direct online collection orders, table bookings, customer loyalty, and brand discovery for both the **Hayes** and **Slough** flagship locations.

**Live Production URL:** [https://tasteofvillagerestaurants.co.uk](https://tasteofvillagerestaurants.co.uk)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Branch Locations](#branch-locations)
- [Technology Stack](#technology-stack)
- [Architecture & Decoupled Design](#architecture--decoupled-design)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Development Server](#running-the-development-server)
- [Environment Variables Reference](#environment-variables-reference)
- [Available Scripts](#available-scripts)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Production Deployment](#production-deployment)
- [Architectural Guardrails](#architectural-guardrails)
- [Documentation Index](#documentation-index)

---

## Overview

Taste of Village serves authentic Lahori and Gujranwala cuisine across West London and Berkshire. This repository contains the standalone customer-facing web application.

The web platform is completely decoupled from in-store POS hardware and runs as a serverless frontend hosted on Firebase Hosting, backed by Cloud Firestore for order persistence and Stripe Elements for payment processing.

---

## Key Features

- **Multi-Branch Context & Deep Linking:** Seamless branch selection between Hayes and Slough. Once inside a branch (`/hayes` or `/slough`), all category navigation, product modals, and checkout operations remain locked to that specific branch.
- **Zero-Latency Static Menu Engine:** Static JSON catalogs (`tov-menu.json` and `tov-menu-slough.json`) provide 0ms menu rendering, eliminating external database latency and guaranteeing 100% menu uptime.
- **Collection-Only Ordering Flow:** Clean, transparent collection ordering with real-time basket calculations, dietary allergen filters, item customization, and a high-converting Upsell Drawer for drinks and sides.
- **Stripe Elements Payment Integration:** Embedded Stripe Elements supporting credit/debit cards, Apple Pay, and Google Pay via a serverless Firebase Cloud Function (`createStripeIntent`).
- **Table Reservation Engine:** Direct table booking portal (`/book`) with date, time, party size selection, and real-time Firestore persistence.
- **Order Tracking & Notifications:** Instant order lookup (`/track/:orderId`) with WhatsApp summary generation and automated confirmation emails.
- **PWA & Offline Resilience:** Progressive Web App capabilities powered by `vite-plugin-pwa` and IndexedDB caching (`idb-keyval`).
- **Telemetry & UX Analytics:** Microsoft Clarity integration for user journey recordings and heatmaps, paired with Google Analytics 4 (GA4).

---

## Branch Locations

| Branch | Address | Postcode | Phone | Tenant ID |
| :--- | :--- | :--- | :--- | :--- |
| **Hayes Branch** | 766B Uxbridge Rd | `UB4 0RU` | `020 3409 3786` | `f0b00da2-4444-4444-4444-000000000004` |
| **Slough Branch** | 260 Farnham Road | `SL1 4XL` | `020 3409 3786` | `f0b00da2-4444-4444-4444-000000000005` |

Branch configuration and operational metadata reside in `src/shopConfig.ts`.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.9, Vite 7 |
| **Styling & Animation** | Tailwind CSS 4 (`@tailwindcss/vite`), Framer Motion, Lenis Smooth Scroll |
| **Routing** | React Router DOM v7 |
| **Database & Cloud** | Google Cloud Firestore, Firebase Hosting, Firebase Functions |
| **Payments** | Stripe Elements (`@stripe/stripe-js`, `@stripe/react-stripe-js`) |
| **State & Storage** | React Context (`StoreContext`, `AuthContext`), IndexedDB (`idb-keyval`) |
| **Testing** | Playwright (E2E & visual regressions), ESLint 9 |
| **PWA & Offline** | `vite-plugin-pwa`, Service Workers |

---

## Architecture & Decoupled Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Customer Browser / Mobile PWA                        │
│                                                                        │
│   ┌───────────────────────────┐         ┌──────────────────────────┐   │
│   │  React 19 + Vite (SPA)    │         │  Stripe Elements SDK     │   │
│   │  Tailwind CSS 4 / Lucide  │         │  Apple / Google Pay      │   │
│   └─────────────┬─────────────┘         └────────────┬─────────────┘   │
└─────────────────┼────────────────────────────────────┼─────────────────┘
                  │                                    │
                  ▼                                    ▼
       ┌──────────────────────┐             ┌──────────────────────┐
       │   Firebase Hosting   │             │   Cloud Function     │
       │   CDN Edge Network   │             │   createStripeIntent │
       │   taste-of-village   │             └──────────┬───────────┘
       └──────────┬───────────┘                        │
                  │                                    ▼
                  │                         ┌──────────────────────┐
                  │                         │   Stripe API         │
                  │                         │   PaymentIntents     │
                  │                         └──────────────────────┘
                  ▼                                    
       ┌───────────────────────────────────────────────────────────┐
       │                 Google Cloud Firestore                    │
       │       Collections: orders, bookings, leads, customers     │
       └───────────────────────────────────────────────────────────┘
```

### Decoupled Standards

1. **Pure Standalone Web Repository:** Contains zero POS counter register code, kitchen display (KDS) interfaces, or thermal printer drivers. In-store restaurant operations use commercial Square POS hardware.
2. **Client-Owned Infrastructure:** All GCP, Firebase, and Stripe resources belong to the client organization (`sales@faloodaandco.co.uk`).
3. **High-Availability Data Layer:** Static JSON catalogs allow customers to browse menus and configure carts even if external services experience temporary degradation.

---

## Repository Structure

```
TOV-website/
├── .github/                 # GitHub workflows & CI automation
├── docs/                    # Technical architecture & operational specs
│   ├── ARCHITECTURE.md      # In-depth architectural design & data flow
│   ├── DEVELOPMENT_GUIDE.md # Local development setup & workflows
│   ├── DEPLOYMENT_GUIDE.md  # Production release & domain configuration
│   ├── API_AND_DATA_MODELS.md # Schemas for Firestore & static catalogs
│   ├── ANALYTICS_AND_MONITORING.md # Clarity, GA4 & MCP integration
│   └── EXTERNAL_DEVELOPER_SPEC.md # Full handover specification
├── e2e/                     # Playwright end-to-end test suites
├── functions/               # Firebase Cloud Functions (Stripe intents)
│   └── src/index.ts         # PaymentIntent creation endpoint
├── public/                  # Static assets, manifests, icons
├── scripts/                 # Utility scripts (analytics, optimization)
│   ├── mcp-server.js        # Local MCP server for analytics
│   ├── pull-clarity.js      # Microsoft Clarity data pull
│   └── pull-ga4.js          # Google Analytics 4 data pull
├── src/
│   ├── assets/              # WebP imagery and SVG vectors
│   ├── components/          # UI components (Navbar, Footer, StripeCheckout, etc.)
│   ├── context/             # StoreContext (cart & orders) and AuthContext
│   ├── data/                # Static menu JSON catalogs (Hayes & Slough)
│   ├── hooks/               # Custom React hooks (useLocationConfig, etc.)
│   ├── pages/               # Route views (SplashSelector, TOVHome, Menu, Book)
│   ├── routes/              # Route guards and lazy loaders
│   ├── services/            # Firestore and external service clients
│   ├── shopConfig.ts        # Central shop configuration and branch metadata
│   ├── firebaseConfig.ts    # Firebase client credentials
│   ├── App.tsx              # Router setup and global providers
│   └── main.tsx             # Application DOM entry point
├── firebase.json            # Firebase Hosting and Functions configuration
├── firestore.rules          # Security rules for Cloud Firestore
├── package.json             # NPM package definition & scripts
└── vite.config.ts           # Vite bundler and PWA configuration
```

---

## Getting Started

### Prerequisites

- **Node.js:** version 20.0.0 or higher
- **npm:** version 10.0.0 or higher
- **Git**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Faloodaandco/TOV.git
   cd TOV
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. If working on Cloud Functions, install function dependencies:
   ```bash
   npm --prefix functions install
   ```

### Environment Configuration

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Populate the required Firebase environment variables in `.env`:

```env
VITE_FIREBASE_PROJECT_ID=taste-of-village-21052
VITE_FIREBASE_APP_ID=1:299893522694:web:1726d5d4dd2337c6ba5e87
VITE_FIREBASE_STORAGE_BUCKET=taste-of-village-21052.firebasestorage.app
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=taste-of-village-21052.firebaseapp.com
VITE_FIREBASE_MESSAGING_SENDER_ID=299893522694
VITE_FIREBASE_MEASUREMENT_ID=G-DLX86F7LBK
```

### Running the Development Server

Start the Vite development server with local network access:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project identifier | `taste-of-village-21052` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | `1:299893522694:web:...` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Cloud Storage bucket name | `taste-of-village-21052.firebasestorage.app` |
| `VITE_FIREBASE_API_KEY` | Public Firebase Web API Key | Required for live auth/Firestore |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain | `taste-of-village-21052.firebaseapp.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM Messaging sender ID | `299893522694` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics 4 tag ID | `G-DLX86F7LBK` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` or `pk_test_...` |
| `VITE_TENANT_ID` | Optional override for single-tenant mode | Leave empty for multi-branch |

---

## Available Scripts

Run scripts from the project root using `npm run SCRIPT_NAME`:

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `vite --host` | Starts the Vite dev server accessible on local network |
| `build` | `tsc -b && vite build` | Type-checks TypeScript and compiles the production bundle |
| `lint` | `eslint .` | Runs ESLint across all TypeScript and React files |
| `preview` | `vite preview` | Serves the production build locally for testing |
| `test:e2e` | `playwright test` | Runs the Playwright end-to-end test suite |
| `clarity` | `node scripts/pull-clarity.js` | Fetches Microsoft Clarity analytics and user recordings |
| `auth:ga4` | `node scripts/auth-ga4.js` | Authenticates Google Analytics 4 reporting credentials |
| `ga4` | `node scripts/pull-ga4.js` | Pulls GA4 traffic and conversion telemetry |

---

## Testing & Quality Assurance

The application uses [Playwright](https://playwright.dev/) for automated end-to-end testing and visual regression monitoring.

Run all tests headlessly:
```bash
npm run test:e2e
```

Run tests with interactive UI mode:
```bash
npx playwright test --ui
```

Run specific test files:
```bash
npx playwright test e2e/menu-integrity.spec.ts
npx playwright test e2e/checkout-flow.spec.ts
npx playwright test e2e/mobile-customer-journey.spec.ts
```

---

## Production Deployment

The website deploys to Firebase Hosting under project `taste-of-village-21052`.

### 1. Build the Production Bundle
Compile and validate the frontend bundle:
```bash
npm run build
```

### 2. Deploy to Firebase Hosting
Deploy the static build to global CDN edge nodes:
```bash
npx firebase-tools deploy --only hosting --project taste-of-village-21052
```

### 3. Deploy Cloud Functions (When Functions Change)
```bash
npx firebase-tools deploy --only functions:createStripeIntent --project taste-of-village-21052
```

Detailed deployment workflows and DNS setup are documented in [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

---

## Architectural Guardrails

All contributors and engineers must adhere to the following rules:

1. **No In-Store POS or Hardware Code:** Do not add receipt printer drivers (ESC/POS), kitchen display screens, local subnet discovery scripts (`192.168.0.x`), or staff pin pads. Square POS handles counter registers and kitchen operations.
2. **Collection-Only Ordering:** The online checkout flow strictly supports **Collection Only**. Do not add delivery address fields, driver dispatch integrations, or courier commission hooks.
3. **Authentic Photography Only:** Use exclusively authentic dish photography from Taste of Village kitchens. Stock illustrations or synthetic placeholder imagery are strictly prohibited.
4. **Billing Isolation:** All cloud services must reside on accounts owned by `sales@faloodaandco.co.uk`. Never attach agency or personal billing credentials.

---

## Documentation Index

Explore the `docs/` directory for detailed specifications:

- **[Architecture & Design (`docs/ARCHITECTURE.md`)](docs/ARCHITECTURE.md):** Detailed system architecture, data models, state management, and routing lifecycle.
- **[Development Guide (`docs/DEVELOPMENT_GUIDE.md`)](docs/DEVELOPMENT_GUIDE.md):** Local environment setup, menu catalog updating, and troubleshooting.
- **[Deployment Guide (`docs/DEPLOYMENT_GUIDE.md`)](docs/DEPLOYMENT_GUIDE.md):** Production builds, Firebase deployment, and custom domain SSL.
- **[API & Data Models (`docs/API_AND_DATA_MODELS.md`)](docs/API_AND_DATA_MODELS.md):** Firestore schemas, menu data contracts, and Stripe payment intents.
- **[Analytics & Monitoring (`docs/ANALYTICS_AND_MONITORING.md`)](docs/ANALYTICS_AND_MONITORING.md):** Clarity heatmaps, GA4 telemetry, and local MCP server usage.
- **[Handover Specification (`docs/EXTERNAL_DEVELOPER_SPEC.md`)](docs/EXTERNAL_DEVELOPER_SPEC.md):** Comprehensive technical handover reference.
- **[Contributing Guidelines (`CONTRIBUTING.md`)](CONTRIBUTING.md):** Code conventions, commit standards, and pull request workflows.

---

## License & Maintainers

Maintained by **Taste of Village** and **Falooda & Co** engineering.  
Copyright &copy; 2026 Taste of Village. All rights reserved.
