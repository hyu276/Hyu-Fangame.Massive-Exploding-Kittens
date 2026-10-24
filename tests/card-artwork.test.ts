import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveArtworkTexture } from '../src/client/utils/card-artwork-map';

const config = { cards: { attack: {
  slots: ['a.png', 'a.png', 'b.png', 'b.png', 'c.webp', 'd.jpg'],
  revision: 'art-123'
} } };

test('six visual slots map four paintings with independent gameplay index', () => {
  const urls = Array.from({ length: 6 }, (_, artworkSlot) =>
    resolveArtworkTexture({ name: 'attack', index: 0, artworkSlot }, config));
  assert.deepEqual(urls.map(url => url?.split('/').at(-1)?.split('?')[0]), [
    'a.png', 'a.png', 'b.png', 'b.png', 'c.webp', 'd.jpg'
  ]);
  assert.ok(urls.every(url => url?.endsWith('?v=art-123')));
});

test('art slot repeats cyclically and legacy art remains unchanged without manifest', () => {
  assert.equal(resolveArtworkTexture({ name: 'attack', index: 3, artworkSlot: 7 }, config),
    '/assets/cards/attack/a.png?v=art-123');
  assert.equal(resolveArtworkTexture({ name: 'nope', index: 3 }, config), null);
});

test('reject malformed manifest names or visual slots', () => {
  assert.equal(resolveArtworkTexture({ name: 'attack', index: -1 }, config), null);
  assert.equal(resolveArtworkTexture({ name: '../attack', index: 0 }, config), null);
  assert.equal(resolveArtworkTexture({ name: 'attack', index: 0 },
    { cards: { attack: { slots: ['../bad.png'], revision: 'ok' } } }), null);
});
