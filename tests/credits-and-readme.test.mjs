import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = name => readFileSync(name, 'utf8');

test('lobby header avoids unsupported 900-weight Oswald and preserves Vietnamese typography', () => {
  const css = read('src/client/components/lobby/LobbyStyles.css');
  const start = css.indexOf('.lobby-title {');
  const end = css.indexOf('.lobby-subtitle {', start);
  const title = css.slice(start, end);
  assert.match(title, /Be Vietnam Pro/);
  assert.doesNotMatch(title, /Oswald|background-clip|drop-shadow/);
  assert.match(title, /line-height:\s*1\.28/);
  assert.match(css, /\.lobby-container \.lobby-top-bar \.btn/);
});

test('credits can be opened from both card and board lobbies', () => {
  const card = read('src/client/components/lobby/LobbyFooter.tsx');
  const board = read('src/client/components/board-game/BoardLobby.tsx');
  const credits = read('src/client/components/credits/CreditsButton.tsx');
  assert.match(card, /<CreditsButton\s*\/>/);
  assert.match(board, /<CreditsButton appearance="board"\s*\/>/);
  assert.match(credits, /<dialog/);
  assert.match(credits, /aria-labelledby/);
  assert.match(credits, /onClose/);
  assert.match(credits, /showModal\(\)/);
  assert.match(credits, /Đóng Credits/);
});

test('credits distinguish Hyu and upstream authors and retain the actual MIT license notice', () => {
  const credits = read('src/client/components/credits/CreditsButton.tsx');
  const license = read('LICENSE');
  assert.match(credits, /Hyu/);
  assert.match(credits, /hyu276/);
  assert.match(credits, /DomiIRL\/exploding-kittens/);
  assert.match(credits, /MIT License/);
  assert.match(credits, /Copyright © 2025 Dominik/);
  assert.match(credits, /phi thương mại/);
  assert.match(license, /MIT License/);
  assert.match(license, /Copyright \(c\) 2025 Dominik/);
});

test('README begins with the playable site, not a technical badges catalogue', () => {
  const readme = read('README.md');
  const firstSection = readme.slice(0, 360);
  assert.match(firstSection, /https:\/\/massiveexplodingkittens\.netlify\.app\//);
  assert.doesNotMatch(firstSection, /shields\.io|Docker|Node\.js/);
  assert.match(readme, /DomiIRL\/exploding-kittens/);
  assert.match(readme, /Hyu/);
  assert.match(readme, /MIT License/);
  assert.doesNotMatch(readme, /your-username/);
});

test('GitHub Pages-only editor hosting boundary remains intact', () => {
  const agents = read('AGENTS.md');
  const netlify = read('netlify.toml');
  const guard = read('scripts/verify-editor-boundary.mjs');
  assert.match(agents, /GitHub Pages ONLY/);
  assert.match(agents, /Never deploy the Card Artwork Studio UI to Netlify/);
  assert.match(netlify, /publish\s*=\s*"dist"/);
  assert.match(guard, /assertNoStudioInOutput\('dist'\)/);
});
