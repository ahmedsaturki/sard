/**
 * @module @sard-cms/core/memory-governor
 * Memory management for 512MB/1-core constraint (HC-03, HC-01)
 * Monitors heap usage, triggers GC, evicts caches
 */

import { EventEmitter } from 'node:events';

export interface MemoryConfig {
  maxHeapMB: number;
  warningThreshold: number; // 0.8 = 80%
  criticalThreshold: number; // 0.9 = 90%
  checkIntervalMs: number;
  gcIntervalMs: number;
  enableAutoGC: boolean;
}

export interface MemoryStats {
  heapUsedMB: number;
  heapTotalMB: number;
  externalMB: number;
  rssMB: number;
  usagePercent: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
}

export class MemoryGovernor extends EventEmitter {
  private config: MemoryConfig;
  private checkInterval: NodeJS.Timeout | null = null;
  private gcInterval: NodeJS.Timeout | null = null;
  private stats: MemoryStats | null = null;
  private cacheEvictionCallbacks: Array<() => Promise<void>> = [];

  constructor(config: Partial<MemoryConfig> = {}) {
    super();

    this.config = {
      maxHeapMB: parseInt(process.env.NODE_OPTIONS?.match(/--max-old-space-size=(\d+)/)?.[1] || '512', 10),
      warningThreshold: 0.8,
      criticalThreshold: 0.9,
      checkIntervalMs: 30000, // 30 seconds
      gcIntervalMs: 60000, // 1 minute
      enableAutoGC: true,
      ...config,
    };
  }

  start(): void {
    if (this.checkInterval) return;

    // Initial check
    this.checkMemory();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkMemory();
    }, this.config.checkIntervalMs);

    // Periodic GC
    if (this.config.enableAutoGC && global.gc) {
      this.gcInterval = setInterval(() => {
        this.forceGC();
      }, this.config.gcIntervalMs);
    }

    console.log(`[MemoryGovernor] Started - Max heap: ${this.config.maxHeapMB}MB`);
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
  }

  checkMemory(): MemoryStats {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const externalMB = Math.round(usage.external / 1024 / 1024);
    const rssMB = Math.round(usage.rss / 1024 / 1024);
    const usagePercent = heapUsedMB / this.config.maxHeapMB;

    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (usagePercent >= this.config.criticalThreshold) status = 'critical';
    else if (usagePercent >= this.config.warningThreshold) status = 'warning';

    this.stats = {
      heapUsedMB,
      heapTotalMB,
      externalMB,
      rssMB,
      usagePercent,
      status,
      timestamp: new Date(),
    };

    // Emit events for status changes
    this.emit('memory-check', this.stats);

    if (status === 'critical') {
      this.emit('memory-critical', this.stats);
      this.handleCriticalMemory();
    } else if (status === 'warning') {
      this.emit('memory-warning', this.stats);
      this.handleWarningMemory();
    }

    return this.stats;
  }

  private handleWarningMemory(): void {
    const stats = this.stats;
    if (!stats) return;
    console.warn(`[MemoryGovernor] WARNING: Heap usage at ${stats.heapUsedMB}MB (${(stats.usagePercent * 100).toFixed(1)}% of ${this.config.maxHeapMB}MB)`);

    // Evict caches
    this.evictCaches('warning');
  }

  private handleCriticalMemory(): void {
    const stats = this.stats;
    if (!stats) return;
    console.error(`[MemoryGovernor] CRITICAL: Heap usage at ${stats.heapUsedMB}MB (${(stats.usagePercent * 100).toFixed(1)}% of ${this.config.maxHeapMB}MB)`);

    // Force GC
    this.forceGC();

    // Aggressive cache eviction
    this.evictCaches('critical');
  }

  registerCacheEviction(callback: () => Promise<void>): void {
    this.cacheEvictionCallbacks.push(callback);
  }

  private evictCaches(severity: 'warning' | 'critical'): void {
    console.log(`[MemoryGovernor] Evicting caches (${severity})...`);

    for (const callback of this.cacheEvictionCallbacks) {
      try {
        callback();
      } catch (error) {
        console.error('[MemoryGovernor] Cache eviction failed:', error);
      }
    }
  }

  forceGC(): void {
    if (global.gc) {
      const before = process.memoryUsage().heapUsed;
      global.gc();
      const after = process.memoryUsage().heapUsed;
      const freed = Math.round((before - after) / 1024 / 1024);
      console.log(`[MemoryGovernor] GC freed ${freed}MB`);
      this.emit('gc-complete', { freedMB: freed });
    } else {
      console.warn('[MemoryGovernor] GC not available (run with --expose-gc)');
    }
  }

  getStats(): MemoryStats | null {
    return this.stats;
  }

  getConfig(): Readonly<MemoryConfig> {
    return { ...this.config };
  }

  updateConfig(config: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Express middleware for memory monitoring
  middleware() {
    return (_req: any, res: any, next: () => void) => {
      this.checkMemory();

      // Add memory headers
      res.setHeader('X-Memory-Used-MB', String(this.stats?.heapUsedMB || 0));
      res.setHeader('X-Memory-Usage-Pct', String(Math.round((this.stats?.usagePercent || 0) * 100)));
      res.setHeader('X-Memory-Status', this.stats?.status || 'normal');

      // Reject requests if critical
      if (this.stats?.status === 'critical') {
        return res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable: memory critical',
          retryAfter: 30,
        });
      }

      next();
    };
  }
}

// Singleton instance
let memoryGovernorInstance: MemoryGovernor | null = null;

export function getMemoryGovernor(config?: Partial<MemoryConfig>): MemoryGovernor {
  if (!memoryGovernorInstance) {
    memoryGovernorInstance = new MemoryGovernor(config);
  }
  return memoryGovernorInstance;
}

export function initializeMemoryGovernor(config?: Partial<MemoryConfig>): MemoryGovernor {
  memoryGovernorInstance = new MemoryGovernor(config);
  memoryGovernorInstance.start();
  return memoryGovernorInstance;
}

