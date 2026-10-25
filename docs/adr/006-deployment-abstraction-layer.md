> **⚠️ SUPERSEDED** — This ADR was created in a prior session and has been replaced by ADR-010 through ADR-017 as of 2026-10-25 per Spec v3.0 re-baseline. It is retained for historical reference only.

# ADR-006: Deployment Abstraction Layer (@sard/runtime)

## Status
Accepted

## Context
Sard must run on four deployment targets without code changes:
1. **Sard Static** — Static export to any hosting (PHP-only, S3, GitHub Pages)
2. **Sard Lite** — Shared hosting (Hostinger, cPanel, Plesk) with SQLite + Node.js
3. **Sard Cloud** — Edge (Cloudflare Workers, Vercel Edge) with PostgreSQL
4. **Sard Docker** — Self-hosted VPS with PostgreSQL + Redis

The core CMS must be completely decoupled from the runtime environment.

## Decision
Create a **Deployment Abstraction Layer** as a separate package `@sard/runtime` with the following adapters:

### RuntimeAdapter
Interface for HTTP request/response handling across environments:
- `EdgeRuntimeAdapter` — Cloudflare Workers / Vercel Edge (streaming SSR)
- `NodeRuntimeAdapter` — Node.js 20+ / Bun (single-process or cluster)
- `StaticRuntimeAdapter` — Generates static files at build time

### DatabaseAdapter
Interface for database operations with two implementations:
- `PostgreSQLAdapter` — Production (Neon, Supabase, self-hosted)
- `SQLiteAdapter` — Sard Lite / Static (single file, zero-config)

### StorageAdapter
Interface for file/blob storage:
- `S3StorageAdapter` — AWS S3, Cloudflare R2, MinIO
- `LocalStorageAdapter` — Local filesystem (Lite/Docker)
- `KVStorageAdapter` — Cloudflare KV, Vercel KV (Edge)

### CacheAdapter
Interface for caching:
- `RedisCacheAdapter` — Production
- `MemoryCacheAdapter` — Development/Lite
- `FilesystemCacheAdapter` — Static export
- `KVCacheAdapter` — Edge

### QueueAdapter
Interface for background jobs:
- `CloudflareQueuesAdapter` — Edge
- `BullMQAdapter` — Node.js with Redis
- `MemoryQueueAdapter` — Development/Lite
- `CronQueueAdapter` — Static (scheduled at build)

### Configuration
All adapters configured via `sard.config.ts`:
```typescript
// sard.config.ts
import { defineConfig } from "@sard/runtime";

export default defineConfig({
  runtime: process.env.SARD_RUNTIME ?? "lite", // "static" | "lite" | "cloud" | "docker"
  database: {
    adapter: "sqlite", // or "postgresql"
    connection: process.env.DATABASE_URL ?? "./data/sard.db"
  },
  storage: {
    adapter: "local",
    basePath: "./storage"
  },
  cache: {
    adapter: "memory"
  },
  queue: {
    adapter: "memory"
  }
});
```

## Consequences
### Positive
- Core CMS is 100% runtime-agnostic
- Single codebase deploys to 4 targets
- Easy to add new deployment targets
- Local development matches production (Lite mode)

### Negative
- Additional abstraction layer adds complexity
- Must maintain parity across adapters
- Performance characteristics differ per target

## Compliance
- Enables all 4 deployment modes (Static, Lite, Cloud, Docker)
- Supports shared hosting constraint (Lite mode)
- Supports Edge performance targets (Cloud mode)
