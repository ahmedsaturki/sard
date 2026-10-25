# ADR-011: Deployment Targets (Sard Lite First)

**Status:** Accepted  
**Supersedes:** ADR-004 (Edge Runtime Strategy)

## Context
ADR-004 made Cloudflare Edge the primary target. The spec's absolute constraint AC-01 demands the opposite priority: Sard Lite must run on shared hosting with Node.js (256-512MB RAM, 1 core, no root, no shell access) — this is ~90% of the market (WordPress's actual install base). Edge-first would skip the market Sard exists to win.

## Decision
Target priority, in build order:
1. **Sard Lite (v1.0 MVP):** Next.js (Payload 3) standalone Node.js server on shared hosting (Node 20+, 512MB/1-core budget). SQLite+SQLCipher single-file DB. Local filesystem media storage. This is the Phase 2 GATE.
2. **Sard Static (v1.x):** Static export from the same collections (Phase 3) — any PHP-only/custom panel hosting.
3. **Sard Docker (v2.0):** Containerized, gVisor runtime class for sandboxing (Phase 4).
4. **Sard Cloud (v2.0+):** Edge adapters (Cloudflare Workers / Vercel) from existing packages/edge-adapter (Phase 4).

The Deployment Abstraction Layer (ADR-006) is kept as the interface contract; adapters ship in target order.

## Alternatives Considered
1. Edge-first (ADR-004) — Rejected: skips the 90% shared-hosting market; edge runtimes (no Node APIs, memory ceilings) conflict with the 512MB/1-core budget and with running PHP-WASM.
2. Docker-first — Rejected: requires VPS/root; excludes the target segment by definition.

## Consequences
Positive: MVP serves the killer segment; local dev == production shape; every later target reuses the same core.
Negative: Edge targets land later (Phase 4); TTFB <= 50ms (HC-01) must be met via caching/ISR on Lite, not edge proximity — validated by Lighthouse CI.

## Validation Plan
- Phase 2: apps/lite boots with node server.js under NODE_OPTIONS=--max-old-space-size=512, 1 core (taskset in CI), k6 100VU/60s no freeze.
- Phase 5: real Hostinger deploy <= 5 minutes with recorded evidence.
