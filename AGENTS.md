# AGENTS.md

Guidance and configuration for automated agents working on the Taste of Village (TOV) Next.js codebase.

## Core Rules

1. **Client Decoupled Standard:** Zero in-store POS, KDS screens, or edge hardware scripts. Standalone Next.js marketing and direct-ordering website only.
2. **Anti-Slop Guardrails:** No generic filler. Active voice. Strict zero generative AI food imagery (`generate_image` BAN). No cut-and-paste 2D composite graphics.
3. **No Hallucinations:** Verify APIs, route contracts, and Square/Firebase integrations against source code and official specs.
4. **Elite Design Standard:** ALWAYS apply the following design skills automatically for ANY UI/UX work without being asked: `design-taste-frontend`, `beautiful-web-ui-design`, `ui-ux-pro-max`, `owl-ui-design-mastery`, `owl-visual-critique`, `antigravity-design-expert`. UI must be clean, editorial, transparent, fast, and highly refined (no generic boxed cards or cheap drop shadows).
5. **Canonical Domain Invariant:** The ONLY valid domain for Taste of Village is `https://tasteofvillagerestaurants.co.uk/`. NEVER assume, generate, or use placeholders like `tasteofvillage.co.uk`. All URLs, examples, Apple Pay domain verifications, webhooks, and tracking links MUST use `tasteofvillagerestaurants.co.uk`.
6. **Next.js Vercel Build Strictness:** Vercel builds fail immediately on strict Next.js syntax/type errors. ALWAYS escape JSX entities (`&` must be `&amp;`, `<` must be `&lt;`). NEVER blindly import from UI libraries (like `lucide-react`) without verifying the export exists locally, to avoid `TS2305` build crashes. If Vercel isn't updating, check the dashboard for strict build failures or active dashboard filters (like Author or Status Error) hiding the latest deployment.
7. **Multi-Brand Isolation & Webhook Invariant:** NEVER share or fallback Meta WhatsApp Phone IDs, WABA IDs, or Catalog IDs between brands (Falooda & Co vs Taste of Village Hayes vs Taste of Village Slough). Dynamic phone resolution MUST match the active branch/location explicitly (`branchKey === 'slough' ? TOV_SLOUGH_PHONE_ID : TOV_HAYES_PHONE_ID`). Square Webhook endpoints MUST be registered to the canonical WWW domain (`https://www.tasteofvillagerestaurants.co.uk/api/webhooks/square`) to avoid HTTP 308 redirect payload drops. In Square Webhook HMAC-SHA256 verification, NEVER confuse Webhook Subscription IDs (`wbhk_...`) with Signature Keys.
8. **Brand Motif & Background Pattern Standard:**
   - **Dark Backgrounds (`#0E1F1A`, `#1A3C34`):** ALWAYS use `/assets/tov-pattern-light.svg` with container opacity `0.6` to `0.8` (since the SVG has an internal `0.12` stroke opacity). NEVER use `tov-pattern.svg` on dark backgrounds.
   - **Light Backgrounds (`#FAF5EE`, `#FDF5F2`):** ALWAYS use `/assets/tov-pattern.svg` with container opacity `0.03` to `0.05`.
   - Never remove or obscure the signature cross-stitch diamond motif from page footers or hero sections without explicit approval.
9. **Headless Git Push Protocol (WSL Environment):**
   - Headless `git push` commands can stall on Windows GUI Credential Manager.
   - When pushing programmatically in this environment, retrieve `GITHUB_TOKEN` from `.env.local` and execute via:
     `GITHUB_TOKEN=$(grep -E "^GITHUB_TOKEN=" .env.local | cut -d'=' -f2) && git push "https://x-access-token:${GITHUB_TOKEN}@github.com/Faloodaandco/tov-nextjs.git" <branch>`


## Agent Skills

### Tooling & Workflow (Matt Pocock Skills)
The full suite of Matt Pocock agent skills has been installed globally (prefix: `mattpocock-`). Use these for standard engineering workflows:
- **Engineering**: `mattpocock-codebase-design`, `mattpocock-tdd`, `mattpocock-diagnosing-bugs`, `mattpocock-implement-spec`, `mattpocock-code-review`, `mattpocock-wizard`
- **Productivity**: `mattpocock-grilling`, `mattpocock-grill-me`, `mattpocock-teach`, `mattpocock-writing-for-agents`
- **Misc**: `mattpocock-setup-pre-commit`, `mattpocock-git-guardrails-claude-code`, `mattpocock-migrate-to-shoehorn`

### Issue Tracker
GitHub Issues on `Faloodaandco/tov-nextjs`. See `docs/agents/issue-tracker.md`.

### Domain Docs
Single-context layout (`CONTEXT.md` and `docs/adr/`). See `docs/agents/domain.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
