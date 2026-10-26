/**
 * @module sard/lite/app/api/auth/route
 * Authentication API - Login, 2FA, logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { LoginSchema, TwoFactorSetupSchema } from '../validation';

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

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadInstance();
    const body = await request.json();
    
    // Check if it's a 2FA setup request
    if (body.twoFactorCode !== undefined && body.enabled !== undefined) {
      const validation = validateRequest(TwoFactorSetupSchema, body);
      if (!validation.success) {
        return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
      }
      
      // This would update user's 2FA settings
      return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
    }
    
    // Regular login
    const validation = validateRequest(LoginSchema, body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }
    
    const { email, password, twoFactorCode } = validation.data;
    
    // Attempt login with Payload
    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
      // 2FA code would be passed here if needed
    });
    
    if (!result.token) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Set cookie
    const response = NextResponse.json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
      },
    });
    
    response.cookies.set('payload-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('[API] Auth error:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.cookies.set('payload-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('[API] Logout error:', error);
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
  }
}
