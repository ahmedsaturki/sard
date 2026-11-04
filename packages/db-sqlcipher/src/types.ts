/**
 * @module @sard-cms/db-sqlcipher/types
 * Type definitions for SQLCipher WASM worker pool
 */

export interface SQLCipherConfig {
  /** Path to the database file (without .db extension) */
  databasePath: string;
  /** Encryption key (32 bytes hex string) - from SARD_DB_KEY env only */
  encryptionKey: string;
  /** Worker pool size (1-2 for Lite) */
  poolSize?: number;
  /** Queue max size (backpressure) */
  queueMaxSize?: number;
  /** SQLite PRAGMAs */
  pragmas?: Record<string, string | number>;
}

export interface SQLCipherWorkerMessage {
  id: string;
  type: 'exec' | 'query' | 'transaction' | 'close' | 'health';
  sql?: string;
  params?: unknown[];
  statements?: { sql: string; params: unknown[] }[];
}

export interface SQLCipherWorkerResponse {
  id: string;
  success: boolean;
  rows?: unknown[][];
  rowCount?: number;
  error?: string;
  changes?: number;
  lastInsertRowid?: number | bigint;
}

export interface DatabaseAdapter {
  initialize(config: SQLCipherConfig): Promise<void>;
  exec(sql: string, params?: unknown[]): Promise<{ rows: unknown[][]; rowCount: number }>;
  query(sql: string, params?: unknown[]): Promise<{ rows: unknown[][]; rowCount: number }>;
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

export interface Transaction {
  exec(sql: string, params?: unknown[]): Promise<{ rows: unknown[][]; rowCount: number; changes: number }>;
  query(sql: string, params?: unknown[]): Promise<{ rows: unknown[][]; rowCount: number }>;
}

export interface PayloadDatabaseAdapter {
  // Payload 3 DatabaseAdapter contract (subset)
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  execute(sql: string, params: unknown[]): Promise<{ rows: unknown[][]; affectedRows: number; insertId?: number | string }>;
  query(sql: string, params: unknown[]): Promise<{ rows: unknown[][] }>;
  transaction<T>(callback: (tx: PayloadTransaction) => Promise<T>): Promise<T>;
  // Migration methods
  createMigrationTable(): Promise<void>;
  getExecutedMigrations(): Promise<string[]>;
  executeMigration(sql: string): Promise<void>;
}

export interface PayloadTransaction {
  execute(sql: string, params: unknown[]): Promise<{ rows: unknown[][]; affectedRows: number; insertId?: number | string }>;
  query(sql: string, params: unknown[]): Promise<{ rows: unknown[][] }>;
}

export interface Migration {
  name: string;
  up: string;
  down?: string;
}

