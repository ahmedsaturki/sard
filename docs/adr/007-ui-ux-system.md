> **⚠️ SUPERSEDED** — This ADR was created in a prior session and has been replaced by ADR-010 through ADR-017 as of 2026-10-25 per Spec v3.0 re-baseline. It is retained for historical reference only.

# ADR-007: UI/UX System (Design Tokens, Component Library, Visual Editor)

## Status
Accepted

## Context
Sard must deliver a "luxury" UX/CX that exceeds WordPress in every user-facing aspect:
- Real-time visual editing (< 8s for common updates vs 45s WordPress)
- Zero-friction client handoff (agencies deliver sites clients can actually manage)
- Accessibility baked in (WCAG 2.2 AA by default)
- RTL-first for Arabic
- Design system that enables rebranding via token changes only

## Decision
Build a comprehensive UI/UX system in three layers:

### Layer 1: Design Tokens (`@sard/design-tokens`)
Single source of truth for all visual decisions:
```json
{
  "color": { "primary": { "500": "#1a73e8" }, "neutral": { "900": "#111" } },
  "spacing": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" },
  "typography": { "fontFamily": { "sans": "Inter, system-ui", "arabic": "IBM Plex Sans Arabic" } },
  "breakpoints": { "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px" },
  "shadows": { "sm": "0 1px 2px", "md": "0 4px 6px", "lg": "0 10px 15px" },
  "radius": { "sm": "4px", "md": "8px", "lg": "12px", "full": "9999px" },
  "transitions": { "fast": "150ms", "normal": "250ms", "slow": "350ms" }
}
```
- Tokens exported as CSS custom properties, JS/TS objects, Figma variables
- Rebranding = change token values, zero component changes
- Separate token sets for Light/Dark/High-Contrast themes
- RTL-aware tokens (logical properties: inline-start/end vs left/right)

### Layer 2: Component Library (`@sard/components`)
React components built strictly from design tokens:
- **Primitives**: Box, Flex, Grid, Text, Heading, Image, Button, Input, Select
- **Composed**: Card, Modal, Drawer, Toast, Tooltip, Table, Tabs, Accordion
- **Form**: Form, Field, Label, ErrorMessage, FieldArray (React Hook Form integration)
- **Editor**: PortableTextEditor, BlockToolbar, InlineToolbar, MediaPicker
- **Admin**: Sidebar, Header, Breadcrumbs, DataTable, EntityPicker, WorkflowBar
- Every component:
  - Semantic HTML + ARIA by default
  - Keyboard navigation built-in
  - Focus management
  - RTL support via logical CSS properties
  - Theme-aware (light/dark/high-contrast)
  - Storybook stories for each variant/state

### Layer 3: Real-Time Visual Editor (`@sard/visual-editor`)
The core differentiator — solves "Headless CMS preview problem":
- **Architecture**: Next.js App Router + React Server Components
- **Live Preview**: Site renders in iframe with `postMessage` bridge to editor
- **Click-to-Edit**: Click any element in preview → inline editor opens
- **Keystroke Sync**: Changes stream to preview via WebSocket/SSE (< 100ms)
- **Block Editing**: Portable Text blocks editable in-place
- **Style Panel**: Sidebar shows design tokens applied to selected element
- **Responsive Preview**: Toggle breakpoints in editor toolbar
- **Collaboration**: Presence cursors, selection highlights, comments on blocks
- **Version Diff**: Visual diff between versions in editor

### Implementation Stack
- **Framework**: React 19 + Next.js 15 App Router
- **Styling**: Tailwind CSS v4 (token-first) + CSS Modules for scoped styles
- **State**: Zustand (editor) + TanStack Query (server state)
- **Real-time**: Socket.io or PartyKit (WebSocket infrastructure)
- **Portable Text**: @portabletext/react + custom block components
- **Forms**: React Hook Form + Zod validation
- **Accessibility**: axe-core integrated in Storybook CI

## Consequences
### Positive
- Consistent, accessible UI across admin and frontend
- Rebranding in minutes, not days
- Visual editing eliminates "preview → edit → save → reload" loop
- Collaboration built-in from day one
- RTL support is free via logical properties

### Negative
- Significant upfront investment
- Visual editor complexity (iframe communication, sync)
- Must maintain component parity across admin/frontend

## Compliance
- WCAG 2.2 AA baked into component primitives
- RTL-first via logical properties + Arabic font tokens
- Visual editor targets < 8s update cycle
- Client handoff enabled by design constraints + simplified panel
