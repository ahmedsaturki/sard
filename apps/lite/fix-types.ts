import fs from 'fs';

const base = 'D:/ahmed-research-lab/Bunya-Labs/Sard/apps/lite';

// Fix globals/index.ts - add type annotation for user parameter
const globalsPath = `${base}/src/globals/index.ts`;
let globals = fs.readFileSync(globalsPath, 'utf8');
globals = globals.replace(/update: \(\{ req: \{ user \} \}\) => user\?/g, 'update: ({ req: { user } }: any) => user?.');
fs.writeFileSync(globalsPath, globals, 'utf8');
console.log('globals/index.ts fixed');

// Fix posts.ts - additional bracket notation fixes
const postsPath = `${base}/src/collections/posts.ts`;
let posts = fs.readFileSync(postsPath, 'utf8');
posts = posts.replace(/data\.status === 'published'/g, "data['status'] === 'published'");
posts = posts.replace(/data\.title\s*$/gm, "data['title']");
fs.writeFileSync(postsPath, posts, 'utf8');
console.log('posts.ts fixed');

// Fix users.ts - remove httpOnly property
const usersPath = `${base}/src/collections/users.ts`;
let users = fs.readFileSync(usersPath, 'utf8');
users = users.replace(/^\s+httpOnly: true,\r?\n/, '');
fs.writeFileSync(usersPath, users, 'utf8');
console.log('users.ts fixed');

// Fix server.ts - ensure config is awaited properly
const serverPath = `${base}/src/app/server.ts`;
let server = fs.readFileSync(serverPath, 'utf8');
server = server.replace('const payload = await getPayload({ config: await config });', 'const resolvedConfig = await config;\n  const payload = await getPayload({ config: resolvedConfig });');
server = server.replace('process.env.PORT', 'process.env["PORT"]');
server = server.replace('process.env.HOST', 'process.env["HOST"]');
fs.writeFileSync(serverPath, server, 'utf8');
console.log('server.ts fixed');

console.log('All TypeScript fixes applied!');
