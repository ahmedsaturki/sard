/**
 * @module sard/lite/app/api/validation
 * Zod validation schemas for API endpoints
 */

import { z } from 'zod';

// Post schemas
export const PostCreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  content: z.any(), // Lexical/Portable Text
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'in_review', 'published', 'archived']).default('draft'),
  publishAt: z.string().datetime().optional(),
  locale: z.enum(['ar', 'en']).default('ar'),
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    ogImage: z.string().url().optional(),
    jsonLd: z.any().optional(),
    directAnswer: z.string().max(300).optional(),
  }).optional(),
});

export const PostUpdateSchema = PostCreateSchema.partial();

export const PostQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['draft', 'in_review', 'published', 'archived']).optional(),
  locale: z.enum(['ar', 'en']).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'publishAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Media schemas
export const MediaUploadSchema = z.object({
  alt: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
  locale: z.enum(['ar', 'en']).default('ar'),
});

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  twoFactorCode: z.string().length(6).optional(),
});

export const TwoFactorSetupSchema = z.object({
  enabled: z.boolean(),
});

// Audit schemas
export const AuditQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  action: z.string().optional() as z.ZodOptional<z.ZodString>,
  userId: z.string().uuid().optional() as z.ZodOptional<z.ZodString>,
  resourceType: z.string().optional() as z.ZodOptional<z.ZodString>,
  dateFrom: z.string().datetime().optional() as z.ZodOptional<z.ZodString>,
  dateTo: z.string().datetime().optional() as z.ZodOptional<z.ZodString>,
});

// Version schemas
export const VersionRestoreSchema = z.object({
  version: z.number().int().positive(),
  note: z.string().max(500).optional(),
});

export const VersionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});