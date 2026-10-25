# ADR-017: Testing & Verification Strategy (Mixed Model)

**Status:** Accepted (user-confirmed 2026-10-25)

## Context
This dev environment cannot spawn external processes (verified: EPERM across main thread, workers, PTY; k6/Lighthouse/Docker not installed). The approved model: in-process gates for every change + approved shell steps for heavy ops + CI as authoritative for the strong gates.

## Decision
Three verification tiers:
1. In-process (every change, run_code):
   - TypeScript strict: tsc API (createProgram) — no any, no ts-ignore (HC-05/AC-08).
   - Unit/integration: vitest/node (startVitest) — TDD first (AP-01).
   - Lint: ESLint 9 flat config via API — no-any, no-vm rules, import boundaries.
   - Server: Vite dev server / Node standalone booted in-process for Live Preview.
2. Approved shell (per step, sandbox escalation asked once per program): pnpm install (new deps), drizzle-kit generate, payload migrations, Playwright E2E (system Chrome via executablePath), local k6/Lighthouse if ever installed.
3. CI authoritative (GitHub Actions):
   - Quality: lint + typecheck + test (512MB container, 1 CPU).
   - Perf: k6 100 VU / 60 s against the app started with --max-old-space-size=512 + taskset -c 0; abort if p95 > 100ms or any stall > 500ms (HC-03).
   - Lighthouse CI: Perf >= 98, A11y = 100, BP = 100, SEO = 100 on home/post/archive/login (HC-02/HC-01).
   - Security: npm audit --audit-level=high (HC-04), SBOM (CycloneDX) + lockfile + npm ci (HC-08; Snyk when a token is provided — otherwise audit-ci as the documented substitute, to be recorded in the delivery report), OWASP ZAP baseline scan (Phase 2+).
   - Package size: tarball <= 50MB (HC-15).
4. Live Preview (AC-04/AC-12, every feature): boot in-process → ego browser (Chrome) → navigate + interact → screenshot(s) → docs/evidence/{feature}-{date}.png → referenced in the delivery report. No feature is done without this.
5. Human (HC-13): 5-user usability sessions with recorded consent, script + score sheet in docs/evidence/usability/.

## Alternatives Considered
1. CI-only evidence — Rejected: too slow a loop; still authoritative, but not the dev loop.
2. User runs installs manually — Rejected as default (approved-shell steps keep the loop agentic with one approval each).

## Consequences
Positive: every claim in a delivery report traces to an artifact (test run, screenshot, CI artifact); AC-12 satisfied mechanically.
Negative: CI access requires a GitHub remote (open question §9 of the plan) — until then, CI configs are committed and runnable-ready, and local in-process gates carry the weight; the delivery report marks CI-gated items as PENDING-CI, never as passed.

## Validation Plan
- GATE 1/2 checklists reference this ADR; any item marked passed must link an artifact.
