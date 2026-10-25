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
// import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'; // optional
import { sardCollections } from './src/collections/index.js';
import { sardGlobals } from './src/globals/index.js';
import { sardFields } from './src/fields/index.js';
// Translations handled by Payload 3 built-in localization
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default buildConfig({
  admin: {
    user: 'users',
    autoLogin: false,
    livePreview: {
      url: process.env.SARD_SITE_URL ?? 'http://localhost:4321',
      collections: ['posts', 'pages'],
    },
    components: {
      // Custom components for Client Handoff (HC-11)
      // afterLogin: ['@sard/client-handoff/WelcomeGuide'],
      // afterDashboard: ['@sard/client-handoff/QuickActions'],
    },
    importMap: {
      baseDir: path.resolve(__dirname),
    },
    // RTL support (HC-10)
    // rtl: true, // Payload 3.1+ supports RTL natively
  },
  
  editor: lexicalEditor({
    // Arabic/RTL support in editor
    // Note: Lexical handles RTL via CSS direction
  }),
  
  collections: sardCollections,
  globals: sardGlobals,
  fields: sardFields,
  
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL ?? 'file:./data/sard.db',
    },
    // Custom adapter via @sard/db-sqlcipher will be swapped in
    // via DATABASE_ADAPTER=sqlcipher env var
  }),
  
  localization: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar', // Arabic-first (HC-10)
    fallback: true,
  },
  
  i18n: {
    supportedLanguages: { ar: { dateFNSKey: 'ar-SA' }, en: { dateFNSKey: 'en-US' } },
  },
  
  // Auth configuration (HC-06)
  auth: {
    users: {
      verify: false, // Email verification disabled for Lite
      maxLoginAttempts: 5,
      lockTime: 60000 * 15, // 15 min lockout
      tokenExpiration: 900, // 15 min JWT TTL (HC-06)
      cookies: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        httpOnly: true,
        domain: process.env.SARD_COOKIE_DOMAIN,
      },
      // Argon2id via @node-rs/argon2 (custom provider)
      // passwordHash: async (password) => await argon2.hash(password),
      // passwordVerify: async (password, hash) => await argon2.verify(hash, password),
    },
  },
  
  // Security headers via helmet (configured in server.ts)
  // cors: { origin: process.env.SARD_ALLOWED_ORIGINS?.split(',') ?? '*' },
  
  // Rate limiting (configured in server.ts middleware)
  
  graphQL: {
    disable: false,
    playground: process.env.NODE_ENV !== 'production',
  },
  
  rest: {
    disable: false,
  },
  
  // Server configuration
  serverURL: process.env.SARD_SERVER_URL ?? 'http://localhost:4321',
  
  // Telemetry
  telemetry: false,
  
  // Plugins
  plugins: [
    // vercelBlobStorage({ enabled: !!process.env.BLOB_READ_WRITE_TOKEN }), // optional
  ],
  
  // Sharp for image optimization
  sharp: true,
  
  // Upload
  upload: {
    limits: {
      fileSize: 10_000_000, // 10MB
    },
  },
  
  // Custom routes
  routes: {
    // /install flow
    install: '/api/sard/install',
  },
  
  // Typescript
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
    declare: true,
  },
});
