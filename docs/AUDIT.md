# Phase 0: Project Revival - Discovery Audit Report

**Date:** 2026-11-03  
**Auditor:** Claude Code (Claude Opus 4.5)  
**Status:** COMPLETED

---

## Executive Summary

The Sard monorepo is in a **partially revived state** post-early-termination. Core fixes for TypeScript compilation and ESLint errors have been completed on the `claude/pensive-agnesi-14caa6` branch. The project requires cleanup, security hardening, and documentation completion before Phase 1 foundation work can resume.

**Key Finding:** 28 stray files in repo root need deletion. Build artifacts are present but CI configs need verification.

---

## 1. Repository State

### Current Branch Classification
| Branch | Status | Purpose |
|--------|--------|---------|
| `main` | Protected | Production (stable releases) |
| `master` | Divergent | Legacy/alternative |
| `claude/pensive-agnesi-14caa6` | **ACTIVE** | Phase 0-1 revival branch |

### Recent Activity
- **Latest commit:** 1bc6c03 - Version bump to 0.0.2 (client-handoff)
- **Previous:** f9e0ba2 - TypeScript compilation fixes
- **Status:** Working directory has uncommitted changes in ESLint config and client-handoff

### Branch Analysis
The monorepo contains 5 worktree branches in `.claude/worktrees/` that are no longer needed:
- `cool-euclid-6229da`
- `distracted-galileo-d22c27`
- `frosty-swirles-d902c7`
- `inspiring-williams-8a7106`
- `sard-brand-logo-906e8f`
- `serene-mirzakhani-c3edcf`

These appear to be abandoned experimental branches that should be cleaned up.

---

## 2. Security Assessment

### Secrets Detection
**Status:** ⚠️ POTENTIAL CONCERN

| Location | Risk Level | Notes |
|----------|------------|-------|
| `.env` | MEDIUM | Contains `SARD_SECRET_KEY=change-me-to-a-256-bit-secret` - placeholder, needs real value in production |
| `.env.example` | LOW | Template file, no actual secrets |
| `PUBLISHING-STATUS.md` | MEDIUM | Contains **actual npm token** (should be redacted) |
| npm registry | BLOCKED | `@sard` org doesn't exist; publishing blocked |

### Environment Files
```
.env              - Local development config (NEEDS REVIEW for secrets)
.env.example      - Template (safe)
packages/db/.env  - May have DB credentials (check)
```

**Action Required:**
1. Redact npm token from `PUBLISHING-STATUS.md`
2. Verify no real secrets in `.env` before committing
3. Set up proper secret management for production

### Security Model (ADR-013) Implementation Status
| Layer | Status | Notes |
|-------|--------|-------|
| L1 Process Isolation | PLANNED | Code designed but not fully implemented |
| L2 PHP-WASM | PARTIAL | `@php-wasm/node` integrated but need process isolation tests |
| L3 Capability Manifest | NOT STARTED | Design documented, no implementation |
| L4 AuthN/AuthZ | PARTIAL | Argon2id configured, 2FA stubbed |
| L5 Input/Output | PARTIAL | Zod validation used, helmet not integrated |
| L6 Data at Rest | PARTIAL | SQLCipher integration exists in db-sqlcipher |

---

## 3. Dependency Analysis

### Critical Dependencies
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `typescript` | `5.9.3` | ✓ Current | TypeScript 5.7+ compatible |
| `eslint` | `9.39.5` | ✓ Current | ESLint 9.x flat config |
| `next` | `15.0.0` | ✓ Current | App Router ready |
| `payload` | `^3.0.0` | ✓ Current | Payload CMS 3 |
| `pnpm` | `>=9.15.0` | ✓ Met | Workspace ready |

### Security Audit
```bash
# Run locally after auth is fixed:
npm audit --audit-level=high
```

**Blocking Issue:** NPM token in `PUBLISHING-STATUS.md` exposed. Should be removed and organization created with proper auth.

---

## 4. UI/UX System Assessment

### Current State
**Package:** `@sard-cms/components` (partial)  
**Status:** Basic components exist, need to align with ADR-007/ADR-010

