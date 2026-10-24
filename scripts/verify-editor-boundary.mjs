import { existsSync, readFileSync } from 'node:fs';

const forbidden = [
  'public/card-studio', 'public/docs/card-studio',
  'dist/card-studio', 'dist/card-studio.html',
  'dist/docs/card-studio', 'dist/docs/card-studio.html',
];
for (const path of forbidden) {
  if (existsSync(path)) throw new Error('Editor must never be included in Netlify build: ' + path);
}
const netlify = readFileSync('netlify.toml', 'utf8');
if (!/publish\s*=\s*"dist"/.test(netlify)) {
  throw new Error('Netlify publish folder must remain dist, NOT docs.');
}
if (!existsSync('docs/card-studio/index.html')) {
  throw new Error('GitHub Pages editor must remain in docs/card-studio.');
}
console.log('Verified: editor is not in the Netlify publish directory.');
