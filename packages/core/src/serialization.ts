/**
 * @module @sard/core/serialization
 *
 * Core CMS serialization types for content model transport.
 * Used by REST/GraphQL APIs and the Visual Editor.
 * See ADR-001 (Stack), ADR-003 (Portable Text), ADR-005 (Plugin Sandbox).
 */

import { z } from "zod";

/**
 * Serializable field definition (stripped of Zod internals).
 */
export interface FieldDefinitionSerializable {
  name: string;
  type: string;
  label: string | Record<string, string>;
  description?: string;
  required?: boolean;
  options?: string[]; // for select/multiselect
  to?: string; // for relation
}

/**
 * Serializable collection (stripped of Zod internals).
 */
export interface CollectionSerializable {
  slug: string;
  title: string;
  isSingleton?: boolean;
  createRoles?: string[];
  description?: string;
  fields: FieldDefinitionSerializable[];
}

/**
 * Serialized content entry for API transport.
 * Includes Portable Text body and typed field data.
 */
export interface ContentEntrySerializable {
  id: string;
  collectionId: string;
  collectionSlug: string;
  slug: string;
  body: unknown; // Portable Text document
  data: Record<string, unknown>;
  status: "draft" | "in_review" | "published" | "archived";
  publishAt?: string; // ISO 8601
  publishedAt?: string;
  locale: string;
  sourceId?: string;
  version: number;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated list response for API transport.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Content query parameters for API.
 */
export interface ContentQueryParamsInput {
  page?: number;
  pageSize?: number;
  status?: "draft" | "in_review" | "published" | "archived";
  locale?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  localeFilter?: string; // for multi-locale
}

/**
 * Collection with computed metadata for API.
 */
export interface CollectionWithMeta {
  slug: string;
  title: string;
  isSingleton?: boolean;
  createRoles?: string[];
  description?: string;
  fields: FieldDefinitionSerializable[];
  entryCount?: number;
  lastPublishedAt?: string;
  lastUpdatedAt?: string;
}

/**
 * API error response format.
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Successful API response wrapper.
 */
export interface ApiSuccessResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Validation error detail.
 */
export interface ValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}

/**
 * Content mutation input (create/update).
 */
export interface ContentMutationInputData {
  slug?: string;
  body?: unknown;
  data?: Record<string, unknown>;
  status?: "draft" | "in_review" | "published" | "archived";
  publishAt?: string; // ISO 8601
  locale?: string;
}

/**
 * Collection creation input.
 */
export interface CollectionCreateInputData {
  slug: string;
  title: string;
  isSingleton?: boolean;
  createRoles?: string[];
  description?: string;
  fields: Array<{
    name: string;
    type: string;
    label: string | Record<string, string>;
    description?: string;
    required?: boolean;
    options?: string[];
    to?: string; // for relation
  }>;
}

/**
 * Plugin manifest for API transport.
 */
export interface PluginManifestSerializable {
  name: string;
  version: string;
  description?: string;
  capabilities: string[];
  permissions?: {
    http?: { domains: string[] };
    database?: { tables: string[] };
  };
}

/**
 * User serializable for API.
 */
export interface UserSerializable {
  id: string;
  email: string;
  name?: string;
  role: "owner" | "admin" | "editor" | "author" | "viewer";
  mfaEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Media serializable for API.
 */
export interface MediaSerializable {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  variants?: Record<string, Record<string, unknown>>;
  width?: number;
  height?: number;
  altText?: string;
  title?: string;
  status: "active" | "disabled";
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Audit log entry for API.
 */
export interface AuditLogEntrySerializable {
  id: string;
  action: string;
  actorId?: string;
  actorType: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

/**
 * Zod schemas for API validation.
 */
export const CollectionCreateInputSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  isSingleton: z.boolean().optional(),
  createRoles: z.array(z.string()).optional(),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      name: z.string().min(1).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
      type: z.enum([
        "text",
        "textarea",
        "number",
        "boolean",
        "select",
        "multiselect",
        "date",
        "portableText",
        "media",
        "relation",
        "array",
        "json",
      ]),
      label: z.union([z.string(), z.record(z.string())]),
      description: z.string().optional(),
      required: z.boolean().optional(),
      options: z.array(z.string()).optional(),
      to: z.string().optional(),
    }).strict()
  ).min(1),
});

export type CollectionCreateInput = z.infer<typeof CollectionCreateInputSchema>;

export const ContentMutationInputSchema = z.object({
  slug: z.string().optional(),
  body: z.unknown().optional(),
  data: z.record(z.unknown()).optional(),
  status: z.enum(["draft", "in_review", "published", "archived"]).optional(),
  publishAt: z.string().datetime().optional(),
  locale: z.string().optional(),
});

export type ContentMutationInput = z.infer<typeof ContentMutationInputSchema>;

export const ContentQueryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20).optional(),
  status: z.enum(["draft", "in_review", "published", "archived"]).optional(),
  locale: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  localeFilter: z.string().optional(),
});

export type ContentQueryParams = z.infer<typeof ContentQueryParamsSchema>;
