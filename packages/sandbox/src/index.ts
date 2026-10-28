/**
 * @module @sard/sandbox
 * Process isolation wrapper for untrusted code execution
 *
 * ADR-013 L1: Process isolation first (AC-05).
 * Uses child_process with resource limits for production.
 * Memory enforced via --max-old-space-size + RSS monitoring (pidusage).
 * Wall-clock enforced via spawn timeout.
 */

import { spawn } from 'node:child_process';
import pidusage from 'pidusage';
import type { Sandbox, SandboxConfig, SandboxResult, CapabilityManifest } from './types.js';

class ProcessSandbox implements Sandbox {
  private manifests = new Map<string, CapabilityManifest>();
  private activeProcesses = new Map<string, ReturnType<typeof spawn>>();

  isAvailable(): boolean {
    return typeof process !== 'undefined' && typeof spawn === 'function';
  }

  getUsage(): { memoryMB: number; cpuPercent: number } | null {
    const usage = process.memoryUsage();
    return {
      memoryMB: Math.round(usage.heapUsed / 1024 / 1024),
      cpuPercent: 0
    };
  }

  registerManifest(manifest: CapabilityManifest): void {
    this.manifests.set(manifest.name, manifest);
  }

  getManifest(name: string): CapabilityManifest | undefined {
    return this.manifests.get(name);
  }

  async run<T>(fn: () => Promise<T>, config: SandboxConfig = {}): Promise<SandboxResult<T>> {
    const start = Date.now();

    if (config.capabilities) {
      for (const cap of config.capabilities) {
        if (!this.hasCapability(cap)) {
          return {
            success: false,
            error: `Capability denied: ${cap}`,
            durationMs: Date.now() - start,
            exitCode: undefined
          };
        }
      }
    }

    if (!this.isAvailable()) {
      try {
        const result = await fn();
        return {
          success: true,
          result,
          durationMs: Date.now() - start,
          exitCode: undefined
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
          exitCode: undefined
        };
      }
    }

    return this.runInChildProcess(fn, config, Date.now());
  }

  private hasCapability(cap: string): boolean {
    const defaultAllowed = ['content:read', 'content:write', 'media:read'];
    return defaultAllowed.includes(cap) ||
           Array.from(this.manifests.values()).some(m => m.capabilities.includes(cap));
  }

  private async runInChildProcess<T>(
    fn: () => Promise<T>,
    config: SandboxConfig,
    start: number
  ): Promise<SandboxResult<T>> {
    const script = `
      const fn = ${fn.toString()};
      fn().then(r => console.log(JSON.stringify({ success: true, result: r })))
          .catch(e => console.log(JSON.stringify({ success: false, error: e.message })));
    `;

    return new Promise((resolve) => {
      const memoryLimitMB = config.memoryLimitMB ?? 128;
      const child = spawn(process.execPath, [`--max-old-space-size=${memoryLimitMB}`, '-e', script], {
        cwd: config.cwd ?? process.cwd(),
        env: { ...process.env, ...config.env },
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: config.wallTimeLimitMs ?? 5000
      });

      let stdout = '';
      let stderr = '';
      let killedBy = '';
      let monitor: NodeJS.Timeout | null = null;
      let timeoutKilled = false;

      child.stdout?.on('data', (d) => { stdout += d.toString(); });
      child.stderr?.on('data', (d) => { stderr += d.toString(); });

      if (config.memoryLimitMB) {
        monitor = setInterval(() => {
          if (!child.pid) return;
          pidusage(child.pid).then((stat) => {
            const usedMB = stat.memory / (1024 * 1024);
            if (usedMB > memoryLimitMB) {
              killedBy = 'memory';
              child.kill('SIGKILL');
            }
          }).catch(() => {});
        }, 50);
      }

      child.on('close', (code, signal) => {
        if (monitor) clearInterval(monitor);
        const timedOut = signal === 'SIGTERM' && !killedBy;
        if (signal === 'SIGTERM') timeoutKilled = true;
        if (signal === 'SIGKILL' && !killedBy) killedBy = 'memory';
        if (timeoutKilled && !killedBy) killedBy = 'timeout';

        try {
          const lastLine = stdout.trim().split('\n').pop() ?? '{}';
          const parsed = JSON.parse(lastLine);
          resolve({
            ...parsed,
            durationMs: Date.now() - start,
            exitCode: code ?? undefined,
            killed: signal !== null || !!killedBy || timeoutKilled,
            killReason: (killedBy || (timeoutKilled ? 'timeout' : signal)) ?? undefined
          });
        } catch {
          resolve({
            success: false,
            error: 'Failed to parse child output',
            stdout,
            stderr,
            durationMs: Date.now() - start,
            exitCode: code ?? undefined,
            killed: signal !== null || !!killedBy || timeoutKilled,
            killReason: (killedBy || (timeoutKilled ? 'timeout' : signal)) ?? undefined
          });
        }
      });

      child.on('error', (err) => {
        if (monitor) clearInterval(monitor);
        resolve({
          success: false,
          error: err.message,
          durationMs: Date.now() - start,
          exitCode: undefined
        });
      });
    });
  }

