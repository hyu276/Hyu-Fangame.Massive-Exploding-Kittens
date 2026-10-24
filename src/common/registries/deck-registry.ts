import {Registry} from './registry';
import {DeckType} from '../entities/deck-type';
import {OriginalDeck} from '../entities/deck-types/original-deck';
import {ImplodingKittensDeck} from '../entities/deck-types/imploding-kittens-deck';
import {StreakingKittensDeck} from '../entities/deck-types/streaking-kittens-deck';
import {BarkingKittensDeck} from '../entities/deck-types/barking-kittens-deck';
import {ZombieKittensDeck} from '../entities/deck-types/zombie-kittens-deck';
import {AggroKittensDeck} from '../entities/deck-types/aggro-kittens-deck';
import {AttackingKittensDeck} from '../entities/deck-types/attacking-kittens-deck';
import {DefendingKittensDeck} from '../entities/deck-types/defending-kittens-deck';
import {CreepyKittensDeck} from '../entities/deck-types/creepy-kittens-deck';
import {TimebombKittensDeck} from '../entities/deck-types/timebomb-kittens-deck';

// Registry quản lý các loại bộ bài
export const deckRegistry = new Registry<DeckType>();

// Đăng ký bộ bài tiêu chuẩn và các bộ bài mở rộng
export const ORIGINAL = register(new OriginalDeck());
export const IMPLODING_KITTENS = register(new ImplodingKittensDeck());
export const STREAKING_KITTENS = register(new StreakingKittensDeck());
export const BARKING_KITTENS = register(new BarkingKittensDeck());
export const ZOMBIE_KITTENS = register(new ZombieKittensDeck());
export const AGGRO_KITTENS = register(new AggroKittensDeck());
export const ATTACKING_KITTENS = register(new AttackingKittensDeck());
export const DEFENDING_KITTENS = register(new DefendingKittensDeck());
export const CREEPY_KITTENS = register(new CreepyKittensDeck());
export const TIMEBOMB_KITTENS = register(new TimebombKittensDeck());

function register(deck: DeckType): DeckType {
  return deckRegistry.register(deck);
}
