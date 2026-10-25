# ADR-012: SQLite Strategy (SQLCipher Worker Pool)

**Status:** Accepted  
**Supersedes:** parts of ADR-001 (PostgreSQL-primary) and ADR-006 (unencrypted SQLiteAdapter)

## Context
- AC-06 (absolute): SQLite in production = SQLCipher (AES-256). No exceptions. The current packages/runtime SQLiteAdapter uses plain libSQL — non-compliant.
- HC-07: no direct better-sqlite3 — pooling/abstraction required.
- AC-01: shared hosting forbids native compilation of many tools; WASM binaries avoid install steps.
- SQLite's single-writer bottleneck is a known WordPress-migration complaint — must not block the event loop (HC-01/HC-03).

## Decision
Build @sard/db-sqlcipher:
1. Engine: 7mind/sqlcipher-wasm (SQLCipher compiled to WebAssembly — AES-256, no native build, works on shared hosting).
2. Concurrency: the engine runs in a worker-thread pool (bounded, size 1-2 by default) behind an async queue — non-blocking, satisfies the spirit of HC-07 (pool, not raw sync calls on the event loop).
3. Key management (AC-11): the encryption key is loaded only from SARD_DB_KEY env var or a secrets manager file path (SARD_DB_KEY_FILE); never in code, never in Git; key rotation supported (re-key on demand); the DB file is unreadable without the key (tested).
4. Payload integration: a custom Payload 3 Database Adapter (@sard/db-sqlcipher/payload) implements Payload's DatabaseAdapter contract over the pool, with Payload auto-migrations translated to SQLCipher DDL. This is the riskiest item — PoC first (Phase 1, day 4).
5. WAL + PRAGMAs: journal_mode=WAL, synchronous=NORMAL, busy_timeout=5000, foreign_keys=ON.
6. PostgreSQL adapter (existing @sard/runtime adapter, retained and finished) remains for Cloud/Docker targets.

## Alternatives Considered
1. libSQL/Turso (ADR-001/006 current) — Rejected for Lite: no AES-256 at-rest encryption (violates AC-06; file-level obfuscation is not encryption).
2. better-sqlite3 + SQLCipher native bindings — Rejected: native builds often unavailable on shared hosting; violates HC-07 spirit if used directly.
3. Plain libsql + app-layer column encryption — Rejected: violates AC-06 (SQLCipher. No exceptions) and is weaker (key management, metadata leaks).

## Consequences
Positive: AC-06 met from the first production write; non-blocking writes; WASM = portable to any shared host; key from env (AC-11).
Negative: WASM SQL engine is slower than native SQLite (~3-5x on writes) → mitigated by WAL + pool + static-first caching; Payload adapter is new code → PoC gates it.

## Validation Plan
- Unit: encrypt/decrypt round-trip; file unreadable without key (hexdump test).
- Integration: Payload migrations + CRUD through the adapter; 2 concurrent writers no deadlock (busy_timeout).
- Load: k6 100VU/60s, 512MB/1-core — p95 < 100ms, no event-loop stall > 50ms.
- If p95 fails: ADR-12b fallback (read-replica file + write-ahead queue) — documented in Phase 2.
