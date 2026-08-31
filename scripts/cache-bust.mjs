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
const updated = html.replace(/(src|href)=["']([^"']+\.(?:js|css))["']/g, (match, attr, url) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${attr}="${url}${separator}v=${version}"`;
});

fs.writeFileSync(htmlPath, updated);
console.log(`Versioned asset query cache-bust for index.html with version ${version}`);
