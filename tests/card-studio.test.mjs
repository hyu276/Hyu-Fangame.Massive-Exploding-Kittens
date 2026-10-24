import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  distributeByCounts, distributeEvenly, expandArtworkSlots, summarizeChanges, buildArtworkRestoreEntries, validFilename, validType,
  extractRegisteredCardTypes, buildArtworkCatalog, filterArtworkCatalog,
  validateSlots, validateImageBytes, validateManifest
} from '../docs/card-studio/core.mjs';

test('manual distribution of four paintings across six physical art positions', () => {
  const slots = distributeByCounts({ 'a.png': 2, 'b.png': 2, 'c.png': 1, 'd.png': 1 }, 6);
  assert.equal(slots.length, 6);
  assert.deepEqual(slots, ['a.png', 'a.png', 'b.png', 'b.png', 'c.png', 'd.png']);
  assert.equal(validateSlots(slots, ['a.png', 'b.png', 'c.png', 'd.png']), true);
});

test('random allocation keeps every one of the four images, with balanced repeats', () => {
  const imgs = ['a.png', 'b.png', 'c.png', 'd.png'];
  const result = distributeEvenly(imgs, 6, () => .5);
  assert.equal(result.length, 6);
  const amounts = imgs.map(name => result.filter(x => x === name).length).sort();
  assert.deepEqual(amounts, [1, 1, 2, 2]);
});

test('frequency validation catches invalid sums and noninteger weights', () => {
  assert.throws(() => distributeByCounts({ 'a.png': 2, 'b.png': 3 }, 6), /Tổng/);
  assert.throws(() => distributeByCounts({ 'a.png': 2.5, 'b.png': 3.5 }, 6), /không hợp lệ/);
  assert.throws(() => distributeByCounts({ 'a.png': -1, 'b.png': 7 }, 6), /không hợp lệ/);
});

test('reject traversal and unsupported extension in all art paths', () => {
  assert.equal(validType('attack'), true);
  assert.equal(validType('../private'), false);
  assert.equal(validFilename('cover-05.webp'), true);
  assert.equal(validFilename('../data.png'), false);
  assert.equal(validFilename('exploit.svg'), false);
  assert.throws(() => validateSlots(['notfound.png'], ['valid.png']), /không tồn tại/);
});

test('accept PNG header only when the declared filename matches', () => {
  const png = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0]);
  assert.equal(validateImageBytes(png, 'card.png'), true);
  assert.equal(validateImageBytes(png, 'card.jpg'), false);
  assert.equal(validateImageBytes(png, 'card.svg'), false);
});

test('validate manifest structure and cache-busting revisions', () => {
  assert.doesNotThrow(() => validateManifest({ schemaVersion: 1, cards: {
    attack: { slots: ['a.png','b.webp'], revision: 'mh51ab-9fa3a55e' }
  } }));
  assert.throws(() => validateManifest({ schemaVersion: 1, cards: {
    attack: { slots: ['../bad.png'], revision: 'safe' }
  } }));
});

test('the physical-copy preview repeats the configured six-position cycle without missing images', () => {
  const slots = ['a.png', 'a.png', 'b.png', 'b.png', 'c.png', 'd.png'];
  assert.deepEqual(expandArtworkSlots(slots, 6), slots);
  const actual = expandArtworkSlots(slots, 10);
  assert.equal(actual.length, 10);
  assert.deepEqual(actual.slice(6), slots.slice(0, 4));
  assert.throws(() => expandArtworkSlots(slots, 0), /không hợp lệ/);
});

test('pre-commit review identifies added, changed, removed assets and allocation updates', () => {
  const old = new Map([['attack', [
    { name: 'a.png', sha: 'sha-a' }, { name: 'b.png', sha: 'sha-b' },
  ]]]);
  const next = new Map([['attack', [
    { name: 'a.png', sha: 'sha-a', bytes: new Uint8Array([1]) },
    { name: 'c.webp', bytes: new Uint8Array([2]) },
  ]]]);
  const changed = summarizeChanges(old, next, new Set(['attack']));
  assert.deepEqual(changed.map(item => item.kind).sort(), ['add', 'delete', 'mapping', 'replace']);
});

