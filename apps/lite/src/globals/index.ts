/**
 * @module sard/lite/globals
 * Global singleton configurations
 */

export const sardGlobals = [];

export const SiteSettings = {
  slug: 'site-settings',
  labels: { singular: { ar: 'إعدادات الموقع', en: 'Site Settings' } },
  admin: { group: { ar: 'الإعدادات', en: 'Settings' } },
  access: { read: () => true, update: ({ req: { user } }: any) => user?.['role'] === 'admin' },
  fields: [
    { name: 'siteName', type: 'text', required: true, localized: true, label: { ar: 'اسم الموقع', en: 'Site Name' } },
    { name: 'siteDescription', type: 'textarea', localized: true, label: { ar: 'وصف الموقع', en: 'Site Description' } },
    { name: 'siteUrl', type: 'text', required: true, label: { ar: 'رابط الموقع', en: 'Site URL' } },
    { name: 'logo', type: 'upload', relationTo: 'media', label: { ar: 'الشعار', en: 'Logo' } },
    { name: 'favicon', type: 'upload', relationTo: 'media', label: { ar: 'الفافيقونة', en: 'Favicon' } },
    { name: 'defaultLocale', type: 'select', required: true, defaultValue: 'ar', options: [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }], label: { ar: 'اللغة الافتراضية', en: 'Default Locale' } },
    { name: 'supportedLocales', type: 'array', fields: [{ name: 'locale', type: 'select', options: [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }] }], defaultValue: [{ locale: 'ar' }, { locale: 'en' }], label: { ar: 'اللغات المدعومة', en: 'Supported Locales' } },
    { name: 'social', type: 'group', label: { ar: 'روابط التواصل', en: 'Social Links' }, fields: [
      { name: 'twitter', type: 'text', label: 'X/Twitter' },
      { name: 'linkedin', type: 'text', label: 'LinkedIn' },
      { name: 'github', type: 'text', label: 'GitHub' },
      { name: 'youtube', type: 'text', label: 'YouTube' },
    ]},
    { name: 'seo', type: 'group', label: { ar: 'إعدادات SEO افتراضية', en: 'Default SEO' }, fields: [
      { name: 'defaultMetaTitle', type: 'text', maxLength: 60, localized: true, label: { ar: 'عنوان افتراضي', en: 'Default Meta Title' } },
      { name: 'defaultMetaDescription', type: 'textarea', maxLength: 160, localized: true, label: { ar: 'وصف افتراضي', en: 'Default Meta Description' } },
      { name: 'defaultOgImage', type: 'upload', relationTo: 'media', label: { ar: 'صورة مشاركة افتراضية', en: 'Default OG Image' } },
      { name: 'jsonLd', type: 'json', label: { ar: 'JSON-LD افتراضي', en: 'Default JSON-LD' } },
    ]},
    { name: 'analytics', type: 'group', label: { ar: 'التحليلات', en: 'Analytics' }, fields: [
      { name: 'gaId', type: 'text', label: 'Google Analytics ID' },
      { name: 'plausibleDomain', type: 'text', label: 'Plausible Domain' },
    ]},
  ],
};

export const Navigation = {
  slug: 'navigation',
  labels: { singular: { ar: 'التنقل', en: 'Navigation' } },
  admin: { group: { ar: 'الإعدادات', en: 'Settings' } },
  access: { read: () => true, update: ({ req: { user } }: any) => user?.['role'] === 'admin' },
  fields: [
    { name: 'items', type: 'array', label: { ar: 'عناصر القائمة', en: 'Menu Items' }, fields: [
      { name: 'label', type: 'text', required: true, localized: true, label: { ar: 'التسمية', en: 'Label' } },
      { name: 'url', type: 'text', required: true, label: { ar: 'الرابط', en: 'URL' } },
      { name: 'newTab', type: 'checkbox', defaultValue: false, label: { ar: 'فتح في تبويب جديد', en: 'Open in New Tab' } },
      { name: 'children', type: 'array', fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'url', type: 'text', required: true },
      ], label: { ar: 'عناصر فرعية', en: 'Sub Items' } },
    ]},
  ],
};

export const sardGlobalsList = [SiteSettings, Navigation];
