# Exploding Kittens Codebase Guide & Agent Constitution

> **For AI Agents & Developers ("Vibecoding" Standard)**:  
> This document governs the architecture, development patterns, cache egress limits, and verification standards for the Exploding Kittens project. Any AI agent operating on this repository **MUST** adhere strictly to the rules and conventions defined herein.

---

## 🧠 1. Core Architecture & Philosophy

The project implements the complete Exploding Kittens universe (14 game modes, expansion packs, and bot AI) using **React** (client frontend), **boardgame.io** (turn-based multiplayer state engine), and **Cloudflare Workers / R2** (edge backend & static asset storage).

### 1.1 Key Directories
- **`src/common/`**: Shared game logic, state models, entity wrappers, deck configurations, and moves.
  - `src/common/entities/`: OOP wrapper classes (`TheGame`, `Player`, `Card`, `Piles`).
  - `src/common/models/`: Pure JSON-serializable TypeScript interfaces prefixed with `I` (`IGameState`, `IPlayer`, `ICard`).
  - `src/common/moves/`: Move functions wrapped with `inGame`.
  - `src/common/config/game-modes/`: Declarative configurations and rules for all 14 game modes.
- **`src/client/`**: React frontend, UI components, sound/audio triggers, image preloader, and bot worker.
  - `src/client/context/GameContext.tsx`: React context binding client UI to `TheGameClient`.
  - `src/client/bot/kitten-bot.ts`: Multi-difficulty Bot AI with MCTS and card tracking.
  - `src/client/utils/preloadImages.ts`: Egress-optimized lazy card asset preloader.
- **`src/server/`**: Server runtime for multiplayer rooms (`boardgame.io/server` + Koa), including HTTP cache middleware.
- **`cloudflare/`**: Cloudflare Workers & R2 edge proxy (`worker.ts`, `wrangler.jsonc`) with Edge Cache API integration.
- **`tests/`**: Automated Vitest test suites (110+ comprehensive unit, integration, and bot tests).

---

## 🧩 2. OOP Wrapper Pattern & State Management Rules

The codebase strictly enforces the separation between raw state (managed by `boardgame.io` and Immer) and object-oriented game logic:

### 2.1 Models vs Entities
- **Models (`src/common/models/`)**: Pure TypeScript interfaces prefixed with `I` (e.g. `ICard`, `IPlayer`, `IGameState`).
  - **Rule**: NEVER add methods, getters, setters, or business logic inside `src/common/models/`. These interfaces represent raw JSON-serializable state only.
- **Entities (`src/common/entities/`)**: Wrapper classes (e.g. `TheGame`, `Player`, `Card`, `Piles`).
  - **Rule**: When executing moves or reading/modifying state, always instantiate or access the Entity wrapper.
  - **Rule**: Mutate game state ONLY through Entity methods (e.g. `player.discard(cardId)`, `game.piles.draw()`). **Never directly mutate `IPlayer` or `ICard` object references.**

### 2.2 Moves with `inGame` Higher-Order Function
- Every game move in `src/common/moves/` must follow the signature:
  ```typescript
  import { TheGame } from "../entities/game";

  export const myMove = (game: TheGame, ...args: any[]): void => {
    // 1. Validate preconditions using entity helpers
    // 2. Perform state mutations via entity methods
    // 3. Throw or reject invalid moves cleanly without corrupting state
  };
  ```
- Register moves in `src/common/exploding-kittens.ts` using `inGame(myMove)`.

### 2.3 Deterministic Randomness
- **Rule**: **NEVER use `Math.random()` inside game moves, entities, or rules.**
- Always use `game.random` or `ctx.random` provided by `boardgame.io`. This guarantees seed reproducibility, multiplayer synchronization across clients, and deterministic replayability in tests.

### 2.4 Information Leakage Prevention (`playerView`)
- `boardgame.io` uses `playerView` to filter sensitive state before sending it over the network to clients.
- Opponent hand cards, the exact order of the draw pile, and secret reinsert positions MUST remain hidden from other players and dead spectators unless explicitly revealed by card rules (e.g., *See the Future* or *Share the Future*).

