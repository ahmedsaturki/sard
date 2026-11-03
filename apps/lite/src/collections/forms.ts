import type { CollectionConfig } from 'payload';

export const Forms: CollectionConfig = {
  slug: 'forms',
  labels: { singular: { ar: 'نموذج', en: 'Form' }, plural: { ar: 'النماذج', en: 'Forms' } },
  admin: { useAsTitle: 'title', group: { ar: 'التفاعل', en: 'Interaction' } },
  access: { read: () => true, create: ({ req: { user } }) => user?.['role'] === 'admin' || user?.['role'] === 'editor', update: ({ req: { user } }) => user?.['role'] === 'admin' || user?.['role'] === 'editor', delete: ({ req: { user } }) => user?.['role'] === 'admin' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { ar: 'العنوان', en: 'Title' } },
    { name: 'fields', type: 'array', label: { ar: 'الحقول', en: 'Fields' }, fields: [
      { name: 'name', type: 'text', required: true, label: { ar: 'اسم الحقل', en: 'Field Name' } },
      { name: 'label', type: 'text', required: true, localized: true, label: { ar: 'التسمية', en: 'Label' } },
      { name: 'type', type: 'select', required: true, options: [
        { label: { ar: 'نص', en: 'Text' }, value: 'text' },
        { label: { ar: 'بريد إلكتروني', en: 'Email' }, value: 'email' },
        { label: { ar: 'نص طويل', en: 'Textarea' }, value: 'textarea' },
        { label: { ar: 'اختيار', en: 'Select' }, value: 'select' },
        { label: { ar: 'مربع اختيار', en: 'Checkbox' }, value: 'checkbox' },
        { label: { ar: 'ملف', en: 'File' }, value: 'file' },
        { label: { ar: 'reCAPTCHA', en: 'reCAPTCHA' }, value: 'recaptcha' },
      ], label: { ar: 'النوع', en: 'Type' } },
      { name: 'required', type: 'checkbox', defaultValue: false, label: { ar: 'إلزامي', en: 'Required' } },
      { name: 'options', type: 'array', fields: [{ name: 'label', type: 'text', localized: true }, { name: 'value', type: 'text' }], admin: { condition: (_, { type }) => type === 'select' } },
      { name: 'validation', type: 'json', label: { ar: 'قواعد التحقق', en: 'Validation Rules' } },
    ] },
    { name: 'submitAction', type: 'select', required: true, defaultValue: 'email', options: [
      { label: { ar: 'إرسال بالبريد', en: 'Email' }, value: 'email' },
      { label: { ar: 'حفظ في قاعدة البيانات', en: 'Database' }, value: 'database' },
      { label: { ar: 'Webhook', en: 'Webhook' }, value: 'webhook' },
    ], label: { ar: 'إجراء الإرسال', en: 'Submit Action' } },
    { name: 'emailTo', type: 'text', admin: { condition: (_, { submitAction }) => submitAction === 'email' }, label: { ar: 'إرسال إلى', en: 'Email To' } },
    { name: 'emailSubject', type: 'text', localized: true, admin: { condition: (_, { submitAction }) => submitAction === 'email' }, label: { ar: 'موضوع البريد', en: 'Email Subject' } },
    { name: 'webhookUrl', type: 'text', admin: { condition: (_, { submitAction }) => submitAction === 'webhook' }, label: { ar: 'Webhook URL', en: 'Webhook URL' } },
    { name: 'successMessage', type: 'text', localized: true, label: { ar: 'رسالة النجاح', en: 'Success Message' } },
    { name: 'spamProtection', type: 'checkbox', defaultValue: true, label: { ar: 'حماية من السبام', en: 'Spam Protection' } },
    { name: 'locale', type: 'select', required: true, defaultValue: 'ar', options: [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }], admin: { position: 'sidebar' } },
  ],
};
