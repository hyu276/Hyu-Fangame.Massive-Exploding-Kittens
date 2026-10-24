import {DeckType} from '../deck-type';
import {TheGame} from '../game';

export class ExpansionDeck extends DeckType {
  constructor(
    name: string = 'expansion_1',
    displayName: string = 'Gói Mở Rộng 1 (Expansion Pack 1)',
    description: string = 'Gói thẻ bài mở rộng bổ sung các lá bài đặc biệt mới vào trận đấu.',
    icon: string = '✨'
  ) {
    super(name, displayName, description, false, icon);
  }

  startingHandSize(): number {
    return 0; // Bài phát ban đầu dùng từ Bộ Tiêu Chuẩn
  }

  buildBaseDeck(_game: TheGame): void {
    // Nơi thêm các lá bài mở rộng vào chồng bài rút (drawPile)
    // Các thẻ bài mới sắp thêm sẽ được đưa vào đây
  }
}
