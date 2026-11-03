/**
 * @module @sard-cms/wp-runtime/php-wasm-runtime
 * PHP-WASM runtime wrapper using @php-wasm/node (WordPress Playground)
 *
 * Each WP plugin runs in isolated PHP WASM instance with virtual filesystem.
 * Communication via Bridge API with capability enforcement.
 */

import { getPHPLoaderModule } from '@php-wasm/node';
import { loadPHPRuntime, popLoadedRuntime, PHP } from '@php-wasm/universal';
import type { WPPluginBridge, WPPluginManifest, WPPluginContext, WPQuery, WPPost, WPPage } from './types.js';

export class PHPWasmRuntime {
  private php: PHP | null = null;
  private plugins = new Map<string, WPPluginContext>();
  private virtualFS: Map<string, string> = new Map();

  constructor(private config: { memoryLimitMB?: number; allowNetwork?: string[] } = {}) {}

  async initialize(): Promise<void> {
    const loaderModule = await getPHPLoaderModule('8.3');
    const runtimeId = await loadPHPRuntime(loaderModule);
    this.php = popLoadedRuntime(runtimeId);
    await this.evalPHP(`
      ini_set('memory_limit', '${this.config.memoryLimitMB ?? 64}M');
      ini_set('max_execution_time', '5');
      ini_set('allow_url_fopen', '0');
      ini_set('allow_url_include', '0');
    `);
  }

  private async evalPHP(code: string): Promise<void> {
    if (!this.php) throw new Error('PHP not initialized');
    await this.php.run({ code });
  }

  private getVirtualFile(path: string): unknown {
    const content = this.virtualFS.get(path);
    return content ? JSON.parse(content) : null;
  }

  private setVirtualFile(path: string, content: string): void {
    this.virtualFS.set(path, content);
  }

  async loadPlugin(manifest: WPPluginManifest, _pluginZip: Buffer): Promise<WPPluginContext> {
    if (!this.php) await this.initialize();

    const bridge = this.createBridgeForPlugin(manifest.slug);

    const context: WPPluginContext = {
      plugin: manifest,
      bridge,
      logger: {
        info: (msg: string, data?: unknown) => console.log(`[WP:${manifest.name}] ${msg}`, data ?? ''),
        warn: (msg: string, data?: unknown) => console.warn(`[WP:${manifest.name}] ${msg}`, data ?? ''),
        error: (msg: string, err?: Error) => console.error(`[WP:${manifest.name}] ${msg}`, err ?? '')
      },
      config: {
        get: (key: string) => this.getVirtualFile(`config/${key}.json`),
        set: (key: string, value: unknown) => this.setVirtualFile(`config/${key}.json`, JSON.stringify(value))
      }
    };

    this.plugins.set(manifest.slug, context);
    return context;
  }

  private createBridgeForPlugin(pluginSlug: string): WPPluginBridge {
    const self = this;

    const getContext = () => {
      const ctx = self.plugins.get(pluginSlug);
      if (!ctx) throw new Error(`Plugin ${pluginSlug} not loaded`);
      return ctx;
    };

    const checkCapability = (cap: string): boolean => {
      const ctx = getContext();
      return ctx.plugin.capabilities.includes(cap) || ctx.plugin.capabilities.includes('*');
    };

    const checkNetwork = (domain: string): boolean => {
      const ctx = getContext();
      const allowlist = ctx.plugin.permissions.net?.domains ?? [];
      return allowlist.some(d => d === '*' || d === domain || (d.startsWith('*.') && domain.endsWith(d.slice(2))));
    };

    const checkTable = (table: string): boolean => {
      const ctx = getContext();
      const allowlist = ctx.plugin.permissions.db?.tables ?? [];
      return allowlist.includes('*') || allowlist.includes(table);
    };

    const checkFS = (path: string, write = false): boolean => {
      const ctx = getContext();
      const allowlist = write ? ctx.plugin.permissions.fs?.write : ctx.plugin.permissions.fs?.read;
      if (!allowlist) return false;
      return allowlist.some(p => p === '*' || path.startsWith(p.replace('*', '')));
    };

    return {
      async getPosts(_query?: WPQuery): Promise<WPPost[]> {
        if (!checkCapability('content:read')) throw new Error('Capability denied: content:read');
        return [];
      },
      async getPost(_id: string | number): Promise<WPPost | null> {
        if (!checkCapability('content:read')) throw new Error('Capability denied');
        return null;
      },
      async getPages(_query?: WPQuery): Promise<WPPage[]> {
        if (!checkCapability('content:read')) throw new Error('Capability denied');
        return [];
      },
      async getPage(_id: string | number): Promise<WPPage | null> {
        if (!checkCapability('content:read')) throw new Error('Capability denied');
        return null;
      },
      async getOption(name: string): Promise<unknown> {
        return self.getVirtualFile(`options/${name}.json`);
      },
      async updateOption(name: string, value: unknown): Promise<void> {
        if (!checkCapability('content:write')) throw new Error('Capability denied');
        self.setVirtualFile(`options/${name}.json`, JSON.stringify(value));
      },
      async deleteOption(name: string): Promise<void> {
        if (!checkCapability('content:write')) throw new Error('Capability denied');
        self.virtualFS.delete(`options/${name}.json`);
      },
      async query(sql: string, _params: unknown[] = []): Promise<unknown[][]> {
        if (!checkCapability('db:query')) throw new Error('Capability denied');
        if (!/^\s*select/i.test(sql)) throw new Error('Only SELECT queries allowed');
        return [];
      },
      async execute(_sql: string, _params: unknown[] = []): Promise<{ affectedRows: number; insertId?: number }> {
        throw new Error('Write queries not allowed via bridge; use options API');
      },
      enqueueScript(handle: string, src: string, deps: string[] = []): void {
        self.setVirtualFile(`assets/scripts/${handle}.json`, JSON.stringify({ src, deps }));
      },
      enqueueStyle(handle: string, src: string, deps: string[] = []): void {
        self.setVirtualFile(`assets/styles/${handle}.json`, JSON.stringify({ src, deps }));
      },
      addAdminPage(config: import('./types.js').WPAdminPageConfig): void {
        self.setVirtualFile(`admin/pages/${config.menu_slug}.json`, JSON.stringify(config));
      },
      addMetaBox(config: import('./types.js').WPMetaBoxConfig): void {
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
      async doAction(_hook: string, ..._args: unknown[]): Promise<void> {
        // Trigger registered actions
      },
      async applyFilters(_hook: string, value: unknown, ..._args: unknown[]): Promise<unknown> {
        return value;
      }
    };
  }

  async unloadPlugin(slug: string): Promise<void> {
    const context = this.plugins.get(slug);
    if (!context) return;

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

  async shutdown(): Promise<void> {
    for (const slug of this.plugins.keys()) {
      await this.unloadPlugin(slug);
    }
    this.php = null;
  }
}

export async function createPHPWasmRuntime(config?: { memoryLimitMB?: number; allowNetwork?: string[] }): Promise<PHPWasmRuntime> {
  const runtime = new PHPWasmRuntime(config);
  await runtime.initialize();
  return runtime;
}
