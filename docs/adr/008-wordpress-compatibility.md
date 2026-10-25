> **⚠️ SUPERSEDED** — This ADR was created in a prior session and has been replaced by ADR-010 through ADR-017 as of 2026-10-25 per Spec v3.0 re-baseline. It is retained for historical reference only.

# ADR-008: WordPress Compatibility Layer (4 Levels)

## Status
Accepted

## Context
WordPress powers 43% of the web (835M+ sites). Migration friction is the #1 barrier to adoption.
Sard must provide a **gradual, safe migration path** — not just a "big bang" replacement.
The compatibility layer must:
- Reduce migration risk to near-zero
- Allow incremental adoption (run WP plugins alongside Sard features)
- Maintain Sard's security model (no direct WP plugin access to core)
- Provide native alternatives so users don't *need* WP plugins long-term

## Decision
Implement a 4-level WordPress Compatibility Layer:

### Level 1: Legacy Plugin Runtime (PHP WASM Sandbox)
**Technology**: `@php-wasm/node` (WordPress Playground runtime) or `@nexustools/php`
- Each WP plugin runs in isolated **WebAssembly sandbox**
- Communication via **Bridge API** with capability-based permissions:
  ```typescript
  interface WPPluginBridge {
    // Content (read-only by default)
    getPosts(query: WPQuery): Promise<WPPost[]>;
    getPost(id: string): Promise<WPPost | null>;
    
    // Options (scoped to plugin prefix)
    getOption(name: string): Promise<any>;
    updateOption(name: string, value: any): Promise<void>;
    
    // Database (parameterized queries only, no raw SQL)
    query(sql: string, params: any[]): Promise<any[]>;
    
    // Assets
    enqueueScript(handle: string, src: string, deps: string[]): void;
    enqueueStyle(handle: string, src: string, deps: string[]): void;
    
    // Admin UI
    addAdminPage(config: WPAdminPageConfig): void;
    addMetaBox(config: WPMetaBoxConfig): void;
  }
  ```
- **Security**: No filesystem access, no raw SQL, no eval, network requests proxied
- **Lifecycle**: Install → Sandbox Init → Bridge Registration → Ready
- **Monitoring**: Resource limits (CPU, memory, execution time) per plugin
- **Target Plugins (Phase 2)**: Contact Form 7, Yoast SEO, WooCommerce (cart/checkout only)

### Level 2: Theme Conversion (WP Theme → Astro)
**Tool**: `@sard/theme-converter` (CLI + Web UI)
- Input: WordPress theme directory (PHP templates + style.css + functions.php)
- Analysis: Parse template hierarchy, extract template parts, identify loops/conditionals
- Output: Astro project with:
  - `.astro` components matching template structure
  - Tailwind CSS config matching theme's design tokens
  - Portable Text block components for content areas
  - `functions.php` logic converted to Sard hooks/plugins
- **Visual Regression**: Automated screenshot comparison (Playwright) against live WP site
- **Target**: Twenty Twenty-Four, Astra, GeneratePress, Hello Elementor

### Level 3: Migration Toolkit
**Command**: `sard migrate wordpress`
- **Input**: WXR (WordPress eXtended RSS) or JSON export
- **Content Migration**:
  - Posts/Pages → Portable Text documents (blocks converted from HTML)
  - Categories/Tags → Taxonomy terms
  - Featured Images → Media library entries
  - Custom Post Types → Sard Collections
- **User Migration**: Users + roles + capabilities → Sard users/roles
- **SEO Migration**: Yoast/RankMath/AIOSEO meta → Sard JSON-LD + directAnswer blocks
- **URL Preservation**: Automatic 301 redirect generation from permalink structure
- **Media**: Download + optimize (WebP/AVIF) + re-link in content
- **Validation**: Post-migration report with diff stats, broken link check
- **Rollback**: One-click revert via migration snapshot

### Level 4: Native Alternatives (Replace, Don't Just Run)
Build Sard-native replacements for top WP plugins:
| WP Plugin | Sard Native Alternative | Advantage |
|---|---|---|
| Contact Form 7 | `@sard/forms` | Visual builder, spam protection, multi-step, analytics |
| Yoast SEO | `@sard/seo` | AEO/GEO built-in, JSON-LD auto, llms.txt, MCP |
| WooCommerce | `@sard/commerce` | Headless-first, SKU-level JSON-LD, Agentic AI pricing |
| WPML/Polylang | `@sard/i18n` | Native bilingual model, RTL, locale-aware fields |
| Elementor | `@sard/visual-editor` | Real-time, collaborative, design-constrained |
| WP Rocket | `@sard/performance` | Edge caching, ISR, streaming SSR — no config needed |

## Security Constraints (Non-Negotiable)
- ❌ No WP plugin accesses Sard database directly
- ❌ No WP plugin executes raw SQL
- ❌ No WP plugin reads/writes filesystem outside its sandbox
- ❌ No WP plugin makes outbound network requests without proxy
- ❌ No `eval()`, `create_function()`, dynamic code execution
- ✅ All Bridge API calls logged to Audit Trail
- ✅ Resource quotas enforced per plugin (CPU, memory, time)
- ✅ Plugin can be killed instantly by admin

## Acceptance Criteria
- ✅ Level 1: 5 popular WP plugins install & run in sandbox (Contact Form 7, Yoast, WooCommerce cart, WPML, Akismet)
- ✅ Level 2: Twenty Twenty-Four converts to Astro, visual regression < 2% pixel diff
- ✅ Level 3: Real WP site (≥ 100 posts, ≥ 50 images) migrates in < 30 min, 100% URL preservation
- ✅ Level 4: Each native alternative outperforms WP equivalent in speed/security/UX

## Compliance
- Enables gradual migration (run WP plugins while adopting Sard features)
- Maintains Sard's security model (sandbox + capabilities)
- Provides exit strategy (native alternatives)
- Reduces agency/client migration risk to near-zero
