/**
 * @module sard/lite/payload.config
 * Payload 3 configuration for Sard Lite
 * 
 * AC-01: Shared hosting compatible (Node 20+, 512MB/1-core)
 * AC-06: SQLCipher via @sard/db-sqlcipher adapter
 * HC-10: Arabic-first, RTL admin
 * HC-06: Argon2id + JWT 15min TTL
 */

import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { sardCollections } from './src/collections/index';
import { sardGlobals } from './src/globals/index';
import { sardFields } from './src/fields/index';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default buildConfig({
  secret: process.env['PAYLOAD_SECRET'] || 'a-strong-secret-for-development-only',
  admin: {
    user: 'users',
    autoLogin: false,
    livePreview: {
      url: process.env['SARD_SITE_URL'] ?? 'http://localhost:3000',
      collections: ['posts', 'pages'],
    },
    components: {
      // Custom components for Client Handoff (HC-11)
      // afterLogin: ['@sard/client-handoff/WelcomeGuide'],
      // afterDashboard: ['@sard/client-handoff/QuickActions'],
    },
    importMap: {
      baseDir: path.resolve(__dirname, 'admin'),
    },
  },

  editor: lexicalEditor({
    // Arabic/RTL support in editor
  }),

  collections: sardCollections,
  globals: sardGlobals,

  db: sqliteAdapter({
    client: {
      url: process.env['DATABASE_URL'] ?? 'file:./data/sard.db',
    },
  }),

  // Auth configuration (HC-06)
  auth: {
    jwtOrder: ['Bearer', 'cookie'],
  },

  graphQL: {
    disable: false,
    disablePlaygroundInProduction: process.env.NODE_ENV === 'production',
  },

  serverURL: process.env['PAYLOAD_PUBLIC_SERVER_URL'] || 'http://localhost:3000',

  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
});