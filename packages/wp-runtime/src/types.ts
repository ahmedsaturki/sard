/**
 * @module @sard/wp-runtime/types
 * Type definitions for WordPress plugin Bridge API
 *
 * ADR-016 L1: PHP-WASM runtime with capability-scoped Bridge
 */

export interface WPQuery {
  post_type?: string;
  posts_per_page?: number;
  paged?: number;
  orderby?: string;
  order?: 'ASC' | 'DESC';
  meta_query?: unknown[];
  tax_query?: unknown[];
  s?: string; // search
  [key: string]: unknown;
}

export interface WPPost {
  ID: number;
  post_title: string;
  post_content: string;
  post_excerpt: string;
  post_status: string;
  post_type: string;
  post_author: number;
  post_date: string;
  post_modified: string;
  post_name: string;
  guid: string;
  menu_order: number;
  comment_status: string;
  ping_status: string;
  post_password: string;
  to_ping: string;
  pinged: string;
  post_content_filtered: string;
  post_parent: number;
  meta: Record<string, unknown>;
}

export interface WPPage extends WPPost {
  post_type: 'page';
}

export interface WPAdminPageConfig {
  page_title: string;
  menu_title: string;
  capability: string;
  menu_slug: string;
  callback: string; // PHP callable
  icon_url?: string;
  position?: number;
}

export interface WPMetaBoxConfig {
  id: string;
  title: string;
  callback: string; // PHP callable
  screen: string | string[];
  context?: 'normal' | 'advanced' | 'side';
  priority?: 'default' | 'high' | 'low' | 'core';
  callback_args?: unknown;
}

export interface WPPluginManifest {
  name: string;
  version: string;
  slug: string;
  capabilities: string[];
  permissions: {
    fs?: { read?: string[]; write?: string[] };
    net?: { domains?: string[] };
    db?: { tables?: string[] };
    hooks?: { actions?: string[]; filters?: string[] };
  };
  entryPoint: string; // main PHP file
  dependencies?: string[];
}

export interface WPPluginContext {
  plugin: WPPluginManifest;
  bridge: WPPluginBridge;
  logger: {
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, error?: Error): void;
  };
  config: {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
  };
}

export interface WPPluginBridge {
  // Content (read-only by default)
  getPosts(query?: WPQuery): Promise<WPPost[]>;
  getPost(id: string | number): Promise<WPPost | null>;
  getPages(query?: WPQuery): Promise<WPPage[]>;
  getPage(id: string | number): Promise<WPPage | null>;

  // Options (scoped to plugin prefix)
  getOption(name: string): Promise<unknown>;
  updateOption(name: string, value: unknown): Promise<void>;
  deleteOption(name: string): Promise<void>;

  // Database (parameterized queries only, no raw SQL)
  query(sql: string, params: unknown[]): Promise<unknown[][]>;
  execute(sql: string, params: unknown[]): Promise<{ affectedRows: number; insertId?: number }>;

  // Assets
  enqueueScript(handle: string, src: string, deps?: string[]): void;
  enqueueStyle(handle: string, src: string, deps?: string[]): void;

  // Admin UI
  addAdminPage(config: WPAdminPageConfig): void;
  addMetaBox(config: WPMetaBoxConfig): void;

  // Hooks
  addAction(hook: string, callback: string, priority?: number): void;
  addFilter(hook: string, callback: string, priority?: number): void;
  doAction(hook: string, ...args: unknown[]): Promise<void>;
  applyFilters(hook: string, value: unknown, ...args: unknown[]): Promise<unknown>;
}