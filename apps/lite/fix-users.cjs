const fs = require('fs');
const f = 'src/collections/users.ts';
let c = fs.readFileSync(f, 'utf8');

console.log('BEFORE len:', c.length);
console.log('BEFORE sameSite:', c.includes("sameSite: 'strict'"));
console.log('BEFORE SARD_COOKIE_DOMAIN:', c.includes('process.env.SARD_COOKIE_DOMAIN'));
console.log('BEFORE user?.role:', c.includes('user?.role'));

// Replace sameSite: 'strict' with sameSite: 'Strict'
c = c.replace(/sameSite: 'strict'/g, "sameSite: 'Strict'");

// Replace process.env.SARD_COOKIE_DOMAIN with process.env['SARD_COOKIE_DOMAIN']
c = c.replace(/process\.env\.SARD_COOKIE_DOMAIN/g, "process.env['SARD_COOKIE_DOMAIN']");

// Replace user?.role with user?.['role']
c = c.replace(/user\?\.role/g, "user?.['role']");

// Replace user?.id with user?.['id']
c = c.replace(/user\?\.id/g, "user?.['id']");

fs.writeFileSync(f, c, 'utf8');

// Verify
const verify = fs.readFileSync(f, 'utf8');
console.log('AFTER len:', verify.length);
console.log('AFTER sameSite:', verify.includes("sameSite: 'strict'"));
console.log('AFTER SARD_COOKIE_DOMAIN:', verify.includes('process.env.SARD_COOKIE_DOMAIN'));
console.log('AFTER user?.role:', verify.includes('user?.role'));
console.log('AFTER user?.[role]:', verify.includes("user?.['role']"));
console.log('DONE');