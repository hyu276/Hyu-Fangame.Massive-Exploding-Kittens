import type {ICard} from '../models';
import {TheGame} from './game';

export abstract class DeckType {
  name: string;
  displayName: string;
  description: string;
  isBase: boolean;
  icon: string;
  avatarUrl?: string;

  protected constructor(
    name: string,
    displayName: string,
    description: string,
    isBase: boolean = false,
    icon: string = '🃏',
    avatarUrl?: string
  ) {
    this.name = name;
    this.displayName = displayName;
    this.description = description;
    this.isBase = isBase;
    this.icon = icon;
    this.avatarUrl = avatarUrl;
  }

  /** Thẻ bài tạo nên bộ bài trước khi chia bài */
  abstract buildBaseDeck(game: TheGame): void;

  /** Số lượng lá bài mỗi người chơi được chia lúc khởi đầu */
  abstract startingHandSize(): number;

  /** Thẻ bài được tự động chia riêng cho mỗi người (ví dụ: Defuse) */
  startingHandForcedCards(_game: TheGame, _player_index: number): ICard[] {
    return [];
  }

  /** Thẻ bài được thêm vào chồng bài rút sau khi đã chia bài (ví dụ: Mèo Nổ) */
  addPostDealCards(_game: TheGame): void {
  }
}
