const fs = require('fs');
const content = fs.readFileSync('packages/client-handoff/src/components/InteractiveGuide.tsx', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('Lines 320-335:');
for (let i = 319; i < Math.min(335, lines.length); i++) {
  console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
}