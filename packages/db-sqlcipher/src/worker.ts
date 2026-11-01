/**
 * @module @sard/db-sqlcipher/worker
 * SQLCipher WASM worker - runs in worker thread, executes encrypted SQLite
 */

import { parentPort, workerData } from 'node:worker_threads';
import { createClient, type InArgs, type Row, type TransactionMode } from '@libsql/client';
import type { SQLCipherWorkerMessage, SQLCipherWorkerResponse } from './types.js';

if (!parentPort) {
  throw new Error('SQLCipher worker must be run as a worker thread');
}

const { databasePath, encryptionKey } = workerData as { databasePath: string; encryptionKey: string };

let client: ReturnType<typeof createClient> | null = null;

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

  // Verify encryption works
  const result = await client.execute('SELECT 1 as test');
  if (!result.rows || result.rows.length !== 1) {
    throw new Error('Database initialization failed');
  }
}

async function execute(sql: string, params: InArgs = []): Promise<SQLCipherWorkerResponse> {
  if (!client) throw new Error('Client not initialized');

  try {
    const result = await client.execute({ sql, args: params });
    return {
      id: '',
      success: true,
      rows: result.rows.map((row: Row) => Object.values(row)),
      rowCount: result.rows.length,
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

async function transaction(statements: { sql: string; params: unknown[] }[], msgId: string): Promise<SQLCipherWorkerResponse> {
  if (!client) throw new Error('Client not initialized');

  try {
    const transactionResult = await client.transaction('write');
    const txn = transactionResult as any;
    
    let lastInsertRowid: bigint | undefined;
    let changes = 0;
    
    for (const stmt of statements) {
      const stmtResult = await txn.execute({ sql: stmt.sql, args: stmt.params ?? [] });
      if (stmtResult.rowsAffected > 0) {
        changes += stmtResult.rowsAffected;
        if (stmtResult.lastInsertRowid !== undefined) {
          lastInsertRowid = stmtResult.lastInsertRowid;
        }
      }
    }

    await txn.commit();

    return {
      id: msgId,
      success: true,
      rowCount: statements.length,
      changes,
      lastInsertRowid: lastInsertRowid !== undefined ? Number(lastInsertRowid) : 0,
    };
  } catch (error) {
    return {
      id: msgId,
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
        Object.assign(response, await execute(msg.sql, msg.params as InArgs));
        break;
      case 'query':
        if (!msg.sql) throw new Error('SQL required for query');
        Object.assign(response, await execute(msg.sql, msg.params as InArgs));
        break;
      case 'transaction':
        if (!msg.statements?.length) throw new Error('Statements required for transaction');
        Object.assign(response, await transaction(msg.statements, msg.id));
        break;
      case 'health':
        response.success = true;
        response.rowCount = 1;
        break;
      case 'close':
        if (client) {
          await client.close();
          client = null;
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
