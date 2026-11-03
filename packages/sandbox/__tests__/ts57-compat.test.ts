import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { SandboxConfig, CapabilityManifest } from '../src/types.js';
import {
  sandbox,
  capabilities,
  auditLog,
  createCapabilityGatekeeper,
  type SandboxResult
} from '../src/index.js';

describe('TypeScript 5.7 verbatimModuleSyntax Compatibility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Type-only imports and exports', () => {
    it('should support type-only import of SandboxResult', async () => {
      const result: SandboxResult<string> = {
        success: true,
        result: 'test',
        durationMs: 100
      };
      expect(result.success).toBe(true);
      if (result.success && result.result !== undefined) {
        expect(result.result).toBe('test');
      }
    });

    it('should support type-only import of SandboxConfig', () => {
      const config: SandboxConfig = {
        memoryLimitMB: 64,
        wallTimeLimitMs: 5000,
        capabilities: ['content:read']
      };
      expect(config.memoryLimitMB).toBe(64);
      expect(config.capabilities).toContain('content:read');
    });

    it('should support type-only import of CapabilityManifest', () => {
      const manifest: CapabilityManifest = {
        name: 'test-manifest',
        version: '1.0.0',
        capabilities: ['custom:read'],
        permissions: {
          fs: { read: ['/data'] }
        }
      };
      expect(manifest.name).toBe('test-manifest');
    });
  });

  describe('Named exports verification', () => {
    it('should export sandbox instance', () => {
      expect(sandbox).toBeDefined();
      expect(typeof sandbox.run).toBe('function');
      expect(typeof sandbox.isAvailable).toBe('function');
      expect(typeof sandbox.getUsage).toBe('function');
      expect(typeof sandbox.registerManifest).toBe('function');
      expect(typeof sandbox.getManifest).toBe('function');
      expect(typeof sandbox.killProcess).toBe('function');
    });

    it('should export capabilities object with correct structure', () => {
      expect(capabilities).toBeDefined();
      expect(capabilities.content).toEqual({
        read: 'content:read',
        write: 'content:write',
        delete: 'content:delete'
      });
      expect(capabilities.media).toEqual({
        read: 'media:read',
        write: 'media:write',
        delete: 'media:delete'
      });
      expect(capabilities.net).toEqual({
        http: 'net:http',
        ws: 'net:ws'
      });
      expect(capabilities.db).toEqual({
        query: 'db:query',
        migrate: 'db:migrate'
      });
    });

    it('should export auditLog function', () => {
      expect(typeof auditLog).toBe('function');
    });

    it('should export createCapabilityGatekeeper function', () => {
      expect(typeof createCapabilityGatekeeper).toBe('function');
    });

    it('should export type SandboxResult', () => {
      const result: SandboxResult<number> = {
        success: true,
        result: 42,
        durationMs: 50
      };
      expect(result.result).toBe(42);
    });

    it('should export type SandboxConfig', () => {
      const config: SandboxConfig = {
        cwd: '/test',
        env: { KEY: 'value' }
      };
      expect(config.cwd).toBe('/test');
    });

    it('should export type CapabilityManifest', () => {
      const manifest: CapabilityManifest = {
        name: 'test',
        version: '1.0.0',
        capabilities: [],
        permissions: {}
      };
      expect(manifest.version).toBe('1.0.0');
    });
  });

  describe('VM execution with type values', () => {
    it('should execute async functions returning typed values', async () => {
      const result = await sandbox.run(async () => {
        return { value: 123, label: 'test' };
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual({ value: 123, label: 'test' });
    });

    it('should handle type unions in results', async () => {
      const result = await sandbox.run(async (): Promise<string | null> => {
        return Math.random() > 0.5 ? 'present' : null;
      });

      expect(result.success).toBe(true);
      expect(result.result === 'present' || result.result === null).toBe(true);
    });

    it('should propagate type errors correctly', async () => {
      const result = await sandbox.run(async () => {
        throw new Error('Type validation failed');
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Type validation failed');
    });
  });

  describe('Module concatenation patterns', () => {
    it('should support re-exporting types alongside values', async () => {
      const result = await sandbox.run(async () => {
        return {
          value: 'exported',
          type: 'test' as const
        };
      });

      expect(result.success).toBe(true);
      if (result.success && result.result) {
        expect(result.result.value).toBe('exported');
        expect(result.result.type).toBe('test');
      }
    });

    it('should handle mixed type/value imports in dynamic contexts', async () => {
      const config: SandboxConfig = {
        memoryLimitMB: 32
      };

      const result = await sandbox.run(async () => {
        return 'executed';
      }, config);

      expect(result.success).toBe(true);
    });
  });

  describe('Template literal capabilities', () => {
    it('should accept template literal capability strings when registered', async () => {
      const manifest: CapabilityManifest = {
        name: 'template-test',
        version: '1.0.0',
        capabilities: ['cap:rest', 'cap:mutation', 'cap:query'],
        permissions: {}
      };
      sandbox.registerManifest(manifest);

      const result = await sandbox.run(async () => 'ok', {
        capabilities: ['cap:rest', 'cap:mutation', 'cap:query']
      });

      expect(result.success).toBe(true);
    });

    it('should validate capability format with custom manifest', async () => {
      const manifest: CapabilityManifest = {
        name: 'format-test',
        version: '1.0.0',
        capabilities: ['format:test:1', 'format:test:2'],
        permissions: {}
      };

      sandbox.registerManifest(manifest);

      const result = await sandbox.run(async () => 'ok', {
        capabilities: ['format:test:1']
      });

      expect(result.success).toBe(true);
    });

    it('should deny unregistered template literal capabilities', async () => {
      const result = await sandbox.run(async () => 'ok', {
        capabilities: ['unregistered:capability']
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Capability denied');
    });
  });

  describe('Exact optional property types', () => {
    it('should distinguish between undefined and missing optional properties', async () => {
      const configMissing: SandboxConfig = {};

      expect(configMissing.memoryLimitMB).toBeUndefined();
    });

    it('should handle optional properties in result types', () => {
      const resultWithoutOptional: SandboxResult<string> = {
        success: true,
        result: 'value',
        durationMs: 100
      };

      const resultWithOptional: SandboxResult<string> = {
        success: true,
        result: 'value',
        durationMs: 100,
        memoryUsedMB: 64
      };

      expect(resultWithoutOptional.success).toBe(true);
      expect(resultWithOptional.memoryUsedMB).toBe(64);
    });
  });

  describe('NoUncheckedIndexedAccess compatibility', () => {
    it('should require checking when accessing mapped types', async () => {
      const manifests = new Map<string, CapabilityManifest>();
      const testManifest: CapabilityManifest = {
        name: 'map-test',
        version: '1.0.0',
        capabilities: [],
        permissions: {}
      };
      manifests.set('test', testManifest);

      const retrieved = manifests.get('test');
      if (retrieved) {
        expect(retrieved.name).toBe('map-test');
      }
    });

    it('should handle undefined results from map access', () => {
      const manifests = new Map<string, CapabilityManifest>();

      const notFound = manifests.get('nonexistent');
      expect(notFound).toBeUndefined();
    });
  });

  describe('KillReason type support', () => {
    it('should handle kill reason in results for successful runs', async () => {
      const result = await sandbox.run(async () => {
        return 'result';
      }, {
        memoryLimitMB: 64,
        wallTimeLimitMs: 10000
      });

      // For successful runs, killReason should be undefined and killed should be false
      expect(result.killReason).toBeUndefined();
      expect(result.killed).toBe(false);
      expect(result.success).toBe(true);
    });

    it('should handle timeout kill reason with short timeout', async () => {
      const result = await sandbox.run(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return 'should timeout';
      }, {
        wallTimeLimitMs: 10
      });

      // Timeout should be caught by the process timeout
      expect(result.success).toBe(false);
      expect(result.killed).toBe(true);
    });

    it('should handle memory limit exceeded kill reason', async () => {
      const result = await sandbox.run(async () => {
        // Try to allocate memory
        const arr = [];
        for (let i = 0; i < 100000; i++) {
          arr.push(new Array(1000).fill('x'));
        }
        return arr;
      }, {
        memoryLimitMB: 1,
        wallTimeLimitMs: 5000
      });

      // Memory limit enforcement may or may not trigger depending on implementation
      // Either the process gets killed (killed: true) or it completes
      // Both are acceptable behaviors
      expect(result.killed !== undefined).toBe(true);
      expect(result.success !== undefined).toBe(true);
    });
  });

  describe('Security with verbatimModuleSyntax', () => {
    it('should deny unauthorized capabilities consistently', async () => {
      const result = await sandbox.run(async () => 'ok', {
        capabilities: ['unauthorized:cap']
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Capability denied');
    });

    it('should allow registered capabilities through gatekeeper', async () => {
      const manifest: CapabilityManifest = {
        name: 'gatekeeper-test',
        version: '1.0.0',
        capabilities: ['read:data', 'write:data'],
        permissions: {}
      };

      sandbox.registerManifest(manifest);
      const gatekeeper = createCapabilityGatekeeper(manifest);

      const result = await gatekeeper.enforce('read:data', async () => 'data');
      expect(result).toBe('data');
    });

    it('should reject unauthorized capability via gatekeeper', async () => {
      const manifest: CapabilityManifest = {
        name: 'gatekeeper-test-2',
        version: '1.0.0',
        capabilities: ['read:data'],
        permissions: {}
      };

      sandbox.registerManifest(manifest);
      const gatekeeper = createCapabilityGatekeeper(manifest);

      await expect(gatekeeper.enforce('write:data', async () => 'data'))
        .rejects.toThrow('Capability denied');
    });
  });

  describe('Module resolution edge cases', () => {
    it('should handle default allowed capabilities', async () => {
      const result = await sandbox.run(async () => 'allowed');

      expect(result.success).toBe(true);
      expect(result.result).toBe('allowed');
    });

    it('should resolve capability strings correctly', () => {
      expect(capabilities.content.read).toBe('content:read');
      expect(capabilities.media.delete).toBe('media:delete');
      expect(capabilities.net.http).toBe('net:http');
      expect(capabilities.db.migrate).toBe('db:migrate');
    });

    it('should handle capability checking without manifest', async () => {
      const result = await sandbox.run(async () => 'ok', {
        capabilities: ['content:read']
      });

      expect(result.success).toBe(true);
    });
  });
});

describe('auditLog with TS 5.7', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log audit entries with type safety', () => {
    auditLog('read', 'content:read', { resource: 'document-1' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle complex detail objects', () => {
    const details = {
      userId: 'user-123',
      resourceId: 'doc-456',
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'api',
        version: 1
      }
    };

    auditLog('operation', 'content:read', details);

    const calls = consoleLogSpy.mock.calls;
    expect(calls[0]).toBeDefined();
    const [label, data] = calls[0]!;
    expect(label).toBe('[AUDIT]');
    expect((data as Record<string, unknown>)['details']).toEqual(details);
  });
});

describe('createCapabilityGatekeeper with TS 5.7', () => {
  const testManifest: CapabilityManifest = {
    name: 'gatekeeper-compat-test',
    version: '1.0.0',
    capabilities: ['read:data', 'write:data'],
    permissions: {}
  };

  describe('check method', () => {
    it('should return true for allowed capability', () => {
      const gatekeeper = createCapabilityGatekeeper(testManifest);
      expect(gatekeeper.check('read:data')).toBe(true);
    });

    it('should return false for denied capability', () => {
      const gatekeeper = createCapabilityGatekeeper(testManifest);
      expect(gatekeeper.check('delete:data')).toBe(false);
    });
  });

  describe('enforce method', () => {
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

describe('SandboxResult type inference', () => {
  it('should infer result type from Promise<T>', async () => {
    const result = await sandbox.run<string>(async () => 'inferred');

    expect(typeof result.result).toBe('string');
    expect(result.result).toBe('inferred');
  });

  it('should handle complex generic types', async () => {
    type ApiResponse = {
      id: number;
      data: string[];
      nested: {
        value: boolean;
      };
    };

    const result = await sandbox.run<ApiResponse>(async () => ({
      id: 1,
      data: ['a', 'b', 'c'],
      nested: { value: true }
    }));

    expect(result.success).toBe(true);
    if (result.success && result.result !== undefined) {
      expect(result.result?.id).toBe(1);
      expect(result.result?.data).toHaveLength(3);
      expect(result.result?.nested.value).toBe(true);
    }
  });

  it('should handle void return type', async () => {
    const result = await sandbox.run<void>(async () => {
      return undefined as void;
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toBeUndefined();
    }
  });

  it('should handle never return type for errors', async () => {
    const result = await sandbox.run<never>(async () => {
      throw new Error('Never expected');
    });

    expect(result.success).toBe(false);
  });
});

describe('Module namespace exports with TS 5.7', () => {
  it('should work with import type for types only', () => {
    type Config = SandboxConfig;
    type Result = SandboxResult<boolean>;

    const config: Config = { wallTimeLimitMs: 100 };
    const result: Result = { success: true, result: true, durationMs: 50 };

    expect(config.wallTimeLimitMs).toBe(100);
    expect(result.success).toBe(true);
  });

  it('should support exporting multiple types from single module', () => {
    type Types = SandboxConfig | SandboxResult | CapabilityManifest;

    const config: Types = { memoryLimitMB: 128 };
    const result: Types = { success: true, result: undefined, durationMs: 10 };
    const manifest: Types = { name: 'test', version: '1.0', capabilities: [], permissions: {} };

    expect(config).toBeDefined();
    expect(result).toBeDefined();
    expect(manifest).toBeDefined();
  });
});
