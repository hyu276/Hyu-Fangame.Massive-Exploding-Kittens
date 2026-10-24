import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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
// Catch accidental copy/rename/bundling of the editor into a game build,
// not just its original directory name. Inspect text artifacts, never images.
const studioMarkers = [
  'Card Artwork Studio',
  'MASSIVE EXPLODING KITTENS / TOOLS',
  'id="filterMissing"',
  'Fine-grained GitHub token',
  'extractRegisteredCardTypes',
];
function assertNoStudioInOutput(directory) {
  if (!existsSync(directory)) return;
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) {
      assertNoStudioInOutput(path);
    } else if (item.isFile() && /\.(?:html|js|css)$/i.test(item.name)) {
      const content = readFileSync(path, 'utf8');
      const marker = studioMarkers.find(value => content.includes(value));
      if (marker) throw new Error('GitHub Pages-only admin code found in Netlify output: ' + path +
        ' (marker: ' + marker + ')');
    }
  }
}
assertNoStudioInOutput('dist');
console.log('Verified: GitHub Pages-only Card Artwork Studio is absent from Netlify game build.');
