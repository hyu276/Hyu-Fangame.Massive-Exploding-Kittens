import test from 'node:test';
import assert from 'node:assert/strict';
import {
  distributeByCounts, distributeEvenly, validFilename, validType,
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
