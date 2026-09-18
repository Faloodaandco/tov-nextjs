# AGENTS.md

Guidance and configuration for automated agents working on the Taste of Village (TOV) Next.js codebase.

## Core Rules

1. **Client Decoupled Standard:** Zero in-store POS, KDS screens, or edge hardware scripts. Standalone Next.js marketing and direct-ordering website only.
2. **Anti-Slop Guardrails:** No generic filler. Active voice. Strict zero generative AI food imagery (`generate_image` BAN). No cut-and-paste 2D composite graphics.
3. **No Hallucinations:** Verify APIs, route contracts, and Square/Firebase integrations against source code and official specs.

## Agent Skills

### Issue Tracker
GitHub Issues on `Faloodaandco/tov-nextjs`. See `docs/agents/issue-tracker.md`.

### Domain Docs
Single-context layout (`CONTEXT.md` and `docs/adr/`). See `docs/agents/domain.md`.