---

## ⚡ 3. Cloudflare R2 Backend & Zero-Bloat Cache Egress Policy

Because the game features hundreds of high-resolution card illustrations (~250+ cards across base games and expansions), **uncontrolled asset downloading will cause catastrophic Cache Egress bills and slow down gameplay.** All code and agent modifications MUST obey the following zero-bloat cache egress rules:

### 3.1 Strict Asset Preload Policy
- ❌ **NEVER eager-preload all card images upon app launch.** Preloading the entire asset catalog (200MB+) burns user bandwidth and explodes egress costs.
- ✅ **Core Cards Only**: Only eager-preload the 9 fundamental cards on initial app load (`preloadCoreCardImages()` in `preloadImages.ts` < 3.5MB total).
- ✅ **Lazy & Match-Specific Loading**: Load additional card textures on-demand or idle-preload match-relevant cards via `requestIdleCallback` (`preloadMatchCardImages()`).
- ✅ **Deduplication**: Use client-side Set-based memoization (`preloadedUrls`) to ensure no asset is ever requested more than once per browser session.

### 3.2 HTTP & CDN Edge Cache Headers
- **Static Assets (`/assets/*`, hashed JS/CSS, images, sounds)**:
  - Must return `Cache-Control: public, max-age=31536000, immutable`.
  - Browsers and Cloudflare Edge nodes will cache these permanently.
- **HTML Entry Point (`index.html`)**:
  - Must return `Cache-Control: public, max-age=0, must-revalidate`.
  - Ensures zero-downtime updates: clients immediately fetch new HTML pointing to new hashed chunks while retaining all cached assets.

### 3.3 Cloudflare Edge Cache API & R2 Integration
- In `cloudflare/worker.ts`, all incoming asset requests (`/assets/*`) MUST check `caches.default.match(request)` before querying the R2 bucket (`env.GAME_STORAGE`) or container.
- Put responses into `caches.default.put(request, response.clone())` with permanent caching headers.
- Always forward and respect `ETag` and `If-None-Match` headers, returning `304 Not Modified` whenever valid to prevent byte egress.

### 3.4 Vite Bundle Splitting & Budget Limits
- Game client builds must maintain chunk boundaries configured in `vite.config.ts`:
  - Third-party vendor dependencies (`react`, `react-dom`, `boardgame.io`, `immer`) are bundled into a dedicated chunk (`dist/assets/vendor-*.js`, ~328kB).
  - Game application logic lives in `dist/assets/index-*.js` (~408kB).
- **Hard Chunk Budget**: No single JavaScript chunk shall exceed `500kB`. If chunk warnings appear during `npm run build`, refactor imports or adjust `manualChunks`.
- Do not bake large static JSON files or base64 images into JavaScript bundles.

---

## 🤖 4. Vibecoding Guardrails & Repo Quality Rules

When an AI agent is requested to develop, refactor, or add new features ("vibecode"):

### 4.1 Verification Checklist (Mandatory Before Completing Tasks)
An agent **must not** declare a task complete without executing and passing these 4 validation commands:
1. **Unit Test Suite**:
   ```cmd
   cmd /c npm test
   ```
   **Requirement**: 100% of tests must pass (110/110 tests passing). Zero tolerance for regressions across bot matches, game mode configurations, and NOW-card interrupts.
2. **ESLint Code Quality**:
   ```cmd
   cmd /c npm run lint
   ```
   **Requirement**: 0 errors. Follow TypeScript and React coding standards.
3. **Client Production Build**:
   ```cmd
   cmd /c npm run build
   ```
   **Requirement**: TypeScript check (`tsc`) and Vite build must succeed with 0 errors and zero chunks exceeding 500kB.
4. **Server Production Build**:
   ```cmd
   cmd /c npm run build:server
   ```
   **Requirement**: Server TypeScript compilation (`tsc -p src/server/tsconfig.json`) must pass with 0 errors.

