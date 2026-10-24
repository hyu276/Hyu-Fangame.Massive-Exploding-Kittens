import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_BARKING_KITTEN, NAME_DEFUSE} from '../../constants/cards';

export class BarkingKittenCard extends CardType {
  constructor(name: string = NAME_BARKING_KITTEN) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    // 1. Kiểm tra xem có người chơi còn sống nào khác đang giữ lá Barking Kitten trên tay không
    const otherPlayerWithBK = game.players.allPlayers.find(
      p => p.id !== actingPlayer.id && p.isAlive && p.hasCard(NAME_BARKING_KITTEN)
    );

    if (otherPlayerWithBK) {
      // Đối đầu trực tiếp: Người đang cầm Barking Kitten phải dùng Defuse hoặc phát nổ
      if (otherPlayerWithBK.hasCard(NAME_DEFUSE)) {
        const defuseCardIdx = otherPlayerWithBK.findCardIndex(NAME_DEFUSE);
        if (defuseCardIdx !== -1) {
          const defuseCard = otherPlayerWithBK.getCardAt(defuseCardIdx);
          defuseCard?.moveTo(game.piles.discardPile);
        }
        const bkCardIdx = otherPlayerWithBK.findCardIndex(NAME_BARKING_KITTEN);
        if (bkCardIdx !== -1) {
          const bkCard = otherPlayerWithBK.getCardAt(bkCardIdx);
          bkCard?.moveTo(game.piles.discardPile);
        }
      } else {
        otherPlayerWithBK.eliminate();
      }
      return;
    }

    // 2. Kiểm tra xem trước đó đã có người chơi nào đặt Barking Kitten trước mặt chưa
    const faceUpPlayerId = game.gameState.barkingKittenFaceUpPlayer;
    if (faceUpPlayerId && faceUpPlayerId !== actingPlayer.id) {
      const faceUpPlayer = game.players.getPlayer(faceUpPlayerId);
      if (faceUpPlayer && faceUpPlayer.isAlive) {
        if (faceUpPlayer.hasCard(NAME_DEFUSE)) {
          const defuseCardIdx = faceUpPlayer.findCardIndex(NAME_DEFUSE);
          if (defuseCardIdx !== -1) {
            const defuseCard = faceUpPlayer.getCardAt(defuseCardIdx);
            defuseCard?.moveTo(game.piles.discardPile);
          }
        } else {
          faceUpPlayer.eliminate();
        }
      }
      game.gameState.barkingKittenFaceUpPlayer = null;
      return;
    }

    // 3. Chưa có ai giữ lá thứ hai: Đặt lá này công khai trước mặt người đánh
    game.gameState.barkingKittenFaceUpPlayer = actingPlayer.id;
  }

  sortOrder(): number {
    return 15;
  }
}
