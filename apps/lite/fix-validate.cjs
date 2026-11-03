const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the schema parameter type to properly infer T
  const oldFunc = `function validateRequest<T>(schema: z.ZodSchema, data: unknown): { success: true; data: T } | { success: false; error: string } {`;
  const newFunc = `function validateRequest<T extends z.ZodSchema>(schema: T, data: unknown): { success: true; data: z.infer<T> } | { success: false; error: string } {`;

  if (content.includes(oldFunc)) {
    content = content.replace(oldFunc, newFunc);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`SUCCESS: ${filePath}`);
  } else {
    console.log(`Function signature not found in ${filePath}`);
  }
}

fixFile('D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/api/posts/route.ts');
fixFile('D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/api/media/route.ts');