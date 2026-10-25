/**
 * @module sard/lite/app/api/auth/two-factor/service
 * Two-Factor Authentication (TOTP) service
 */

import { authenticator } from 'otplib';
import { getPayload } from 'payload';
import config from 'file:///D:/ahmed-research-lab/Bunya%20Labs/Sard/apps/lite/dist/payload.config.esm.js';

let payloadPromise: Promise<any> | null = null;

function getPayloadInstance() {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config });
  }
  return payloadPromise;
}

// Configure otplib
authenticator.options = {
  window: 1, // Allow 1 step window (30 seconds)
  digits: 6,
  step: 30,
  algorithm: 'SHA1',
};

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
  const secret = authenticator.generateSecret();
  const serviceName = 'Sard Lite';
  const uri = authenticator.keyuri(userEmail, serviceName, secret);
  
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
    const valid = authenticator.check(code, secret);
    return { valid };
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
  return authenticator.generateSecret();
}

export function getTwoFactorURI(email: string, secret: string): string {
  return authenticator.keyuri(email, 'Sard Lite', secret);
}
