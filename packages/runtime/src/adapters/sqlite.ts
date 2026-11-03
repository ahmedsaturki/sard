/**
 * @module @sard-cms/runtime/adapters/sqlite
 * SQLite Database Adapter using libsql (Turso) for cross-platform compatibility
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { schema } from "@sard-cms/db";
import type { DatabaseAdapter, DatabaseConfig } from "../interfaces.js";

export class SQLiteAdapter implements DatabaseAdapter {
  private db: any = null;
  private client: any = null;

  async initialize(config: DatabaseConfig): Promise<void> {
    let filePath = config.connectionString.replace("sqlite:", "").replace("file:", "");
    if (!filePath.endsWith(".db") && !filePath.endsWith(".sqlite")) {
      filePath += ".db";
    }
    
    this.client = createClient({
      url: "file:" + filePath,
    });

    await this.client!.execute("PRAGMA journal_mode = WAL;");
    await this.client!.execute("PRAGMA synchronous = NORMAL;");
    await this.client!.execute("PRAGMA foreign_keys = ON;");

    this.db = drizzle(this.client!, { schema });
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const client = this.client;
    if (!client) throw new Error("SQLite not initialized");
    
    const result = await client.execute({ sql, args: params });
    const firstWord = sql.trim().split(" ")[0];
    
    return {
      rows: result.rows as any[],
      rowCount: result.rows.length,
      command: firstWord ? firstWord.toUpperCase() : "UNKNOWN",
    };
  }

  async transaction(fn: (tx: any) => Promise<any>): Promise<any> {
    const client = this.client;
    if (!client) throw new Error("SQLite not initialized");
    
    return client.transaction(async (txClient: any) => {
      const { drizzle } = await import("drizzle-orm/libsql");
      const txDb = drizzle(txClient, { schema })
      const txAdapter = this.createTransactionAdapter(txDb)
      return fn(txAdapter)
    });
  }

  private createTransactionAdapter(txDb: any): any {
    const db = txDb;
    return {
      async query(sql: string, params: any[] = []): Promise<any> {
        const result = await db.execute({ sql, args: params });
        const firstWord = sql.trim().split(" ")[0];
        return {
          rows: result.rows as any[],
          rowCount: result.rows.length,
          command: firstWord ? firstWord.toUpperCase() : "UNKNOWN",
        };
      },
      async transaction(fn: (tx: any) => Promise<any>): Promise<any> {
        return fn(this)
      },
      async close(): Promise<void> {},
      async healthCheck(): Promise<boolean> { return true; },
      getDialect(): "sqlite" { return "sqlite"; },
    };
  }

  async close(): Promise<void> {
    const client = this.client;
    if (client) {
      await client.close();
      this.client = null;
      this.db = null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = this.client;
      if (!client) return false;
      const result = await client.execute("SELECT 1");
      return result.rows.length === 1;
    } catch {
      return false;
    }
  }

  getDialect(): "sqlite" {
    return "sqlite";
  }

  getDrizzle(): any {
    return this.db;
  }

  async migrate(migrations: { sql: string }[]): Promise<void> {
    const client = this.client;
    if (!client) throw new Error("SQLite not initialized");
    
    for (const migration of migrations) {
      await client.execute(migration.sql);
    }
  }
}

export function createSQLiteAdapter(_config: any): any {
  return new SQLiteAdapter();
}

