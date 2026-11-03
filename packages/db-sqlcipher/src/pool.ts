/**
 * @module @sard-cms/db-sqlcipher/pool
 * Worker thread pool for SQLCipher WASM - non-blocking async queue
 */

import { Worker, isMainThread } from 'node:worker_threads';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { SQLCipherConfig, SQLCipherWorkerMessage, SQLCipherWorkerResponse, DatabaseAdapter, Transaction } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PoolWorker {
  worker: Worker;
  busy: boolean;
  queue: Array<{ msg: SQLCipherWorkerMessage; resolve: (v: SQLCipherWorkerResponse) => void; reject: (e: Error) => void }>;
}

export class SQLCipherPool implements DatabaseAdapter {
  private workers: PoolWorker[] = [];
  private config: SQLCipherConfig | null = null;
  private nextWorker = 0;
  private closed = false;

  async initialize(config: SQLCipherConfig): Promise<void> {
    if (this.config) throw new Error('Pool already initialized');
    this.config = config;
    
    const poolSize = config.poolSize ?? 1;
    const workerPath = join(__dirname, 'worker.js');
    
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerPath, {
        workerData: { databasePath: config.databasePath, encryptionKey: config.encryptionKey },
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=128' }
      });
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Worker init timeout')), 10000);
        worker.once('message', (msg) => {
          if (msg?.type === 'ready') {
            clearTimeout(timeout);
            resolve();
          }
        });
        worker.once('error', (err) => { clearTimeout(timeout); reject(err); });
      });
      
      this.workers.push({
        worker,
        busy: false,
        queue: []
      });
      
      worker.on('message', (response: SQLCipherWorkerResponse) => {
        const w = this.workers.find(w => w.worker === worker);
        if (w && w.queue.length > 0) {
          const { resolve } = w.queue.shift()!;
          w.busy = w.queue.length > 0;
          resolve(response);
        }
      });
      
      worker.on('error', (err) => {
        const w = this.workers.find(w => w.worker === worker);
        if (w) {
          for (const item of w.queue) {
            item.reject(err);
          }
          w.queue = [];
          w.busy = false;
        }
      });
    }
  }

  private acquire(): PoolWorker {
    if (this.closed) throw new Error('Pool closed');
    if (this.workers.length === 0) throw new Error('Pool not initialized');

    let attempts = 0;
    while (attempts < this.workers.length) {
      const idx = this.nextWorker++ % this.workers.length;
      const w = this.workers[idx];
      if (w && (!w.busy || (this.config?.queueMaxSize ?? 100) > w.queue.length)) {
        return w;
      }
      attempts++;
    }
    return this.workers.reduce((a, b) => a.queue.length < b.queue.length ? a : b);
  }

  private send(msg: SQLCipherWorkerMessage): Promise<SQLCipherWorkerResponse> {
    const w = this.acquire();
    return new Promise((resolve, reject) => {
      w.queue.push({ msg, resolve, reject });
      w.busy = true;
      w.worker.postMessage(msg);
    });
  }

  async exec(sql: string, params: unknown[] = []): Promise<{ rows: unknown[][]; rowCount: number }> {
    const response = await this.send({ id: randomUUID(), type: 'exec', sql, params });
    if (!response.success) throw new Error(response.error);
    return { rows: response.rows ?? [], rowCount: response.rowCount ?? 0 };
  }

  async query(sql: string, params: unknown[] = []): Promise<{ rows: unknown[][]; rowCount: number }> {
    return this.exec(sql, params);
  }

  async transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    // For now, serialize transactions on first worker
    const w = this.workers[0];
    const statements: { sql: string; params: unknown[] }[] = [];
    
    const tx: Transaction = {
      exec: async (sql: string, params: unknown[] = []) => {
        statements.push({ sql, params });
        return { rows: [], rowCount: 0, changes: 0 };
      },
      query: async (sql: string, params: unknown[] = []) => {
        statements.push({ sql, params });
        return { rows: [], rowCount: 0 };
      }
    };
    
    const result = await fn(tx);
    
    // Execute all statements in a single transaction
    const response = await this.send({
      id: randomUUID(),
      type: 'transaction',
      statements
    });
    
    if (!response.success) throw new Error(response.error);
    return result;
  }

  async close(): Promise<void> {
    this.closed = true;
    for (const w of this.workers) {
      w.worker.postMessage({ id: randomUUID(), type: 'close' });
      await new Promise(resolve => setTimeout(resolve, 100));
      w.worker.terminate();
    }
    this.workers = [];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.send({ id: randomUUID(), type: 'health' });
      return response.success;
    } catch {
      return false;
    }
  }
}

export function createSQLCipherPool(config: SQLCipherConfig): SQLCipherPool {
  return new SQLCipherPool();
}

