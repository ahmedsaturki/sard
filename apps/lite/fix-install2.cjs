const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/install.ts';

let content = fs.readFileSync(path, 'utf8');

// Add non-null assertions after the REQUIRED_FIELDS check
// Change data.adminPassword.length to data.adminPassword!.length
const oldCheck1 = `if (data.adminPassword.length < 12) throw new Error('Admin password must be at least 12 characters');`;
const newCheck1 = `if (data.adminPassword!.length < 12) throw new Error('Admin password must be at least 12 characters');`;

if (content.includes(oldCheck1)) {
  content = content.replace(oldCheck1, newCheck1);
  console.log('Fixed adminPassword check');
} else {
  console.log('adminPassword check not found');
}

// Change data.adminEmail to data.adminEmail!
const oldCheck2 = `!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.adminEmail)) throw new Error('Invalid admin email');`;
const newCheck2 = `!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.adminEmail!) throw new Error('Invalid admin email');`;

if (content.includes(oldCheck2)) {
  content = content.replace(oldCheck2, newCheck2);
  console.log('Fixed adminEmail check');
} else {
  console.log('adminEmail check not found');
}

// Change data.locale to data.locale!
const oldCheck3 = `!['ar', 'en'].includes(data.locale)) throw new Error('Locale must be ar or en');`;
const newCheck3 = `!['ar', 'en'].includes(data.locale!)) throw new Error('Locale must be ar or en');`;

if (content.includes(oldCheck3)) {
  content = content.replace(oldCheck3, newCheck3);
  console.log('Fixed locale check');
} else {
  console.log('locale check not found');
}

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS');