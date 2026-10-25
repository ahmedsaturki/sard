# Sard — Git Remote Setup for github.com/ahmedsaturki/sard
# Run this in: D:\\ahmed-research-lab\\Bunya Labs\\Sard

Set-Location "D:\\ahmed-research-lab\\Bunya Labs\\Sard"

Write-Host "Checking git status..." -ForegroundColor Cyan
git status

Write-Host "`nAdding remote origin..." -ForegroundColor Cyan
git remote add origin https://github.com/ahmedsaturki/sard.git

Write-Host "`nVerifying remote..." -ForegroundColor Cyan
git remote -v

Write-Host "`nStaging all changes..." -ForegroundColor Cyan
git add -A

Write-Host "`nCommitting..." -ForegroundColor Cyan
git commit -m "chore: Phase 1 foundation - ADRs 010-017, Payload 3 app, SQLCipher, sandbox, WP runtime, CI

- ADR-010: Stack Choice (Payload CMS 3) supersedes ADR-001
- ADR-011: Deployment Targets (Lite First) supersedes ADR-004  
- ADR-012: SQLite Strategy (SQLCipher Worker Pool) enforces AC-06
- ADR-013: Security Model (6 Layers) enforces AC-05/AC-06/AC-11/HC-04/HC-06
- ADR-014: Killer Use Case (Agency Client Handoff)
- ADR-015: Monorepo Structure v2 supersedes ADR-002
- ADR-016: WordPress Compatibility (4 Levels Updated) supersedes ADR-008
- ADR-017: Testing & Verification Strategy (Mixed Model)
- New packages: @sard/db-sqlcipher, @sard/sandbox, @sard/wp-runtime
- apps/lite: Payload 3 app with /install flow, security baseline, RTL-first
- CI: k6 100VU/512MB, Lighthouse 98/100/100/100, SBOM, npm audit"

Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
git push -u origin master

Write-Host "`nDone! Check https://github.com/ahmedsaturki/sard/actions for CI runs." -ForegroundColor Green
Read-Host "Press Enter to exit"
