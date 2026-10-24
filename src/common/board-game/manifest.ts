/** Digital playtest inventory. The two supplied instruction PDFs verify totals, not subtype counts. */
export type BoardEdition = 'classic' | 'super_fan';

export const BOARD_GAME_NAME = 'Exploding-Kittens-Board-Game';

export const CLASSIC_ACTION_COUNTS = {
  expose_1: 2, expose_3: 2, alter_2_now: 2, swap_top_bottom_now: 2,
  add_magnet_now: 4, flip_now: 2, shuffle_now: 2, nope_now: 4,
  skip_draw_3: 3, draw_to_five: 3, defuse: 6, draw_bottom: 3,
  mega_move: 3, fast_pass: 2, slow_steady: 3, one_small_step: 3,
  ditto: 3, cat_taco: 5, cat_beard: 5, cat_rainbow: 5,
} as const;

export const SUPER_FAN_EXTRA_COUNTS = { charity_case: 4, feral_cat: 4 } as const;

export type ClassicActionKind = keyof typeof CLASSIC_ACTION_COUNTS;
export type ActionKind = ClassicActionKind | keyof typeof SUPER_FAN_EXTRA_COUNTS;

export const MOVE_KINDS = [
  'move_1', 'move_2', 'move_3', 'move_4', 'move_5',
  'move_1_or_flip', 'move_3_or_flip', 'move_5_or_flip',
  'flip_then_move_2', 'flip_then_move_4', 'cut_the_line',
] as const;
export type MoveKind = typeof MOVE_KINDS[number] | 'danger_magnet';

export const BOARD_MANIFEST = {
  classic: {
    status: 'unverified_manifest', actionTotal: 64, moveTotal: 21,
    dangerMagnetReserve: 10, characterTotal: 6,
    rulesSource: 'EKBoardGame_FieldGuide_21NOV2024_Web-compressed_1.pdf',
  },
  super_fan: {
    status: 'unverified_manifest', actionTotal: 72, moveTotal: 21,
    dangerMagnetReserve: 10, characterTotal: 6,
    rulesSource: 'EKG-BG-MORE_Instructions_23JUNE2025_Web.pdf',
  },
} as const;

export const ACTION_LABELS: Record<ActionKind, string> = {
  expose_1: 'Expose the Future 1×', expose_3: 'Expose the Future 3×',
  alter_2_now: 'Alter the Future 2× NOW', swap_top_bottom_now: 'Swap Top and Bottom NOW',
  add_magnet_now: 'Add a Magnet NOW', flip_now: 'Flip NOW', shuffle_now: 'Shuffle NOW',
  nope_now: 'Nope NOW', skip_draw_3: 'Skip and Draw 3', draw_to_five: 'Draw to Five',
  defuse: 'Defuse', draw_bottom: 'Draw from the Bottom', mega_move: 'Mega Move',
  fast_pass: 'Fast Pass', slow_steady: 'Slow and Steady', one_small_step: '1 Small Step',
  ditto: 'Ditto', cat_taco: 'Tacocat', cat_beard: 'Beard Cat',
  cat_rainbow: 'Rainbow-Ralphing Cat', charity_case: 'Charity Case', feral_cat: 'Feral Cat',
};

export const NOW_ACTIONS = new Set<ActionKind>([
  'alter_2_now', 'swap_top_bottom_now', 'add_magnet_now',
  'flip_now', 'shuffle_now', 'nope_now',
]);

export const REPLACEMENT_ACTIONS = new Set<ActionKind>([
  'skip_draw_3', 'draw_bottom', 'mega_move', 'fast_pass',
  'slow_steady', 'one_small_step', 'ditto',
]);

export function actionInventory(edition: BoardEdition): ActionKind[] {
  const counts: Partial<Record<ActionKind, number>> = {
    ...CLASSIC_ACTION_COUNTS,
    ...(edition === 'super_fan' ? SUPER_FAN_EXTRA_COUNTS : {}),
  };
  const result = Object.entries(counts).flatMap(([kind, count]) =>
    Array.from({ length: count }, () => kind as ActionKind));
  if (result.length !== BOARD_MANIFEST[edition].actionTotal) {
    throw new Error(`Invalid experimental ${edition} action inventory: ${result.length}`);
  }
  return result;
}
