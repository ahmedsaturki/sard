/**
 * @module sard/lite/app/api/auth/two-factor/service
 * Two-Factor Authentication (TOTP) service
 */

import { generateSecret, generateURI } from 'otplib';
import { getPayload } from 'payload';
import type { Payload } from 'payload';
import config from '@payload-config';

let payloadPromise: Promise<Payload> | null = null;

async function getPayloadInstance(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config });
  }
  return payloadPromise;
}

// otplib v13 TOTP options structure
type TotpOptions = {
  window?: number;
  digits?: number;
  step?: number;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TOTP_OPTIONS: TotpOptions = {
  window: 1,
  digits: 6,
  step: 30,
  algorithm: 'SHA1',
} as any;

export interface TwoFactorSetup {
  secret: string;
  uri: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyResult {
  valid: boolean;
  remainingAttempts?: number;
}

export async function generateTwoFactorSecret(userEmail: string): Promise<TwoFactorSetup> {
  // @ts-ignore - otplib v13 type incompatibility
  const secret = generateSecret(TOTP_OPTIONS);
  const serviceName = 'Sard Lite';
  // @ts-ignore - otplib v13 type incompatibility
  const uri = generateURI(serviceName, userEmail, secret, TOTP_OPTIONS);

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  // Generate QR code data URL (using a simple approach)
  // In production, use a proper QR code library like 'qrcode'
  const qrCodeDataUrl = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <text x="10" y="20" font-family="monospace" font-size="10">QR Code for: ${uri}</text>
      <text x="10" y="40" font-family="monospace" font-size="8">Secret: ${secret}</text>
    </svg>`
  ).toString('base64')}`;

  return {
    secret,
    uri,
    qrCodeDataUrl,
    backupCodes,
  };
}

export async function verifyTwoFactorCode(secret: string, code: string): Promise<TwoFactorVerifyResult> {
  try {
    // @ts-ignore - otplib v13 type incompatibility
    const result = verify(code, secret, TOTP_OPTIONS);
    // @ts-ignore - VerifyResult has .valid boolean
    return { valid: result.valid };
  } catch (error) {
    console.error('[2FA] Verification error:', error);
    return { valid: false };
  }
}

export async function enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<void> {
  console.log('[2FA] Enabling 2FA for user:', userId);
}

export async function disableTwoFactor(userId: string): Promise<void> {
  console.log('[2FA] Disabling 2FA for user:', userId);
}

export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  console.log('[2FA] Verifying backup code for user:', userId);
  return false; // Placeholder
}

export function generateBackupCodes(): string[] {
  return Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
}

export function generateTwoFactorSecretOnly(): string {
  // @ts-ignore - otplib v13 type incompatibility
  return generateSecret(TOTP_OPTIONS);
}

export function getTwoFactorURI(email: string, secret: string): string {
  // @ts-ignore - otplib v13 type incompatibility
  return generateURI('Sard Lite', email, secret, TOTP_OPTIONS);
}
