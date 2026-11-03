const fs = require('fs');
const path = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite/src/app/api/auth/two-factor/setup/service.ts';

let content = fs.readFileSync(path, 'utf8');

// Use CRLF line endings in the replacement strings to match the file
const oldStr = '  const secret = totp.secret;\r\n  /* @ts-ignore - typings differ */\r\n  const uri = totp.provisioningUri(userEmail, { issuer: \'Sard Lite\' });';
const newStr = '  const secret = totp.generateSecret();\r\n  /* @ts-ignore - typings differ */\r\n  const uri = totp.provisioningUri(userEmail, { issuer: \'Sard Lite\', secret });';

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS: Replaced totp.secret with totp.generateSecret()');
} else {
  console.log('NOT FOUND');
}