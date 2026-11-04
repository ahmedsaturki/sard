/**
 * @module @sard-cms/wp-compat/migration/types
 * Type definitions for WordPress Migration Toolkit (L3)
 */


/**
 * WordPress WXR (WordPress eXtended RSS) export structure
 */
export interface WXRExport {
  channel: WXRChannel;
}

export interface WXRChannel {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  language: string;
  wp: WXRWordPressData;
  items: WXRItem[];
}

export interface WXRWordPressData {
  wxr_version: string;
  base_site_url: string;
  base_blog_url: string;
  authors: WXRAuthor[];
  categories: WXRCategory[];
  tags: WXRTag[];
  terms: WXRTerm[];
  posts: WXRPost[];
  pages: WXRPage[];
  attachments: WXRAttachment[];
  comments: WXRComment[];
}

export interface WXRAuthor {
  login: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
}

export interface WXRCategory {
  slug: string;
  name: string;
  parent?: string;
  description: string;
}

export interface WXRTag {
  slug: string;
  name: string;
  description: string;
}

export interface WXRTerm {
  slug: string;
  name: string;
  taxonomy: string;
  parent?: string;
  description: string;
}

export interface WXRPost {
  id: number;
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  guid: string;
  description: string;
  content_encoded: string;
  excerpt_encoded: string;
  post_date: string;
  post_date_gmt: string;
  comment_status: string;
  ping_status: string;
  post_name: string;
  status: string;
  post_parent: number;
  menu_order: number;
  post_type: string;
  post_password: string;
  is_sticky: boolean;
  categories: string[];
  tags: string[];
  meta: WXRPostMeta[];
}

export interface WXRPostMeta {
  key: string;
  value: string;
}

export interface WXRPage {
  id: number;
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  guid: string;
  description: string;
  content_encoded: string;
  post_date: string;
  post_date_gmt: string;
  comment_status: string;
  ping_status: string;
  post_name: string;
  status: string;
  post_parent: number;
  menu_order: number;
  post_type: string;
  post_password: string;
  categories: string[];
  tags: string[];
  meta: WXRPostMeta[];
}

export interface WXRAttachment {
  id: number;
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  guid: string;
  description: string;
  content_encoded: string;
  post_date: string;
  post_date_gmt: string;
  status: string;
  post_parent: number;
  meta: WXRPostMeta[];
  attachment_url: string;
}

export interface WXRComment {
  id: number;
  author: string;
  author_email: string;
  author_url: string;
  author_ip: string;
  date: string;
  date_gmt: string;
  content: string;
  approved: string;
  type: string;
  parent: number;
  user_id: number;
  post_id: number;
}

export interface WXRItem {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  guid: string;
  description: string;
  content: string;
  postType: string;
  status: string;
}

/**
 * Migration options
 */
export interface MigrationOptions {
  sourceFile: string;
  outputDir: string;
  preserveUrls: boolean;
  generate301Redirects: boolean;
  importMedia: boolean;
  mediaBaseUrl?: string;
  skipContent?: boolean;
  dryRun?: boolean;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  stats: {
    authors: number;
    categories: number;
    tags: number;
    posts: number;
    pages: number;
    attachments: number;
    comments: number;
  };
  redirects: Map<string, string>;
  warnings: string[];
  errors: string[];
}

/**
 * 301 Redirect entry
 */
export interface RedirectEntry {
  from: string;
  to: string;
  type: "301" | "302";
  reason: string;
}

