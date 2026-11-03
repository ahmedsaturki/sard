/**
 * @module sard/lite/app/api/auth/two-factor/setup/service
 * 2FA Setup service module
 */

import { generateSecret, generateURI, verify } from 'otplib';
import { getPayload } from 'payload';
import config from '@payload-config';

import { NodeCryptoPlugin } from '@otplib/plugin-crypto-node';
import { ScureBase32Plugin } from '@otplib/plugin-base32-scure';
import { HashAlgorithm } from '@otplib/core';

let payloadPromise: Promise<any> | null = null;

function getPayloadInstance() {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config });
  }
  return payloadPromise;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TwoFactorSetup {
  secret: string;
  uri: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export async function generateTwoFactorSecret(userEmail: string): Promise<TwoFactorSetup> {
  const crypto = new NodeCryptoPlugin();
  const base32 = new ScureBase32Plugin();

  const secret = generateSecret({
    crypto,
    base32,
  });

  const uri = generateURI({
    issuer: 'Sard Lite',
    label: userEmail,
    secret,
    algorithm: 'sha1' as HashAlgorithm,
    digits: 6,
    period: 30,
  });

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

export async function verifyTwoFactorCode(_secret: string, code: string): Promise<{ valid: boolean }> {
  try {
    const crypto = new NodeCryptoPlugin();
    const base32 = new ScureBase32Plugin();

    const result = await verify({
      token: code,
      secret: _secret,
      crypto,
      base32,
      epochTolerance: 30,
      algorithm: 'sha1' as HashAlgorithm,
      digits: 6,
      period: 30,
    });

    return { valid: result.valid };
  } catch (error) {
    console.error('[2FA] Verification error:', error);
    return { valid: false };
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */