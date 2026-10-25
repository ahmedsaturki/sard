/**
 * @module sard/lite/app/api/audit/middleware
 * Audit trail middleware for all API requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from 'file:///D:/ahmed-research-lab/Bunya%20Labs/Sard/apps/lite/dist/payload.config.esm.js';

let payloadPromise: Promise<any> | null = null;

function getPayloadInstance() {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config });
  }
  return payloadPromise;
}

export interface AuditContext {
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
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
  return async (request: any, response: any) => {
    const startTime = Date.now();
    
    // Extract context
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Try to get user from auth cookie
    const token = request.cookies.get('payload-token')?.value;
    let userId: string | undefined;
    let userEmail: string | undefined;
    
    if (token) {
      try {
        // In production, validate JWT and extract user
        // For now, just log the attempt
      } catch (e) {
        // Ignore token validation errors
      }
    }
    
    // Store context for response
    request.auditContext = {
      ip,
      userAgent,
      userId,
      userEmail,
      timestamp: new Date().toISOString(),
      durationMs: 0,
    };
    
    return null; // Continue
  };
}

export async function logApiCall(
  request: any,
  response: any,
  resourceType: string,
  resourceId?: string,
  action?: string
): Promise<void> {
  const auditContext = request.auditContext || {};
  
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
          durationMs: Date.now() - (auditContext.timestamp ? new Date(auditContext.timestamp).getTime() : Date.now()),
        },
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[AUDIT] Failed to log:', error);
  }
}
