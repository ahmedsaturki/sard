/**
 * @module sard/lite/app/api/audit/schema
 * Audit log collection schema
 */

export const AuditLogCollection = {
  slug: 'audit_log',
  labels: { singular: { ar: 'سجل التدقيق', en: 'Audit Log' }, plural: { ar: 'سجلات التدقيق', en: 'Audit Logs' } },
  admin: { group: { ar: 'الأمان', en: 'Security' }, hidden: true },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: () => true,
    update: () => false,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'action', type: 'text', required: true, label: { ar: 'الإجراء', en: 'Action' } },
    { name: 'user', type: 'relationship', relationTo: 'users', label: { ar: 'المستخدم', en: 'User' } },
    { name: 'userEmail', type: 'email', label: { ar: 'بريد المستخدم', en: 'User Email' } },
    { name: 'ip', type: 'text', label: { ar: 'عنوان IP', en: 'IP Address' } },
    { name: 'userAgent', type: 'textarea', label: { ar: 'معرّف المستخدم', en: 'User Agent' } },
    { name: 'resourceType', type: 'text', label: { ar: 'نوع المورد', en: 'Resource Type' } },
    { name: 'resourceId', type: 'text', label: { ar: 'معرف المورد', en: 'Resource ID' } },
    { name: 'details', type: 'json', label: { ar: 'التفاصيل', en: 'Details' } },
    { name: 'createdAt', type: 'date', required: true, admin: { readOnly: true } },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        data.createdAt = new Date().toISOString();
      },
    ],
  },
};
