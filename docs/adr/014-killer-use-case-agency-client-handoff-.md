# ADR-014: Killer Use Case — Agency Client Handoff

**Status:** Accepted (user-confirmed 2026-10-25)  
**Implements:** MC-08, HC-11, HC-12

## Context
One killer use case must anchor v1.0 (MC-08). Candidates: (a) agency client handoff (B2B), (b) Arabic RTL blog (fastest WP replacement story), (c) both. User chose (a).

## Decision
Killer use case: the agency that delivers sites its clients can actually manage.
- The buyer is the agency/freelancer (pays), the end user is the client (non-technical, often Arabic-speaking).
- Sard Lite wins by making handoff the product: Client Handoff (HC-11) 3 layers — (1) design constraints that keep sites within a manageable token surface, (2) a simplified Arabic admin ("إدارة الموقع") with only what the client may touch, (3) an interactive in-app guide.
- starters/agency = the flagship template (portfolio/services/team/contact/booking) + starters/blog-ar = the RTL demo that doubles as the "beats WordPress for Arabic" proof (HC-12 use case #1).
- WCAG 2.2 AA + RTL are marketing-grade differentiators against WP's 95.9% a11y failure rate.

## Alternatives Considered
1. Arabic blog first — Rejected as primary: lower willingness-to-pay; kept as the demo starter (evidence for HC-12).
2. Both equally — Rejected (AP-15): dilutes Phase 2 scope.

## Consequences
Positive: clear ICP → focused UX (HC-13 user tests = 5 agencies/clients); monetization path (Open Core: core MIT, agency tools commercial — MC-07); WP migration L2/L3 sells itself to agencies with WP client bases.
Negative: B2B sales cycle is longer; must ship the handoff UX right (it IS the product).

## Validation Plan
- Phase 2: 5 usability sessions (HC-13) with agency owners + their real clients, scripted task: "update your homepage text and publish" — success >= 4/5 unaided, time < 3 min.
- HC-12: 7 WordPress use cases each demonstrated better in Sard with recorded evidence (Phase 4 GATE).
