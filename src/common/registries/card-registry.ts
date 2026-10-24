import {CardType} from '../entities/card-type';
import {DefuseCard} from '../entities/card-types/defuse-card';
import {CatCard} from '../entities/card-types/cat-card';
import {ExplodingKittenCard} from '../entities/card-types/exploding-kitten-card';
import {SkipCard} from "../entities/card-types/skip-card";
import {ShuffleCard} from "../entities/card-types/shuffle-card";
import {Registry} from "./registry";
import {AttackCard} from "../entities/card-types/attack-card";
import {NopeCard} from "../entities/card-types/nope-card";
import {SeeTheFutureCard} from "../entities/card-types/see-the-future-card";
import {FavorCard} from "../entities/card-types/favor-card";
import {ReverseCard} from "../entities/card-types/reverse-card";
import {DrawFromTheBottomCard} from "../entities/card-types/draw-from-the-bottom-card";
import {AlterTheFutureCard} from "../entities/card-types/alter-the-future-card";
import {FeralCatCard} from "../entities/card-types/feral-cat-card";
import {TargetedAttackCard} from "../entities/card-types/targeted-attack-card";
import {ImplodingKittenCard} from "../entities/card-types/imploding-kitten-card";
import {StreakingKittenCard} from "../entities/card-types/streaking-kitten-card";
import {SuperSkipCard} from "../entities/card-types/super-skip-card";
import {SeeTheFuture5xCard} from "../entities/card-types/see-the-future-5x-card";
import {AlterTheFuture5xCard} from "../entities/card-types/alter-the-future-5x-card";
import {SwapTopAndBottomCard} from "../entities/card-types/swap-top-and-bottom-card";
import {GarbageCollectionCard} from "../entities/card-types/garbage-collection-card";
import {CatomicBombCard} from "../entities/card-types/catomic-bomb-card";
import {MarkCard} from "../entities/card-types/mark-card";
import {CurseOfTheCatButtCard} from "../entities/card-types/curse-of-the-cat-butt-card";
import {BarkingKittenCard} from "../entities/card-types/barking-kitten-card";
import {TowerOfPowerCard} from "../entities/card-types/tower-of-power-card";
import {AlterTheFuture3xNowCard} from "../entities/card-types/alter-the-future-3x-now-card";
import {BuryCard} from "../entities/card-types/bury-card";
import {PersonalAttack3xCard} from "../entities/card-types/personal-attack-3x-card";
import {ShareTheFuture3xCard} from "../entities/card-types/share-the-future-3x-card";
import {IllTakeThatCard} from "../entities/card-types/ill-take-that-card";
import {PotluckCard} from "../entities/card-types/potluck-card";
import {ZombieKittenCard} from "../entities/card-types/zombie-kitten-card";
import {CloneCard} from "../entities/card-types/clone-card";
import {DigDeeperCard} from "../entities/card-types/dig-deeper-card";
import {FeedTheDeadCard} from "../entities/card-types/feed-the-dead-card";
import {GraveRobberCard} from "../entities/card-types/grave-robber-card";
import {AttackOfTheDeadCard} from "../entities/card-types/attack-of-the-dead-card";
import {ShuffleNowCard} from "../entities/card-types/shuffle-now-card";
import {ClairvoyanceCard} from "../entities/card-types/clairvoyance-card";
import {ReverseAttackCard} from "../entities/card-types/reverse-attack-card";
import {BuriedTreasureCard} from "../entities/card-types/buried-treasure-card";
import {IllTakeItFromHereCard} from "../entities/card-types/ill-take-it-from-here-card";
import {LookAtTheBottomCard} from "../entities/card-types/look-at-the-bottom-card";
import {DrawFromAnywhereCard} from "../entities/card-types/draw-from-anywhere-card";
import {ChooseYourFateCard} from "../entities/card-types/choose-your-fate-card";
import {FlipFourCard} from "../entities/card-types/flip-four-card";
import {AnnoyCard} from "../entities/card-types/annoy-card";
import {SlapCard} from "../entities/card-types/slap-card";
import {StealACard} from "../entities/card-types/steal-a-card";
import {SeeTheFuture1xCard} from "../entities/card-types/see-the-future-1x-card";
import {CurseOfCrystalCornCard} from "../entities/card-types/curse-of-crystal-corn-card";
import {KittenRollCallCard} from "../entities/card-types/kitten-roll-call-card";
import {TimebombKittenCard} from "../entities/card-types/timebomb-kitten-card";
import {DefuseTimebombCard} from "../entities/card-types/defuse-timebomb-card";
import {BlindCard} from "../entities/card-types/blind-card";
import {SearchCard} from "../entities/card-types/search-card";
import {DiscardCard} from "../entities/card-types/discard-card";
import {CopycatCard} from "../entities/card-types/copycat-card";
import {
  ArmageddonCard,
  GodcatCard,
  DevilcatCard,
  RevealTheFuture3xCard,
  BoobyTrapKittenCard,
  SharedSufferingCard,
  RevealAndStealCard,
  BadDecisionCard,
  PeekCard,
  CharmCard,
  CurseCard,
  AnniversaryBonusCard,
  ExplodingMinionCard,
  MinionDefuseCard
} from "../entities/card-types/mode-cards";
import {
  NAME_ALTER_THE_FUTURE,
  NAME_ATTACK,
  NAME_CAT_CARD,
  NAME_DEFUSE,
  NAME_DRAW_FROM_THE_BOTTOM,
  NAME_EXPLODING_KITTEN,
  NAME_FAVOR,
  NAME_FERAL_CAT,
  NAME_IMPLODING_KITTEN,
  NAME_NOPE,
  NAME_REVERSE,
  NAME_SEE_THE_FUTURE,
  NAME_SHUFFLE,
  NAME_SKIP,
  NAME_TARGETED_ATTACK,
  NAME_STREAKING_KITTEN,
  NAME_SUPER_SKIP,
  NAME_SEE_THE_FUTURE_5X,
  NAME_ALTER_THE_FUTURE_5X,
  NAME_SWAP_TOP_AND_BOTTOM,
  NAME_GARBAGE_COLLECTION,
  NAME_CATOMIC_BOMB,
  NAME_MARK,
  NAME_CURSE_OF_THE_CAT_BUTT,
  NAME_BARKING_KITTEN,
  NAME_TOWER_OF_POWER,
  NAME_ALTER_THE_FUTURE_3X_NOW,
  NAME_BURY,
  NAME_PERSONAL_ATTACK_3X,
  NAME_SHARE_THE_FUTURE_3X,
  NAME_ILL_TAKE_THAT,
  NAME_POTLUCK,
  NAME_ZOMBIE_KITTEN,
  NAME_CLONE,
  NAME_DIG_DEEPER,
  NAME_FEED_THE_DEAD,
  NAME_GRAVE_ROBBER,
  NAME_ATTACK_OF_THE_DEAD,
  NAME_SHUFFLE_NOW,
  NAME_CLAIRVOYANCE,
  NAME_REVERSE_ATTACK,
  NAME_BURIED_TREASURE,
  NAME_ILL_TAKE_IT_FROM_HERE,
  NAME_LOOK_AT_THE_BOTTOM,
  NAME_DRAW_FROM_ANYWHERE,
  NAME_CHOOSE_YOUR_FATE,
  NAME_FLIP_FOUR,
  NAME_ANNOY,
  NAME_SLAP_1X,
  NAME_SLAP_2X,
  NAME_SLAP_3X,
  NAME_STEAL_A_CARD,
  NAME_SEE_THE_FUTURE_1X,
  NAME_CURSE_OF_CRYSTAL_CORN,
  NAME_KITTEN_ROLL_CALL,
  NAME_TIMEBOMB_KITTEN,
  NAME_DEFUSE_TIMEBOMB,
  NAME_BLIND,
  NAME_SEARCH,
  NAME_DISCARD,
  NAME_COPYCAT,
  NAME_ARMAGEDDON,
  NAME_GODCAT,
  NAME_DEVILCAT,
  NAME_RAISING_HECK,
  NAME_REVEAL_THE_FUTURE_3X,
  NAME_BOOBY_TRAP_KITTEN,
  NAME_SHARED_SUFFERING,
  NAME_REVEAL_AND_STEAL,
  NAME_BAD_DECISION,
  NAME_PEEK,
  NAME_DISGUISE_CHARM,
  NAME_TRANSFORMATION_CHARM,
  NAME_SIGHT_CHARM,
  NAME_BOTTOM_CHARM,
  NAME_GIVING_CURSE,
  NAME_EXCESS_CURSE,
  NAME_AMATEUR_ARCHEOLOGY,
  NAME_CREEPY_PEEKY,
  NAME_HIP_CAT,
  NAME_HIP_BAT,
  NAME_PLUS_PLUS,
  NAME_ROBIN_HOOD,
  NAME_BATTLE_HAMSTER,
  NAME_THE_TWINS,
  NAME_EXPLODING_MINION,
  NAME_MINION_DEFUSE,
  NAME_MINION_CHARACTER_CARD
} from "../constants/cards";

