# AGENTS.md

Guidance and configuration for automated agents working on the Taste of Village (TOV) Next.js codebase.

## Core Rules

1. **Client Decoupled Standard:** Zero in-store POS, KDS screens, or edge hardware scripts. Standalone Next.js marketing and direct-ordering website only.
2. **Anti-Slop Guardrails:** No generic filler. Active voice. Strict zero generative AI food imagery (`generate_image` BAN). No cut-and-paste 2D composite graphics.
3. **No Hallucinations:** Verify APIs, route contracts, and Square/Firebase integrations against source code and official specs.
4. **Elite Design Standard:** ALWAYS apply the following design skills automatically for ANY UI/UX work without being asked: `design-taste-frontend`, `beautiful-web-ui-design`, `ui-ux-pro-max`, `owl-ui-design-mastery`, `owl-visual-critique`, `antigravity-design-expert`. UI must be clean, editorial, transparent, fast, and highly refined (no generic boxed cards or cheap drop shadows).

## Agent Skills

### Issue Tracker
GitHub Issues on `Faloodaandco/tov-nextjs`. See `docs/agents/issue-tracker.md`.

### Domain Docs
Single-context layout (`CONTEXT.md` and `docs/adr/`). See `docs/agents/domain.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
