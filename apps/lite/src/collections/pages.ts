/**
 * @module sard/lite/collections/pages
 * Pages collection - static pages with flexible blocks
 */

import type { CollectionConfig } from 'payload';

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: { ar: 'صفحة', en: 'Page' }, plural: { ar: 'صفحات', en: 'Pages' } },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'locale', 'template', 'updatedAt'],
    group: { ar: 'المحتوى', en: 'Content' },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { ar: 'العنوان', en: 'Title' },
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
    },
    {
      name: 'template',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: { ar: 'افتراضي', en: 'Default' }, value: 'default' },
        { label: { ar: 'صفحة هبوط', en: 'Landing' }, value: 'landing' },
        { label: { ar: 'اتصل بنا', en: 'Contact' }, value: 'contact' },
        { label: { ar: 'من نحن', en: 'About' }, value: 'about' },
      ],
      label: { ar: 'القالب', en: 'Template' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'blocks',
      type: 'array',
      label: { ar: 'الكتل', en: 'Blocks' },
      fields: [
        {
          name: 'blockType',
          type: 'select',
          required: true,
          options: [
            { label: { ar: 'نص غني', en: 'Rich Text' }, value: 'richText' },
            { label: { ar: 'صورة', en: 'Image' }, value: 'image' },
            { label: { ar: 'فيديو', en: 'Video' }, value: 'video' },
            { label: { ar: 'معرض', en: 'Gallery' }, value: 'gallery' },
            { label: { ar: 'نموذج', en: 'Form' }, value: 'form' },
            { label: { ar: 'أزرار', en: 'CTA' }, value: 'cta' },
          ],
        },
        {
          name: 'content',
          type: 'richText',
          admin: { condition: (_, { blockType }) => blockType === 'richText' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { condition: (_, { blockType }) => blockType === 'image' },
        },
        {
          name: 'videoUrl',
          type: 'text',
          admin: { condition: (_, { blockType }) => blockType === 'video' },
        },
        {
          name: 'images',
          type: 'array',
          fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
          admin: { condition: (_, { blockType }) => blockType === 'gallery' },
        },
        {
          name: 'formId',
          type: 'relationship',
          relationTo: 'forms',
          admin: { condition: (_, { blockType }) => blockType === 'form' },
        },
        {
          name: 'ctaText',
          type: 'text',
          localized: true,
          admin: { condition: (_, { blockType }) => blockType === 'cta' },
        },
        {
          name: 'ctaUrl',
          type: 'text',
          admin: { condition: (_, { blockType }) => blockType === 'cta' },
        },
        {
          name: 'ctaStyle',
          type: 'select',
          options: [
            { label: { ar: 'أساسي', en: 'Primary' }, value: 'primary' },
            { label: { ar: 'ثانوي', en: 'Secondary' }, value: 'secondary' },
            { label: { ar: 'مخطط', en: 'Outline' }, value: 'outline' },
          ],
          admin: { condition: (_, { blockType }) => blockType === 'cta' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: { ar: 'مسودة', en: 'Draft' }, value: 'draft' },
        { label: { ar: 'منشور', en: 'Published' }, value: 'published' },
      ],
      label: { ar: 'الحالة', en: 'Status' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'locale',
      type: 'select',
      required: true,
      defaultValue: 'ar',
      options: [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }],
      label: { ar: 'اللغة', en: 'Locale' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'seo',
      type: 'group',
      label: { ar: 'SEO', en: 'SEO' },
      fields: [
        { name: 'metaTitle', type: 'text', maxLength: 60, localized: true, label: { ar: 'عنوان SEO', en: 'SEO Title' } },
        { name: 'metaDescription', type: 'textarea', maxLength: 160, localized: true, label: { ar: 'وصف SEO', en: 'SEO Description' } },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: { ar: 'صورة المشاركة', en: 'OG Image' } },
        { name: 'jsonLd', type: 'json', label: { ar: 'JSON-LD', en: 'JSON-LD' } },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        data.version = (data.version ?? 0) + 1;
      },
    ],
  },
};
