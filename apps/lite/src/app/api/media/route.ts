/**
 * @module sard/lite/app/api/media/route
 * Media API - Upload, list, delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from 'file:///D:/ahmed-research-lab/Bunya%20Labs/Sard/apps/lite/dist/payload.config.esm.js';
import { MediaUploadSchema } from '../validation';

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
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const locale = searchParams.get('locale') || 'ar';
    
    const result = await payload.find({
      collection: 'media',
      page,
      limit,
      where: { locale: { equals: locale } },
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
    console.error('[API] Media GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadInstance();
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'File type not allowed' }, { status: 400 });
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 });
    }
    
    // Get alt and caption
    const alt = formData.get('alt') as string || '';
    const caption = formData.get('caption') as string || '';
    const locale = (formData.get('locale') as string) || 'ar';
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Payload
    const media = await payload.create({
      collection: 'media',
      data: {
        alt,
        caption,
        locale,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    });
    
    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error) {
    console.error('[API] Media POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload media' }, { status: 500 });
  }
}