### 4.2 Minimalist Code & Dependency Discipline
- Avoid pulling in new heavy npm libraries for trivial tasks. Utilize standard ES2022+ features, TypeScript utilities, and `boardgame.io` built-ins.
- Keep helper functions concise, self-documenting, and localized to the appropriate module.

### 4.3 Atomic & Safe State Transitions
- Any new move or mechanic must handle edge cases cleanly:
  - If a player attempts an illegal move (e.g. playing out of turn without a NOW card), reject or throw an error before any deck or player state is altered.
  - Prevent state desynchronization between player hands, draw pile, and discard pile.

---

## 🃏 5. Game Mechanics & Feature Reference

### 5.1 Game Mode Registry (Modes 0 to 13)
All modes are declaratively registered in `src/common/config/game-modes/`:
| Mode ID | Name | Core Mechanic / Special Rules |
| :--- | :--- | :--- |
| `0` | **Classic Exploding Kittens** | Standard 2-5 players, 1 bomb fewer than players, 1 defuse per player. |
| `1` | **Quick Play (2P Duel)** | Strictly 2 players, 16 cards in draw pile, exactly 2 bombs, high tension. |
| `2` | **Combo (Liên hoàn)** | Multiplier cards boost effects (e.g. 2x Attack, stacked draws). |
| `3` | **Team-Up** | Players divided into teams; team wins when opposing team is eliminated. |
| `4` | **Cat Burglar** | Cat Burglar figurine starts next to player 0; steals named Cat Cards. |
| `5` | **Zombie Standalone** | Dead players remain in game as undead; Zombie Kittens resurrect players. |
| `6` | **Zombie Carl** | Special Carl zombie rules with tailored draw deck. |
| `7` | **Zombie Apocalypse** | Large-scale zombie mode with expanded deck sizes and undead mechanics. |
| `8` | **Recipes for Disaster** | Custom recipe decks (e.g. *Sticky Fingers*, *Lightning Fast*). |
| `9` | **Good vs Evil** | Playmat featuring Godcat vs Devilcat duel mechanics. |
| `10` | **Rage Mode** | Rage Cat figurine and Booby Traps placed into player hands. |
| `11` | **Curse You!** | Progressive unlockable deck system starting with the 54-card base pool. |
| `12` | **10th Anniversary Legacy** | Special anniversary edition including 8 legacy bonus cards. |
| `13` | **Exploding Minions** | Minions standalone rules, Gru Tech subsets, and Minion Defuse. |

### 5.2 Fast-Reaction & "NOW" Cards Mechanic
- Cards flagged with `isNow` (e.g. *Shuffle NOW*, *Alter the Future NOW*, *Zombie Kitten*):
  - Can be played **at any time**, including outside of the player's active turn.
  - The engine verifies `isNowCard(card)` or `isZombieKitten(card)` before permitting off-turn moves.
  - Does not corrupt turn order or active attack debt unless specifically stated by card rules.

### 5.3 Bot AI Architecture
Located in `src/client/bot/kitten-bot.ts`:
- **5 Difficulty Levels**: `easy`, `medium`, `hard`, `hell`, `asia`.
- **Card Counting & Hand Tracking**: Tracks known cards, defuse probability, and opponent threat levels (`HandTracker`).
- **Monte Carlo Tree Search (MCTS)**: Evaluates prospective plays through probabilistic rollouts (`MCTSEvaluator`) to decide whether to attack, defuse, hold, or draw.

---

## 🛠️ 6. Developer & Agent Workflows

### 6.1 Running the Project Locally
Running the project requires two concurrent processes:
1. **Game Server**: `cmd /c npm run server:dev` (runs on `http://localhost:51399`)
2. **Client Dev Server**: `cmd /c npm run dev` (runs on `http://localhost:5173`)

### 6.2 Cloudflare R2 & Worker Development
- **Local Worker Dev**: `npx wrangler dev`
- **Deploy Edge Worker**: `npx wrangler deploy`
- Bucket binding name: `GAME_STORAGE` (mapped to `exploding-kittens-storage`).

---

*This guide is the single source of truth for repository architecture, cache optimization, and code quality. Always uphold these standards when developing.*
