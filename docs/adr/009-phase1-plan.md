> **⚠️ SUPERSEDED** — This ADR was created in a prior session and has been replaced by ADR-010 through ADR-017 as of 2026-10-25 per Spec v3.0 re-baseline. It is retained for historical reference only.

# ADR-009: Phase 1 Detailed Plan & Risk Analysis

## Status
Accepted

## Context
Phase 1 (2 weeks) establishes the foundation for all subsequent work. This ADR documents the detailed task breakdown, dependencies, and risk mitigation.

## Phase 1 Task Breakdown (2 Weeks = 10 Working Days)

### Week 1: Foundation & Research

#### Day 1-2: Reference Project Deep Dive
- [ ] Clone and run EmDash locally (pnpm install, pnpm dev)
- [ ] Analyze EmDash plugin sandbox architecture (Worker isolates, Bridge API)
- [ ] Clone and run Payload CMS locally
- [ ] Analyze Payload's field system, admin UI, GraphQL generation
- [ ] Clone and run Strapi 5 locally
- [ ] Analyze Strapi's content-type builder, plugin system
- [ ] **Research PHP WASM**: @php-wasm/node, @nexustools/php, WordPress Playground
- [ ] **Deliverable**: Comparative analysis doc (docs/research/reference-projects.md)

#### Day 3: Monorepo Setup
- [ ] pnpm workspaces with apps/ + packages/ + tools/
- [ ] TypeScript strict config (noUncheckedIndexedAccess, exactOptionalPropertyTypes)
- [ ] ESLint 9 flat config + Prettier + Husky + lint-staged
- [ ] GitHub Actions CI (lint, typecheck, test, build)
- [ ] Docker Compose (PostgreSQL 16 + pgvector + Adminer)
- [ ] **Deliverable**: Working monorepo with CI passing

#### Day 4-5: Database Layer
- [ ] Drizzle ORM schemas (PostgreSQL + SQLite unified)
- [ ] Migrations system (drizzle-kit)
- [ ] Seed data (bilingual demo content)
- [ ] Database adapters: PostgreSQLAdapter + SQLiteAdapter
- [ ] **Deliverable**: @sard/db package with adapters, migrations passing

### Week 2: Core Architecture & Adapters

#### Day 6: Deployment Abstraction Layer (@sard/runtime)
- [ ] Define adapter interfaces (Runtime, Database, Storage, Cache, Queue)
- [ ] Implement SQLiteAdapter (Lite mode)
- [ ] Implement PostgreSQLAdapter (Cloud/Docker)
- [ ] Implement MemoryCacheAdapter + FilesystemCacheAdapter
- [ ] Implement MemoryQueueAdapter
- [ ] sard.config.ts schema + validation
- [ ] **Deliverable**: @sard/runtime package with adapters

#### Day 7: Core CMS Types
- [ ] Collection/Field definitions (Zod schemas)
- [ ] Portable Text types + validation
- [ ] Content versioning types
- [ ] User/Role/Capability types
- [ ] **Deliverable**: @sard/core package

#### Day 8: Portable Text Engine
- [ ] Zod schema for Portable Text
- [ ] HTML renderer (semantic, CLS-safe)
- [ ] Plain text renderer (for AEO/email)
- [ ] HTML → Portable Text migrator
- [ ] Direct Answer extractor (40-60 words)
- [ ] **Deliverable**: @sard/portable-text package with tests

#### Day 9: PHP WASM Research & PoC
- [ ] Evaluate @php-wasm/node vs @nexustools/php vs WordPress Playground
- [ ] Build minimal PoC: Load WP plugin in WASM, call Bridge API
- [ ] Document resource limits, API surface, limitations
- [ ] **Deliverable**: docs/research/php-wasm-poc.md

#### Day 10: Integration & CI
- [ ] Wire all packages together
- [ ] Full CI pipeline passing (lint, typecheck, test, build)
- [ ] Docker Compose for local dev (PostgreSQL + SQLite)
- [ ] Documentation: README, CONTRIBUTING, ADR index
- [ ] **Deliverable**: Phase 1 complete, ready for Phase 2

## Risk Analysis & Mitigation

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **PHP WASM performance insufficient** for production WP plugins | High | High | - PoC in Day 9 validates early
- Fallback: Document unsupported plugins
- Native alternatives (Level 4) as primary path |
| **Drizzle SQLite vs PostgreSQL parity issues** | Medium | High | - Unified schema with dialect-aware migrations
- Test suite runs against both dialects in CI
- Use Drizzle's pgTable/sqliteTable with same column definitions |
| **Visual editor iframe sync complexity** | High | High | - Defer full editor to Phase 3
- Phase 2: Basic Portable Text editor (textarea + block toolbar)
- Use PartyKit for WebSocket infrastructure (proven) |
| **Design token system over-engineering** | Medium | Medium | - Start with Tailwind CSS v4 config as token source
- Extract to JSON only when multi-platform needed
- Figma sync as Phase 3+ |
| **PHP WASM sandbox escape** | Low | Critical | - No filesystem/net/eval in WASM build
- Bridge API is ONLY communication path
- Resource limits via WASM memory limits
- Audit Trail on every bridge call |
| **Dual database (PG/SQLite) migration drift** | Medium | Medium | - Single source of truth: Drizzle schema
- drizzle-kit generates both dialect migrations
- CI tests against both |
| **Shared hosting Node.js version constraints** | Medium | High | - Target Node.js 20 LTS (available on Hostinger, cPanel)
- Bun single binary as alternative (no Node install needed)
- install.php detects environment and fetches correct binary |
| **Scope creep in Phase 1** | High | High | - Strict Definition of Done per task
- No UI work beyond token definitions
- No editor beyond Portable Text textarea
- No WP plugin runtime beyond PoC |

## Success Criteria (Phase 1 Complete)
- [ ] Monorepo builds and passes CI (lint, typecheck, test, build)
- [ ] @sard/db works with both PostgreSQL and SQLite
- [ ] @sard/runtime switches adapters via config
- [ ] @sard/core exports validated types
- [ ] @sard/portable-text renders HTML + extracts direct answers
- [ ] PHP WASM PoC loads a simple WP plugin
- [ ] All ADRs (001-009) documented
- [ ] CI/CD pipeline green
- [ ] Documentation sufficient for Phase 2 onboarding

## Dependencies for Phase 2
Phase 2 can start when:
1. All Phase 1 packages publishable (versioned, built)
2. Adapter pattern proven (PG + SQLite both work)
3. PHP WASM PoC demonstrates viable Bridge API
4. CI/CD reliably catches regressions
