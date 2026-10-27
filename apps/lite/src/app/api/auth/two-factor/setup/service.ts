/**
 * @module sard/lite/app/api/auth/two-factor/setup/service
 * 2FA Setup service module
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { TOTP } from 'otplib';
import { getPayload } from 'payload';
import config from '@payload-config';

let payloadPromise: Promise<any> | null = null;

function getPayloadInstance() {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config });
  }
  return payloadPromise;
}

const totpOptions = {
  window: 1,
  digits: 6,
  step: 30,
  algorithm: 'sha1',
};

/* eslint-enable @typescript-eslint/no-explicit-any */

export interface TwoFactorSetup {
  secret: string;
  uri: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export async function generateTwoFactorSecret(userEmail: string): Promise<TwoFactorSetup> {
  // @ts-ignore - TOTP constructor accepts partial options
  const totp = new TOTP(totpOptions);
  const secret = totp.secret;
  /* @ts-ignore - typings differ */
  const uri = totp.provisioningUri(userEmail, { issuer: 'Sard Lite' });

  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

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

export async function verifyTwoFactorCode(secret: string, code: string): Promise<{ valid: boolean }> {
  try {
    /* @ts-ignore - typings differ */
    const totp = new TOTP(totpOptions);
    /* @ts-ignore - typings differ */
    const valid = totp.verify(code, secret);
    return { valid };
  } catch (error) {
    console.error('[2FA] Verification error:', error);
    return { valid: false };
  }
}
