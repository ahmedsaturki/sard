/**
 * @module sard/lite/fields
 * Custom field types for Sard
 */

export const sardFields = [];

export const seoField = {
  name: 'seo',
  type: 'group',
  label: { ar: 'SEO', en: 'SEO' },
  fields: [
    { name: 'metaTitle', type: 'text', maxLength: 60, localized: true, label: { ar: 'عنوان SEO', en: 'SEO Title' } },
    { name: 'metaDescription', type: 'textarea', maxLength: 160, localized: true, label: { ar: 'وصف SEO', en: 'SEO Description' } },
    { name: 'ogImage', type: 'upload', relationTo: 'media', label: { ar: 'صورة المشاركة', en: 'OG Image' } },
    { name: 'jsonLd', type: 'json', label: { ar: 'JSON-LD', en: 'JSON-LD' } },
    { name: 'directAnswer', type: 'textarea', maxLength: 300, localized: true, label: { ar: 'إجابة مباشرة (AEO)', en: 'Direct Answer (AEO)' } },
  ],
};

export const directAnswerField = {
  name: 'directAnswer',
  type: 'textarea',
  maxLength: 300,
  localized: true,
  label: { ar: 'إجابة مباشرة (AEO)', en: 'Direct Answer (AEO)' },
  admin: { description: { ar: 'إجابة مختصرة 40-60 كلمة لمحركات الإجابة', en: '40-60 word concise answer for answer engines' } },
};

export const clientEditableField = {
  name: 'clientEditable',
  type: 'checkbox',
  defaultValue: false,
  label: { ar: 'قابل للتعديل من العميل', en: 'Client Editable' },
  admin: { description: { ar: 'يظهر في لوحة إدارة الموقع المبسطة', en: 'Shows in simplified client panel' } },
};
