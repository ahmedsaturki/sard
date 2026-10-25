import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: { ar: 'تصنيف', en: 'Category' }, plural: { ar: 'تصنيفات', en: 'Categories' } },
  admin: { useAsTitle: 'title', group: { ar: 'تنظيم', en: 'Organization' } },
  access: { read: () => true, create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor', update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor', delete: ({ req: { user } }) => user?.role === 'admin' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { ar: 'الاسم', en: 'Name' } },
    { name: 'slug', type: 'text', required: true, unique: true, localized: true, label: { ar: 'الرابط', en: 'Slug' } },
    { name: 'description', type: 'textarea', localized: true, label: { ar: 'الوصف', en: 'Description' } },
    { name: 'parent', type: 'relationship', relationTo: 'categories', label: { ar: 'تصنيف أب', en: 'Parent Category' } },
    { name: 'locale', type: 'select', required: true, defaultValue: 'ar', options: [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }], admin: { position: 'sidebar' } },
  ],
};
