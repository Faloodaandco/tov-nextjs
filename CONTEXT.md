# Context: Taste of Village (TOV) Web Platform

## Domain Overview
Taste of Village is an authentic Pakistani restaurant brand operating two flagship locations in Greater London / Berkshire:
1. **Hayes**: 766B Uxbridge Rd, Hayes UB4 0RU (Tenant: `f0b00da2-4444-4444-4444-000000000004`)
2. **Slough**: 260 Farnham Road, Slough SL1 4XL (Tenant: `f0b00da2-4444-4444-4444-000000000005`)

## Architectural Seams
- **Framework:** Next.js (App Router), Tailwind CSS.
- **Canonical Production Domain:** `https://tasteofvillagerestaurants.co.uk/`
- **Hosting:** Vercel (Auto-deploy from `master` on `Faloodaandco/tov-nextjs`).
- **Database & Auth:** Firebase Firestore & Firebase Auth (`taste-of-village-21052`).
- **Payments & Checkout:** Square Web Payments SDK (client) + Next.js API route `/api/checkout/square` (server-side order creation via Square REST API).
- **Multi-Branch Context:** Route-driven via `/[locationId]/*` (`/hayes/*` and `/slough/*`).
- **Decoupled Boundary:** Web platform ONLY. Zero in-store POS, thermal printer drivers, or KDS interfaces belong in this repository.
