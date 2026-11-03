/**
 * @module sard/lite/app/api/audit/middleware
 * Audit trail middleware for all API requests
 */

import { getPayload } from 'payload';
import type { Payload } from 'payload';
import config from '@payload-config';

let payloadPromise: Promise<Payload> | null | undefined = null;

async function getPayloadInstance(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config });
  }
  return payloadPromise;
}

export interface AuditContext {
  userId?: string | undefined;
  userEmail?: string | undefined;
  ip?: string | undefined;
  userAgent?: string | undefined;
  resourceType?: string | undefined;
  resourceId?: string | undefined;
  timestamp?: string | undefined;
  durationMs?: number | undefined;
}

export async function auditLog(
  action: string,
  context: AuditContext,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const payload = await getPayloadInstance();

    await payload.create({
      collection: 'audit_log',
      data: {
        action,
        user: context.userId || null,
        userEmail: context.userEmail || null,
        ip: context.ip || 'unknown',
        userAgent: context.userAgent || 'unknown',
        resourceType: context.resourceType || 'unknown',
        resourceId: context.resourceId || null,
        details: details || {},
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Don't throw - audit logging should never break the main request
    console.error('[AUDIT] Failed to log:', error);
  }
}

export function createAuditMiddleware() {
  return async (request: { headers: { get: (name: string) => string | null }; cookies: { get: (name: string) => { value: string } | undefined }; method?: string; url?: string; auditContext?: AuditContext }, _response: unknown) => {
    // Extract context
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Try to get user from auth cookie
    const token = request.cookies.get('payload-token')?.value;
    let userId: string | undefined = undefined;
    let userEmail: string | undefined = undefined;

    if (token) {
      try {
        // In production, validate JWT and extract user
        // For now, just log the attempt
      } catch {
        // Ignore token validation errors
      }
    }

    // Store context for response
    const auditContext: AuditContext = {
      ip: ip === 'unknown' ? undefined : ip,
      userAgent: userAgent === 'unknown' ? undefined : userAgent,
      userId,
      userEmail,
      timestamp: new Date().toISOString(),
      durationMs: 0,
    };
    request.auditContext = auditContext;

    return null; // Continue
  };
}

export async function logApiCall(
  request: { headers: { get: (name: string) => string | null }; cookies: { get: (name: string) => { value: string } | undefined }; method?: string; url?: string; auditContext?: AuditContext },
  _response: unknown,
  resourceType: string,
  resourceId?: string,
  action?: string
): Promise<void> {
  const auditContext: AuditContext = request.auditContext ?? {};

  try {
    const payload = await getPayloadInstance();

    await payload.create({
      collection: 'audit_log',
      data: {
        action: action || `${request.method} ${resourceType}`,
        user: auditContext.userId || null,
        userEmail: auditContext.userEmail || null,
        ip: auditContext.ip || 'unknown',
        userAgent: auditContext.userAgent || 'unknown',
        resourceType,
        resourceId: resourceId || null,
        details: {
          method: request.method,
          url: request.url,
          statusCode: 200,
          durationMs: auditContext.timestamp
            ? Date.now() - new Date(auditContext.timestamp).getTime()
            : 0,
        },
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[AUDIT] Failed to log:', error);
  }
}
