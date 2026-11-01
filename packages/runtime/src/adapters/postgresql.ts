/**
 * @module @sard/runtime/adapters/postgresql
 * PostgreSQL Database Adapter for Cloud/Docker modes
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, PoolClient } from "pg";
import { schema } from "@sard/db";
import type { DatabaseAdapter, DatabaseConfig, QueryResult } from "../interfaces.js";

export class PostgreSQLAdapter implements DatabaseAdapter {
  private db: ReturnType<typeof drizzle> | null = null;
  private pool: Pool | null = null;

  async initialize(config: DatabaseConfig): Promise<void> {
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.poolSize ?? 10,
      ssl: config.ssl ?? false,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const client = await this.pool.connect();
    client.release();

    this.db = drizzle(this.pool, { schema });
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const pool = this.pool;
    if (!pool) throw new Error("PostgreSQL pool not initialized");

    const result = await pool.query<T>(sql, params);

    const firstWord = sql.trim().split(" ")[0];
    return {
      rows: result.rows,
      rowCount: result.rowCount ?? 0,
      command: firstWord !== '' ? firstWord.toUpperCase() : 'UNKNOWN',
    };
  }

  async transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    const pool = this.pool;
    if (!pool) throw new Error("PostgreSQL pool not initialized");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const txAdapter = this.createTransactionAdapter(client);
      const result = await fn(txAdapter);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private createTransactionAdapter(client: PoolClient): DatabaseAdapter {
    return {
      async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
        const result = await client.query<T>(sql, params);
        const firstWord = sql.trim().split(' ')[0];
        return {
          rows: result.rows,
          rowCount: result.rowCount ?? 0,
          command: firstWord !== '' ? firstWord.toUpperCase() : 'UNKNOWN',
        };
      },
      async transaction(fn: (tx: DatabaseAdapter) => Promise<unknown>): Promise<unknown> {
        return fn(this);
      },
      async close(): Promise<void> {
        // Client is released in parent transaction
        // This is a no-op for transaction adapter
      },
      async healthCheck(): Promise<boolean> {
        return true;
      },
      getDialect(): "postgresql" {
        return "postgresql";
      },
    };
  }

  async close(): Promise<void> {
    const pool = this.pool;
    if (pool) {
      await pool.end();
      this.pool = null;
      this.db = null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const pool = this.pool;
      if (!pool) return false;
      const result = await pool.query("SELECT 1");
      return result.rowCount === 1;
    } catch {
      return false;
    }
  }

  getDialect(): "postgresql" {
    return "postgresql";
  }

  getDrizzle() {
    return this.db;
  }

  async migrate(migrations: { sql: string }[]): Promise<void> {
    const pool = this.pool;
    if (!pool) throw new Error("PostgreSQL not initialized");

    for (const migration of migrations) {
      await pool.query(migration.sql);
    }
  }
}

export function createPostgreSQLAdapter(_config: DatabaseConfig): PostgreSQLAdapter {
  const adapter = new PostgreSQLAdapter();
  // Note: initialize() needs to be called separately
  return adapter;
}