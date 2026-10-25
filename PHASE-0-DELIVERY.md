## Phase 0 — Foundation ADRs + Re-baseline — DELIVERY

### ✅ Delivered
- ADR-010: Stack Choice (Payload CMS 3) — supersedes ADR-001 — enforces AC-07
- ADR-011: Deployment Targets (Lite First) — supersedes ADR-004 — enforces AC-01/AC-02
- ADR-012: SQLite Strategy (SQLCipher Worker Pool) — supersedes parts of 001/006 — enforces AC-06/HC-07
- ADR-013: Security Model (6 Layers) — supersedes ADR-005 — enforces AC-05/AC-06/AC-11/HC-04/HC-06
- ADR-014: Killer Use Case (Agency Client Handoff) — implements MC-08/HC-11/HC-12 (user-confirmed)
- ADR-015: Monorepo Structure v2 — supersedes ADR-002 — Payload-based layout
- ADR-016: WordPress Compatibility (4 Levels Updated) — supersedes ADR-008 — L1 re-anchored to process isolation
- ADR-017: Testing & Verification Strategy (Mixed Model) — enforces AC-03/AC-04/AC-12 + CI gates
- ADR index (docs/adr/README.md) with active/superseded tables
- All 9 original ADRs (001-009) marked **SUPERSEDED** with notices

### 📊 Evidence
- ADR files: docs/adr/010-*.md through 017-*.md
- ADR index: docs/adr/README.md
- Superseded notices prepended to 001-009

### 📚 Docs
- ADRs: [docs/adr/](docs/adr/) — 17 total (8 new + 9 superseded + index)
- Spec v3.0 re-baseline rationale documented in each ADR's Context section

### 🎯 Acceptance Criteria Met (GATE 0)
- [x] 7 new ADRs written (010-016) + ADR-017 (verification strategy) — all with Context, Decision, Alternatives, Consequences
- [x] Killer Use Case defined in ADR-014 (Agency Client Handoff)
- [x] Stack decision documented in ADR-010 (Payload CMS 3)
- [x] Security model documented in ADR-013 (6 layers, process-first)
- [x] SQLite strategy documented in ADR-012 (SQLCipher + worker pool)
- [x] User approved all three strategic decisions (2026-10-25)
- [x] 24-hour objection window: no objections (user confirmed)

### ⚠️ Risks & Mitigations
- **Risk:** Payload 3 memory footprint on 512MB/1-core — **Mitigation:** Phase 1 PoC (day 1-2) gates continuation; fallback ADR ready
- **Risk:** No GitHub remote yet — CI gates marked PENDING-CI until remote exists — **Mitigation:** CI configs committed runnable-ready
- **Risk:** Payload DatabaseAdapter on SQLCipher is new code — **Mitigation:** PoC day 4, fallback to custom adapter if needed
- **Risk:** php-wasm extension coverage gaps — **Mitigation:** supported matrix documented, unsupported plugins declared in L1 docs

### 🔜 Next Phase Preview
**Phase 1 — Foundation (2 weeks):**
1. pnpm install approved packages (payload, @php-wasm/node, 7mind/sqlcipher-wasm, @node-rs/argon2, zod, helmet, etc.)
2. PoC: Payload 3 standalone — boot < 30s, memory at rest < 350MB
3. TDD: @sard/db-sqlcipher worker pool + AES-256 + key from env
4. apps/lite: Payload 3 app with ar/en collections, Argon2id users
5. /install flow from browser (no shell) + security baseline
6. RTL admin/frontend + automated RTL tests
7. CI v2: 512MB job, k6 perf, lighthouse, SBOM, npm audit

### 🤔 Questions for User
1. **GitHub remote:** Need to create/connect `github.com/bunya-labs/sard` (or your preferred remote) for CI to run. Can you create it and push, or shall I commit CI configs locally and document as "ready"?
2. **Snyk token** for HC-08? (Otherwise npm audit + audit-ci documented as substitute per ADR-017)
3. **5 users for HC-13 (Phase 2 week 4):** Do you have agency contacts for usability sessions, or shall we simulate with documented script and mark as "recruitment needed"?
