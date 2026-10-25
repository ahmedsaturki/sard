# PHASE 1 — Manual Step Required

## pnpm install (blocked by sandbox)

The sandbox prevents spawning external processes (pnpm, npm, terminal, etc.). 

**Please run this manually in your terminal:**

```bash
cd "D:\ahmed-research-lab\Bunya Labs\Sard"
pnpm install --frozen-lockfile=false
```

This will install:
- @sard/db-sqlcipher (sqlcipher-wasm, drizzle-orm, zod)
- @sard/sandbox (zod)
- @sard/wp-runtime (@php-wasm/node, zod)
- sard/lite (payload 3, next 15, react 19, @payloadcms/db-sqlite, @node-rs/argon2, helmet, express-rate-limit, etc.)

After install completes, let me know and I'll continue with:
1. TypeScript configs for new packages
2. TDD: db-sqlcipher worker pool + AES-256 implementation
3. Payload 3 app scaffold (apps/lite)
4. /install flow + security baseline
5. RTL setup
6. CI configs (committed locally)

The delivery report will note CI items as PENDING-CI until GitHub remote is connected.
