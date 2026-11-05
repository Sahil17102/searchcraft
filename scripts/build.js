const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const publicEntries = [
  'index.html',
  'admin',
  'assets',
  'contact',
  'login',
  'panel',
  'pricing',
  'resources',
  'signup',
  'solutions',
  'support'
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const entry of publicEntries) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) throw new Error(`Missing public entry: ${entry}`);
  fs.cpSync(source, path.join(output, entry), { recursive: true });
}

console.log(`SearchCraft static site ready in dist (${publicEntries.length} entries)`);
