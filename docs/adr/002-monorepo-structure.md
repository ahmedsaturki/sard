> **⚠️ SUPERSEDED** — This ADR was created in a prior session and has been replaced by ADR-010 through ADR-017 as of 2026-10-25 per Spec v3.0 re-baseline. It is retained for historical reference only.

# ADR-002: Monorepo Structure

## Status
Accepted

## Context
Sard is a multi-package system:
- Core CMS engine
- Admin UI
- Edge runtime adapters
- Plugin SDK
- CLI tools
- Documentation site

A monorepo enables:
- Shared types and utilities
- Atomic commits across packages
- Consistent tooling (lint, test, build)
- Easier dependency management

## Decision
Use **pnpm workspaces** with the following structure:

```
sard/
├── apps/
│   ├── admin/              # React admin dashboard
│   ├── docs/               # Astro documentation site
│   └── demo/               # Demo site showcasing Sard
├── packages/
│   ├── core/               # CMS core: collections, fields, content engine
│   ├── portable-text/      # Portable Text parser, validator, renderer
│   ├── plugin-sdk/         # Plugin development SDK + sandbox runtime
│   ├── edge-adapter/       # Cloudflare Workers / Vercel Edge adapters
│   ├── db/                 # Drizzle schemas, migrations, seeds
│   ├── mcp-server/         # Model Context Protocol server
│   └── cli/                # Sard CLI (create, migrate, deploy)
├── tools/
│   ├── eslint-config/      # Shared ESLint config
│   ├── tsconfig/           # Shared TypeScript configs
│   └── vitest-config/      # Shared test config
├── docs/
│   └── adr/                # Architecture Decision Records
├── docker-compose.yml      # Local Postgres + adminer
├── pnpm-workspace.yaml
├── package.json            # Root: scripts, dev deps
├── tsconfig.base.json
├── turbo.json              # Turborepo (optional, for caching)
└── .github/workflows/      # CI/CD
```

### Tooling
- **pnpm** for package management (faster, disk-efficient)
- **Turborepo** (optional) for build caching
- **Changesets** for versioning and releases
- **Husky + lint-staged** for pre-commit hooks

## Consequences
### Positive
- Clear separation of concerns
- Shared configs reduce duplication
- Independent versioning of packages
- Easier onboarding (docs site in-repo)

### Negative
- Larger initial setup
- More complex CI (need to test all packages)

## Compliance
This structure supports all 7 layers:
- `packages/core` → Layer 1 (Core)
- `packages/portable-text` → Layer 2 (Structured Content)
- `packages/plugin-sdk` → Layer 3 (Security)
- `packages/edge-adapter` → Layer 4 (Performance)
- `apps/admin` → Layer 7 (RTL, Accessibility)
- `packages/mcp-server` → Layer 6 (Agents)
