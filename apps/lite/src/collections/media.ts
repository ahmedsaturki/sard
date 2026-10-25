import path from 'path';
import { fileURLToPath } from 'node:url';
import type { CollectionConfig } from 'payload';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: { ar: 'ملف', en: 'Media' }, plural: { ar: 'الملفات', en: 'Media' } },
  admin: { group: { ar: 'الوسائط', en: 'Media' } },
  access: { read: () => true, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => user?.role === 'admin' },
  upload: {
    staticDir: path.resolve(__dirname, '../../public/media'),
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 432, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    formatOptions: {
      format: 'webp',
      options: { quality: 85 },
    },
  },
  fields: [
    { name: 'alt', type: 'text', localized: true, label: { ar: 'نص بديل', en: 'Alt Text' } },
    { name: 'caption', type: 'text', localized: true, label: { ar: 'التعليق', en: 'Caption' } },
    { name: 'locale', type: 'select', required: true, defaultValue: 'ar', options: [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }], admin: { position: 'sidebar' } },
  ],
};
