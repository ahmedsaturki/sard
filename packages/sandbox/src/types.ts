/**
 * @module @sard/sandbox/types
 * Type definitions for process isolation sandbox
 */

export interface SandboxConfig {
  /** Max memory in MB */
  memoryLimitMB?: number;
  /** Max CPU time in ms */
  cpuTimeLimitMs?: number;
  /** Max wall-clock time in ms */
  wallTimeLimitMs?: number;
  /** Allowed capabilities */
  capabilities?: string[];
  /** Working directory */
  cwd?: string;
  /** Environment variables (allowlist) */
  env?: Record<string, string>;
  /** Network allowlist (domains) */
  networkAllowlist?: string[];
  /** Kill switch callback */
  onKill?: (reason: string) => void;
}

export interface SandboxResult<T = unknown> {
  success: boolean;
  result?: T | undefined;
  error?: string | undefined;
  stdout?: string | undefined;
  stderr?: string | undefined;
  exitCode?: number | undefined;
  killed?: boolean | undefined;
  killReason?: string | undefined;
  durationMs: number;
  memoryUsedMB?: number | undefined;
}

export interface SandboxedProcess {
  id: string;
  pid: number;
  kill(): Promise<void>;
  onExit: (callback: (code: number | null, signal: string | null) => void) => void;
}

export interface Sandbox {
  /** Run a function in isolated process */
  run<T>(fn: () => Promise<T>, config?: SandboxConfig): Promise<SandboxResult<T>>;
  /** Run a script file in isolated process */
  runScript<T>(scriptPath: string, args?: string[], config?: SandboxConfig): Promise<SandboxResult<T>>;
  /** Check if sandbox is available */
  isAvailable(): boolean;
  /** Get resource usage */
  getUsage(): { memoryMB: number; cpuPercent: number } | null;
}

export interface CapabilityManifest {
  name: string;
  version: string;
  capabilities: string[];
  permissions: {
    fs?: { read?: string[]; write?: string[] };
    net?: { domains?: string[] };
    db?: { tables?: string[] };
  };
}
