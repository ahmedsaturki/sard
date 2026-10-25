import type { CollectionConfig } from 'payload';

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: { ar: 'وسم', en: 'Tag' }, plural: { ar: 'وسوم', en: 'Tags' } },
  admin: { useAsTitle: 'title', group: { ar: 'تنظيم', en: 'Organization' } },
  access: { read: () => true, create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor', update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor', delete: ({ req: { user } }) => user?.role === 'admin' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { ar: 'الاسم', en: 'Name' } },
    { name: 'slug', type: 'text', required: true, unique: true, localized: true, label: { ar: 'الرابط', en: 'Slug' } },
    { name: 'locale', type: 'select', required: true, defaultValue: 'ar', options: [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }], admin: { position: 'sidebar' } },
  ],
};
