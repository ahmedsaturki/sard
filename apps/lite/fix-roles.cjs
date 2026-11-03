const fs = require('fs');
const files = [
  'src/collections/categories.ts',
  'src/collections/forms.ts',
  'src/collections/media.ts',
  'src/collections/pages.ts',
  'src/collections/posts.ts',
  'src/collections/tags.ts',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  const before = c;
  c = c.replace(/user\?\.role/g, "user?.['role']");
  if (c !== before) {
    fs.writeFileSync(f, c, 'utf8');
    console.log('updated', f);
  } else {
    console.log('no change', f);
  }
}