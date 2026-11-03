import fs from 'fs';
const path = 'D:\\ahmed-research-lab\\Bunya-Labs\\Sard\\apps\\lite\\src\\app\\install.ts';
let c = fs.readFileSync(path, 'utf8');
const oldStr = "import { hash, verify } from '@node-rs/argon2';\r\n\r\nexport { installHandler, installMiddleware };";
const newStr = "import { hash, verify } from '@node-rs/argon2';\r\nimport { SignJWT } from 'jose';\r\n\r\nexport { installHandler, installMiddleware };";
if (c.includes(oldStr)) {
  c = c.replace(oldStr, newStr);
  fs.writeFileSync(path, c, 'utf8');
  console.log('OK: jose import added');
} else {
  console.log('NOT FOUND');
  const idx = c.indexOf("import { hash, verify }");
  console.log('context:', JSON.stringify(c.slice(idx, idx + 120)));
}