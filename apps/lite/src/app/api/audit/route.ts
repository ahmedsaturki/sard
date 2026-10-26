/**
 * @module sard/lite/app/api/audit/route
 * Audit trail API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { AuditQuerySchema } from '../validation';

let payloadPromise: Promise<any> | null = null;

function getPayloadInstance() {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config });
  }
  return payloadPromise;
}

function validateRequest<T>(schema: any, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
  }
  return { success: true, data: result.data };
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadInstance();
    const { searchParams } = new URL(request.url);
    
    const queryResult = validateRequest(AuditQuerySchema, Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json({ success: false, error: queryResult.error }, { status: 400 });
    }
    
    const query = queryResult.data;
    
    // Build where clause
    const where: any = {};
    if (query.action) where.action = { equals: query.action };
    if (query.userId) where.user = { equals: query.userId };
    if (query.resourceType) where.resourceType = { equals: query.resourceType };
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.greater_than_equal = query.dateFrom;
      if (query.dateTo) where.createdAt.less_than_equal = query.dateTo;
    }
    
    const result = await payload.find({
      collection: 'audit_log',
      page: query.page,
      limit: query.limit,
      where,
      sort: '-createdAt',
    });
    
    return NextResponse.json({
      success: true,
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
      },
    });
  } catch (error) {
    console.error('[API] Audit GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
