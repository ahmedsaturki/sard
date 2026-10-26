/**
 * @module @sard/docker-runtime/adapters/docker
 * Docker Adapter for Sard Docker mode
 */

import type { DatabaseAdapter, DatabaseConfig } from "@sard/runtime";
import { createDatabaseAdapter } from "@sard/runtime";

export class DockerAdapter implements DatabaseAdapter {
  private db: DatabaseAdapter | null = null;

  async initialize(config: DatabaseConfig): Promise<void> {
    this.db = await createDatabaseAdapter(config);
    await this.db.initialize(config);
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error("Docker adapter not initialized");
    return this.db.query(sql, params);
  }

  async transaction(fn: (tx: any) => Promise<any>): Promise<any> {
    if (!this.db) throw new Error("Docker adapter not initialized");
    return fn(this.db);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.db) return false;
    try {
      await this.db.query("SELECT 1");
      return true;
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
    if (!this.db) throw new Error("Docker adapter not initialized");
    for (const migration of migrations) {
      await this.db.query(migration.sql);
    }
  }
}

export function createDockerAdapter(): DockerAdapter {
  return new DockerAdapter();
}
