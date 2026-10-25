> **⚠️ SUPERSEDED** — This ADR was created in a prior session and has been replaced by ADR-010 through ADR-017 as of 2026-10-25 per Spec v3.0 re-baseline. It is retained for historical reference only.

# ADR-001: Technology Stack Selection

## Status
Accepted

## Context
Sard must be a Content Operating System that solves WordPress's architectural flaws:
- 96% of vulnerabilities from plugins → need sandboxed plugin architecture
- PHP performance limitations → need modern TypeScript/Edge runtime
- HTML-bound content → need structured content (Portable Text JSON)
- Poor accessibility → need WCAG 2.2 AA by default
- No agent/LLM support → need MCP + dual-persona design (humans + agents)

## Decision
Adopt the following stack:

### Frontend Framework
- **Astro 5.x** for content-heavy sites (SSG/ISR, partial hydration, edge-ready)
- **React 19** for interactive admin/dashboard components
- Rationale: Astro's content-first architecture matches WordPress's strength but with modern foundations

### Backend/CMS Core
- **Custom TypeScript core** inspired by EmDash's sandboxed Worker model
- Not Payload/Strapi: they're monolithic; Sard needs edge-native plugin isolation from day 1
- EmDash proved: sandboxed Worker isolates solve WordPress's plugin security problem

### Database
- **PostgreSQL 16+** with **Drizzle ORM**
- Rationale: type-safe queries, migrations, pgvector for semantic search, edge-compatible (Neon, Supabase)

### Runtime
- **Node.js 24+** for development and self-hosted deployments
- **Cloudflare Workers** / **Vercel Edge** for edge deployments
- Bun 1.x as optional faster runtime for local dev

### Language
- **TypeScript 5.7+ strict mode** — no `any`, no `@ts-ignore`
- ESLint + Prettier + Oxlint for code quality

### Content Format
- **Portable Text** (JSON) as the canonical content format
- Not HTML: enables re-use across web, mobile, email, LLM agents

### AI Layer
- **MCP Server** for LLM integration
- **Skills Layer** for agentic workflows (read, analyze, transform content)
- **pgvector** for semantic search and RAG

### Search
- **PostgreSQL + pgvector** for semantic search
- OpenSearch/Elasticsearch as optional external provider

### Testing
- **Vitest** for unit/integration tests
- **Playwright** for E2E browser tests
- **k6** for load testing

### CI/CD
- **GitHub Actions** with reusable workflows
- Automated deployment to Cloudflare Workers / Vercel Edge

## Consequences
### Positive
- Type safety end-to-end
- Sandboxed plugins from day 1 (no WordPress-style vulnerability cascade)
- Edge-native performance (LCP ≤1s, INP ≤100ms achievable)
- Structured content enables AI/agent consumption
- Modern DX attracts TypeScript developers

### Negative
- More initial complexity than WordPress install
- Requires developer expertise (not for non-technical users initially)
- Edge runtime limitations (no native Node APIs in Workers)

### Risks & Mitigation
- **Risk**: Plugin sandbox complexity → **Mitigation**: Start with minimal capability manifest, iterate
- **Risk**: Edge cold starts → **Mitigation**: Use Vercel/Cloudflare provisioned concurrency for critical paths
- **Risk**: Portable Text adoption → **Mitigation**: Provide rich-text editor with Portable Text output, migration tools from HTML

## Compliance
This decision aligns with Sard's 7-layer architecture:
- Layer 1 (Core): TypeScript-first, PostgreSQL + Drizzle
- Layer 2 (Structured Content): Portable Text JSON
- Layer 3 (Security): Sandboxed Worker isolates
- Layer 4 (Performance): Edge runtime targets
- Layer 5 (SEO/AEO): Structured data native
- Layer 6 (Agents): MCP + Skills Layer
- Layer 7 (Governance): Capability manifests, audit trails

## References
- EmDash CMS: https://github.com/emdash-cms/emdash
- Payload CMS: https://github.com/payloadcms/payload
- Strapi: https://github.com/strapi/strapi
- Portable Text: https://portabletext.com
- Cloudflare Workers: https://developers.cloudflare.com/workers/
