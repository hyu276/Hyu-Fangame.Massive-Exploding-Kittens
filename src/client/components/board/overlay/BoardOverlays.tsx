import WinnerOverlay from './winner/WinnerOverlay.tsx';
import DeadOverlay from './dead/DeadOverlay.tsx';
import SpecialActionOverlay from './special-action/SpecialActionOverlay.tsx';
import SeeTheFutureOverlay from './see-future/SeeTheFutureOverlay.tsx';
import AlterTheFutureOverlay from './alter-future/AlterTheFutureOverlay.tsx';
import DefuseOverlay from './defuse/DefuseOverlay.tsx';
import BuryOverlay from './bury/BuryOverlay.tsx';
import DigDeeperOverlay from './dig-deeper/DigDeeperOverlay.tsx';
import LookAtTheBottomOverlay from './look-at-the-bottom/LookAtTheBottomOverlay.tsx';
import DrawFromAnywhereOverlay from './draw-from-anywhere/DrawFromAnywhereOverlay.tsx';
import HandShuffleDefenseOverlay from './hand-shuffle-defense/HandShuffleDefenseOverlay.tsx';
import SearchOverlay from './search/SearchOverlay.tsx';
import {useGame} from "../../../context/GameContext.tsx";
import {
  CHOOSE_CARD_TO_GIVE,
  CHOOSE_CARD_FOR_GARBAGE,
  CHOOSE_CARD_FOR_POTLUCK,
  CHOOSE_PLAYER_TO_REQUEST_FROM,
  CHOOSE_PLAYER_TO_STEAL_FROM,
  CHOOSE_PLAYER_FOR_TARGETED_ATTACK,
  CHOOSE_PLAYER_FOR_MARK,
  CHOOSE_PLAYER_FOR_CURSE,
  CHOOSE_PLAYER_FOR_ILL_TAKE_THAT,
  CHOOSE_DEAD_PLAYER_FOR_RESURRECTION,
  CHOOSE_DEAD_PLAYER_FOR_FEED,
  GIVE_CARD_TO_FEED_DEAD,
  CHOOSE_CARD_FOR_GRAVE_ROBBER,
  CHOOSE_PLAYER_FOR_ANNOY,
  CHOOSE_PLAYER_FOR_BLIND,
  CHOOSE_PLAYER_FOR_DISCARD,
} from '../../../../common';
import LobbyOverlay from "./lobby/LobbyOverlay.tsx";

/**
 * Quản lý và hiển thị tất cả các overlay trong bàn chơi
 */
