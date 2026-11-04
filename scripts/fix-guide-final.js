const fs = require('fs');
let content = fs.readFileSync('packages/client-handoff/src/components/InteractiveGuide.tsx', 'utf8');
const lines = content.split('\n');

// Show current state
console.log('Current state (lines 325-332):');
for (let i = 324; i < Math.min(332, lines.length); i++) {
  console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
}

// The issue: line 327 (index 326) has `</Paper>` but it should just be removed
// The correct structure:
// - Line 307: </Paper> closes the main Paper
// - Lines 309-326: Tooltip (floating button) - inside Box, outside Paper
// - Line 327: </Paper> - THIS IS WRONG, needs to be removed
// - Line 328: </Box> - closes the Box

const fixedLines = lines.slice(0, 327); // Keep lines 0-326 (before the wrong </Paper>)
// Don't add the wrong </Paper>, just close with </Box>
fixedLines.push('  </Box>');
fixedLines.push(');');
fixedLines.push('};');
fixedLines.push('');
fixedLines.push('export default InteractiveGuide;');

console.log('\nFixed state:');
console.log('Total lines:', fixedLines.length);
for (let i = 324; i < fixedLines.length; i++) {
  console.log(`${i+1}: ${JSON.stringify(fixedLines[i])}`);
}

fs.writeFileSync('packages/client-handoff/src/components/InteractiveGuide.tsx', fixedLines.join('\n'), 'utf8');
console.log('\nFile fixed!');