### Component Inventory
| Component | Status | Source File |
|-----------|--------|-------------|
| `SimplifiedPanel` | ✅ Fixed | `packages/client-handoff/src/components/SimplifiedPanel.tsx` |
| `Box`, `Flex`, `Grid`, etc. | ⚠️ Stub | `packages/components/src/` |

### Luxury Standard Gap Analysis
| Requirement | Status | Gap |
|-------------|--------|-----|
| Real-time visual editing | NOT STARTED | Visual Editor package exists but incomplete |
| Zero-friction handoff | IN PROGRESS | SimplifiedPanel functional |
| WCAG 2.2 AA | NOT STARTED | No axe-core integration |
| RTL-first Arabic | PLANNED | Design tokens defined |
| Client handoff 3-layer | IN PROGRESS | Layer 2 working |

### Competitor Comparison
| Feature | Sard | WordPress | EmDash | Strapi 5 |
|---------|------|-----------|--------|----------|
| Shared hosting support | ✅ (Lite) | ✅ | ❌ | ✅ |
| Plugin sandboxing | ✅ (PHP WASM planned) | ❌ (security issues) | ✅ | ❌ |
| RTL-first UI | ✅ Planned | ❌ (i18n) | ✅ | ✅ |
| Client handoff UX | ✅ Planned | ❌ | ❌ | ❌ |
| Portabil Text editor | Planned | ❌ | ✅ | ✅ |

---

## 5. Build & Test Status

### Build Artifacts
```
packages/client-handoff/dist/     ✅ Built (v0.0.2)
packages/components/dist/        ? Check
packages/design-tokens/dist/      ? Check
```

### ESLint Status
| File | Status |
|------|--------|
| `packages/client-handoff/src/components/SimplifiedPanel.tsx` | ✅ Fixed (line 131) |
| `packages/client-handoff/src/context.ts` | ✅ Fixed |
| `packages/client-handoff/src/handoff-package.ts` | ✅ Fixed |
| `packages/client-handoff/src/lint-rules/design-constraints.ts` | ✅ Fixed |
| `packages/client-handoff/legacy-ui/` | ❌ Ignored |

**ESLint Configuration:**
- `eslint.config.mjs` properly configured
- `design-constraints.js` deleted, replaced by `design-constraints.ts`
- Legacy UI properly excluded

### Test Coverage
| Package | Test Files | Status |
|---------|------------|--------|
| `portable-text` | `validate.test.ts`, `render.test.ts`, `migrate.test.ts` | ✅ |
| `components` | `placeholder.test.ts` | ⚠️ Stub |
| `db-sqlcipher` | `pool.test.ts` | ⚠️ Check |
| `sandbox` | `sandbox.test.ts`, `ts57-compat.test.ts` | ✅ |

---

## 6. Architecture Documentation Status

| Document | Location | Status |
|----------|----------|--------|
| ADR Index | docs/adr/README.md | ✅ Complete |
| ADR-010: Stack Choice | docs/adr/010-stack-choice-payload-cms-3.md | ✅ |
| ADR-013: Security Model | docs/adr/013-security-model-6-layers-.md | ✅ |
| ADR-014: Killer Use Case | docs/adr/014-killer-use-case-agency-client-handoff-.md | ✅ |
| ADR-017: Testing Strategy | docs/adr/017-testing-and-verification-strategy.md | ✅ |
| Reference Projects | docs/research/reference-projects.md | ✅ |

### Missing Documentation
- Phase 0 cleanup report (this document)
- Security audit checklist (GDPR, OWASP Top-10)
- Competitive analysis summary
- Package README files

---

## 7. Cleanup Requirements

### Immediate Deletions (Untracked Files)
28 stray files in repo root identified for deletion:
```
add-react-import.js
analyze_file.py
console.log(x))
dependencies
env-backup.reg
fix-*.js / fix_*.py
node-fix-imports.js
org_help.txt
package.json (if at root)
update-imports*.ps1
```

### Worktree Cleanup
Unused worktrees should be removed:
```bash
git worktree prune
rm -rf .claude/worktrees/{cool-euclid-6229da,distracted-galileo-d22c27,...}
```

