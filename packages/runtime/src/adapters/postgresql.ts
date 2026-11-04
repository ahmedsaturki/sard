/**
 * @module @sard-cms/runtime/adapters/postgresql
 * PostgreSQL Database Adapter for Cloud/Docker modes
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "@sard-cms/db";
import type { DatabaseAdapter } from "../interfaces.js";

export class PostgreSQLAdapter implements DatabaseAdapter {
  private db: any = null;
  private pool: Pool | null = null;

  async initialize(_config: any): Promise<void> {
    this.pool = new Pool({
      connectionString: "postgresql://postgres:postgres@localhost:5432/sard",
      max: 10,
      ssl: false,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    
    const client = await this.pool!.connect();
    client.release();

    this.db = drizzle(this.pool!, { schema });
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const pool = this.pool;
    if (!pool) throw new Error("PostgreSQL pool not initialized");
    
    const result = await pool.query(sql, params);
    
    const firstWord = sql.trim().split(" ")[0];
    return {
      rows: result.rows as any[],
      rowCount: result.rowCount ?? 0,
      command: firstWord ? firstWord.toUpperCase() : "UNKNOWN",
    };
  }

  async transaction(fn: (tx: any) => Promise<any>): Promise<any> {
    const pool = this.pool;
    if (!pool) throw new Error("PostgreSQL pool not initialized");
    
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const tx = this.createTransactionClient(client);
      const result = await fn(tx);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private createTransactionClient(client: any): any {
    const txClient = client;
    return {
      async query(sql: string, params: any[] = []): Promise<any> {
        const result = await txClient.query(sql, params);
        const firstWord = sql.trim().split(" ")[0];
        return {
          rows: result.rows as any[],
          rowCount: result.rowCount ?? 0,
          command: firstWord ? firstWord.toUpperCase() : "UNKNOWN",
        };
      },
      async transaction(fn: (tx: any) => Promise<any>): Promise<any> {
        return fn(this);
      },
      async close(): Promise<void> {},
      async healthCheck(): Promise<boolean> { return true; },
      getDialect(): "postgresql" { return "postgresql"; },
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

  getDrizzle(): any {
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

export function createPostgreSQLAdapter(_config: any): any {
  return new PostgreSQLAdapter();
}

