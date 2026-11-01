/**
 * Drizzle migration runner — executes pending migrations from src/migrations.
 */
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createSardDb, closeDb } from "./client.js";

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/sard";

async function main(): Promise<void> {
  const db = createSardDb({ connectionString });
  // eslint-disable-next-line no-console
  console.log("[sard:db] Applying migrations...");
  await migrate(db, { migrationsFolder: "./src/migrations" });
  // eslint-disable-next-line no-console
  console.log("[sard:db] Migrations complete.");
  await closeDb();
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error("[sard:db] Migration failed:", err);
  process.exit(1);
});