test('restore commit can only replace card artwork blobs and the manifest', () => {
  const old = new Map([
    ['public/assets/cards/attack/a.png', 'a'.repeat(40)],
    ['public/assets/cards/attack/b.webp', 'b'.repeat(40)],
  ]);
  const historical = new Map([
    ['public/assets/cards/attack/a.png', 'c'.repeat(40)],
    ['public/assets/cards/attack/c.jpg', 'd'.repeat(40)],
  ]);
  const entries = buildArtworkRestoreEntries(old, historical, 'e'.repeat(40));
  assert.equal(entries.length, 4);
  assert.deepEqual(entries.map(e => e.path).sort(), [
    'public/assets/cards/attack/a.png',
    'public/assets/cards/attack/b.webp',
    'public/assets/cards/attack/c.jpg',
    'src/client/data/card-artwork-map.json',
  ]);
  assert.equal(entries.find(e => e.path.endsWith('/b.webp')).sha, null);
  assert.throws(() => buildArtworkRestoreEntries(old, new Map([
    ['public/other/index.html', 'f'.repeat(40)],
  ]), 'e'.repeat(40)), /không hợp lệ/);
});

test('registry discovery finds playable types without any asset directory', () => {
  const constants = readFileSync('src/common/constants/cards.ts', 'utf8');
  const registry = readFileSync('src/common/registries/card-registry.ts', 'utf8');
  const names = extractRegisteredCardTypes(constants, registry);
  assert.ok(names.length >= 80, 'expect all playable variants from the registry');
  assert.ok(names.includes('godcat'));
  assert.ok(names.includes('attack'));
  assert.ok(names.includes('slap_3x'));
  assert.equal(new Set(names).size, names.length);
  assert.throws(() => extractRegisteredCardTypes(constants, 'unregistered source'), /registry/);
});

test('missing artwork filter includes registered types with no folder and works with search', () => {
  const names = extractRegisteredCardTypes(
    readFileSync('src/common/constants/cards.ts', 'utf8'),
    readFileSync('src/common/registries/card-registry.ts', 'utf8')
  );
  const working = new Map();
  for (const type of readdirSync('public/assets/cards')) {
    const dir = join('public/assets/cards', type);
    if (!validType(type)) continue;
    const images = readdirSync(dir, { withFileTypes: true })
      .filter(file => file.isFile() && validFilename(file.name))
      .map(file => ({ name: file.name }));
    if (images.length) working.set(type, images);
  }
  const catalog = buildArtworkCatalog(names, working);
  const missing = filterArtworkCatalog(catalog, '', 'missing');
  assert.ok(missing.length > 0);
  assert.ok(missing.some(x => x.name === 'godcat' && x.count === 0));
  assert.ok(!missing.some(x => x.name === 'attack'));
  assert.equal(filterArtworkCatalog(catalog, 'GODCAT', 'missing').length, 1);
  assert.ok(filterArtworkCatalog(catalog, '', 'available').some(x => x.name === 'attack'));
  assert.equal(missing.every(x => x.missing), true);
  assert.equal(filterArtworkCatalog(catalog, '', 'all').length, catalog.length);
});

test('catalog treats mapping to deleted artwork as missing, and supports brand-new category uploads', () => {
  const working = new Map([['custom_card', []], ['attack', [{ name: '0.png' }]]]);
  const catalog = buildArtworkCatalog(['attack', 'custom_card'], working, {
    cards: { attack: { slots: ['missing.png'] } }
  });
  assert.equal(catalog.find(x => x.name === 'attack').missing, true);
  assert.equal(catalog.find(x => x.name === 'custom_card').missing, true);
  working.get('custom_card').push({ name: 'first.webp' });
  const afterUpload = buildArtworkCatalog(['attack', 'custom_card'], working);
  assert.equal(afterUpload.find(x => x.name === 'custom_card').missing, false);
});

test('admin typography covers Vietnamese labels without Impact glyph fallback', () => {
  const css = readFileSync('docs/card-studio/studio.css', 'utf8');
  const html = readFileSync('docs/card-studio/index.html', 'utf8');
  assert.ok(!/\bImpact\b/.test(css));
  assert.match(css, /Be Vietnam Pro/);
  assert.match(html, /fonts.googleapis.com/);
  assert.match(html, /fonts.gstatic.com/);
  assert.match(html, /id="filterMissing"/);
  assert.ok(existsSync('docs/.nojekyll'));
});
