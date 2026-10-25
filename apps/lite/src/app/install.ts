/**
 * @module sard/lite/app/install
 * /install flow - browser-based setup (no shell required)
 */

import { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import { Payload } from 'payload';
import { argon2 } from '@node-rs/argon2';

interface InstallRequest {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  locale: 'ar' | 'en';
  dbKey?: string;
}

interface InstallResponse {
  success: boolean;
  message: string;
  dbKey?: string;
  adminToken?: string;
  redirectUrl?: string;
}

const REQUIRED_FIELDS: (keyof InstallRequest)[] = ['siteName', 'siteUrl', 'adminEmail', 'adminPassword', 'adminName', 'locale'];

function validateInstallRequest(body: unknown): InstallRequest {
  const data = body as Record<string, unknown>;
  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || typeof data[field] !== 'string') {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  if (data.adminPassword.length < 12) throw new Error('Admin password must be at least 12 characters');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.adminEmail)) throw new Error('Invalid admin email');
  if (!['ar', 'en'].includes(data.locale)) throw new Error('Locale must be ar or en');
  return data as InstallRequest;
}

function generateDBKey(): string {
  return randomBytes(32).toString('hex');
}

function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    memoryCost: 65536, timeCost: 3, parallelism: 1, outputLen: 32, type: 2,
  });
}

export async function installHandler(payload: Payload): Promise<(req: Request, res: Response) => Promise<void>> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
      }
      
      const existingUsers = await payload.find({ collection: 'users', limit: 1 });
      if (existingUsers.totalDocs > 0) {
        res.status(400).json({ success: false, message: 'Sard is already installed' });
        return;
      }
      
      const input = validateInstallRequest(req.body);
      const dbKey = input.dbKey ?? generateDBKey();
      console.log('[INSTALL] Generated DB key (save this!):', dbKey);
      
      const passwordHash = await hashPassword(input.adminPassword);
      
      const admin = await payload.create({
        collection: 'users',
        data: {
          email: input.adminEmail,
          password: input.adminPassword,
          name: input.adminName,
          role: 'owner',
          locale: input.locale,
        },
      });
      
      await payload.updateGlobal({
        slug: 'site-settings',
        data: {
          siteName: input.siteName,
          siteUrl: input.siteUrl,
          defaultLocale: input.locale,
          supportedLocales: [{ locale: 'ar' }, { locale: 'en' }],
        },
      });
      
      await payload.updateGlobal({
        slug: 'navigation',
        data: {
          items: [
            { label: { ar: 'الرئيسية', en: 'Home' }, url: '/' },
            { label: { ar: 'المقالات', en: 'Posts' }, url: '/posts' },
            { label: { ar: 'اتصل بنا', en: 'Contact' }, url: '/contact' },
          ],
        },
      });
      
      const token = payload.jwt.sign({ id: admin.id, collection: 'users', email: admin.email, role: admin.role }, {
        expiresIn: '15m',
      });
      
      const response: InstallResponse = {
        success: true,
        message: 'Sard installed successfully!',
        dbKey,
        adminToken: token,
        redirectUrl: '/admin',
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('[INSTALL] Error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Installation failed',
      });
    }
  };
}

export function installMiddleware(payload: Payload) {
  const handler = await installHandler(payload);
  return handler;
}
