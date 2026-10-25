/**
 * @module sard/lite/app/server
 * Sard Lite standalone server for shared hosting
 */

import express from 'express';
import { buildPayload } from 'payload';
import config from '../../payload.config.js';
import { helmetConfig, authRateLimit, writeRateLimit, apiRateLimit, prototypePollutionProtection, corsMiddleware, securityHeaders, auditMiddleware } from './security.js';
import { installMiddleware } from './install.js';

async function start(): Promise<void> {
  const app = express();
  
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  app.use(helmetConfig);
  app.use(corsMiddleware);
  app.use(securityHeaders);
  app.use(prototypePollutionProtection);
  app.use(auditMiddleware);
  
  app.use('/api/auth', authRateLimit);
  app.use('/api/sard/install', authRateLimit);
  app.use(['/api/collections', '/api/globals'], writeRateLimit);
  app.use('/api', apiRateLimit);
  
  const payload = await buildPayload({ config });
  
  app.post('/api/sard/install', installMiddleware(payload));
  app.use('/api', payload.router);
  app.use('/admin', payload.admin.router);
  
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: process.env.npm_package_version ?? '0.0.1' });
  });
  
  app.use('/media', express.static(config.upload?.staticDir ?? './public/media', {
    maxAge: '1y', etag: true, lastModified: true,
  }));
  
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
  });
  
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  });
  
  const MEMORY_LIMIT_MB = parseInt(process.env.NODE_OPTIONS?.match(/--max-old-space-size=(\d+)/)?.[1] ?? '512', 10);
  setInterval(() => {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    if (heapUsedMB > MEMORY_LIMIT_MB * 0.9) {
      console.warn('[MEMORY] High usage:', heapUsedMB, 'MB /', MEMORY_LIMIT_MB, 'MB');
      if (global.gc) global.gc();
    }
  }, 30000);
  
  const port = parseInt(process.env.PORT ?? '4321', 10);
  const host = process.env.HOST ?? '0.0.0.0';
  
  app.listen(port, host, () => {
    console.log(`🚀 Sard Lite running on http://${host}:${port}`);
    console.log(`   Admin: http://${host}:${port}/admin`);
    console.log(`   Install: http://${host}:${port}/api/sard/install`);
    console.log(`   Memory limit: ${MEMORY_LIMIT_MB}MB`);
  });
  
  process.on('SIGTERM', async () => {
    console.log('[SHUTDOWN] SIGTERM received');
    await payload.db.destroy();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('[SHUTDOWN] SIGINT received');
    await payload.db.destroy();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error('[STARTUP ERROR]', err);
  process.exit(1);
});
