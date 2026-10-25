# Research: PHP WASM for WordPress Plugin Sandbox

## Executive Summary
Evaluate PHP WebAssembly runtimes for running WordPress plugins in isolated sandboxes within Sard.

## Candidates

### 1. @php-wasm/node (WordPress Playground Runtime)
**Source**: https://github.com/WordPress/wordpress-playground/tree/main/packages/php-wasm

| Aspect | Details |
|---|---|
| **Maturity** | Production (powers WordPress Playground, WordPress.com sandbox) |
| **PHP Version** | 8.2+ (compiled from source with Emscripten) |
| **Extensions** | Core + mbstring, json, openssl, pdo, pdo_sqlite, curl, zip, gd, imagick |
| **WordPress Support** | Full (Playground runs complete WP) |
| **Bundle Size** | ~8-12 MB (compressed) |
| **Startup Time** | ~200-500ms (cold), ~50ms (warm) |
| **Memory** | Configurable (default 128MB, max 512MB in WASM) |
| **API** | PHP.eval(), PHP.globals, filesystem virtualization |
| **Networking** | Proxy via Service Worker or Node.js fetch polyfill |
| **Licensing** | MIT (WordPress) |

**Pros**:
- Official WordPress project, actively maintained
- Runs full WordPress including plugins/themes
- Virtual filesystem (no host FS access)
- Network proxy controllable

**Cons**:
- Large bundle (~12MB)
- Limited to extensions compiled in
- No native threading (WASM limitation)
- Debugging harder

### 2. @nexustools/php (Nexus Tools)
**Source**: https://github.com/nexustools/php-wasm

| Aspect | Details |
|---|---|
| **Maturity** | Beta (actively developed) |
| **PHP Version** | 8.3+ |
| **Extensions** | Core + popular extensions on demand |
| **Bundle Size** | ~6-10 MB |
| **Startup** | Faster (~100-300ms) |
| **API** | Similar to php-wasm |
| **Licensing** | MIT |

**Pros**:
- Smaller, faster
- Modern PHP 8.3
- Good TypeScript types

**Cons**:
- Less battle-tested than WordPress Playground
- Smaller community
- WordPress-specific extensions may be missing

### 3. php-wasm (standalone, lower-level)
**Source**: https://github.com/oraoto/php-wasm

| Aspect | Details |
|---|---|
| **Maturity** | Alpha |
| **Use Case** | Build custom PHP WASM builds |
| **Flexibility** | Choose exact extensions |

**Cons**: Too low-level for our use case.

### 4. wasmer-js / wasmtime (WASI PHP builds)
**Source**: https://github.com/wasmerio/wasmer

**Cons**: PHP WASI builds not mature enough for WordPress.

## Recommendation: @php-wasm/node (WordPress Playground)

**Rationale**:
1. **Proven at scale**: Powers WordPress Playground (millions of sessions)
2. **WordPress-native**: Built specifically for running WP in browser/WASM
3. **Complete extension set**: Includes all WP-required extensions
4. **Virtual filesystem**: Perfect for sandboxing (no host FS access)
5. **Network proxy**: Can intercept and control all outbound requests
6. **Active maintenance**: WordPress core team investment

## Integration Architecture

