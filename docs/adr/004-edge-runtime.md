# ADR-004: Edge Runtime Strategy

## Status
Accepted

## Context
Sard must achieve:
- LCP ≤ 1.0s (2x better than 2.5s standard)
- INP ≤ 100ms (2x better than 200ms standard)
- TTFB ≤ 50ms
- Global performance (not just single-region)

Traditional server deployments cannot meet these targets consistently.

## Decision
Deploy Sard on **Edge runtimes** with the following strategy:

### Primary: Cloudflare Workers
- Global edge network (300+ locations)
- V8 isolate-based (fast cold starts)
- Durable Objects for stateful operations
- R2 for asset storage
- D1 (SQLite) or PostgreSQL (via Neon/Vercel) for database

### Secondary: Vercel Edge Functions
- Next.js integration
- Edge middleware for auth, routing
- Automatic ISR/SSG

### Fallback: Node.js Self-Hosted
- For enterprises requiring on-prem
- Docker containers with PM2
- Same codebase, different adapter

### Architecture
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Edge Function  │  ← Cloudflare Workers / Vercel Edge
│  - Auth         │
│  - Routing      │
│  - Caching      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Core Engine    │  ← Portable Text, Collections, Fields
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  PostgreSQL     │  ← Neon Serverless Postgres / Self-hosted
│  + pgvector     │
└─────────────────┘
```

### Streaming SSR
- Stream HTML chunks as they render
- No waiting for full page render
- Critical CSS inlined, rest deferred

### Caching Strategy
- Edge cache for static assets (immutable)
- ISR for content pages (revalidate on publish)
- No cache for admin/preview (auth-required)

## Consequences
### Positive
- Global low-latency performance
- Automatic scaling (no server management)
- Cost-efficient (pay per request)

### Negative
- Edge runtime limitations (no native Node APIs)
- Vendor lock-in concerns → mitigated by adapter pattern
- Cold starts for uncached routes → mitigated by provisioned concurrency

## Compliance
- Layer 4 (Performance): Edge is the enabler for LCP ≤1s, INP ≤100ms
- Layer 1 (Core): Adapters keep core runtime-agnostic
