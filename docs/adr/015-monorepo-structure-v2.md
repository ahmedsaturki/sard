# ADR-015: Monorepo Structure v2 (Payload-based)

**Status:** Accepted  
**Supersedes:** ADR-002

## Context
ADR-002's structure assumed a custom core. With Payload 3 as nucleus (ADR-010), the layout must host a Next.js Payload app while keeping the existing reusable packages.

## Decision
pnpm workspaces, same root, reorganized:

```
apps/
  lite/               # NEW — Payload 3 app (Next.js 15, admin, content, /install)
  static/             # Phase 3 — static export pipeline
  docs/               # KEPT — documentation site
  demo/               # REPURPOSED — Phase 3 demo (or removed)
  admin/              # SUPERSEDED — frozen; custom views migrate into apps/lite admin; deleted after Phase 2
packages/
  db-sqlcipher/       # NEW — SQLCipher WASM worker pool + Payload adapter (ADR-012)
  sandbox/            # NEW — process isolation wrapper (ADR-013 L1)
  wp-runtime/         # REBUILT — @php-wasm/node + Bridge API (ADR-016 L1)
  wp-compat/          # KEPT + TESTS — WXR parser, theme converter, migration (L2/L3)
  portable-text/      # KEPT — validation/render/migration (used by wp-compat + export)
  design-tokens/      # KEPT
  components/         # KEPT (rebranded for Payload admin where used)
  client-handoff/     # KEPT — HC-11 logic layer
  edge-adapter/       # KEPT — Phase 4 (Cloud target)
  mcp-server/         # KEPT — Phase 4.5 only (AC-09)
  runtime/            # SLIMMED — PostgreSQL adapter + config only (Lite uses db-sqlcipher)
  core/               # FROZEN — legacy; surviving types folded into apps/lite + db-sqlcipher, then removed
  plugin-sdk/         # FROZEN — replaced by wp-runtime Bridge + Payload plugins
  cli/                # KEPT — sard migrate / sard export
tools/                # KEPT — eslint/tsconfig/vitest configs
docs/adr/  docs/research/  docs/evidence/   # evidence dir NEW (AC-12)
```

Rules: TypeScript strict + no-any (existing ESLint config, extended with no-vm rule); Conventional Commits (MC-05); lockfile committed; package <= 50MB tarball check in CI (HC-15).

## Alternatives Considered
1. Keep apps/admin as admin — Rejected: Payload ships a production admin; two admins = double maintenance.
2. Separate repos per app — Rejected: atomic changes across core+db+app are the norm here.

## Consequences
Positive: reuses ~40% of existing code (portable-text, wp-compat, design-tokens, components, client-handoff, edge-adapter); clear ownership per package.
Negative: migration work in Phase 1 week 2 (scaffolding apps/lite, re-pointing shared deps); frozen packages must be deleted before Phase 4 to avoid bitrot.

## Validation Plan
- pnpm install && pnpm build green on 512MB runner (GATE 1).
- Dependency graph check: no package imports a frozen package (ESLint import boundary rule).
