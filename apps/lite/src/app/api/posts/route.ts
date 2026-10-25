/**
 * @module sard/lite/app/api/posts/route
 * Posts API - Full CRUD with versioning
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from 'file:///D:/ahmed-research-lab/Bunya%20Labs/Sard/apps/lite/dist/payload.config.esm.js';
import { PostCreateSchema, PostUpdateSchema, PostQuerySchema } from '../validation';

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
    
    // Parse query params
    const queryResult = validateRequest(PostQuerySchema, Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json({ success: false, error: queryResult.error }, { status: 400 });
    }
    
    const query = queryResult.data;
    
    // Build where clause
    const where: any = {};
    if (query.status) where.status = { equals: query.status };
    if (query.locale) where.locale = { equals: query.locale };
    if (query.category) where['categories.slug'] = { equals: query.category };
    if (query.tag) where['tags.slug'] = { equals: query.tag };
    if (query.search) {
      where.or = [
        { title: { contains: query.search } },
        { excerpt: { contains: query.search } },
      ];
    }
    
    const result = await payload.find({
      collection: 'posts',
      where,
      page: query.page,
      limit: query.limit,
      sort: `${query.sortOrder === 'desc' ? '-' : ''}${query.sortBy}`,
      depth: 2,
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
    console.error('[API] Posts GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadInstance();
    const body = await request.json();
    
    const validation = validateRequest(PostCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }
    
    const data = validation.data;
    
    // Check slug uniqueness
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: data.slug } },
      limit: 1,
    });
    
    if (existing.docs.length > 0) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 });
    }
    
    // Create post
    const post = await payload.create({
      collection: 'posts',
      data: {
        ...data,
        publishedAt: data.status === 'published' ? new Date().toISOString() : null,
      },
    });
    
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error('[API] Posts POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}
