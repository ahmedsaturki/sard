/**
 * @module sard/lite/app/api/auth/route
 * Authentication API - Login, 2FA, logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { LoginSchema } from '../validation';
import type { Payload } from 'payload';

let payloadPromise: Promise<Payload> | null = null;

async function getPayloadInstance(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config });
  }
  return payloadPromise;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadInstance();
    const body = await request.json();
    
    // Regular login
    const loginResult = LoginSchema.safeParse(body);
    if (!loginResult.success) {
      return NextResponse.json({ success: false, error: loginResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') }, { status: 400 });
    }
    const { email, password } = loginResult.data;
    
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

export async function DELETE(_request: NextRequest) {
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