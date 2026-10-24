# Sard — سَرد

> **Content that flows anywhere — محتوى يسري أينما كان**

**Sard is not a CMS. Sard is a Content Operating System** — an API-first,
composable, edge-deployed content platform with agentic AI support, a secure
sandboxed plugin system, and Arabic/RTL as first-class citizens.

Built by **Bunya Labs — بُنية لابز** under the MIT license.

---

## The problem with WordPress — and how Sard fixes it at the root

| WordPress flaw | Sard's architectural answer |
|---|---|
| 96% of vulnerabilities come from plugins | Sandboxed plugin isolates + explicit Capability Manifests |
| Traditional PHP collapses under load | Edge + serverless + streaming SSR |
| Plugin conflicts and destructive updates | Isolated test environments + decentralized plugin registry |
| Outdated PHP, poor developer experience | TypeScript-first, strict types, zero `any` |
| HTML-locked content | Portable Text (structured JSON) |
| Hidden costs > $1,500/year | Transparent pricing + serverless cost model |
| 95.9% of pages fail WCAG | WCAG 2.2 AA by default + embedded auditor |
| Legal uncertainty (Automattic vs WP Engine) | Open governance + independent foundation + MIT |

## Architecture (7 layers)

```
┌─────────────────────────────────────────────────────────┐
│  Layer 7: Governance & Enterprise                       │
│  SSO · Audit · DAM/PIM · EAA · TCO · RTL                │
├─────────────────────────────────────────────────────────┤
│  Layer 6: Dual Audience (Humans + Agents)               │
│  Dual-Persona · Liquid Content · Skills Layer           │
├─────────────────────────────────────────────────────────┤
│  Layer 5: Distribution & Search (SEO · AEO · GEO)       │
│  JSON-LD · Knowledge Graph · Trust Signals · llms.txt   │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Performance & Luxury                          │
│  Edge · Streaming SSR · LCP ≤1s · INP ≤100ms · CLS≤.05 │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Security & Sandboxing                         │
│  Capability Manifest · Isolated Workers · Audit Trails  │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Structured Content                            │
│  Portable Text · JSON · API-First · Decoupled           │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Core — TypeScript-first                       │
│  PostgreSQL · Drizzle · Edge-ready                     │
└─────────────────────────────────────────────────────────┘
```

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Astro 5 (content) + React 19 (admin) | SSG/ISR + rich interactivity |
| CMS core | Custom TypeScript core (EmDash-inspired) | Edge-native plugin isolation from day 1 |
| Database | PostgreSQL 16 + Drizzle ORM | Type-safe, pgvector, edge-compatible |
| Runtime | Node 24 / Cloudflare Workers / Vercel Edge | Global performance |
| Content | Portable Text (JSON) | Decoupled, validated, agent-readable |
| AI | MCP Server + Skills Layer + pgvector | Agentic CMS |
| Testing | Vitest + Playwright + k6 | Unit → e2e → load |

See `.github/../docs/adr/` for the full decision record.

## Repository layout

```
apps/
  admin/          # React admin dashboard (RTL-first)
  docs/           # Astro documentation site
  demo/           # Demo site showcasing Sard
packages/
  core/           # CMS core: collections, fields, content engine
  portable-text/  # Portable Text engine (validate, render, migrate)
  plugin-sdk/     # Plugin SDK + sandbox runtime
  edge-adapter/   # Cloudflare Workers / Vercel Edge adapters
  db/             # Drizzle schemas, migrations, seeds
  mcp-server/     # Model Context Protocol server
  cli/            # Sard CLI
docs/
  adr/            # Architecture Decision Records
```

## Getting started

```bash
# Prerequisites: Node 24+, pnpm 9+, Docker
git clone <this-repo> sard
cd sard
pnpm install

# Start local Postgres (with pgvector) + Adminer
docker compose up -d

# Configure
cp .env.example .env   # DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sard

# Migrate + seed
cd packages/db && pnpm db:generate && pnpm db:migrate && pnpm db:seed
```

## Development

```bash
pnpm dev         # Run all apps/packages in dev mode
pnpm build       # Build all packages
pnpm test        # Run all test suites
pnpm typecheck   # TypeScript strict across the monorepo
pnpm lint        # ESLint (no-any enforced)
```

## Performance targets (Definition of Done)

| Metric | Industry "good" | Sard target |
|---|---|---|
| LCP | ≤ 2.5s | **≤ 1.0s** |
| INP | ≤ 200ms | **≤ 100ms** |
| CLS | ≤ 0.1 | **≤ 0.05** |
| TTFB | hundreds of ms | **≤ 50ms (edge)** |
| Lighthouse Perf | 90 | **≥ 98** |
| Lighthouse A11y | 90 | **100** |

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1. Foundation | Monorepo, tooling, CI, Postgres+Drizzle, ADRs | 🔄 in progress |
| 2. Core | Content model, Portable Text engine, REST/GraphQL, auth, sandboxed plugins | ⬜ |
| 3. Admin & UX | Visual editor, workflows, media, RTL admin, a11y | ⬜ |
| 4. Advanced | MCP server, Skills Layer, AEO/GEO, semantic search, enterprise | ⬜ |
| 5. Launch | Open source, WordPress migration tools, docs, community | ⬜ |

## Contributing

See `.github/CONTRIBUTING.md` (to be added in Phase 1 close) and
`docs/adr/` for how decisions are made. RFCs live in `docs/rfcs/`.

## License

MIT — see [LICENSE](./LICENSE).
