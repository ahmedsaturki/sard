/**
 * @module @sard-cms/runtime/config
 * Sard runtime configuration schema
 */
import { z } from "zod";

export const DatabaseAdapterType = ["postgresql", "sqlite"] as const;
export type DatabaseAdapterType = (typeof DatabaseAdapterType)[number];

export const StorageAdapterType = ["s3", "local", "kv"] as const;
export type StorageAdapterType = (typeof StorageAdapterType)[number];

export const CacheAdapterType = ["redis", "memory", "filesystem", "kv"] as const;
export type CacheAdapterType = (typeof CacheAdapterType)[number];

export const QueueAdapterType = ["cloudflare", "bullmq", "memory", "cron"] as const;
export type QueueAdapterType = (typeof QueueAdapterType)[number];

export const RuntimeType = ["static", "lite", "cloud", "docker"] as const;
export type RuntimeType = (typeof RuntimeType)[number];

export const SardConfigSchema = z.object({
  runtime: z.enum(RuntimeType).default("lite"),
  database: z.object({
    adapter: z.enum(DatabaseAdapterType),
    connectionString: z.string(),
    poolSize: z.number().int().positive().optional().default(10),
  }),
  storage: z.object({
    adapter: z.enum(StorageAdapterType),
    basePath: z.string().optional(),
    bucket: z.string().optional(),
    region: z.string().optional(),
    endpoint: z.string().optional(),
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
  }).default({ adapter: "local", basePath: "./storage" }),
  cache: z.object({
    adapter: z.enum(CacheAdapterType),
    url: z.string().optional(),
    defaultTTL: z.number().int().positive().optional().default(3600),
  }).default({ adapter: "memory" }),
  queue: z.object({
    adapter: z.enum(QueueAdapterType),
    url: z.string().optional(),
  }).default({ adapter: "memory" }),
});

export type SardConfig = z.infer<typeof SardConfigSchema>;

export function validateConfig(config: unknown) {
  return SardConfigSchema.parse(config);
}

