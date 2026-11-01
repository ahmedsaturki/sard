/**
 * @module @sard/runtime/adapters/sqlite
 * SQLite Database Adapter using libsql (Turso) for cross-platform compatibility
 */
import { createClient, LibSQLConnection } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { schema } from "@sard/db";
import type { DatabaseAdapter, DatabaseConfig, QueryResult } from "../interfaces.js";

interface LibSQLResult {
  rows: Record<string, unknown>[];
  rowsAffected?: number;
}

export class SQLiteAdapter implements DatabaseAdapter {
  private db: ReturnType<typeof drizzle> | null = null;
  private client: ReturnType<typeof createClient> | null = null;

  async initialize(config: DatabaseConfig): Promise<void> {
    let filePath = config.connectionString.replace("sqlite:", "").replace("file:", "");
    if (!filePath.endsWith(".db") && !filePath.endsWith(".sqlite")) {
      filePath += ".db";
    }

    this.client = createClient({
      url: "file:" + filePath,
    });

    await this.client.execute("PRAGMA journal_mode = WAL;");
    await this.client.execute("PRAGMA synchronous = NORMAL;");
    await this.client.execute("PRAGMA foreign_keys = ON;");

    this.db = drizzle(this.client, { schema });
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const client = this.client;
    if (!client) throw new Error("SQLite not initialized");

    const result = await client.execute({ sql, args: params as string[] });
    const firstWord = sql.trim().split(" ")[0];

    return {
      rows: (result as LibSQLResult).rows as T[],
      rowCount: (result as LibSQLResult).rows.length,
      command: firstWord !== '' ? firstWord.toUpperCase() : 'UNKNOWN',
    };
  }

  async transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    const client = this.client;
    if (!client) throw new Error("SQLite not initialized");

    return client.transaction(async (txClient: LibSQLConnection) => {
      const txDb = drizzle(txClient, { schema });
      const txAdapter = this.createTransactionAdapter(txDb);
      return fn(txAdapter) as Promise<T>;
    });
  }

  private createTransactionAdapter(txDb: ReturnType<typeof drizzle>): DatabaseAdapter {
    return {
      async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
        const result = await txDb.execute(sql, params as string[]);
        const firstWord = sql.trim().split(" ")[0];
        return {
          rows: result.rows as T[],
          rowCount: (result as LibSQLResult).rows.length,
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
      getDialect(): "sqlite" {
        return "sqlite";
      },
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
      return (result as LibSQLResult).rows.length === 1;
    } catch {
      return false;
    }
  }

  getDialect(): "sqlite" {
    return "sqlite";
  }

  getDrizzle() {
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

export function createSQLiteAdapter(_config: DatabaseConfig): SQLiteAdapter {
  const adapter = new SQLiteAdapter();
  // Note: initialize() needs to be called separately
  return adapter;
}