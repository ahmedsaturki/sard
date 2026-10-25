# ADR-010: Stack Choice (Payload CMS 3)

**Status:** Accepted  
**Supersedes:** ADR-001

## Context
Sard must be built on an existing CMS (AC-07: "لا تبنِ CMS من الصفر — استخدم Payload CMS أو EmDash").  
The existing ADR-001 chose "custom TypeScript core inspired by EmDash" — this violates AC-07 (absolute constraint).  
Payload CMS 3.x is the only mature, actively maintained, TypeScript-first CMS with:
- Built-in GraphQL + REST auto-generation
- Localization (i18n) out of the box
- Admin UI with RTL support (React-based)
- Lexical rich text editor (Portable Text compatible blocks)
- SQLite adapter via Drizzle (for Sard Lite target)
- Plugin architecture (for WP Compat layer)
- Argon2id support via community plugin

## Decision
**Payload CMS 3.x** is the nucleus of Sard Lite (Phase 1-2).  
- `apps/lite`: Payload 3 app (Next.js 15 embedded, React 19 admin)
- Collections: `posts` (ar/en), `pages`, `media`, `users`, `settings` (singleton)
- Database: SQLite via `@payloadcms/db-sqlite` (Drizzle + libSQL) **wrapped by `@sard/db-sqlcipher`** for AES-256 encryption (AC-06)
- Auth: Argon2id (via `@node-rs/argon2`), JWT sessions TTL ≤ 15min (HC-06)
- RTL: Arabic-first admin + frontend (HC-10)
- Node 20+ target (shared hosting compatibility — AC-01)

## Alternatives Considered
1. **EmDash** — Rejected: early-stage, edge-first (Cloudflare Workers), not suited for shared hosting Lite target, "Empty Ecosystem" as noted in spec.
2. **Custom Core (ADR-001)** — Rejected: violates AC-07 (absolute), duplicates effort, delays MVP by 6+ months.
3. **Strapi** — Rejected: heavier, less TypeScript-native, SQLite support weaker.

## Consequences
**Positive:**
- AC-07 compliance (no CMS from scratch)
- Faster Phase 1-2 (Payload provides 70% of MVP out of box)
- Built-in localization, auth, admin, GraphQL
- Active community, plugin ecosystem

**Negative:**
- Payload admin customization needed for Client Handoff (HC-11)
- SQLite adapter requires sqlcipher-wasm wrapper (AC-06)
- Payload memory footprint must be tuned for 512MB target (HC-03)

## Validation Plan
- Phase 1 PoC: Payload 3 standalone on Node 20 — boot < 30s, memory at rest < 350MB
- k6 100VU/60s on 512MB runner (CI) — p95 < 100ms, no freeze
- RTL admin + frontend visual tests (Playwright)
