import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: { ar: 'مستخدم', en: 'User' }, plural: { ar: 'المستخدمون', en: 'Users' } },
  admin: { useAsTitle: 'name', group: { ar: 'الإدارة', en: 'Administration' } },
  auth: {
    tokenExpiration: 900, // 15 min (HC-06)
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 900000, // 15 min
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: true,
      domain: process.env.SARD_COOKIE_DOMAIN,
    },
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.id === '{{doc.id}}',
    delete: ({ req: { user } }) => user?.role === 'admin',
    admin: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: { ar: 'الاسم', en: 'Name' } },
    { name: 'role', type: 'select', required: true, defaultValue: 'viewer', options: [
      { label: { ar: 'مالك', en: 'Owner' }, value: 'owner' },
      { label: { ar: 'مدير', en: 'Admin' }, value: 'admin' },
      { label: { ar: 'محرر', en: 'Editor' }, value: 'editor' },
      { label: { ar: 'مؤلف', en: 'Author' }, value: 'author' },
      { label: { ar: 'قارئ', en: 'Viewer' }, value: 'viewer' },
    ], label: { ar: 'الدور', en: 'Role' } },
    { name: 'avatar', type: 'upload', relationTo: 'media', label: { ar: 'الصورة الشخصية', en: 'Avatar' } },
    { name: 'bio', type: 'textarea', localized: true, label: { ar: 'نبذة', en: 'Bio' } },
    { name: 'locale', type: 'select', required: true, defaultValue: 'ar', options: [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }], admin: { position: 'sidebar' } },
    { name: 'mfaEnabled', type: 'checkbox', defaultValue: false, label: { ar: 'مصادقة ثنائية', en: 'Two-Factor Auth' }, admin: { position: 'sidebar' } },
    { name: 'mfaSecret', type: 'text', admin: { hidden: true } },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Password hashing is handled by Payload auth with custom Argon2id provider
      },
    ],
  },
};