  async runScript<T>(scriptPath: string, args: string[] = [], config: SandboxConfig = {}): Promise<SandboxResult<T>> {
    const start = Date.now();
    const memoryLimitMB = config.memoryLimitMB ?? 128;
    const script = `require(${JSON.stringify(scriptPath)})(...${JSON.stringify(args)});`;

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let killedBy = '';
      let monitor: NodeJS.Timeout | null = null;
      let timeoutKilled = false;

      const child = spawn(process.execPath, [`--max-old-space-size=${memoryLimitMB}`, '-e', script], {
        cwd: config.cwd ?? process.cwd(),
        env: { ...process.env, ...config.env },
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: config.wallTimeLimitMs ?? 5000
      });

      child.stdout?.on('data', (d) => { stdout += d.toString(); });
      child.stderr?.on('data', (d) => { stderr += d.toString(); });

      if (config.memoryLimitMB) {
        monitor = setInterval(() => {
          if (!child.pid) return;
          pidusage(child.pid).then((stat) => {
            if (stat.memory / (1024 * 1024) > memoryLimitMB) {
              killedBy = 'memory';
              child.kill('SIGKILL');
            }
          }).catch(() => {});
        }, 50);
      }

      child.on('close', (code, signal) => {
        if (monitor) clearInterval(monitor);
        const timedOut = signal === 'SIGTERM' && !killedBy;
        if (signal === 'SIGTERM') timeoutKilled = true;
        if (signal === 'SIGKILL' && !killedBy) killedBy = 'memory';
        if (timeoutKilled && !killedBy) killedBy = 'timeout';

        resolve({
          success: code === 0,
          error: code !== 0 ? (stderr || 'Script failed') : undefined,
          stdout,
          stderr,
          durationMs: Date.now() - start,
          exitCode: code ?? undefined,
          killed: signal !== null || !!killedBy || timeoutKilled,
          killReason: (killedBy || (timeoutKilled ? 'timeout' : signal)) ?? undefined
        });
      });

      child.on('error', (err) => {
        if (monitor) clearInterval(monitor);
        resolve({ success: false, error: err.message, durationMs: Date.now() - start, exitCode: undefined });
      });
    });
  }

  async killProcess(processId: string): Promise<void> {
    const child = this.activeProcesses.get(processId);
    if (child) {
      child.kill('SIGKILL');
      this.activeProcesses.delete(processId);
    }
  }
}

export const sandbox = new ProcessSandbox();

export const capabilities = {
  content: {
    read: 'content:read',
    write: 'content:write',
    delete: 'content:delete'
  },
  media: {
    read: 'media:read',
    write: 'media:write',
    delete: 'media:delete'
  },
  net: {
    http: 'net:http',
    ws: 'net:ws'
  },
  db: {
    query: 'db:query',
    migrate: 'db:migrate'
  }
} as const;

export function auditLog(action: string, capability: string, details: Record<string, unknown>): void {
  console.log('[AUDIT]', { timestamp: new Date().toISOString(), action, capability, details });
}

export function createCapabilityGatekeeper(manifest: CapabilityManifest) {
  return {
    check(capability: string): boolean {
      return manifest.capabilities.includes(capability);
    },
    async enforce<T>(capability: string, fn: () => Promise<T>): Promise<T> {
      if (!manifest.capabilities.includes(capability)) {
        auditLog('capability:denied', capability, { manifest: manifest.name });
        throw new Error(`Capability denied: ${capability}`);
      }
      auditLog('capability:granted', capability, { manifest: manifest.name });
      return fn();
    }
  };
}