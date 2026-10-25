# Reference Projects Analysis

## EmDash (Cloudflare) - https://github.com/emdash-cms/emdash

### Architecture Overview
- **Framework**: Astro + React (admin)
- **Runtime**: Cloudflare Workers (V8 isolates)
- **Database**: D1 (SQLite) + R2 + KV
- **Plugin System**: Worker isolates with Capability Manifest
- **Content**: Portable Text (Sanity-style)

### Key Technical Decisions

#### Plugin Sandbox (src/runtime/plugin-runner.ts)
```typescript
// Each plugin runs in separate Worker isolate
const pluginWorker = new Worker(new URL("./plugin-worker.ts", import.meta.url), {
  type: "module",
  name: `plugin-${pluginId}`
});

// Capability-based Bridge API
interface PluginBridge {
  content: { read, write, delete };
  media: { read, write };
  http: { fetch }; // restricted domains
  storage: { get, set }; // plugin-scoped KV
}
```

#### Content Model (src/content/collections.ts)
- Collections defined as TypeScript objects
- Fields: text, richText (Portable Text), image, reference, select, boolean, date
- Auto-generates REST + GraphQL endpoints

#### Admin UI (apps/admin)
- React + Vite + Tailwind
- Real-time preview via iframe + postMessage
- Block-based editor for Portable Text

### Lessons for Sard
1. **Worker isolates work** for plugin sandboxing at edge
2. **Capability Manifest** pattern is proven
3. **Portable Text** as canonical format enables multi-channel
4. **Astro + React** hybrid works for content + interactive admin
4. **D1 (SQLite)** viable for edge; need PostgreSQL for complex queries

---

## Payload CMS - https://github.com/payloadcms/payload

### Architecture Overview
- **Framework**: Next.js App Router (embedded)
- **Database**: PostgreSQL (primary), MongoDB (legacy)
- **Admin**: React + Payload UI components
- **Content**: Rich Text (Lexical) + custom fields
- **API**: REST + GraphQL (auto-generated)

### Key Technical Decisions

#### Field System (src/fields)
```typescript
// Extensible field types
type FieldType = 
  | "text" | "textarea" | "number" | "checkbox" 
  | "select" | "radio" | "date" | "relationship"
  | "upload" | "richText" | "array" | "group" | "tabs";

// Each field: validation, hooks, admin UI, GraphQL type
```

#### Access Control (src/access)
```typescript
// Per-collection, per-operation, per-field
const access = {
  read: ({ req }) => req.user?.role === "admin",
  create: ({ req }) => req.user?.role !== "viewer",
  update: ({ req, doc }) => req.user?.id === doc.author,
  delete: ({ req }) => req.user?.role === "admin",
};
```

#### Admin UI
- Custom React components (not off-the-shelf)
- Real-time preview (iframe)
- Drag-and-drop block editor (Lexical)
- Extensible via custom components

#### Plugin System
- Payload plugins are npm packages extending config
- Hooks into: collections, fields, admin, GraphQL, REST
- No sandboxing (trusted ecosystem)

### Lessons for Sard
1. **Field extensibility** via TypeScript interfaces
2. **Access control** as code, not config
3. **Lexical editor** for rich text (alternative to Portable Text)
4. **Auto-generated APIs** from field definitions
5. **No plugin sandboxing** - must add for Sard

---

## Strapi 5 - https://github.com/strapi/strapi

### Architecture Overview
- **Framework**: Koa.js + custom CLI
- **Database**: PostgreSQL, MySQL, SQLite, MariaDB
- **Admin**: React + Strapi Design System
- **Content**: Dynamic zones + components (similar to Portable Text)
- **API**: REST + GraphQL (auto-generated)

### Key Technical Decisions

#### Content Types (Content-Type Builder)
```json
{
  "kind": "collectionType",
  "attributes": {
    "title": { "type": "string" },
    "content": { "type": "dynamiczone", "components": ["blocks.hero", "blocks.richtext"] }
  }
}
```

#### Plugin System
- Plugins are npm packages with Strapi-specific structure
- Server APIs, Admin APIs, Content Types
- No sandboxing (trusted)

#### Admin Panel
- React + Strapi Design System (custom components)
- Content-Type Builder (visual schema editor)
- Internationalization built-in
- Role-based access control (RBAC)

#### Database Layer
- Entity-based (bookshelf/knex → custom ORM)
- Supports: PostgreSQL, MySQL, SQLite, MariaDB
- Migrations via CLI

### Lessons for Sard
1. **Dynamic zones** = Portable Text equivalent
2. **Visual Content-Type Builder** for admin (must have)
3. **Multi-database support** via adapter pattern
4. **Internationalization** as first-class feature
5. **CLI-driven development** (strapi generate)

---

## Directus - https://github.com/directus/directus

### Key Insights
- **Headless-first** with Vue 3 admin
- **Database introspection** (reads existing schema)
- **No migration lock-in** (works on existing DB)
- **Extensions**: App, API, Hybrid (sandboxed via VM2)
- **Real-time** via WebSocket

---

## CrafterCMS - https://github.com/craftercms/craftercms

### Key Insights
- **Java/Groovy** based
- **Git-based** content repository
- **Decoupled** authoring/delivery
- **Enterprise-focused**

---

## KilnCMS / nullCMS
- Minimal, file-based
- Good for static sites

---

## Summary: What Sard Adopts

| Feature | Source | Sard Approach |
|---|---|---|
| Plugin Sandbox | EmDash | WASM (not Workers) for shared hosting |
| Capability Manifest | EmDash | Adopted + extended |
| Portable Text | EmDash/Sanity | Canonical format |
| Field System | Payload | Zod schemas + TypeScript types |
| Access Control | Payload | Code-based, per-field |
| Content-Type Builder | Strapi | Visual builder in admin |
| Dynamic Zones | Strapi | Portable Text blocks |
| Multi-DB | Strapi/Directus | Adapter pattern (PG + SQLite) |
| Git Content | Directus | Optional (Phase 3+) |
| Visual Editor | Payload/EmDash | Real-time iframe + click-to-edit |

---

## Sard's Unique Differentiators

1. **PHP WASM Sandbox** — Only CMS running WP plugins safely on shared hosting
2. **4 Deployment Modes** — Single codebase, 4 targets
3. **Agentic AI Native** — MCP + Skills Layer built-in
4. **Arabic/RTL First** — Not i18n afterthought
5. **Design Tokens → Components → Editor** — Unified system
6. **Client Handoff Layer** — Agency workflow built-in
7. **WCAG 2.2 AA Default** — Not optional
8. **WordPress Compatibility Layer** — Migration bridge, not just import
