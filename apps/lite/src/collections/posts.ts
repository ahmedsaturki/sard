/**
 * @module sard/lite/collections/posts
 * Posts collection - bilingual (ar/en) with Portable Text content
 */

import type { CollectionConfig } from 'payload';
import { z } from 'zod';

const SEOFields = [
  {
    name: 'metaTitle',
    type: 'text',
    maxLength: 60,
    label: { ar: 'عنوان SEO', en: 'SEO Title' },
    admin: { description: { ar: 'يظهر في نتائج البحث (حد 60 حرف)', en: 'Shown in search results (60 char limit)' } },
  },
  {
    name: 'metaDescription',
    type: 'textarea',
    maxLength: 160,
    label: { ar: 'وصف SEO', en: 'SEO Description' },
    admin: { description: { ar: 'يظهر في نتائج البحث (حد 160 حرف)', en: 'Shown in search results (160 char limit)' } },
  },
  {
    name: 'ogImage',
    type: 'upload',
    relationTo: 'media',
    label: { ar: 'صورة المشاركة الاجتماعية', en: 'Social Share Image' },
  },
  {
    name: 'jsonLd',
    type: 'json',
    label: { ar: 'JSON-LD مخصص', en: 'Custom JSON-LD' },
    admin: { description: { ar: 'بيانات منظمة إضافية', en: 'Additional structured data' } },
  },
  {
    name: 'directAnswer',
    type: 'textarea',
    maxLength: 300,
    label: { ar: 'إجابة مباشرة (AEO)', en: 'Direct Answer (AEO)' },
    admin: { description: { ar: 'إجابة مختصرة 40-60 كلمة لمحركات الإجابة', en: '40-60 word answer for answer engines' } },
  },
];

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: { ar: 'مقال', en: 'Post' }, plural: { ar: 'مقالات', en: 'Posts' } },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'locale', 'publishedAt', 'author'],
    group: { ar: 'المحتوى', en: 'Content' },
  },
  access: {
    read: () => true, // Public read
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor' || user?.role === 'author',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor' || (user?.role === 'author' && user?.id === '{{doc.author}}'),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { ar: 'العنوان', en: 'Title' },
      validate: (value: string) => {
        const result = z.string().min(3).max(200).safeParse(value);
        return result.success ? true : 'Title must be 3-200 characters';
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      localized: true,
      label: { ar: 'الرابط المختصر', en: 'Slug' },
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [({ value, data }) => {
          if (!value && data?.title) {
            return data.title
              .toLowerCase()
              .replace(/[^a-z0-9؀-ۿs-]/g, '')
              .replace(/s+/g, '-')
              .slice(0, 100);
          }
          return value;
        }],
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      label: { ar: 'المحتوى', en: 'Content' },
      editor: 'lexical',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      maxLength: 500,
      label: { ar: 'المقتطف', en: 'Excerpt' },
      admin: { description: { ar: 'يظهر في الأرشيف والبحث (حد 500 حرف)', en: 'Shown in archive and search (500 char limit)' } },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: { ar: 'الصورة الرئيسية', en: 'Featured Image' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: { ar: 'التصنيفات', en: 'Categories' },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: { ar: 'الوسوم', en: 'Tags' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: { ar: 'مسودة', en: 'Draft' }, value: 'draft' },
        { label: { ar: 'قيد المراجعة', en: 'In Review' }, value: 'in_review' },
        { label: { ar: 'منشور', en: 'Published' }, value: 'published' },
        { label: { ar: 'مؤرشف', en: 'Archived' }, value: 'archived' },
      ],
      label: { ar: 'الحالة', en: 'Status' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishAt',
      type: 'date',
      label: { ar: 'النشر في', en: 'Publish At' },
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: { ar: 'تاريخ النشر', en: 'Published At' },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: { ar: 'المؤلف', en: 'Author' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'locale',
      type: 'select',
      required: true,
      defaultValue: 'ar',
      options: [
        { label: 'العربية', value: 'ar' },
        { label: 'English', value: 'en' },
      ],
      label: { ar: 'اللغة', en: 'Locale' },
      admin: { position: 'sidebar' },
    },
    // SEO & AEO fields (HC-12: beats WP Yoast)
    ...SEOFields,
    // Versioning
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      admin: { readOnly: true, hidden: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' || data.status === 'published') {
          data.publishedAt = new Date().toISOString();
        }
        data.version = (data.version ?? 0) + 1;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        // Audit log (ADR-013 L3)
        console.log('[AUDIT]', { action: `post.${operation}`, resourceId: doc.id, user: 'system' });
      },
    ],
  },
};
