const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/install.ts';

let content = fs.readFileSync(path, 'utf8');

// Replace the function body
const oldLine1 = `  const data = body as Record<string, string>;`;
const newLine1 = `  const data = body as Record<string, string | undefined>;`;

if (content.includes(oldLine1)) {
  content = content.replace(oldLine1, newLine1);
  console.log('Fixed data type');
} else {
  console.log('data type line not found');
}

const oldLine2 = `  if (data.adminPassword.length < 12) throw new Error('Admin password must be at least 12 characters');`;
const newLine2 = `  const adminPassword = data.adminPassword as string;
  if (adminPassword.length < 12) throw new Error('Admin password must be at least 12 characters');`;

if (content.includes(oldLine2)) {
  content = content.replace(oldLine2, newLine2);
  console.log('Fixed adminPassword');
} else {
  console.log('adminPassword line not found');
}

const oldLine3 = `  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.adminEmail)) throw new Error('Invalid admin email');`;
const newLine3 = `  const adminEmail = data.adminEmail as string;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) throw new Error('Invalid admin email');`;

if (content.includes(oldLine3)) {
  content = content.replace(oldLine3, newLine3);
  console.log('Fixed adminEmail');
} else {
  console.log('adminEmail line not found');
}

const oldLine4 = `  if (!['ar', 'en'].includes(data.locale)) throw new Error('Locale must be ar or en');`;
const newLine4 = `  const locale = data.locale as string;
  if (!['ar', 'en'].includes(locale)) throw new Error('Locale must be ar or en');`;

if (content.includes(oldLine4)) {
  content = content.replace(oldLine4, newLine4);
  console.log('Fixed locale');
} else {
  console.log('locale line not found');
}

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS');