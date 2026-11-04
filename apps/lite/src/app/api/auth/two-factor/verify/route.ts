/**
 * @module sard/lite/app/api/auth/two-factor/verify/route
 * 2FA Verify API - Verify TOTP code during login
 */

import { NextResponse } from 'next/server';
import { verifyTwoFactorCode } from '../service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, secret } = body as { code?: string; secret?: string };

    if (typeof code !== 'string' || code.length === 0 || typeof secret !== 'string' || secret.length === 0) {
      return NextResponse.json({ success: false, error: 'Code and secret required' }, { status: 400 });
    }

    const result = await verifyTwoFactorCode(secret, code);

    return NextResponse.json({
      success: result.valid,
      error: result.valid ? undefined : 'Invalid code',
    });
  } catch (error) {
    console.error('[2FA] Verify error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify code' }, { status: 500 });
  }
}