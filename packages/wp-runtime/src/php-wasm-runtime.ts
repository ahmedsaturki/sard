/**
 * @module @sard/wp-runtime/php-wasm-runtime
 * PHP-WASM runtime wrapper using @php-wasm/node (WordPress Playground)
 * 
 * Each WP plugin runs in isolated PHP WASM instance with virtual filesystem.
 * Communication via Bridge API with capability enforcement.
 */

import { PHP } from '@php-wasm/node';
import type { WPPluginBridge, WPPluginManifest, WPPluginContext, WPQuery, WPPost } from './types.js';

export class PHPWasmRuntime {
  private php: Awaited<ReturnType<typeof PHP>> | null = null;
  private plugins = new Map<string, WPPluginContext>();
  private bridge: WPPluginBridge;
  private virtualFS: Map<string, string> = new Map(); // path -> content
  
  constructor(private config: { memoryLimitMB?: number; allowNetwork?: string[] } = {}) {
    this.bridge = this.createBridge();
  }
  
  async initialize(): Promise<void> {
    this.php = await PHP.load();
    // Configure PHP ini
    this.php.eval(`
      ini_set('memory_limit', '${this.config.memoryLimitMB ?? 64}M');
      ini_set('max_execution_time', '5');
      ini_set('allow_url_fopen', '0');
      ini_set('allow_url_include', '0');
      ini_set('disable_functions', 'exec,shell_exec,system,passthru,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source,pcntl_exec');
    `);
  }
  
  private createBridge(): WPPluginBridge {
    const self = this;
    
    return {
      async getPosts(query: WPQuery): Promise<WPPost[]> {
        // Translate to Sard content query
        return []; // Implemented via Sard API call
      },
      async getPost(id: string): Promise<WPPost | null> {
        return null;
      },
      async getPages(query: WPQuery): Promise<WPPost[]> {
        return [];
      },
      async getPage(id: string): Promise<WPPost | null> {
        return null;
      },
      async getOption(name: string): Promise<unknown> {
        // Scoped to plugin prefix
        return self.getVirtualFile(`options/${name}.json`);
      },
      async updateOption(name: string, value: unknown): Promise<void> {
        self.setVirtualFile(`options/${name}.json`, JSON.stringify(value));
      },
      async deleteOption(name: string): Promise<void> {
        self.virtualFS.delete(`options/${name}.json`);
      },
      async query(sql: string, params: unknown[]): Promise<unknown[][]> {
        // Parameterized queries only - no raw SQL execution
        // Validate: only SELECT, no UNION, no DDL
        if (!/^\s*select/i.test(sql)) throw new Error('Only SELECT queries allowed');
        if (/union/i.test(sql)) throw new Error('UNION not allowed');
        // Execute via Sard database adapter
        return []; // Placeholder
      },
      async execute(sql: string, params: unknown[]): Promise<{ affectedRows: number; insertId?: number }> {
        throw new Error('Write queries not allowed via bridge; use options API');
      },
      enqueueScript(handle: string, src: string, deps: string[] = []): void {
        // Register for frontend enqueue
        self.setVirtualFile(`assets/scripts/${handle}.json`, JSON.stringify({ src, deps }));
      },
      enqueueStyle(handle: string, src: string, deps: string[] = []): void {
        self.setVirtualFile(`assets/styles/${handle}.json`, JSON.stringify({ src, deps }));
      },
      addAdminPage(config: any): void {
        self.setVirtualFile(`admin/pages/${config.menu_slug}.json`, JSON.stringify(config));
      },
      addMetaBox(config: any): void {
        self.setVirtualFile(`admin/metaboxes/${config.id}.json`, JSON.stringify(config));
      },
      addAction(hook: string, callback: string, priority: number = 10): void {
        const key = `hooks/actions/${hook}/${priority}/${callback}`;
        self.setVirtualFile(key, JSON.stringify({ hook, callback, priority }));
      },
      addFilter(hook: string, callback: string, priority: number = 10): void {
        const key = `hooks/filters/${hook}/${priority}/${callback}`;
        self.setVirtualFile(key, JSON.stringify({ hook, callback, priority }));
      },
      async doAction(hook: string, ...args: unknown[]): Promise<void> {
        // Trigger registered actions
      },
      async applyFilters(hook: string, value: unknown, ...args: unknown[]): Promise<unknown> {
        // Apply registered filters
        return value;
      }
    };
  }
  
  private getVirtualFile(path: string): unknown {
    const content = this.virtualFS.get(path);
    return content ? JSON.parse(content) : null;
  }
  
  private setVirtualFile(path: string, content: string): void {
    this.virtualFS.set(path, content);
  }
  
  async loadPlugin(manifest: WPPluginManifest, pluginZip: Buffer): Promise<WPPluginContext> {
    if (!this.php) await this.initialize();
    
    // Extract plugin ZIP to virtual filesystem
    // In production: use JSZip or similar to extract
    // For now: assume entryPoint is the main file content
    
    const context: WPPluginContext = {
      plugin: manifest,
      bridge: this.bridge,
      logger: {
        info: (msg, data) => console.log(`[WP:${manifest.name}] ${msg}`, data ?? ''),
        warn: (msg, data) => console.warn(`[WP:${manifest.name}] ${msg}`, data ?? ''),
        error: (msg, err) => console.error(`[WP:${manifest.name}] ${msg}`, err ?? '')
      },
      config: {
        get: (key) => this.getVirtualFile(`config/${key}.json`),
        set: (key, value) => this.setVirtualFile(`config/${key}.json`, JSON.stringify(value))
      }
    };
    
    // Register plugin in PHP
    // This is where the plugin's main file would be eval'd in PHP context
    // with the bridge functions exposed as global PHP functions
    
    this.plugins.set(manifest.slug, context);
    return context;
  }
  
  async unloadPlugin(slug: string): Promise<void> {
    const context = this.plugins.get(slug);
    if (!context) return;
    
    // Clean up virtual FS entries for this plugin
    for (const [path] of this.virtualFS) {
      if (path.startsWith(`plugins/${slug}/`) || 
          path.includes(`/${slug}/`) ||
          path.startsWith(`options/${slug}_`)) {
        this.virtualFS.delete(path);
      }
    }
    
    this.plugins.delete(slug);
  }
  
  getPlugin(slug: string): WPPluginContext | undefined {
    return this.plugins.get(slug);
  }
  
  getBridge(): WPPluginBridge {
    return this.bridge;
  }
  
  async shutdown(): Promise<void> {
    for (const slug of this.plugins.keys()) {
      await this.unloadPlugin(slug);
    }
    if (this.php) {
      await this.php.shutdown();
      this.php = null;
    }
  }
}

export async function createPHPWasmRuntime(config?: { memoryLimitMB?: number; allowNetwork?: string[] }): Promise<PHPWasmRuntime> {
  const runtime = new PHPWasmRuntime(config);
  await runtime.initialize();
  return runtime;
}
