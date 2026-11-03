const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/install.ts';

let content = fs.readFileSync(path, 'utf8');

// Replace the validateInstallRequest function with a properly typed version
const oldFunc = `function validateInstallRequest(body: unknown): InstallRequest {
  const data = body as Record<string, string>;
  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || typeof data[field] !== 'string') {
      throw new Error(\`Missing required field: \${field}\`);
    }
  }
  if (data.adminPassword.length < 12) throw new Error('Admin password must be at least 12 characters');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.adminEmail)) throw new Error('Invalid admin email');
  if (!['ar', 'en'].includes(data.locale)) throw new Error('Locale must be ar or en');
  return data as InstallRequest;
}`;

const newFunc = `function validateInstallRequest(body: unknown): InstallRequest {
  const data = body as Record<string, string | undefined>;
  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || typeof data[field] !== 'string') {
      throw new Error(\`Missing required field: \${field}\`);
    }
  }
  const adminPassword = data.adminPassword as string;
  const adminEmail = data.adminEmail as string;
  const locale = data.locale as string;
  if (adminPassword.length < 12) throw new Error('Admin password must be at least 12 characters');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) throw new Error('Invalid admin email');
  if (!['ar', 'en'].includes(locale)) throw new Error('Locale must be ar or en');
  return data as InstallRequest;
}`;

if (content.includes(oldFunc)) {
  content = content.replace(oldFunc, newFunc);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('Function not found - checking current state');
  // Print the function area
  const lines = content.split('\n');
  for (let i = 30; i < 43 && i < lines.length; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}