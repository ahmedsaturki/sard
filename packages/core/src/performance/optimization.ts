/**
 * @module @sard/core/performance
 * Performance optimization utilities for HC-01/HC-02/HC-03
 * Targets: LCP <= 1s, INP <= 100ms, CLS <= 0.05, TTFB <= 50ms
 */

import { MemoryGovernor, getMemoryGovernor } from './memory/governor';

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
  
  constructor(maxSize: number = 1000, ttlMs: number = 300000) {
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
    
    if (oldestKey) {
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

export const queryCache = new LRUCache<any>(500, 60000);
export const mediaCache = new LRUCache<any>(200, 300000);
export const renderCache = new LRUCache<string>(100, 60000);

export function compressionMiddleware() {
  return (req: any, res: any, next: () => void) => {
    const encoding = req.headers['accept-encoding'] || '';
    const supportsGzip = encoding.includes('gzip');
    const supportsBrotli = encoding.includes('br');
    
    const originalSend = res.send;
    res.send = function(body: any) {
      if (res.getHeader('Content-Encoding') || !body || Buffer.byteLength(body) < 1024) {
        return originalSend.call(this, body);
      }
      
      const zlib = require('zlib');
      const encoding = supportsBrotli ? 'br' : (supportsGzip ? 'gzip' : null);
      
      if (encoding) {
        const compressed = encoding === 'br' 
          ? require('zlib').brotliCompressSync(body)
          : require('zlib').gzipSync(body);
        
        res.setHeader('Content-Encoding', encoding);
        res.setHeader('Content-Length', compressed.length);
        return originalSend.call(this, compressed);
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

export function staticAssetHeaders() {
  return (req: any, res: any, next: () => void) => {
    const path = req.path;
    
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

export function preloadCriticalResources() {
  return (req: any, res: any, next: () => void) => {
    const criticalResources = [
      '< /fonts/ibm-plex-sans-arabic.woff2>; rel=preload; as=font; crossorigin',
      '< /js/main.js>; rel=preload; as=script',
      '< /css/critical.css>; rel=preload; as=style',
    ];
    
    res.setHeader('Link', criticalResources.join(', '));
    next();
  };
}

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

export interface BundleStats {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{ name: string; size: number; gzippedSize: number }>;
}

export function analyzeBundle(stats: any): BundleStats {
  return {
    totalSize: 0,
    gzippedSize: 0,
    chunks: [],
  };
}

export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  inp?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}

export class PerformanceMonitor {
  private metrics: any = {};
  private observers: any[] = [];
  
  start(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const lcpObserver = new PerformanceObserver((entries) => {
        const lastEntry = entries.getEntries().pop();
        if (lastEntry) this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}
    
    try {
      const inpObserver = new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          if (entry.entryType === 'event' && entry.duration > (this.metrics.inp || 0)) {
            this.metrics.inp = entry.duration;
          }
        }
      });
      inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 50 });
    } catch (e) {}
    
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
    
    try {
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry) {
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
      }
    } catch (e) {}
    
    try {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) this.metrics.fcp = fcpEntry.startTime;
    } catch (e) {}
  }
  
  stop(): void {}
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  checkThresholds(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    
    if (this.metrics.lcp && this.metrics.lcp > 1000) {
      violations.push('LCP: ' + this.metrics.lcp + 'ms > 1000ms');
    }
    if (this.metrics.inp && this.metrics.inp > 100) {
      violations.push('INP: ' + this.metrics.inp + 'ms > 100ms');
    }
    if (this.metrics.cls && this.metrics.cls > 0.05) {
      violations.push('CLS: ' + this.metrics.cls + ' > 0.05');
    }
    if (this.metrics.ttfb && this.metrics.ttfb > 50) {
      violations.push('TTFB: ' + this.metrics.ttfb + 'ms > 50ms');
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
      return (req: any, res: any, next: () => void) => {
        const start = process.hrtime.bigint();
        
        res.on('finish', () => {
          const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
          
          res.setHeader('X-Response-Time', duration.toFixed(2) + 'ms');
          
          if (duration > 100) {
            console.warn('[PERF] Slow request: ' + req.method + ' ' + req.path + ' - ' + duration.toFixed(2) + 'ms');
          }
        });
        
        next();
      };
    },
    getMetrics: () => monitor.getMetrics(),
    checkThresholds: () => monitor.checkThresholds(),
  };
}
