/**
 * @module @sard/db-sqlcipher
 * SQLCipher WASM worker pool + Payload Database Adapter for Sard Lite
 * 
 * AC-06: SQLite in production = SQLCipher (AES-256). No exceptions.
 * AC-11: Key only from SARD_DB_KEY env var or SARD_DB_KEY_FILE.
 * HC-07: Pool abstraction, no direct better-sqlite3 usage.
 */

export * from './types.js';
export { SQLCipherPool, createSQLCipherPool } from './pool.js';
