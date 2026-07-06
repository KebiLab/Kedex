import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dirs = ['dist/main', 'dist/preload', 'dist/shared'];

for (const dir of dirs) {
  const fullPath = join(root, dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
  writeFileSync(join(fullPath, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2) + '\n');
}

console.log('CJS markers written to', dirs.join(', '));
