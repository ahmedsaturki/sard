/**
 * @module @sard-cms/db
 *
 * Sard core schema — content model, users, media, plugins, audit, knowledge graph.
 * Design notes: docs/adr/001-stack-choice.md, docs/adr/003-content-format.md,
 * docs/adr/005-plugin-sandbox.md.
 */
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "in_review",
  "published",
  "archived"
]);

export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "admin",
  "editor",
  "author",
  "viewer"
]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "login",
  "logout",
  "permission_change",
  "plugin_install",
  "plugin_uninstall",
  "settings_change"
]);

export const mediaStatusEnum = pgEnum("media_status", ["active", "disabled"]);
export const pluginStatusEnum = pgEnum("plugin_status", [
  "installed",
  "enabled",
  "disabled",
  "broken"
]);

// ─── Content model (Collections & Fields) ────────────────────────────────

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 128 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    /** Ordered FieldDefinition[] from @sard/core (JSONB). */
    fields: jsonb("fields").$type<readonly Record<string, unknown>[]>().notNull().default([]),
    /** Singleton collection (one document), e.g. site settings. */
    isSingleton: boolean("is_singleton").notNull().default(false),
    /** Roles allowed to create entries. */
    createRoles: varchar("create_roles", { length: 64 }).array().$type<string[]>().default([]),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [uniqueIndex("collections_slug_uq").on(t.slug)]
);

// ─── Content documents ───────────────────────────────────────────────────

export const content = pgTable(
  "content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 512 }).notNull(),
    /** Portable Text document for the primary content field. */
    body: jsonb("body")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({ _type: "content", blocks: [] }),
    /** All other field values (typed per collection.fields). */
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    status: contentStatusEnum("status").notNull().default("draft"),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    /** BCP-47 locale; Arabic-first content models ship ar + en. */
    locale: varchar("locale", { length: 10 }).notNull().default("en"),
    /** Localized content: points at the source document. */
    sourceId: uuid("source_id"),
    version: integer("version").notNull().default(1),
    authorId: uuid("author_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    uniqueIndex("content_collection_slug_locale_uq").on(t.collectionId, t.slug, t.locale),
    index("content_status_idx").on(t.status),
    index("content_publish_at_idx").on(t.publishAt)
  ]
);

// ─── Content versions (snapshots for versioning/restore) ────────────────

export const contentVersions = pgTable(
  "content_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => content.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    body: jsonb("body").$type<Record<string, unknown>>().notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    note: text("note"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    uniqueIndex("content_versions_content_version_uq").on(t.contentId, t.version)
  ]
);

// ─── Users ───────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    role: userRoleEnum("role").notNull().default("viewer"),
    /** MFA: TOTP secret (encrypted at rest). */
    mfaSecret: varchar("mfa_secret", { length: 255 }),
    mfaEnabled: boolean("mfa_enabled").notNull().default(false),
    /** SSO: SAML/OIDC provider id + subject. */
    ssoProvider: varchar("sso_provider", { length: 64 }),
    ssoSubject: varchar("sso_subject", { length: 255 }),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)]
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [uniqueIndex("user_sessions_token_hash_uq").on(t.tokenHash), index("user_sessions_user_idx").on(t.userId)]
);

// ─── Media (DAM) ─────────────────────────────────────────────────────────

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    filename: varchar("filename", { length: 512 }).notNull(),
    mimeType: varchar("mime_type", { length: 128 }).notNull(),
    size: integer("size").notNull(),
    /** Storage: relative key (S3/R2/local disk depending on adapter). */
    storageKey: varchar("storage_key", { length: 1024 }).notNull(),
    /** Optimized variants: { avif: {url,w,h}, webp: {...}, ... } */
    variants: jsonb("variants").$type<readonly Record<string, Record<string, unknown>>[]>().default([]),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text"),
    title: text("title"),
    status: mediaStatusEnum("status").notNull().default("active"),
    uploadedBy: uuid("uploaded_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [index("media_mimetype_idx").on(t.mimeType)]
);

// ─── Plugins (sandboxed) ─────────────────────────────────────────────────

export const plugins = pgTable(
  "plugins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 128 }).notNull(),
    version: varchar("version", { length: 64 }).notNull(),
    /** Capability manifest: { capabilities: string[], permissions: {...} } */
    manifest: jsonb("manifest").$type<Record<string, unknown>>().notNull().default({}),
    /** Granted capabilities (subset of manifest; admin can reduce). */
    grantedCapabilities: varchar("granted_capabilities", { length: 64 }).array().$type<string[]>().default([]),
    status: pluginStatusEnum("status").notNull().default("installed"),
    installedAt: timestamp("installed_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [uniqueIndex("plugins_name_version_uq").on(t.name, t.version)]
);

// ─── Audit trail (SIEM-exportable) ───────────────────────────────────────

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    action: auditActionEnum("action").notNull(),
    actorId: uuid("actor_id"),
    actorType: varchar("actor_type", { length: 32 }).notNull().default("user"),
    entity: varchar("entity", { length: 64 }).notNull(),
    entityId: varchar("entity_id", { length: 64 }),
    /** Structured before/after snapshot (JSONB, PII-scrubbed). */
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    index("audit_log_action_idx").on(t.action),
    index("audit_log_entity_idx").on(t.entity, t.entityId),
    index("audit_log_created_idx").on(t.createdAt)
  ]
);

// ─── Knowledge graph (AEO/GEO entities & relations) ─────────────────────

export const knowledgeEntities = pgTable(
  "knowledge_entities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: varchar("type", { length: 64 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    /** Linked content document (optional). */
    contentId: uuid("content_id").references(() => content.id, { onDelete: "set null" }),
    /** E-E-A-T: author/expert reference. */
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    /** Schema.org type for JSON-LD generation. */
    schemaOrgType: varchar("schema_org_type", { length: 64 }),
    properties: jsonb("properties").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [
    index("knowledge_entities_type_idx").on(t.type),
    uniqueIndex("knowledge_entities_type_name_uq").on(t.type, t.name)
  ]
);

export const knowledgeRelations = pgTable(
  "knowledge_relations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromEntityId: uuid("from_entity_id")
      .notNull()
      .references(() => knowledgeEntities.id, { onDelete: "cascade" }),
    toEntityId: uuid("to_entity_id")
      .notNull()
      .references(() => knowledgeEntities.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    properties: jsonb("properties").$type<Record<string, unknown>>().default({})
  },
  (t) => [
    uniqueIndex("knowledge_relations_uq").on(t.fromEntityId, t.toEntityId, t.type),
    index("knowledge_relations_from_idx").on(t.fromEntityId)
  ]
);

// ─── Redirects (301 management from admin) ──────────────────────────────

export const redirects = pgTable(
  "redirects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromPath: varchar("from_path", { length: 1024 }).notNull(),
    toPath: varchar("to_path", { length: 1024 }).notNull(),
    statusCode: integer("status_code").notNull().default(301),
    isActive: boolean("is_active").notNull().default(true),
    hits: integer("hits").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [uniqueIndex("redirects_from_path_uq").on(t.fromPath)]
);

// ─── Site settings (multi-brand ready) ──────────────────────────────────

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 128 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  defaultLocale: varchar("default_locale", { length: 10 }).notNull().default("en"),
  locales: varchar("locales", { length: 10 }).array().$type<string[]>().default(["en"]),
  /** Brand settings: { colors, fonts, logoMediaId, ... } */
  brand: jsonb("brand").$type<Record<string, unknown>>().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("sites_slug_uq").on(t.slug)]);

