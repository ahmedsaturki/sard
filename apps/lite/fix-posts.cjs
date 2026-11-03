const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/api/posts/route.ts';

let content = fs.readFileSync(path, 'utf8');

// Fix: add z import and fix schema parameter type
const oldImport = `import { PostCreateSchema, PostUpdateSchema, PostQuerySchema } from '../validation';`;
const newImport = `import { PostCreateSchema, PostUpdateSchema, PostQuerySchema } from '../validation';
import { z } from 'zod';`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
}

// Fix the schema parameter type
const oldFunc = `function validateRequest<T>(schema: any, data: unknown): { success: true; data: T } | { success: false; error: string } {`;
const newFunc = `function validateRequest<T>(schema: z.ZodSchema, data: unknown): { success: true; data: T } | { success: false; error: string } {`;

if (content.includes(oldFunc)) {
  content = content.replace(oldFunc, newFunc);
}

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS');