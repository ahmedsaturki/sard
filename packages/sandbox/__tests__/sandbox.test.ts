import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { SandboxConfig, CapabilityManifest } from '../src/types.js';
import {
  sandbox,
  capabilities,
  auditLog,
  createCapabilityGatekeeper,
  type SandboxResult
} from '../src/index.js';

describe('sandbox', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true in Node.js environment', () => {
      expect(sandbox.isAvailable()).toBe(true);
    });
  });

  describe('getUsage', () => {
    it('should return memory usage info', () => {
      const usage = sandbox.getUsage();
      expect(usage).not.toBeNull();
      if (usage) {
        expect(usage.memoryMB).toBeGreaterThan(0);
        expect(usage.cpuPercent).toBeDefined();
      }
    });
  });

  describe('run', () => {
    it('should execute a simple async function', async () => {
      const result = await sandbox.run(async () => {
        return 'hello world';
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('hello world');
    });

    it('should capture errors from async function', async () => {
      const result = await sandbox.run(async () => {
        throw new Error('test error');
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('test error');
    });

    it('should deny capabilities not in allowlist', async () => {
      const result = await sandbox.run(async () => {
        return 'success';
      }, { capabilities: ['unauthorized:cap'] });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Capability denied');
    });

    it('should allow capabilities in default allowlist', async () => {
      const result = await sandbox.run(async () => {
        return 'allowed';
      }, { capabilities: ['content:read'] });

      expect(result.success).toBe(true);
      expect(result.result).toBe('allowed');
    });

    it('should respect memory limit config', async () => {
      const result = await sandbox.run(async () => {
        return 'test';
      }, { memoryLimitMB: 64 });

      expect(result.success).toBe(true);
    });

    it('should respect wall time limit config', async () => {
      const result = await sandbox.run(async () => {
        let sum = 0;
        for (let i = 0; i < 10000; i++) {
          sum += i;
        }
        return sum;
      }, { wallTimeLimitMs: 5000 });

      expect(result.success).toBe(true);
    });
  });

  describe('registerManifest', () => {
    it('should register a capability manifest', () => {
      const manifest: CapabilityManifest = {
        name: 'test-manifest',
        version: '1.0.0',
        capabilities: ['custom:cap'],
        permissions: {
          fs: { read: ['/data'] }
        }
      };

      sandbox.registerManifest(manifest);
      expect(sandbox.getManifest('test-manifest')).toEqual(manifest);
    });

    it('should allow registered capabilities', async () => {
      const manifest: CapabilityManifest = {
        name: 'custom-manifest',
        version: '1.0.0',
        capabilities: ['custom:operation'],
        permissions: {}
      };

      sandbox.registerManifest(manifest);
      const result = await sandbox.run(async () => 'ok', { capabilities: ['custom:operation'] });

      expect(result.success).toBe(true);
    });
  });

  describe('capabilities constants', () => {
    it('should have content capabilities defined', () => {
      expect(capabilities.content.read).toBe('content:read');
      expect(capabilities.content.write).toBe('content:write');
      expect(capabilities.content.delete).toBe('content:delete');
    });

    it('should have media capabilities defined', () => {
      expect(capabilities.media.read).toBe('media:read');
      expect(capabilities.media.write).toBe('media:write');
      expect(capabilities.media.delete).toBe('media:delete');
    });

    it('should have network capabilities defined', () => {
      expect(capabilities.net.http).toBe('net:http');
      expect(capabilities.net.ws).toBe('net:ws');
    });

    it('should have db capabilities defined', () => {
      expect(capabilities.db.query).toBe('db:query');
      expect(capabilities.db.migrate).toBe('db:migrate');
    });
  });
});

describe('auditLog', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log audit entries', () => {
    auditLog('test-action', 'test-cap', { foo: 'bar' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const calls = consoleLogSpy.mock.calls;
    expect(calls[0]).toBeDefined();
    const [label, data] = calls[0]!;
    expect(label).toBe('[AUDIT]');
    expect((data as Record<string, unknown>)['action']).toBe('test-action');
    expect((data as Record<string, unknown>)['capability']).toBe('test-cap');
    expect((data as Record<string, unknown>)['details']).toEqual({ foo: 'bar' });
    expect((data as Record<string, unknown>)['timestamp']).toBeDefined();
  });
});

describe('createCapabilityGatekeeper', () => {
  const testManifest: CapabilityManifest = {
    name: 'gatekeeper-test',
    version: '1.0.0',
    capabilities: ['read:data', 'write:data'],
    permissions: {}
  };

  describe('check', () => {
    it('should return true for allowed capability', () => {
      const gatekeeper = createCapabilityGatekeeper(testManifest);
      expect(gatekeeper.check('read:data')).toBe(true);
    });

    it('should return false for denied capability', () => {
      const gatekeeper = createCapabilityGatekeeper(testManifest);
      expect(gatekeeper.check('delete:data')).toBe(false);
    });
  });

  describe('enforce', () => {
    it('should execute function for allowed capability', async () => {
      const gatekeeper = createCapabilityGatekeeper(testManifest);
      const result = await gatekeeper.enforce('read:data', async () => 'result');
      expect(result).toBe('result');
    });

    it('should throw error for denied capability', async () => {
      const gatekeeper = createCapabilityGatekeeper(testManifest);
      await expect(gatekeeper.enforce('unauthorized', async () => 'result'))
        .rejects.toThrow('Capability denied');
    });
  });
});

describe('SandboxResult type', () => {
  it('should be properly inferrable', async () => {
    const result: SandboxResult<string> = {
      success: true,
      result: 'test',
      durationMs: 100
    };
    expect(result.success).toBe(true);
    expect(result.result).toBe('test');
  });
});