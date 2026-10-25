# Phase 1 — Open Questions (decided by default, user to confirm/update)

## 1. GitHub Remote for CI
**Default chosen:** Commit CI configs locally only; mark CI-gated items as PENDING-CI in delivery reports.
**Action needed from user:** Create `github.com/bunya-labs/sard` (or preferred), add remote, push. Then CI will run authoritatively.

## 2. Snyk Token (HC-08)
**Default chosen:** npm audit --audit-level=high + audit-ci + CycloneDX SBOM (as documented in ADR-017).
**Action needed from user:** If you have a Snyk token, add as GitHub Actions secret `SNYK_TOKEN`; otherwise current config is valid.

## 3. HC-13 5-User Usability (Phase 2 Week 4)
**Default chosen:** Prepare script + score sheet in `docs/evidence/usability/`; mark recruitment as needed.
**Action needed from user:** When ready, provide contacts or schedule sessions; we'll execute in Phase 2 week 4.

---

These decisions follow the "Mixed" execution model you approved (in-process gates + approved shell + CI authoritative). All configs will be committed; CI items in GATE checklists will show PENDING-CI until remote exists.