### Docker Files
```
Dockerfile   - present but no .dockerignore (present but empty)
.dockerignore - exists
```
Status: **INCOMPLETE** - Need to verify Docker setup works with the new architecture.

---

## 8. Phase Transition Checklist

### From Phase 0 to Phase 1

| Task | Status | Owner |
|------|--------|-------|
| Clean up stray files | 🟡 PENDING | Developer |
| Remove unused worktrees | 🟡 PENDING | Developer |
| Redact secrets from docs | 🟡 PENDING | Developer |
| Resolve npm auth for publishing | 🟡 PENDING | Developer |
| Verify monorepo builds | 🟡 PENDING | Developer |
| Run security audit | 🟡 PENDING | Developer |
| Create CI pipeline | 🟡 PENDING | Developer |

---

## 9. Competitor Landscape (HC-12 Evidence)

### WordPress vs. Sard

| Criteria | WordPress | Sard (Target) | Evidence |
|----------|-----------|---------------|----------|
| Setup time | 5-30 min | < 8 sec | Visual editor goal |
| Plugin security | Major risk | Sandbox | PHP WASM + process isolation |
| Multilingual | Plugin required | Native | ADR-013 L4, L5 |
| Shared hosting | ✅ | ✅ | ADR-011 Lite mode |
| Client handoff | ❌ | ✅ | HC-11 |
| RTL support | Plugin | Native | Arabic-first design |
| WCAG compliance | ~4% pass | 100% | ADR-017 |

### Key Differentiators for Phase 4 GATE 4
1. **WP Plugin Sandbox** - Only system running real WP plugins on shared hosting
2. **Client Handoff UX** - 3-layer handoff experience built-in
3. **Arabic/RTL First** - Not an afterthought
4. **Process Isolation** - gViso/Seccomp plan for production

---

## 10. Recommendations

### Immediate Actions
1. **Delete 28 stray files** in repo root (not part of monorepo)
2. **Redact npm token** from `PUBLISHING-STATUS.md`
3. **Create `@sard` npm org** (requires 2FA)
4. **Verify build** for all packages:
   ```bash
   pnpm build
   ```

### Phase 1 Preparation
1. Complete monorepo cleanup
2. Set up CI/CD pipeline (GitHub Actions from package.json lint-staged)
3. Finalize Phase 1 task list per ADR-009
4. Create test fixtures for db-sqlcipher encryption

### Security Hardening
1. Integrate axe-core for WCAG 2.2 AA testing
2. Add helmet and rate-limit to `apps/lite`
3. Implement capability manifest schema
4. Set up OWASP ZAP baseline scan in CI

---

## Appendix A: File Inventory

### Core Packages (Production)
```
packages/client-handoff/   - Client handoff system (active work)
packages/components/        - UI component library
packages/core/              - Core types
packages/db/                - PostgreSQL layer
packages/db-sqlcipher/      - SQLite with encryption
packages/design-tokens/     - Design token definitions
packages/portable-text/     - Portable Text engine
packages/sandbox/           - Plugin sandbox
packages/wp-compat/         - WordPress compatibility
packages/wp-runtime/        - PHP-WASM runtime
packages/visual-editor/     - Real-time visual editor
```

### Apps
```
apps/admin/    - Admin dashboard (React/Vite)
apps/lite/     - Payload CMS 3 app (Next.js)
apps/demo/     - Demo site
apps/docs/     - Documentation site
```

### Tools
```
tools/         - Build tools and scripts
```

---

## Appendix B: ADR Reference

| ADR | Title | Status |
|-----|-------|--------|
| 010 | Stack Choice (Payload CMS 3) | ACCEPTED |
| 011 | Deployment Targets (Lite First) | ACCEPTED |
| 012 | SQLite Strategy (SQLCipher) | ACCEPTED |
| 013 | Security Model (6 Layers) | ACCEPTED |
| 014 | Killer Use Case (Agency Handoff) | ACCEPTED |
| 015 | Monorepo Structure v2 | ACCEPTED |
| 016 | WordPress Compatibility (4 Levels) | ACCEPTED |
| 017 | Testing & Verification Strategy | ACCEPTED |

---

**Report Generated:** 2026-11-03  
**Next Step:** Proceed with Phase 1 foundation work after cleanup