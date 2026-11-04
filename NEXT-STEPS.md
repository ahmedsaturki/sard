# NEXT STEPS — Manual Execution Required

## 1. Run pnpm install (REQUIRED before anything else)

```bash
cd "D:\\ahmed-research-lab\\Bunya Labs\\Sard"
pnpm install --frozen-lockfile=false
```

This installs all new dependencies:
- payload 3, next 15, react 19
- @php-wasm/node, sqlcipher-wasm
- @node-rs/argon2, helmet, express-rate-limit
- All workspace packages

## 2. Run Git Setup Script

**Option A (Command Prompt):**
```cmd
setup-git-remote.bat
```

**Option B (PowerShell):**
```powershell
.\setup-git-remote.ps1
```

This will:
- Add remote: https://github.com/bunya-labs/sard.git
- Commit all Phase 1 changes
- Push to GitHub (triggers CI)

## 3. Verify CI Runs

Check: https://github.com/bunya-labs/sard/actions

Expected jobs:
- quality (lint, typecheck, test)
- build (512MB)
- perf (k6 100VU/60s) — may need k6 installed on runner
- lighthouse (98/100/100/100)
- security (npm audit, SBOM)
- e2e (Playwright)

## 4. Live Preview (I'll handle after you confirm install works)

After pnpm install succeeds, tell me and I'll:
1. Boot apps/lite in-process
2. Open ego browser to http://localhost:4321
3. Capture screenshots: /install, admin dashboard, post editor
4. Update Phase 1 delivery report with evidence

## 5. Phase 2 Kickoff

Once GATE 1 passes, Phase 2 begins:
- Core workstream (CRUD, media, versioning, auth 2FA, audit trail)
- Sandbox hardening (real child_process isolation)
- WP plugin fixtures (Yoast, CF7, Akismet, WP-Super-Cache, WooCommerce-cart)
- Client Handoff panel (3 layers)
- Visual editor blocks + <8s measurement

---

**Status:** Waiting for your `pnpm install` confirmation.
