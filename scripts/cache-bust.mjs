import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.log('No dist/index.html found; skipping cache busting.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const version = Date.now().toString(36);
const updated = html.replace(/(assets\/[^"']+?\.(?:js|css))(?=["'])/g, (match) => {
  const ext = path.extname(match);
  const base = match.replace(new RegExp(`${ext}$`), '');
  return `${base}-${version}${ext}`;
});

fs.writeFileSync(htmlPath, updated);
console.log(`Cache-busted index.html with version ${version}`);
