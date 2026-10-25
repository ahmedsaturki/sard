# Architecture Decision Records (ADR) Index

## Active (Spec v3.0 — 2026-10-25 re-baseline)
| ID | Title | Supersedes | Key Constraints |
|---|---|---|---|
| 010 | Stack Choice (Payload CMS 3) | 001 | AC-07, AC-01 |
| 011 | Deployment Targets (Lite First) | 004 | AC-01, AC-02 |
| 012 | SQLite Strategy (SQLCipher Worker Pool) | 001, 006 | AC-06, HC-07 |
| 013 | Security Model (6 Layers) | 005 | AC-05, AC-06, AC-11, HC-04, HC-06 |
| 014 | Killer Use Case (Agency Client Handoff) | — | MC-08, HC-11, HC-12 |
| 015 | Monorepo Structure v2 | 002 | MC-01, MC-05 |
| 016 | WordPress Compatibility (4 Levels Updated) | 008 | AC-01, AC-05, HC-09 |
| 017 | Testing & Verification Strategy (Mixed) | — | AC-03, AC-04, AC-12, HC-01, HC-02, HC-03 |

## Superseded (Historical — retained for context)
| ID | Title | Replaced By |
|---|---|---|
| 001 | Technology Stack Selection | 010 |
| 002 | Monorepo Structure | 015 |
| 003 | Portable Text as Canonical Content Format | (retained as reference) |
| 004 | Edge Runtime Strategy | 011 |
| 005 | Plugin Sandbox Architecture | 013 (L2-L6 retained) |
| 006 | Deployment Abstraction Layer | (retained as interface contract) |
| 007 | UI/UX System | (retained as design reference) |
| 008 | WordPress Compatibility Layer | 016 |
| 009 | Phase 1 Detailed Plan | (superseded by Phase 1 execution in this session) |

> **Note:** ADR-003 (Portable Text) and ADR-006 (Deployment Abstraction Layer) are kept as active design references even though their numbers were superseded. ADR-007 (UI/UX) is kept as a design reference.
