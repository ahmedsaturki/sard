const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/install.ts';

let content = fs.readFileSync(path, 'utf8');

const oldLine = `  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.adminEmail)) throw new Error('Invalid admin email');`;
const newLine = `  const adminEmail = data.adminEmail as string;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) throw new Error('Invalid admin email');`;

if (content.includes(oldLine)) {
  content = content.replace(oldLine, newLine);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('adminEmail line not found');
}