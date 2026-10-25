/**
 * @module @sard/wp-runtime/bridge
 * Bridge API implementation - capability-scoped communication
 * between WP plugins (PHP-WASM) and Sard core
 */

import { sandbox, capabilities, auditLog } from '@sard/sandbox';
import type { WPPluginBridge, WPPluginContext, WPPluginManifest } from './types.js';

export function createBridge(context: WPPluginContext): WPPluginBridge {
  const { plugin, logger } = context;
  
  function checkCapability(cap: string): boolean {
    return plugin.capabilities.includes(cap) || 
           plugin.capabilities.includes('*') ||
           plugin.permissions.net?.domains?.includes('*');
  }
  
  function checkNetwork(domain: string): boolean {
    const allowlist = plugin.permissions.net?.domains ?? [];
    return allowlist.some(d => d === '*' || d === domain || 
           (d.startsWith('*.') && domain.endsWith(d.slice(2))));
  }
  
  function checkTable(table: string): boolean {
    const allowlist = plugin.permissions.db?.tables ?? [];
    return allowlist.includes('*') || allowlist.includes(table);
  }
  
  function checkFS(path: string, write = false): boolean {
    const allowlist = write ? plugin.permissions.fs?.write : plugin.permissions.fs?.read;
    if (!allowlist) return false;
    return allowlist.some(p => p === '*' || path.startsWith(p.replace('*', '')));
  }
  
  const bridge: WPPluginBridge = {
    async getPosts(query) {
      if (!checkCapability(capabilities.content.read)) {
        auditLog('bridge:getPosts', 'DENIED', { plugin: plugin.name, capability: capabilities.content.read });
        throw new Error('Capability denied: content:read');
      }
      auditLog('bridge:getPosts', 'ALLOWED', { plugin: plugin.name, query });
      // Call Sard API
      return [];
    },
    
    async getPost(id) {
      if (!checkCapability(capabilities.content.read)) throw new Error('Capability denied');
      auditLog('bridge:getPost', 'ALLOWED', { plugin: plugin.name, id });
      return null;
    },
    
    async getPages(query) {
      if (!checkCapability(capabilities.content.read)) throw new Error('Capability denied');
      return [];
    },
    
    async getPage(id) {
      if (!checkCapability(capabilities.content.read)) throw new Error('Capability denied');
      return null;
    },
    
    async getOption(name) {
      // Scoped to plugin prefix
      const scopedName = `${plugin.slug}_${name}`;
      auditLog('bridge:getOption', 'ALLOWED', { plugin: plugin.name, option: scopedName });
      return context.config.get(scopedName);
    },
    
    async updateOption(name, value) {
      if (!checkCapability(capabilities.content.write)) throw new Error('Capability denied');
      const scopedName = `${plugin.slug}_${name}`;
      auditLog('bridge:updateOption', 'ALLOWED', { plugin: plugin.name, option: scopedName });
      context.config.set(scopedName, value);
    },
    
    async deleteOption(name) {
      if (!checkCapability(capabilities.content.write)) throw new Error('Capability denied');
      const scopedName = `${plugin.slug}_${name}`;
      auditLog('bridge:deleteOption', 'ALLOWED', { plugin: plugin.name, option: scopedName });
      context.config.set(scopedName, null);
    },
    
    async query(sql, params) {
      if (!checkCapability(capabilities.db.query)) throw new Error('Capability denied');
      // Validate parameterized query
      if (!/^\s*select/i.test(sql)) throw new Error('Only SELECT allowed');
      // Check table allowlist
      const tables = sql.match(/from\s+(\w+)/gi)?.map(m => m.split(' ')[1]) ?? [];
      for (const table of tables) {
        if (!checkTable(table)) throw new Error(`Table not allowed: ${table}`);
      }
      auditLog('bridge:query', 'ALLOWED', { plugin: plugin.name, sql, tables });
      // Execute via Sard DB adapter
      return [];
    },
    
    async execute(sql, params) {
      if (!checkCapability(capabilities.db.migrate)) throw new Error('Capability denied');
      throw new Error('Write queries not allowed via bridge');
    },
    
    enqueueScript(handle, src, deps) {
      auditLog('bridge:enqueueScript', 'ALLOWED', { plugin: plugin.name, handle, src });
      // Store for frontend
    },
    
    enqueueStyle(handle, src, deps) {
      auditLog('bridge:enqueueStyle', 'ALLOWED', { plugin: plugin.name, handle, src });
    },
    
    addAdminPage(config) {
      if (!checkCapability('admin:page')) throw new Error('Capability denied');
      auditLog('bridge:addAdminPage', 'ALLOWED', { plugin: plugin.name, slug: config.menu_slug });
    },
    
    addMetaBox(config) {
      if (!checkCapability('admin:metabox')) throw new Error('Capability denied');
      auditLog('bridge:addMetaBox', 'ALLOWED', { plugin: plugin.name, id: config.id });
    },
    
    addAction(hook, callback, priority) {
      if (!checkCapability('hooks:action')) throw new Error('Capability denied');
      auditLog('bridge:addAction', 'ALLOWED', { plugin: plugin.name, hook });
    },
    
    addFilter(hook, callback, priority) {
      if (!checkCapability('hooks:filter')) throw new Error('Capability denied');
      auditLog('bridge:addFilter', 'ALLOWED', { plugin: plugin.name, hook });
    },
    
    async doAction(hook, ...args) {
      auditLog('bridge:doAction', 'ALLOWED', { plugin: plugin.name, hook });
    },
    
    async applyFilters(hook, value, ...args) {
      auditLog('bridge:applyFilters', 'ALLOWED', { plugin: plugin.name, hook });
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
