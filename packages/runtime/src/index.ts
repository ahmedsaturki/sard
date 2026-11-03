/**
 * @module @sard-cms/runtime
 * Deployment Abstraction Layer for Sard
 */
export * from "./config.js";
export * from "./interfaces.js";
export { createDatabaseAdapter, createAdapters } from "./factory.js";

export type { 
  SardConfig, 
  DatabaseAdapterType, 
  StorageAdapterType,
  CacheAdapterType,
  QueueAdapterType,
  RuntimeType 
} from "./config.js";

export type {
  RuntimeAdapter,
  DatabaseAdapter,
  StorageAdapter,
  CacheAdapter,
  QueueAdapter,
  RuntimeConfig,
  RuntimeRequest,
  RuntimeResponse,
  RuntimeMetadata,
  DatabaseConfig,
  QueryResult,
} from "./interfaces.js";

