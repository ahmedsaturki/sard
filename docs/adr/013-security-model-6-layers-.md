# ADR-013: Security Model — 6 Layers

**Status:** Accepted  
**Supersedes:** ADR-005 (scope: process isolation added as layer 1)

## Context
AC-05 (absolute): isolation is process-level first (gVisor/Docker+seccomp), PHP WASM is layer 2; no Node vm module. AC-06, AC-11, HC-04, HC-06 add the rest. The existing ADR-005 (Worker isolates + capability manifest) is retained as a layer but not sufficient alone.

## Decision — the 6 layers (order = trust boundary)
1. L1 Process isolation (AC-05): every untrusted execution unit (WP plugin, user-submitted job) runs in a separate OS process or hardened worker with resource limits (memory cap, CPU-time cap, wall-clock timeout, kill switch). On Docker/Cloud targets: gVisor (runsc) or seccomp profiles (Phase 4). On Lite: dedicated child process with resource limits where available + watchdog kill. Node vm is banned — enforced by ESLint rule (no-restricted-syntax on require('vm')/import 'vm') + CI check.
2. L2 PHP-WASM (WP Compat L1): @php-wasm/node (WordPress Playground runtime) for legacy WP plugins — virtual filesystem, proxied network, no host FS. Capability-scoped Bridge API (ADR-016).
3. L3 Capability manifest + audit: every privileged operation (content write, media, outbound HTTP, plugin install) requires a declared capability; all calls logged to audit_log (retained from ADR-005).
4. L4 AuthN/AuthZ (HC-06): Argon2id (@node-rs/argon2, tuned m=64MB t=3 p=1 → <=150ms), session tokens JWT HS256, TTL 15 min (refresh rotation), alg pinned (no none/RS256 confusion), per-user RBAC (owner/admin/editor/viewer), 2FA TOTP for admins, login lockout.
5. L5 Input/Output (HC-04/HC-05/HC-06): Zod validation at every endpoint boundary (API + admin mutations), strict JSON parsing (prototype-pollution safe: JSON.parse + __proto__/constructor/prototype key rejection in merge paths), output encoding (OWASP XSS), helmet security headers, CORS allowlist, rate limiting on auth + write endpoints.
6. L6 Data at rest (AC-06): SQLCipher AES-256 (ADR-012); media files stored with random names; backups encrypted; secrets only via env/secrets manager (AC-11).

## Alternatives Considered
1. V8 isolates only (ADR-005) — Rejected as primary: same-process memory corruption = full breach; spec explicitly orders process-level first.
2. Node vm sandbox — Forbidden by AC-05.
3. Firejail/bwrap on shared hosting — Usually unavailable (no root); kept for self-hosted docs only.

## Consequences
Positive: defense in depth with explicit trust boundaries; WP plugins cannot reach the DB/FS directly; full audit trail; OWASP Top-10 coverage by construction.
Negative: process per plugin = memory overhead → Lite budget: max 5 concurrent plugin processes (fits 512MB: ~40-80MB each); escape testing must be a GATE 4 deliverable.

## Validation Plan
- L1: escape test suite (plugin attempts: fs read, network egress, eval, env access → all denied + logged) — unit + integration.
- L2: 5 WP plugins run with zero host FS/network access (Playwright + process audit).
- L4: OWASP ZAP baseline scan in CI (Phase 2); pen test (Phase 4, GATE 4).
- L5: prototype-pollution PoC test (payload {"__proto__":{"x":1}} rejected).
- L6: DB file unreadable without key (hexdump + openssl test).
