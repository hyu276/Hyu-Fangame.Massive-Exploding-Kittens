import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME_MODES, getGameModeDefinition, validateSetupData } from '../src/common';
import { getModeDeckSelection, getModePlayerCount } from '../src/client/components/lobby/game-mode-selection';

test('lobby mode changes produce setup accepted by the real game validator', () => {
  for (const mode of GAME_MODES.filter(item => item.availability !== 'planned')) {
    for (const previousCount of [1, 2, 3, 4, 7, 10, 12]) {
      const count = getModePlayerCount(mode, previousCount);
      const selectedDecks = getModeDeckSelection(mode, ['original', 'imploding_kittens', 'quick_play', 'zombie_carl']);
      assert.equal(validateSetupData({ gameMode: mode.id, selectedDecks }, count), undefined,
        `${mode.slug}, previous count ${previousCount}`);
    }
  }
});

test('returning from standalone setup preserves only registered expansions', () => {
  const mixed = getModeDeckSelection(getGameModeDefinition(0), ['original', 'zombie_carl', 'imploding_kittens', 'unknown']);
  assert.deepEqual(mixed, ['original', 'imploding_kittens']);
  assert.equal(validateSetupData({ gameMode: 0, selectedDecks: mixed }, 4), undefined);
  const fixed = getModeDeckSelection(getGameModeDefinition(6), mixed);
  assert.equal(validateSetupData({ gameMode: 6, selectedDecks: fixed }, 2), undefined);
  assert.deepEqual(getModeDeckSelection(getGameModeDefinition(0), fixed), ['original']);
});