// Registry for card models
export const cardTypeRegistry = new Registry<CardType>();

// Card instances
export const ATTACK = register(new AttackCard(NAME_ATTACK));
export const CAT_CARD = register(new CatCard(NAME_CAT_CARD));
export const SKIP = register(new SkipCard(NAME_SKIP));
export const SHUFFLE = register(new ShuffleCard(NAME_SHUFFLE));
export const FAVOR = register(new FavorCard(NAME_FAVOR));
export const NOPE = register(new NopeCard(NAME_NOPE));
export const SEE_THE_FUTURE = register(new SeeTheFutureCard(NAME_SEE_THE_FUTURE));
export const DEFUSE = register(new DefuseCard(NAME_DEFUSE));
export const EXPLODING_KITTEN = register(new ExplodingKittenCard(NAME_EXPLODING_KITTEN));

// Imploding Kittens card instances
export const REVERSE = register(new ReverseCard(NAME_REVERSE));
export const DRAW_FROM_THE_BOTTOM = register(new DrawFromTheBottomCard(NAME_DRAW_FROM_THE_BOTTOM));
export const ALTER_THE_FUTURE = register(new AlterTheFutureCard(NAME_ALTER_THE_FUTURE));
export const FERAL_CAT = register(new FeralCatCard(NAME_FERAL_CAT));
export const TARGETED_ATTACK = register(new TargetedAttackCard(NAME_TARGETED_ATTACK));
export const IMPLODING_KITTEN = register(new ImplodingKittenCard(NAME_IMPLODING_KITTEN));

// Streaking Kittens card instances
export const STREAKING_KITTEN = register(new StreakingKittenCard(NAME_STREAKING_KITTEN));
export const SUPER_SKIP = register(new SuperSkipCard(NAME_SUPER_SKIP));
export const SEE_THE_FUTURE_5X = register(new SeeTheFuture5xCard(NAME_SEE_THE_FUTURE_5X));
export const ALTER_THE_FUTURE_5X = register(new AlterTheFuture5xCard(NAME_ALTER_THE_FUTURE_5X));
export const SWAP_TOP_AND_BOTTOM = register(new SwapTopAndBottomCard(NAME_SWAP_TOP_AND_BOTTOM));
export const GARBAGE_COLLECTION = register(new GarbageCollectionCard(NAME_GARBAGE_COLLECTION));
export const CATOMIC_BOMB = register(new CatomicBombCard(NAME_CATOMIC_BOMB));
export const MARK = register(new MarkCard(NAME_MARK));
export const CURSE_OF_THE_CAT_BUTT = register(new CurseOfTheCatButtCard(NAME_CURSE_OF_THE_CAT_BUTT));

// Barking Kittens card instances
export const BARKING_KITTEN = register(new BarkingKittenCard(NAME_BARKING_KITTEN));
export const TOWER_OF_POWER = register(new TowerOfPowerCard(NAME_TOWER_OF_POWER));
export const ALTER_THE_FUTURE_3X_NOW = register(new AlterTheFuture3xNowCard(NAME_ALTER_THE_FUTURE_3X_NOW));
export const BURY = register(new BuryCard(NAME_BURY));
export const PERSONAL_ATTACK_3X = register(new PersonalAttack3xCard(NAME_PERSONAL_ATTACK_3X));
export const SHARE_THE_FUTURE_3X = register(new ShareTheFuture3xCard(NAME_SHARE_THE_FUTURE_3X));
export const ILL_TAKE_THAT = register(new IllTakeThatCard(NAME_ILL_TAKE_THAT));
export const POTLUCK = register(new PotluckCard(NAME_POTLUCK));

// Zombie Kittens card instances
export const ZOMBIE_KITTEN = register(new ZombieKittenCard(NAME_ZOMBIE_KITTEN));
export const CLONE = register(new CloneCard(NAME_CLONE));
export const DIG_DEEPER = register(new DigDeeperCard(NAME_DIG_DEEPER));
export const FEED_THE_DEAD = register(new FeedTheDeadCard(NAME_FEED_THE_DEAD));
export const GRAVE_ROBBER = register(new GraveRobberCard(NAME_GRAVE_ROBBER));
export const ATTACK_OF_THE_DEAD = register(new AttackOfTheDeadCard(NAME_ATTACK_OF_THE_DEAD));
export const SHUFFLE_NOW = register(new ShuffleNowCard(NAME_SHUFFLE_NOW));
export const CLAIRVOYANCE = register(new ClairvoyanceCard(NAME_CLAIRVOYANCE));

// Aggro / Attacking Kittens card instances
export const REVERSE_ATTACK = register(new ReverseAttackCard(NAME_REVERSE_ATTACK));
export const BURIED_TREASURE = register(new BuriedTreasureCard(NAME_BURIED_TREASURE));
export const ILL_TAKE_IT_FROM_HERE = register(new IllTakeItFromHereCard(NAME_ILL_TAKE_IT_FROM_HERE));
export const ANNOY = register(new AnnoyCard(NAME_ANNOY));
export const SLAP_1X = register(new SlapCard(NAME_SLAP_1X, 1));
export const SLAP_2X = register(new SlapCard(NAME_SLAP_2X, 2));
export const SLAP_3X = register(new SlapCard(NAME_SLAP_3X, 3));
export const STEAL_A_CARD = register(new StealACard(NAME_STEAL_A_CARD));

// Creepy Kittens card instances
export const LOOK_AT_THE_BOTTOM = register(new LookAtTheBottomCard(NAME_LOOK_AT_THE_BOTTOM));
export const DRAW_FROM_ANYWHERE = register(new DrawFromAnywhereCard(NAME_DRAW_FROM_ANYWHERE));
export const CHOOSE_YOUR_FATE = register(new ChooseYourFateCard(NAME_CHOOSE_YOUR_FATE));
export const FLIP_FOUR = register(new FlipFourCard(NAME_FLIP_FOUR));

// Defending Kittens card instances
export const SEE_THE_FUTURE_1X = register(new SeeTheFuture1xCard(NAME_SEE_THE_FUTURE_1X));
export const CURSE_OF_CRYSTAL_CORN = register(new CurseOfCrystalCornCard(NAME_CURSE_OF_CRYSTAL_CORN));
export const KITTEN_ROLL_CALL = register(new KittenRollCallCard(NAME_KITTEN_ROLL_CALL));

// Timebomb Kittens card instances
export const TIMEBOMB_KITTEN = register(new TimebombKittenCard(NAME_TIMEBOMB_KITTEN));
export const DEFUSE_TIMEBOMB = register(new DefuseTimebombCard(NAME_DEFUSE_TIMEBOMB));
export const BLIND = register(new BlindCard(NAME_BLIND));
export const SEARCH = register(new SearchCard(NAME_SEARCH));
export const DISCARD_CARD = register(new DiscardCard(NAME_DISCARD));
export const COPYCAT = register(new CopycatCard(NAME_COPYCAT));

// Mode 9: Good vs Evil
export const ARMAGEDDON = register(new ArmageddonCard(NAME_ARMAGEDDON));
export const GODCAT = register(new GodcatCard(NAME_GODCAT));
export const DEVILCAT = register(new DevilcatCard(NAME_DEVILCAT));
export const RAISING_HECK = register(new LookAtTheBottomCard(NAME_RAISING_HECK));
export const REVEAL_THE_FUTURE_3X = register(new RevealTheFuture3xCard(NAME_REVEAL_THE_FUTURE_3X));

// Mode 10: Rage Mode
export const BOOBY_TRAP_KITTEN = register(new BoobyTrapKittenCard(NAME_BOOBY_TRAP_KITTEN));
export const SHARED_SUFFERING = register(new SharedSufferingCard(NAME_SHARED_SUFFERING));
export const REVEAL_AND_STEAL = register(new RevealAndStealCard(NAME_REVEAL_AND_STEAL));
export const BAD_DECISION = register(new BadDecisionCard(NAME_BAD_DECISION));

// Mode 11: Curse You!
export const PEEK = register(new PeekCard(NAME_PEEK));
export const DISGUISE_CHARM = register(new CharmCard(NAME_DISGUISE_CHARM));
export const TRANSFORMATION_CHARM = register(new CharmCard(NAME_TRANSFORMATION_CHARM));
export const SIGHT_CHARM = register(new CharmCard(NAME_SIGHT_CHARM));
export const BOTTOM_CHARM = register(new CharmCard(NAME_BOTTOM_CHARM));
export const GIVING_CURSE = register(new CurseCard(NAME_GIVING_CURSE));
export const EXCESS_CURSE = register(new CurseCard(NAME_EXCESS_CURSE));

// Mode 12: 10th Anniversary Legacy
export const AMATEUR_ARCHEOLOGY = register(new AnniversaryBonusCard(NAME_AMATEUR_ARCHEOLOGY));
export const CREEPY_PEEKY = register(new AnniversaryBonusCard(NAME_CREEPY_PEEKY));
export const HIP_CAT = register(new AnniversaryBonusCard(NAME_HIP_CAT));
export const HIP_BAT = register(new AnniversaryBonusCard(NAME_HIP_BAT));
export const PLUS_PLUS = register(new AnniversaryBonusCard(NAME_PLUS_PLUS));
export const ROBIN_HOOD = register(new AnniversaryBonusCard(NAME_ROBIN_HOOD));
export const BATTLE_HAMSTER = register(new AnniversaryBonusCard(NAME_BATTLE_HAMSTER));
export const THE_TWINS = register(new AnniversaryBonusCard(NAME_THE_TWINS));

// Mode 13: Exploding Minions
export const EXPLODING_MINION = register(new ExplodingMinionCard(NAME_EXPLODING_MINION));
export const MINION_DEFUSE = register(new MinionDefuseCard(NAME_MINION_DEFUSE));
export const MINION_CHARACTER_CARD = register(new CatCard(NAME_MINION_CHARACTER_CARD));

function register(cardType: CardType): CardType {
  return cardTypeRegistry.register(cardType);
}