```typescript
// @sard/wp-runtime package
import { PHP } from "@php-wasm/node";

interface WPPluginSandbox {
  php: PHP;
  pluginPath: string;
  bridge: WPBridge;
  limits: ResourceLimits;
}

interface ResourceLimits {
  maxMemoryMB: 64;
  maxExecutionTimeMs: 5000;
  maxNetworkRequests: 10;
}

class WPPluginRuntime {
  private sandboxes: Map<string, WPPluginSandbox> = new Map();

  async loadPlugin(pluginZip: Buffer, manifest: WPPluginManifest): Promise<string> {
    const pluginId = crypto.randomUUID();
    
    // Initialize PHP WASM instance
    const php = await PHP.load({
      // Preload WordPress core
      phpIni: `
        memory_limit = 64M
        max_execution_time = 5
        disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source
      `,
    });

    // Mount plugin files in virtual FS
    await this.mountPluginFiles(php, pluginZip);
    
    // Initialize Bridge API
    const bridge = new WPBridge(php, pluginId);
    await bridge.initialize();

    const sandbox: WPPluginSandbox = { php, pluginPath: pluginId, bridge, limits: {} };
    this.sandboxes.set(pluginId, sandbox);
    
    return pluginId;
  }

  async callBridge(pluginId: string, method: string, args: any[]): Promise<any> {
    const sandbox = this.sandboxes.get(pluginId);
    if (!sandbox) throw new Error("Plugin not loaded");
    
    // Enforce limits
    const result = await sandbox.bridge.call(method, args);
    
    // Log to Audit Trail
    await this.auditLog({
      pluginId,
      method,
      args: this.sanitizeArgs(args),
      result: "success",
      timestamp: new Date()
    });
    
    return result;
  }
}
```

## Bridge API Design

```typescript
// Minimal Bridge API for WP plugins
interface WPBridge {
  // Options (scoped to plugin)
  getOption(optionName: string): Promise<any>;
  updateOption(optionName: string, value: any): Promise<void>;
  deleteOption(optionName: string): Promise<void>;

  // Content (read-only, filtered)
  getPosts(query: WPQueryArgs): Promise<WPPost[]>;
  getPost(postId: number): Promise<WPPost | null>;
  getTerms(taxonomy: string, args: WPTermQueryArgs): Promise<WPTerm[]>;

  // Database (parameterized only)
  db: {
    query(sql: string, params: any[]): Promise<any[]>;
    insert(table: string, data: Record<string, any>): Promise<number>;
    update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<number>;
    delete(table: string, where: Record<string, any>): Promise<number>;
  };

  // Assets
  enqueueScript(handle: string, src: string, deps: string[], version?: string): void;
  enqueueStyle(handle: string, src: string, deps: string[], version?: string): void;

  // Admin
  addAdminPage(config: WPAdminPageConfig): Promise<string>;
  addMetaBox(config: WPMetaBoxConfig): Promise<string>;

  // Network (proxied)
  http: {
    get(url: string, options?: RequestInit): Promise<Response>;
    post(url: string, body: any, options?: RequestInit): Promise<Response>;
  };
}
```

## Resource Limits & Security

| Limit | Value | Enforcement |
|---|---|---|
| Memory | 64 MB | PHP ini + WASM heap limit |
| CPU Time | 5 seconds per request | PHP max_execution_time |
| Network Requests | 10 per request | Bridge proxy counter |
| Execution Time | 30 seconds total | WASM timeout |
| File System | Virtual only | No host FS mounting |
| Extensions | Pre-approved list | Compile-time only |

## Limitations & Unsupported Plugins

**Cannot Support** (document clearly):
- Plugins requiring custom PHP extensions (ionCube, custom C extensions)
- Plugins using exec(), shell_exec(), proc_open() (disabled)
- Plugins needing raw filesystem access
- Plugins making uncontrolled outbound connections
- Plugins with ionCube/encoded files
- Multisite-specific plugins (initial version)

**Supported Categories**:
- Contact forms (CF7, Gravity Forms, WPForms)
- SEO (Yoast, RankMath, AIOSEO - read-only mostly)
- Caching (WP Rocket, W3TC - limited to Bridge API)
- Security (Wordfence - scan only, no firewall)
- Forms, galleries, sliders, shortcodes

## Next Steps
1. **Week 1 Day 9-10**: Build minimal PoC loading "Hello World" WP plugin
2. **Phase 2 Week 1**: Implement Bridge API with 3 plugins (CF7, Yoast, WooCommerce cart)
3. **Phase 2 Week 2**: Resource limits, audit logging, sandbox lifecycle
4. **Phase 3**: Visual regression testing for plugin admin UIs
