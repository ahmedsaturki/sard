const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/install.ts';

let content = fs.readFileSync(path, 'utf8');

// Fix bracket notation for index signature access
content = content.replace(
  `const adminPassword = data.adminPassword as string;`,
  `const adminPassword = data['adminPassword'] as string;`
);
content = content.replace(
  `const adminEmail = data.adminEmail as string;`,
  `const adminEmail = data['adminEmail'] as string;`
);
content = content.replace(
  `const locale = data.locale as string;`,
  `const locale = data['locale'] as string;`
);

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS');