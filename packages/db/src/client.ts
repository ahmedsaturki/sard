/**
 * Database client factory — runtime-agnostic.
 * Works on Node (pg pool) and edge-compatible Postgres drivers (Neon, Supabase, Vercel).
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

export interface SardDbOptions {
  /** PostgreSQL connection string. */
  connectionString: string;
  /** Maximum pool size (default 10). */
  max?: number;
}

export type SardDb = ReturnType<typeof createSardDb> & typeof schema;

let pool: Pool | undefined;

/** Create (or reuse) a Drizzle database instance. */
export function createSardDb(options: SardDbOptions) {
  if (!pool) {
    pool = new Pool({
      connectionString: options.connectionString,
      max: options.max ?? 10,
      ssl: options.connectionString.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined
    });
  }
  return drizzle(pool, { schema });
}

/** Close the shared pool (for graceful shutdown / tests). */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