export default function BoardOverlays() {
  const game = useGame();
  const combo = game.gameState.comboMultiplier || 1;
  const isCombo = combo > 1;

  // Xác định thông điệp overlay dựa theo stage hiện tại
  let selectionMessage = null;
  if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM)) {
    selectionMessage = isCombo
      ? `⚡ Hãy chọn một người chơi để xin ${combo} lá bài (Xin Xỏ Liên Hoàn x${combo} - Favor)!`
      : "Hãy chọn một người chơi để xin 1 lá bài (Xin Xỏ - Favor)";
  } else if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_TO_STEAL_FROM)) {
    selectionMessage = isCombo
      ? `⚡ Hãy chọn một người chơi để cướp ngẫu nhiên ${combo} lá bài (Cặp Thẻ Mèo Liên Hoàn x${combo})!`
      : "Hãy chọn một người chơi để cướp ngẫu nhiên 1 lá bài (Cặp Thẻ Mèo)";
  } else if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_TARGETED_ATTACK)) {
    selectionMessage = isCombo
      ? `⚡ Hãy chọn một người chơi để tấn công Liên Hoàn x${combo} (Targeted Attack)! Người đó sẽ nhận ${2 * combo} lượt chơi liên tiếp.`
      : "Hãy chọn một người chơi để tấn công (Targeted Attack)! Người đó sẽ nhận 2 lượt chơi liên tiếp.";
  } else if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_MARK)) {
    selectionMessage = "Hãy chọn một người chơi để rút ngẫu nhiên và đánh dấu công khai 1 lá bài (Mark)!";
  } else if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_CURSE)) {
    selectionMessage = "Hãy chọn một người chơi để ếm Lời Nguyền Mông Mèo (Curse of the Cat Butt)!";
  } else if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_ILL_TAKE_THAT)) {
    selectionMessage = "Hãy chọn một người chơi để đặt lá 'I'll Take That'! Lần rút bài kế tiếp của họ sẽ thuộc về bạn.";
  } else if (game.selfPlayer?.isInStage(CHOOSE_DEAD_PLAYER_FOR_RESURRECTION)) {
    selectionMessage = "🧟 Hãy chọn một người chơi đã chết để hồi sinh (Zombie Kitten)!";
  } else if (game.selfPlayer?.isInStage(CHOOSE_DEAD_PLAYER_FOR_FEED)) {
    selectionMessage = "🍖 Cho Người Chết Ăn (Feed the Dead)! Hãy chọn một người chơi đã chết để mọi người nộp bài cho họ.";
  } else if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_ANNOY)) {
    selectionMessage = "🔒 Hãy chọn một đối thủ để khóa ngẫu nhiên 2 lá bài (Làm Phiền - Annoy)!";
  } else if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_BLIND)) {
    selectionMessage = "🙈 Hãy chọn một người chơi để làm mù (Blind)! Người đó sẽ bị cấm đánh bài trong suốt lượt tiếp theo.";
  } else if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_DISCARD)) {
    selectionMessage = "🗑️ Hãy chọn một người chơi để vứt 2 lá ngẫu nhiên từ tay họ vào Chồng bài bỏ (Discard)!";
  }

  return (
    <>
      <WinnerOverlay />
      <DeadOverlay />
      <LobbyOverlay />
      {selectionMessage && (
        <SpecialActionOverlay message={selectionMessage} />)
      }
      {game.selfPlayer?.isInStage(CHOOSE_CARD_TO_GIVE) && (
        <SpecialActionOverlay
          message={
            (game.gameState.favorCountRemaining || 0) > 1
              ? `⚡ Bạn bị đòi bài Liên Hoàn (Favor)! Còn phải giao nộp ${game.gameState.favorCountRemaining} lá bài nữa.`
              : "Bạn bị đòi bài (Favor)! Hãy chọn 1 lá trên tay để giao nộp."
          }
        />
      )}
      {game.selfPlayer?.isInStage(CHOOSE_CARD_FOR_GARBAGE) && (
        <SpecialActionOverlay message="Thu Gom Rác (Garbage Collection)! Hãy click chọn 1 lá bài trên tay bạn để nộp vào bộ bài." />
      )}
      {game.selfPlayer?.isInStage(CHOOSE_CARD_FOR_POTLUCK) && (
        <SpecialActionOverlay message="Góp Cơm (Potluck)! Hãy click chọn 1 lá bài trên tay bạn để đặt úp lên trên đỉnh bộ bài rút." />
      )}
      {game.selfPlayer?.isInStage(GIVE_CARD_TO_FEED_DEAD) && (
        <SpecialActionOverlay message="🍖 Nuôi Người Chết (Feed the Dead)! Hãy click chọn 1 lá bài trên tay bạn để dâng tặng cho người chết." />
      )}
      {game.selfPlayer?.isInStage(CHOOSE_CARD_FOR_GRAVE_ROBBER) && (
        <SpecialActionOverlay message="⚰️ Kẻ Trộm Mộ (Grave Robber)! Hãy click chọn 1 lá bài trên tay bạn để đưa trở lại Chồng bài rút." />
      )}
      <SeeTheFutureOverlay />
      <AlterTheFutureOverlay />
      <DefuseOverlay />
      <BuryOverlay />
      <DigDeeperOverlay />
      <LookAtTheBottomOverlay />
      <DrawFromAnywhereOverlay />
      <HandShuffleDefenseOverlay />
      <SearchOverlay />
    </>
  );
}
