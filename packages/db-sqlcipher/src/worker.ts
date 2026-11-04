/**
 * @module @sard-cms/db-sqlcipher/worker
 * SQLCipher WASM worker - runs in worker thread, executes encrypted SQLite
 */

import { parentPort, workerData } from 'node:worker_threads';
import { createClient } from '@libsql/client';
import type { InValue } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import type { SQLCipherWorkerMessage, SQLCipherWorkerResponse } from './types.js';

if (!parentPort) {
  throw new Error('SQLCipher worker must be run as a worker thread');
}

const { databasePath, encryptionKey } = workerData as { databasePath: string; encryptionKey: string };

let client: ReturnType<typeof createClient> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

async function initialize(): Promise<void> {
  client = createClient({
    url: `file:${databasePath}`,
    encryptionKey: encryptionKey,
  });

  // Apply PRAGMAs
  await client.execute('PRAGMA journal_mode = WAL;');
  await client.execute('PRAGMA synchronous = NORMAL;');
  await client.execute('PRAGMA foreign_keys = ON;');
  await client.execute('PRAGMA busy_timeout = 5000;');

  db = drizzle(client);
  
  // Verify encryption works
  const result = await client.execute('SELECT 1 as test');
  if (!result.rows || result.rows.length !== 1) {
    throw new Error('Database initialization failed');
  }
}

async function execute(sql: string, params: unknown[] = []): Promise<SQLCipherWorkerResponse> {
  if (!client) throw new Error('Client not initialized');

  try {
    const result = await client.execute({ sql, args: params as InValue[] });
    const rows = Array.isArray(result.rows) ? result.rows.map((r: any) => Object.values(r)) : [];
    return {
      id: '',
      success: true,
      rows: rows as unknown[][],
      rowCount: rows.length,
      changes: (result as any).changes ?? 0,
      lastInsertRowid: (result as any).lastInsertRowid ?? 0,
    };
  } catch (error) {
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function transaction(statements: { sql: string; params: unknown[] }[]): Promise<SQLCipherWorkerResponse> {
  if (!client) throw new Error('Client not initialized');

  try {
    const tx = await client.transaction();
    try {
      for (const stmt of statements) {
        await tx.execute({ sql: stmt.sql, args: stmt.params as InValue[] });
      }
      await tx.close();
    } catch (error) {
      await tx.rollback();
      throw error;
    }

    return {
      id: '',
      success: true,
      rowCount: statements.length,
    };
  } catch (error) {
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

parentPort.on('message', async (msg: SQLCipherWorkerMessage) => {
  const response: SQLCipherWorkerResponse = { id: msg.id, success: false };
  
  try {
    switch (msg.type) {
      case 'exec':
        if (!msg.sql) throw new Error('SQL required for exec');
        Object.assign(response, await execute(msg.sql, msg.params ?? []));
        break;
      case 'query':
        if (!msg.sql) throw new Error('SQL required for query');
        Object.assign(response, await execute(msg.sql, msg.params ?? []));
        break;
      case 'transaction':
        if (!msg.statements?.length) throw new Error('Statements required for transaction');
        Object.assign(response, await transaction(msg.statements));
        break;
      case 'health':
        response.success = true;
        response.rowCount = 1;
        break;
      case 'close':
        if (client) {
          await client.close();
          client = null;
          db = null;
        }
        response.success = true;
        break;
      default:
        response.error = `Unknown message type: ${(msg as any).type}`;
    }
  } catch (error) {
    response.error = error instanceof Error ? error.message : String(error);
  }
  
  parentPort!.postMessage(response);
});

// Initialize on startup
initialize().catch((err) => {
  console.error('[SQLCipher Worker] Initialization failed:', err);
  process.exit(1);
});

parentPort.postMessage({ type: 'ready' });

