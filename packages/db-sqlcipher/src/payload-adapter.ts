/**
 * @module @sard/db-sqlcipher/payload-adapter
 * Payload 3 Database Adapter implementation over SQLCipher pool
 * Implements Payload's DatabaseAdapter contract
 */

import { SQLCipherPool, type SQLCipherConfig, type PayloadDatabaseAdapter, type PayloadTransaction } from './types.js';
import { createSQLCipherPool } from './pool.js';
import { randomUUID } from 'node:crypto';

export class PayloadSQLCipherAdapter implements PayloadDatabaseAdapter {
  private pool: SQLCipherPool | null = null;
  private config: SQLCipherConfig | null = null;
  
  async connect(): Promise<void> {
    if (this.pool) return;
    
    const encryptionKey = process.env.SARD_DB_KEY;
    const keyFile = process.env.SARD_DB_KEY_FILE;
    const databasePath = process.env.SARD_DB_PATH ?? './data/sard';
    
    if (!encryptionKey && !keyFile) {
      throw new Error('SARD_DB_KEY or SARD_DB_KEY_FILE environment variable required (AC-11)');
    }
    
    let key = encryptionKey;
    if (!key && keyFile) {
      const fs = await import('node:fs');
      key = fs.readFileSync(keyFile, 'utf8').trim();
    }
    
    if (!key || key.length !== 64) {
      throw new Error('Encryption key must be 32 bytes (64 hex chars)');
    }
    
    this.config = {
      databasePath,
      encryptionKey: key,
      poolSize: 1, // Single writer for SQLite
      queueMaxSize: 50,
      pragmas: {
        journal_mode: 'WAL',
        synchronous: 'NORMAL',
        foreign_keys: 'ON',
        busy_timeout: '5000'
      }
    };
    
    this.pool = createSQLCipherPool(this.config);
    await this.pool.initialize(this.config);
  }
  
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
  
  async execute(sql: string, params: unknown[] = []): Promise<{ rows: unknown[][]; affectedRows: number; insertId?: number | string }> {
    if (!this.pool) throw new Error('Not connected');
    const result = await this.pool.exec(sql, params);
    return {
      rows: result.rows,
      affectedRows: result.rowCount,
      insertId: undefined // SQLite doesn't easily return insertId without RETURNING
    };
  }
  
  async query(sql: string, params: unknown[] = []): Promise<{ rows: unknown[][] }> {
    if (!this.pool) throw new Error('Not connected');
    const result = await this.pool.query(sql, params);
    return { rows: result.rows };
  }
  
  async transaction<T>(callback: (tx: PayloadTransaction) => Promise<T>): Promise<T> {
    if (!this.pool) throw new Error('Not connected');
    
    return this.pool.transaction(async (tx) => {
      const payloadTx: PayloadTransaction = {
        execute: async (sql: string, params: unknown[] = []) => {
          const result = await tx.exec(sql, params);
          return { rows: result.rows, affectedRows: result.rowCount, insertId: undefined };
        },
        query: async (sql: string, params: unknown[] = []) => {
          const result = await tx.query(sql, params);
          return { rows: result.rows };
        }
      };
      return callback(payloadTx);
    });
  }
  
  async createMigrationTable(): Promise<void> {
    await this.execute(`
      CREATE TABLE IF NOT EXISTS `_migrations` (
        `name` TEXT PRIMARY KEY,
        `executed_at` INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);
  }
  
  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.query('SELECT `name` FROM `_migrations` ORDER BY `executed_at`');
    return result.rows.map(r => r[0] as string);
  }
  
  async executeMigration(sql: string): Promise<void> {
    await this.execute(sql);
  }
}

export function createPayloadAdapter(config?: Partial<SQLCipherConfig>): PayloadSQLCipherAdapter {
  return new PayloadSQLCipherAdapter();
}
