/**
 * @module @sard/core/performance
 * Performance optimization utilities for HC-01/HC-02/HC-03
 * Targets: LCP <= 1s, INP <= 100ms, CLS <= 0.05, TTFB <= 50ms
 */

import type { Request, Response, NextFunction } from 'express';

// ============================================
// Cache Management
// ============================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize = 1000, ttlMs = 300000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
      accessCount: 1,
      lastAccessed: Date.now(),
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey !== null) {
      this.cache.delete(oldestKey);
    }
  }

  size(): number {
    return this.cache.size;
  }

  clearExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

export const queryCache = new LRUCache<Record<string, unknown>>(500, 60000);
export const mediaCache = new LRUCache<Record<string, unknown>>(200, 300000);
export const renderCache = new LRUCache<string>(100, 60000);

// ============================================
// HTTP Response Compression
// ============================================

export function compressionMiddleware() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const encoding = _req.headers['accept-encoding'] as string | undefined ?? '';
    const supportsGzip = encoding.includes('gzip');
    const supportsBrotli = encoding.includes('br');

    const originalSend = res.send;
    res.send = function(body: unknown) {
      const hasContentEncoding = res.getHeader('Content-Encoding') !== null;
      const hasBody = body !== null && body !== undefined;
      const isSmallBody = Buffer.byteLength(body as Buffer) < 1024;
      
      if (hasContentEncoding || !hasBody || isSmallBody) {
        return originalSend.call(this, body);
      }

      const compressEncoding = supportsBrotli ? 'br' : (supportsGzip ? 'gzip' : null);

      if (compressEncoding !== null) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const zlib = require('zlib');
        const compressed = compressEncoding === 'br'
          ? zlib.brotliCompressSync(body as Buffer)
          : zlib.gzipSync(body as Buffer);

        res.setHeader('Content-Encoding', compressEncoding);
        res.setHeader('Content-Length', compressed.length);
        return originalSend.call(this, compressed);
      }

      return originalSend.call(this, body);
    };

    next();
  };
}

// ============================================
// Static Asset Caching
// ============================================

export function staticAssetHeaders() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const path = _req.path;

    if (/.[a-f0-9]{8,}.(js|css|png|jpg|jpeg|webp|avif|woff2?)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    else if (/(js|css|png|jpg|jpeg|webp|avif|woff2?|ico|svg)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    else if (path.endsWith('.html') || path === '/') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    next();
  };
}

// ============================================
// Critical Resource Preloading
// ============================================

export function preloadCriticalResources() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const criticalResources = [
      '< /fonts/ibm-plex-sans-arabic.woff2>; rel=preload; as=font; crossorigin',
      '< /js/main.js>; rel=preload; as=script',
      '< /css/critical.css>; rel=preload; as=style',
    ];

    res.setHeader('Link', criticalResources.join(', '));
    next();
  };
}

// ============================================
// Image Optimization
// ============================================

export interface ImageOptimizationOptions {
  quality: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  widths: number[];
}

export const imageOptimizationConfig = {
  quality: 85,
  format: 'webp',
  widths: [400, 768, 1920],
};

// ============================================
// Bundle Analysis
// ============================================

export interface BundleStats {
  totalSize: number;
  gzippedSize: number;
  chunks: { name: string; size: number; gzippedSize: number }[];
}

export interface BundleStatsInput {
  totalSize: number;
  gzippedSize: number;
  chunks: { name: string; size: number; gzippedSize: number }[];
}

export function analyzeBundle(_stats: BundleStatsInput): BundleStats {
  return {
    totalSize: 0,
    gzippedSize: 0,
    chunks: [],
  };
}

// ============================================
// Performance Metrics
// ============================================

export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  inp?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}

// ============================================
// Performance Monitor
// ============================================

export interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value: number;
}

function isLayoutShiftEntry(entry: PerformanceEntry): entry is LayoutShiftEntry {
  return 'hadRecentInput' in entry && 'value' in entry;
}

export class PerformanceMonitor {
  private metrics: Record<string, number | string | boolean> = {};

  start(): void {
    if (typeof window === 'undefined') return;

    try {
      const lcpObserver = new PerformanceObserver((entries) => {
        const lastEntry = entries.getEntries().pop();
        if (lastEntry !== undefined) this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Performance observer not supported in this environment
    }

    try {
      const inpObserver = new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          if (entry.entryType === 'event' && entry.duration > (this.metrics.inp ?? 0)) {
            this.metrics.inp = entry.duration;
          }
        }
      });
      inpObserver.observe({ type: 'event', buffered: true });
    } catch {
      // Performance observer not supported in this environment
    }

    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          if (isLayoutShiftEntry(entry) && entry.hadRecentInput !== true) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Performance observer not supported in this environment
    }

    try {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (navEntry !== undefined) {
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
      }
    } catch {
      // Performance API not available
    }

    try {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry !== undefined) this.metrics.fcp = fcpEntry.startTime;
    } catch {
      // Performance API not available
    }
  }

  stop(): void {
    // Performance monitoring stopped
  }

  getMetrics() {
    return { ...this.metrics };
  }

  checkThresholds(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    const lcp = this.metrics.lcp;
    const inp = this.metrics.inp;
    const cls = this.metrics.cls;
    const ttfb = this.metrics.ttfb;

    if (lcp !== undefined && typeof lcp === 'number' && lcp > 1000) {
      violations.push('LCP: ' + lcp + 'ms > 1000ms');
    }
    if (inp !== undefined && typeof inp === 'number' && inp > 100) {
      violations.push('INP: ' + inp + 'ms > 100ms');
    }
    if (cls !== undefined && typeof cls === 'number' && cls > 0.05) {
      violations.push('CLS: ' + cls + ' > 0.05');
    }
    if (ttfb !== undefined && typeof ttfb === 'number' && ttfb > 50) {
      violations.push('TTFB: ' + ttfb + 'ms > 50ms');
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}

export function createPerformanceMiddleware() {
  const monitor = new PerformanceMonitor();

  return {
    middleware: () => {
      return (_req: Request, res: Response, next: NextFunction) => {
        const start = process.hrtime.bigint();

        res.on('finish', () => {
          const duration = Number(process.hrtime.bigint() - start) / 1_000_000;

          res.setHeader('X-Response-Time', duration.toFixed(2) + 'ms');

          if (duration > 100) {
            // eslint-disable-next-line no-console
            console.info('[PERF] Slow request: ' + _req.method + ' ' + _req.path + ' - ' + duration.toFixed(2) + 'ms');
          }
        });

        next();
      };
    },
    getMetrics: () => monitor.getMetrics(),
    checkThresholds: () => monitor.checkThresholds(),
  };
}