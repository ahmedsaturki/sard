const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/install.ts';

let content = fs.readFileSync(path, 'utf8');

// Fix the return cast to go through unknown
content = content.replace(
  `return data as InstallRequest;`,
  `return data as unknown as InstallRequest;`
);

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS');