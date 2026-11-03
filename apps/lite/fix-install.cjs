const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/install.ts';

let content = fs.readFileSync(path, 'utf8');

// Fix the type assertion to Record<string, string>
const oldLine = `  const data = body as Record<string, unknown>;`;
const newLine = `  const data = body as Record<string, string>;`;

if (content.includes(oldLine)) {
  content = content.replace(oldLine, newLine);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('Line not found');
}