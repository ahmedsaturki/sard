/**
 * @module @sard-cms/runtime/interfaces
 * Core adapter interfaces for deployment abstraction
 */

/**
 * Runtime Adapter - handles HTTP request/response in different environments
 */
export interface RuntimeAdapter {
  /** Initialize the runtime */
  initialize(config: RuntimeConfig): Promise<void>;
  
  /** Handle incoming request */
  handleRequest(request: RuntimeRequest): Promise<RuntimeResponse>;
  
  /** Shutdown gracefully */
  shutdown(): Promise<void>;
  
  /** Get runtime metadata */
  getMetadata(): RuntimeMetadata;
}

export interface RuntimeConfig {
  /** Base URL for the application */
  baseUrl: string;
  /** Environment variables */
  env: Record<string, string>;
  /** Custom middleware */
  middleware?: RuntimeMiddleware[];
}

export interface RuntimeRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: ReadableStream | string | null;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

/**
 * @module @sard-cms/runtime/interfaces
 * Core adapter interfaces for deployment abstraction
 */

/**
 * Runtime Adapter - handles HTTP request/response in different environments
 */
export interface RuntimeAdapter {
  /** Initialize the runtime */
  initialize(config: RuntimeConfig): Promise<void>;
  
  /** Handle incoming request */
  handleRequest(request: RuntimeRequest): Promise<RuntimeResponse>;
  
  /** Shutdown gracefully */
  shutdown(): Promise<void>;
  
  /** Get runtime metadata */
  getMetadata(): RuntimeMetadata;
}

export interface RuntimeConfig {
  /** Base URL for the application */
  baseUrl: string;
  /** Environment variables */
  env: Record<string, string>;
  /** Custom middleware */
  middleware?: RuntimeMiddleware[];
}

export interface RuntimeRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: ReadableStream | string | null;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface RuntimeResponse {
  status: number;
  headers: Record<string, string>;
  body?: ReadableStream | string | null;
}

export interface RuntimeMetadata {
  name: string;
  version: string;
  environment: "development" | "production" | "preview";
  capabilities: RuntimeCapability[];
}

export type RuntimeCapability = 
  | "streaming-ssr" 
  | "edge-caching" 
  | "isr" 
  | "serverless-functions" 
  | "static-generation" 
  | "websocket";

export type RuntimeMiddleware = (req: RuntimeRequest, next: () => Promise<RuntimeResponse>) => Promise<RuntimeResponse>;

/**
 * Database Adapter - unified interface for PostgreSQL and SQLite
 */
export interface DatabaseAdapter {
  /** Initialize connection */
  initialize(config: DatabaseConfig): Promise<void>;
  
  /** Execute query */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  
  /** Execute transaction */
  transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T>;
  
  /** Close connection */
  close(): Promise<void>;
  
  /** Health check */
  healthCheck(): Promise<boolean>;
  
  /** Get dialect name */
  getDialect(): "postgresql" | "sqlite";
}

export interface DatabaseConfig {
  connectionString: string;
  poolSize?: number;
  ssl?: boolean | object;
}

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  command: string;
}

/**
 * Storage Adapter - file/blob storage abstraction
 */
export interface StorageAdapter {
  /** Upload file */
  upload(key: string, data: Uint8Array | ReadableStream, options?: UploadOptions): Promise<StorageObject>;
  
  /** Download file */
  download(key: string): Promise<StorageObject | null>;
  
  /** Delete file */
  delete(key: string): Promise<void>;
  
  /** List files */
  list(prefix: string, options?: ListOptions): Promise<StorageObject[]>;
  
  /** Get signed URL */
  getSignedUrl(key: string, options: SignedUrlOptions): Promise<string>;
  
  /** Check if exists */
  exists(key: string): Promise<boolean>;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}

export interface ListOptions {
  limit?: number;
  cursor?: string;
}

export interface SignedUrlOptions {
  expiresIn: number; // seconds
  method?: "GET" | "PUT";
}

export interface StorageObject {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
  metadata: Record<string, string>;
  etag: string;
}

/**
 * Cache Adapter
 */
export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
}

/**
 * Queue Adapter - background job processing
 */
export interface QueueAdapter {
  /** Add job to queue */
  add<T>(name: string, data: T, options?: JobOptions): Promise<string>;
  
  /** Process queue */
  process(name: string, handler: JobHandler): Promise<void>;
  
  /** Schedule recurring job */
  schedule(name: string, cron: string, data: unknown, options?: JobOptions): Promise<void>;
  
  /** Get queue stats */
  getStats(name: string): Promise<QueueStats>;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

export type JobHandler = (job: Job) => Promise<unknown>;

export interface Job<T = unknown> {
  id: string;
  name: string;
  data: T;
  attempts: number;
  progress: number;
  timestamp: number;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

