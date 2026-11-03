const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/install.ts';

let content = fs.readFileSync(path, 'utf8');

// Fix argon2 option: 'type' -> 'algorithm'
content = content.replace(
  `type: 2,`,
  `algorithm: 2,`
);

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS');