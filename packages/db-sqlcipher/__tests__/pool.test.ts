/**
 * @module @sard-cms/db-sqlcipher/__tests__/pool.test
 * TDD tests for SQLCipher worker pool
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createSQLCipherPool, type SQLCipherConfig } from '../src/pool.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_DB = join(__dirname, '..', '..', 'test-sqlcipher.db');
const TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('SQLCipherPool', () => {
  let pool: ReturnType<typeof createSQLCipherPool>;
  const config: SQLCipherConfig = {
    databasePath: TEST_DB,
    encryptionKey: TEST_KEY,
    poolSize: 1,
    queueMaxSize: 10
  };
  
  beforeAll(async () => {
    // Clean up any existing test DB
    const fs = await import('node:fs');
    for (const ext of ['', '-wal', '-shm']) {
      try { fs.unlinkSync(TEST_DB + ext); } catch {}
    }
    
    pool = createSQLCipherPool(config);
    await pool.initialize(config);
  });
  
  afterAll(async () => {
    if (pool) await pool.close();
    const fs = await import('node:fs');
    for (const ext of ['', '-wal', '-shm']) {
      try { fs.unlinkSync(TEST_DB + ext); } catch {}
    }
  });
  
  it('should initialize and health check', async () => {
    const healthy = await pool.healthCheck();
    expect(healthy).toBe(true);
  });
  
  it('should create table and insert', async () => {
    await pool.exec('CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT, value INTEGER)');
    const result = await pool.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', ['test', 42]);
    expect(result.rowCount).toBe(1);
  });
  
  it('should query data', async () => {
    const result = await pool.query('SELECT * FROM test_table WHERE name = ?', ['test']);
    expect(result.rowCount).toBe(1);
    expect(result.rows[0][1]).toBe('test');
    expect(result.rows[0][2]).toBe(42);
  });
  
  it('should handle concurrent queries', async () => {
    const promises = Array(10).fill(null).map((_, i) => 
      pool.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', [`concurrent-${i}`, i])
    );
    const results = await Promise.all(promises);
    expect(results.every(r => r.rowCount === 1)).toBe(true);
    
    const count = await pool.query('SELECT COUNT(*) as c FROM test_table');
    expect(Number(count.rows[0][0])).toBe(11); // 1 + 10
  });
  
  it('should handle transaction', async () => {
    const result = await pool.transaction(async (tx) => {
      await tx.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', ['tx1', 100]);
      await tx.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', ['tx2', 200]);
      return 'done';
    });
    expect(result).toBe('done');
    
    const count = await pool.query('SELECT COUNT(*) as c FROM test_table WHERE name LIKE "tx%"');
    expect(Number(count.rows[0][0])).toBe(2);
  });
  
  it('should rollback transaction on error', async () => {
    await expect(pool.transaction(async (tx) => {
      await tx.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', ['rollback1', 300]);
      throw new Error('intentional rollback');
    })).rejects.toThrow('intentional rollback');
    
    const count = await pool.query('SELECT COUNT(*) as c FROM test_table WHERE name = "rollback1"');
    expect(Number(count.rows[0][0])).toBe(0);
  });
  
  it('should produce encrypted file unreadable without key', async () => {
    const fs = await import('node:fs');
    const content = fs.readFileSync(TEST_DB);
    // SQLCipher-encrypted file should not contain plaintext table names
    const str = content.toString('utf8', 0, Math.min(1000, content.length));
    expect(str).not.toContain('test_table');
    expect(str).not.toContain('CREATE TABLE');
  });
});

