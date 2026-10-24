# Game mode selection

The approved video-inspired selector is shared by room creation and bot matches. `GameModeSelector.tsx` reads the existing `GAME_MODES` definitions and renders a full-screen native dialog. The selected illustration forms the background, with category navigation on the left, title at the upper right, configuration action at the lower right and scene thumbnails along the bottom.

`LobbyClient` owns mode and room draft state. Configuration appears above the selected scene. Returning to selection keeps the room draft; bot configuration keeps its draft while the mode remains the same. Switching a mode adjusts player counts and deck selection before configuration opens. The real game validator remains authoritative; no engine or move logic was changed.

Controls: arrow keys, Home and End navigate the focused mode strip. Escape closes contextual rules, then configuration, then selection. The selection dialog restores focus to the lobby opener. The background is inert while configuration is open. Motion honors reduced-motion preferences. Short screens can scroll the selection canvas.

CSS is scoped to `.gms-dialog`; the lobby, board game family and in-game board retain their existing styling. Configuration uses the existing room and bot components with scoped styling and a fixed footer. The common Modal accepts an optional footer and close-disabled state; other callers keep their existing layout.

## Illustration sources

`public/assets/modes/scenes/*.webp` are the 12 approved preview crops, made from existing images without ImageGen:

- normal / legacy: top illustration panels of `cards/exploding_kitten/0.png` and `3.png`.
- quick: `cards/attack/0.png`; team / minions: `cards/cat_card/2.png` and `4.png`.
- burglar: existing `modes/cat-burglar.jpg`; zombie: paw/graveyard area of `decks/zombie_kittens.png`.
- combo / rage: `decks/attacking_kittens.png`; recipes: `cards/see_the_future/0.png`.
- good-evil / curse fallback illustrations: `cards/defuse/0.png` and `cards/nope/0.png`.

Fallback scenes illustrate the mode; they do not declare which cards belong to its deck. Metadata, player limits, experimental status and setup rules come from the shared game definitions. Recipes remains limited to the existing Sticky Fingers playtest.

## Integration verification

- `npm run build`, `npm run build:server` and `npm run lint`: passed.
- All six test entrypoints (including `game-mode-selection.test.ts`) bundled with the existing esbuild dependency and run through `node --test`: 105 passed, 0 failed. The new validator integration tests cover mode changes, player-count boundaries and removal of standalone identifiers from expansion selections.
- The normal `npm test` / `server:dev` launcher encountered a Windows runtime error in tsx's call to `os.userInfo` (`uv_os_get_passwd` / ENOMEM). Verification used the same test source via esbuild/Node and started the compiled server with `npm run server`; no dependency or runner workaround was committed.
- In the running React application: created and joined a 2-player Quick Play room on the local server, then left it; entered a Quick Play bot match and started the game, with cards dealt and the bot taking its turn, then left the test match.
- Browser matrix: all 14 modes at 1280x720, 768x1024 and 390x844, with no horizontal selector overflow, lost tile focus, heading/description collision or CTA/thumbnail overlap. Verified mobile configuration footer visibility and inert background, whitespace-only room validation, retained room draft, retained bot difficulty/count when compatible, Carl's one-bot limit, Escape and focus return. The unrelated name-edit modal keeps its original layout.

The initial mobile footer check caught the old modal entrance animation briefly moving the footer below the viewport. That animation is disabled only in this configuration flow; the final mobile check passed. Screen-reader narration, actual 200% zoom, remote production deployment and full two-human gameplay were not tested in this integration.
