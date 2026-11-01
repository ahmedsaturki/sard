/**
 * @module @sard/wp-runtime/bridge
 * Bridge API implementation - capability-scoped communication
 * between WP plugins (PHP-WASM) and Sard core
 */

import { auditLog } from '@sard/sandbox';
import type { WPPage, WPPluginBridge, WPPluginContext, WPPluginManifest, WPPost, WPQuery } from './types.js';

export function createBridge(context: WPPluginContext): WPPluginBridge {
  const { plugin } = context;

  function checkCapability(cap: string): boolean {
    return plugin.capabilities.includes(cap) ||
           plugin.capabilities.includes('*') ||
           (plugin.permissions.net?.domains?.includes('*') ?? false);
  }

  /* Check network domain permissions */
  function _checkNetwork(domain: string): boolean {
    const allowlist = plugin.permissions.net?.domains ?? [];
    return allowlist.some(d => d === '*' || d === domain ||
           (d.startsWith('*.') && domain.endsWith(d.slice(2))));
  }

  function checkTable(_table: string): boolean {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const allowlist = plugin.permissions.db?.tables ?? [];
    return allowlist.includes('*') || allowlist.includes(_table);
  }

  /* Check file system permissions */
  function checkFS(_path: string, _write = false): boolean {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const allowlist = _write ? plugin.permissions.fs?.write : plugin.permissions.fs?.read;
    if (!allowlist) return false;
    return allowlist.some(p => p === '*' || _path.startsWith(p.replace('*', '')));
  }

  const bridge: WPPluginBridge = {
    async getPosts(query?: WPQuery) {
      if (!checkCapability('content:read')) {
        auditLog('bridge:getPosts', 'DENIED', { plugin: plugin.name, capability: 'content:read' });
        throw new Error('Capability denied: content:read');
      }
      auditLog('bridge:getPosts', 'ALLOWED', { plugin: plugin.name, query });
      // Call Sard API
      return [];
    },

    async getPost(id: string | number) {
      if (!checkCapability('content:read')) throw new Error('Capability denied');
      auditLog('bridge:getPost', 'ALLOWED', { plugin: plugin.name, id });
      return null as WPPost | null;
    },

    async getPages(_query?: WPQuery): Promise<WPPage[]> {
      if (!checkCapability('content:read')) throw new Error('Capability denied');
      console.log(`[Bridge] getPages called with query:`, _query);
      return [];
    },

    async getPage(_id: string | number): Promise<WPPage | null> {
      if (!checkCapability('content:read')) throw new Error('Capability denied');
      console.log(`[Bridge] getPage called with id:`, _id);
      return null;
    },

    async getOption(name: string): Promise<unknown> {
      // Scoped to plugin prefix
      const scopedName = `${plugin.slug}_${name}`;
      auditLog('bridge:getOption', 'ALLOWED', { plugin: plugin.name, option: scopedName });
      return context.config.get(scopedName);
    },

    async updateOption(name: string, value: unknown): Promise<void> {
      if (!checkCapability('content:write')) throw new Error('Capability denied');
      const scopedName = `${plugin.slug}_${name}`;
      auditLog('bridge:updateOption', 'ALLOWED', { plugin: plugin.name, option: scopedName });
      context.config.set(scopedName, value);
    },

    async deleteOption(name: string): Promise<void> {
      if (!checkCapability('content:write')) throw new Error('Capability denied');
      const scopedName = `${plugin.slug}_${name}`;
      auditLog('bridge:deleteOption', 'ALLOWED', { plugin: plugin.name, option: scopedName });
      context.config.set(scopedName, null);
    },

    async query(_sql: string, _params: unknown[] = []): Promise<unknown[][]> {
      if (!checkCapability('db:query')) throw new Error('Capability denied');
      // Validate parameterized query
      if (!/^\s*select/i.test(_sql)) throw new Error('Only SELECT allowed');
      // Check table allowlist
      const tables = _sql.match(/from\s+(\w+)/gi)?.map(m => m.split(' ')[1]).filter((t): t is string => t !== undefined) ?? [];
      for (const table of tables) {
        if (!checkTable(table)) throw new Error(`Table not allowed: ${table}`);
      }
      auditLog('bridge:query', 'ALLOWED', { plugin: plugin.name, sql: _sql, tables: tables as string[] });
      // Execute via Sard DB adapter
      return [];
    },

    async execute(sql: string, params: unknown[] = []): Promise<{ affectedRows: number; insertId?: number }> {
      if (!checkCapability('db:migrate')) throw new Error('Capability denied');
      throw new Error('Write queries not allowed via bridge');
    },

    enqueueScript(handle: string, src: string, _deps: string[] = []): void {
      auditLog('bridge:enqueueScript', 'ALLOWED', { plugin: plugin.name, handle, src });
      // Store for frontend
    },

    enqueueStyle(handle: string, src: string, _deps: string[] = []): void {
      auditLog('bridge:enqueueStyle', 'ALLOWED', { plugin: plugin.name, handle, src });
    },

    addAdminPage(config: import('./types.js').WPAdminPageConfig): void {
      if (!checkCapability('admin:page')) throw new Error('Capability denied');
      auditLog('bridge:addAdminPage', 'ALLOWED', { plugin: plugin.name, slug: config.menu_slug ?? '' });
    },

    addMetaBox(config: import('./types.js').WPMetaBoxConfig): void {
      if (!checkCapability('admin:metabox')) throw new Error('Capability denied');
      auditLog('bridge:addMetaBox', 'ALLOWED', { plugin: plugin.name, id: config['id'] as string });
    },

    addAction(_hook: string, _callback: string, priority = 10): void {
      if (!checkCapability('hooks:action')) throw new Error('Capability denied');
      auditLog('bridge:addAction', 'ALLOWED', { plugin: plugin.name, hook: _hook });
    },

    addFilter(_hook: string, _callback: string, priority = 10): void {
      if (!checkCapability('hooks:filter')) throw new Error('Capability denied');
      auditLog('bridge:addFilter', 'ALLOWED', { plugin: plugin.name, hook: _hook });
    },

    async doAction(_hook: string, ..._args: unknown[]): Promise<void> {
      auditLog('bridge:doAction', 'ALLOWED', { plugin: plugin.name, hook: _hook });
    },

    async applyFilters(_hook: string, value: unknown, ..._args: unknown[]): Promise<unknown> {
      auditLog('bridge:applyFilters', 'ALLOWED', { plugin: plugin.name, hook: _hook });
      return value;
    }
  };

  return bridge;
}

export function createPluginManifest(
  name: string,
  slug: string,
  version: string,
  capabilities: string[],
  permissions: WPPluginManifest['permissions'],
  entryPoint: string
): WPPluginManifest {
  return { name, version, slug, capabilities, permissions, entryPoint };
}