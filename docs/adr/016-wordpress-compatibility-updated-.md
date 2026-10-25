# ADR-016: WordPress Compatibility Layer (4 Levels — Updated)

**Status:** Accepted  
**Supersedes:** ADR-008 (levels retained; L1 mechanics updated for Lite)

## Context
ADR-008 defined 4 levels (L1 PHP-WASM runtime, L2 theme conversion, L3 migration toolkit, L4 native alternatives). Its L1 assumed V8-isolate execution; on Sard Lite (shared hosting) the spec-mandated isolation is process-level (ADR-013). This ADR re-anchors L1 to Lite reality.

## Decision
- **L1 (Lite):** packages/wp-runtime = @php-wasm/node (WordPress Playground runtime, MIT) executing each WP plugin inside a separate child process (ADR-013 L1) with: virtual FS (plugin dir only), proxied egress (allowlist), memory cap 64MB, wall-clock cap 5s/request, kill switch. Communication over the Bridge API (from ADR-008: content read/write scoped, options prefixed, parameterized queries only, no raw SQL, no eval). Target 5 plugins (GATE 2): Yoast SEO, Contact Form 7, Akismet, WP-Super-Cache, WooCommerce (cart/checkout scoped). Each plugin = fixture (real plugin zip from wordpress.org) + integration test + screenshot evidence.
  - gVisor is used where available: Docker/Cloud targets (Phase 4, GATE 4 escape test). On Windows dev: process isolation only (documented).
- **L2 (Phase 3):** theme conversion — wp-compat's ThemeConverter (exists, untested) → Astro; target: Twenty Twenty-Four, visual regression < 2% pixel diff (Playwright).
- **L3 (Phase 4):** migration toolkit — sard migrate wordpress (WXR/XML-Import + REST fetch): >= 100 posts < 30 min, 100% URL preservation + 301 map, media re-linking, SEO meta (Yoast/RankMath) → JSON-LD, validation report. wp-compat's WXRParser (exists) is the base.
- **L4 (ongoing):** native alternatives table from ADR-008 kept (forms, seo, commerce, i18n, editor, performance).

## Alternatives Considered
1. Run full WordPress in php-wasm (WordPress Playground style) — Rejected for Lite: 100MB+ memory per instance, 512MB budget allows at most 2-3; plugin-level execution is the right granularity.
2. Skip L1 in MVP — Rejected: beats WordPress on the same hosting (spec's real question) requires plugins to work, and 96% of WP sites live on plugins.

## Consequences
Positive: agencies migrate clients incrementally (risk ≈ 0, ADR-008 promise); 5 real plugins as GATE 2 evidence.
Negative: php-wasm supports a fixed extension set (core, mbstring, json, openssl, pdo_sqlite, curl, zip, gd) → plugins needing exotic extensions are declared unsupported (documented matrix); per-process memory → concurrency cap 5.

## Validation Plan
- L1: 5/5 plugins pass integration tests (render page + one plugin action each) with zero host FS/net escape (process audit + audit_log).
- L2: TT4 screenshot diff < 2% on 3 viewports.
- L3: synthetic 150-post WXR fixture → < 30 min wall, 0 broken links in report.
