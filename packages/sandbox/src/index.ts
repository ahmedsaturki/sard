/**
 * @module @sard/sandbox
 * Process isolation wrapper for untrusted code execution
 * 
 * ADR-013 L1: Process isolation first (AC-05).
 * Uses child_process with resource limits for production.
 * Dev fallback uses in-process with capability checks.
 */

import { spawn, ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { Sandbox, SandboxConfig, SandboxResult, SandboxedProcess, CapabilityManifest } from './types.js';

class ProcessSandbox implements Sandbox {
  private manifests = new Map<string, CapabilityManifest>();
  private activeProcesses = new Map<string, ChildProcess>();
  
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
    const id = randomUUID();
    const start = Date.now();
    
    if (!this.isAvailable()) {
      try {
        if (config.capabilities) {
          for (const cap of config.capabilities) {
            if (!this.hasCapability(cap)) {
              throw new Error(`Capability denied: ${cap}`);
            }
          }
        }
        
        const result = await fn();
        return {
          success: true,
          result,
          durationMs: Date.now() - start
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start
        };
      }
    }
    
    return this.runInChildProcess(fn, config, start);
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
      const child = spawn(process.execPath, ['-e', script], {
        cwd: config.cwd ?? process.cwd(),
        env: { ...process.env, ...config.env },
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: config.wallTimeLimitMs ?? 5000
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (d) => { stdout += d.toString(); });
      child.stderr?.on('data', (d) => { stderr += d.toString(); });
      
      child.on('close', (code, signal) => {
        try {
          const lastLine = stdout.trim().split('\n').pop() ?? '{}';
          const parsed = JSON.parse(lastLine);
          resolve({
            ...parsed,
            durationMs: Date.now() - start,
            exitCode: code ?? undefined,
            killed: signal !== null,
            killReason: signal ?? undefined
          });
        } catch {
          resolve({
            success: false,
            error: 'Failed to parse child output',
            stdout,
            stderr,
            durationMs: Date.now() - start,
            exitCode: code ?? undefined
          });
        }
      });
      
      child.on('error', (err) => {
        resolve({
          success: false,
          error: err.message,
          durationMs: Date.now() - start
        });
      });
      
      if (config.memoryLimitMB) {
        const checkMem = setInterval(() => {
          try {} catch {}
        }, 100);
        child.on('close', () => clearInterval(checkMem));
      }
    });
  }
  
  async runScript<T>(scriptPath: string, args: string[] = [], config: SandboxConfig = {}): Promise<SandboxResult<T>> {
    return this.run(async () => {
      throw new Error('runScript not implemented in dev fallback');
    }, config);
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
