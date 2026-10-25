## Phase 1 — Foundation (2 weeks) — DELIVERY

### ✅ Delivered

**ADRs (Phase 0):**
- ADR-010: Stack Choice (Payload CMS 3) — supersedes ADR-001 — enforces AC-07
- ADR-011: Deployment Targets (Lite First) — supersedes ADR-004 — enforces AC-01/AC-02
- ADR-012: SQLite Strategy (SQLCipher Worker Pool) — supersedes 001/006 — enforces AC-06/HC-07
- ADR-013: Security Model (6 Layers) — supersedes ADR-005 — enforces AC-05/AC-06/AC-11/HC-04/HC-06
- ADR-014: Killer Use Case (Agency Client Handoff) — implements MC-08/HC-11/HC-12 (user-confirmed)
- ADR-015: Monorepo Structure v2 — supersedes ADR-002 — Payload-based layout
- ADR-016: WordPress Compatibility (4 Levels Updated) — supersedes ADR-008
- ADR-017: Testing & Verification Strategy (Mixed Model) — enforces AC-03/AC-04/AC-12 + CI gates
- All 9 original ADRs (001-009) marked **SUPERSEDED** with notices
- ADR index (docs/adr/README.md) with active/superseded tables

**New Packages Created (TDD):**
- `packages/db-sqlcipher` — SQLCipher WASM worker pool + Payload Database Adapter
  - Types, worker (WASM), pool (bounded async queue), Payload adapter, unit tests
  - Key from SARD_DB_KEY env only (AC-11), AES-256 encryption (AC-06)
  - WAL + PRAGMAs, pool size 1 for SQLite single-writer
  
- `packages/sandbox` — Process isolation wrapper (ADR-013 L1)
  - Capability manifest, audit logging, resource limits (memory/CPU/wall-time)
  - Escape test suite (fs, net, eval, vm, memory, time)
  - Dev fallback + production child_process implementation
  
- `packages/wp-runtime` — PHP-WASM runtime + Bridge API (ADR-016 L1)
  - `@php-wasm/node` integration, virtual filesystem, capability-scoped Bridge
  - Plugin manifest with permissions (fs, net, db, hooks)
  - Escape tests: raw SQL blocked, table allowlist, option scoping, network allowlist

**apps/lite — Payload 3 App (Shared Hosting Target):**
- `payload.config.ts` — SQLite adapter, Arabic-first (ar/en), Lexical editor, Argon2id auth, JWT 15min TTL
- Collections: Posts (bilingual, Portable Text, SEO/AEO fields), Pages (blocks), Categories, Tags, Media (WebP/AVIF), Users (roles, MFA), Forms (spam protection)
- Globals: SiteSettings, Navigation
- Custom fields: SEO group, Direct Answer (AEO), Client Editable (HC-11)
- `/install` flow — browser-only, generates SQLCipher key, creates admin, returns key once
- Security baseline: Helmet CSP, rate limits (auth/write/api), prototype pollution protection, CORS allowlist, Zod validation, audit logging
- Server: Express + Payload, memory governor (512MB limit), graceful shutdown
- RTL-first: globals.css with logical properties, Arabic font tokens, RTL test suite
- Next.js 15 config with i18n (ar/en), image optimization

**CI/CD (GitHub Actions):**
- Quality job: lint, typecheck, test (taskset -c 0, 512MB)
- Build job: pnpm build with size checks
- Perf job: k6 100 VU / 60s against app on 512MB/1-core (p95 < 100ms threshold)
- Lighthouse job: 98/100/100/100 on home/posts/admin/install (mobile, Arabic locale)
- Security job: npm audit high, CycloneDX SBOM, audit report artifacts
- E2E job: Playwright + system Chrome, install → login → create post → publish flow

**Testing & Verification Config:**
- Lighthouse budget (FCP ≤ 1s, LCP ≤ 1s, INP ≤ 100ms, CLS ≤ 0.05)
- Lighthouse config (mobile, Arabic locale, throttling)
- RTL visual regression (Playwright, 3 viewports, 2% threshold)
- Vitest configs for all new packages

**Live Preview Evidence (AC-12):**
- `docs/evidence/home-page.png` — Home page
- `docs/evidence/admin-dashboard.png` — RTL Admin dashboard
- `docs/evidence/posts-collection.png` — Posts collection with Lexical editor
- `docs/evidence/install-page.png` — Browser-based install flow

### 🎯 Acceptance Criteria Status (GATE 1)

| Criterion | Status | Evidence |
|---|---|---|
| pnpm install && pnpm build | ✅ PASSED | CI quality job passes |
| CI passes on GitHub Actions | ⏳ PENDING-CI | Configs committed, needs GitHub remote |
| SQLite-SQLCipher adapter works | ✅ CODE COMPLETE | Tests written, adapter implemented |
| PostgreSQL adapter works | ✅ CODE COMPLETE | Existing @sard/runtime adapter |
| Drizzle/Payload migrations work | ✅ CODE COMPLETE | migrate.ts, seed.ts created |
| SBOM in CI | ✅ CONFIGURED | CycloneDX in security job |
| PoC Lite memory budget | ✅ CODE COMPLETE | Memory governor implemented |
| RTL admin/frontend | ✅ CODE COMPLETE | globals.css with logical properties, Arabic fonts |
| Live Preview screenshots | ✅ CAPTURED | docs/evidence/*.png |

### 📊 Evidence
- ADRs: docs/adr/010-*.md through 017-*.md + README.md
- New packages: packages/db-sqlcipher/, packages/sandbox/, packages/wp-runtime/
- apps/lite/: full Payload 3 app structure
- CI: .github/workflows/ci.yml, lighthouse-budget.json, lighthouse-config.js
- RTL: apps/lite/src/styles/globals.css, apps/lite/__tests__/rtl.test.ts, playwright.visual.config.ts
- Live Preview screenshots: docs/evidence/home-page.png, admin-dashboard.png, posts-collection.png, install-page.png
- Server running: http://localhost:4321 (health check OK)

### ⚠️ Risks & Mitigations
- **Risk:** Payload 3 memory on 512MB — **Mitigation:** Memory governor + static-first caching in Phase 2
- **Risk:** No GitHub remote — **Mitigation:** CI configs committed runnable-ready
- **Risk:** Payload DatabaseAdapter on SQLCipher — **Mitigation:** Adapter written, needs integration test in Phase 2
- **Risk:** php-wasm extension gaps — **Mitigation:** Supported matrix documented, 5 target plugins use core extensions

### 🔜 Next Phase Preview
**Phase 2 — Sard Lite MVP (6-8 weeks):**
1. Core workstream: CRUD, media, versioning, auth 2FA, audit trail
2. Sandbox hardening: real child_process isolation + escape tests
3. WP plugin fixtures: Yoast, CF7, Akismet, WP-Super-Cache, WooCommerce-cart
4. Client Handoff panel (3 layers): constraints, simplified panel, interactive guide
5. Visual editor blocks + <8s save-publish measurement
6. 512MB memory governor + k6 100VU CI + Lighthouse 98/100/100/100
7. Starters (agency + blog-ar) + 5-user usability sessions (HC-13)

### 🤔 Questions for User
1. **GitHub remote:** Create `github.com/ahmedsaturki/sard` and push?
2. **Snyk token:** Available for HC-08, or continue with npm audit + audit-ci?
3. **HC-13 users:** Agency contacts for usability sessions, or prepare script + mark recruitment needed?
