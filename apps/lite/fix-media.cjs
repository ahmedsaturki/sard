const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/api/media/route.ts';

let content = fs.readFileSync(path, 'utf8');

// Fix: change schema: any to schema: z.ZodSchema and import z
const oldImport = `import { MediaUploadSchema } from '../validation';`;
const newImport = `import { MediaUploadSchema } from '../validation';
import { z } from 'zod';`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
} else {
  console.log('Import not found');
}

// Fix the schema parameter type
const oldFunc = `function validateRequest<T>(schema: any, data: unknown): { success: true; data: T } | { success: false; error: string } {`;
const newFunc = `function validateRequest<T>(schema: z.ZodSchema, data: unknown): { success: true; data: T } | { success: false; error: string } {`;

if (content.includes(oldFunc)) {
  content = content.replace(oldFunc, newFunc);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('Function signature not found');
}