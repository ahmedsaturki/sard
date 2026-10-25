> **⚠️ SUPERSEDED** — This ADR was created in a prior session and has been replaced by ADR-010 through ADR-017 as of 2026-10-25 per Spec v3.0 re-baseline. It is retained for historical reference only.

# ADR-005: Plugin Sandbox Architecture

## Status
Accepted

## Context
WordPress's plugin architecture is fundamentally insecure:
- Plugins run with full PHP + database + filesystem access
- 96% of WordPress vulnerabilities come from plugins
- No capability isolation (a simple plugin can delete the database)

Sard must solve this from the ground up.

## Decision
Implement **sandboxed plugin execution** with explicit capability manifests.

### Architecture
```
┌─────────────────────────────────┐
│       Plugin Worker Isolate     │
│  ┌───────────────────────────┐  │
│  │   Plugin Code (User)      │  │
│  └───────────┬───────────────┘  │
│              │                  │
│  ┌───────────▼───────────────┐  │
│  │   Capability Gatekeeper   │  │
│  │   - content:read          │  │
│  │   - content:write         │  │
│  │   - email:send            │  │
│  │   - http:external         │  │
│  └───────────┬───────────────┘  │
└──────────────┼──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│       Core Engine (Trusted)     │
│  - Database access              │
│  - File system                  │
│  - Authentication               │
└─────────────────────────────────┘
```

### Capability Manifest
Every plugin declares required capabilities:
```json
{
  "name": "seo-optimizer",
  "version": "1.0.0",
  "capabilities": [
    "content:read",
    "content:write",
    "metadata:write"
  ],
  "permissions": {
    "http": { "domains": ["*.google.com"] },
    "database": { "tables": ["seo_metadata"] }
  }
}
```

### Implementation
- **Cloudflare Workers** for plugin isolation (V8 isolates)
- **Capability middleware** intercepts all privileged operations
- **Audit logging** for every capability use
- **Plugin review process** before marketplace publication

### Plugin SDK
```typescript
// packages/plugin-sdk/src/index.ts
export interface PluginContext {
  content: {
    read(id: string): Promise<PortableText>;
    write(id: string, content: PortableText): Promise<void>;
  };
  http: {
    fetch(url: string, options: RequestInit): Promise<Response>;
  };
  logger: {
    info(message: string, data: unknown): void;
    error(message: string, error: Error): void;
  };
}

export interface PluginDefinition {
  name: string;
  version: string;
  capabilities: string[];
  init(ctx: PluginContext): Promise<PluginAPI>;
}
```

## Consequences
### Positive
- Plugins cannot escape their sandbox
- Explicit capability declaration (no silent privilege escalation)
- Audit trail for every privileged operation
- Prevents 96% of WordPress-style plugin vulnerabilities

### Negative
- More complex than WordPress plugin model
- Some plugins may require capabilities users don't want to grant
- Performance overhead of isolate communication

## Compliance
- Layer 3 (Security): This is the core security mechanism
- Layer 7 (Governance): Capability manifests enable governance
