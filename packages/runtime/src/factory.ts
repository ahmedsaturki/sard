/**
 * @module @sard-cms/runtime/factory
 * Adapter factory - creates appropriate adapters based on config
 */
import type { DatabaseAdapter, DatabaseConfig } from "./interfaces.js";

export async function createDatabaseAdapter(config: DatabaseConfig): Promise<DatabaseAdapter> {
  const connectionString = config.connectionString.toLowerCase();
  
  if (connectionString.startsWith("sqlite:") || 
      connectionString.startsWith("file:") || 
      config.connectionString.endsWith(".db") || 
      config.connectionString.endsWith(".sqlite")) {
    const { createSQLiteAdapter } = await import("./adapters/sqlite.js");
    return createSQLiteAdapter(config);
  }
  
  const { createPostgreSQLAdapter } = await import("./adapters/postgresql.js");
  return createPostgreSQLAdapter(config);
}

export async function createAdapters(config: { database: DatabaseConfig }): Promise<{
  database: DatabaseAdapter;
  storage: null;
  cache: null;
  queue: null;
}> {
  const database = await createDatabaseAdapter(config.database);
  await database.initialize(config.database);
  
  return { database, storage: null, cache: null, queue: null };
}

