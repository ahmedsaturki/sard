@echo off
REM Sard — Git Remote Setup for github.com/ahmedsaturki/sard
REM Run this in: D:\ahmed-research-lab\Bunya Labs\Sard

cd /d "D:\ahmed-research-lab\Bunya Labs\Sard"

echo Checking git status...
git status

echo.
echo Adding remote origin...
git remote add origin https://github.com/ahmedsaturki/sard.git

echo.
echo Verifying remote...
git remote -v

echo.
echo Staging all changes...
git add -A

echo.
echo Committing...
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

echo.
echo Pushing to GitHub...
git push -u origin master

echo.
echo Done! Check https://github.com/ahmedsaturki/sard/actions for CI runs.
pause
