import './Player.css';
import PlayerCards from '../player-cards/PlayerCards.tsx';
import {getPlayerName} from "../../../../utils/matchData.ts";
import {PlayerPosition} from "../../../../types/component-props.ts";
import {useGame} from "../../../../context/GameContext.tsx";
import {Player as PlayerModel} from '../../../../../common';
import {useAnimationNode} from "../../../../context/AnimationContext.tsx";
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
  STAGE_HAND_SHUFFLE_DEFENSE,
  GAME_MODE_TEAM_UP
} from '../../../../../common';

interface PlayerAreaProps {
  player: PlayerModel;
  position: PlayerPosition;
}

export default function Player({
  player,
  position,
}: PlayerAreaProps) {
  const game = useGame();
  const selfPlayer = game.selfPlayer;

  const playerId = player.id;
  const playerAnimRef = useAnimationNode(`${playerId}`);

  const isSelf = game.isSelf(playerId);
  const isTurn = player.isCurrentPlayer;

  const isSelectableForDeadAction =
    !player.isAlive && (
      selfPlayer?.isInStage(CHOOSE_DEAD_PLAYER_FOR_RESURRECTION) ||
      selfPlayer?.isInStage(CHOOSE_DEAD_PLAYER_FOR_FEED)
    );

  const isSelectable =
    isSelectableForDeadAction || (
    player.isValidCardTarget && (
    selfPlayer?.isInStage(CHOOSE_PLAYER_TO_STEAL_FROM) ||
    selfPlayer?.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM) ||
    selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_TARGETED_ATTACK) ||
    selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_MARK) ||
    selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_CURSE) ||
    selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_ILL_TAKE_THAT) ||
    selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_ANNOY) ||
    selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_BLIND) ||
    selfPlayer?.isInStage(CHOOSE_PLAYER_FOR_DISCARD)));

  const isWaitingOn =
    player.isInStage(CHOOSE_CARD_TO_GIVE) ||
    player.isInStage(CHOOSE_CARD_FOR_GARBAGE) ||
    player.isInStage(CHOOSE_CARD_FOR_POTLUCK) ||
    player.isInStage(GIVE_CARD_TO_FEED_DEAD) ||
    player.isInStage(CHOOSE_CARD_FOR_GRAVE_ROBBER) ||
    player.isInStage(STAGE_HAND_SHUFFLE_DEFENSE);

  const { cardPosition, infoPosition } = position;

  const cardRotation = cardPosition.angle - 90;
  const playerName = getPlayerName(playerId, game.matchData);
  const isTeamMode = game.gameState.gameMode === GAME_MODE_TEAM_UP;
  const team = isTeamMode ? (game.gameState.teams?.[playerId] || (Number(playerId) % 2 === 0 ? 'red' : 'blue')) : null;

  const extraClasses = `${isSelf ? 'hand-interactable self' : ''} ${isTurn ? 'turn' : ''} ${isSelectable ? 'selectable' : ''} ${isWaitingOn ? 'waiting-on' : ''}`

  const handleInteract = () => {
    if (isSelectable) {
      game.selectPlayer(player);
    }
  };

  return (
    <>
      <div
        ref={playerAnimRef}
        className={`player-cards-container ${extraClasses}`}
        style={{
          position: 'absolute',
          top: cardPosition.top,
          left: cardPosition.left,
          transform: `translate(-50%, -50%) rotate(${cardRotation}deg)`,
          zIndex: isSelf ? 2 : 1,
        }}
      >
        <PlayerCards
          player={player}
        />
      </div>

      <div
        className={`player-position ${extraClasses}`}
        style={{
          position: 'absolute',
          top: infoPosition.top,
          left: infoPosition.left,
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
        }}
        onClick={handleInteract}
        data-player-id={playerId}
        data-hand-count={player.handSize}
      >
        <div className="player-info flex flex-col items-center">
          {isTeamMode && (
            <div
              className={`text-xs px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 shadow-sm mb-1 ${
                team === 'red' ? 'bg-red-600 text-white border border-red-400' : 'bg-blue-600 text-white border border-blue-400'
              }`}
            >
              <span>{team === 'red' ? '🔴' : '🔵'}</span>
              <span>{team === 'red' ? 'Đội Đỏ' : 'Đội Xanh'}</span>
            </div>
          )}
          <div className="player-id mt-1 font-bold flex items-center gap-1">
            {game.gameState.towerOfPowerCrownBearer === playerId && (
              <span title={`Đang đội Vương miện Tower of Power (${game.gameState.towerOfPowerStash?.length ?? 0} lá dự trữ)`}>👑</span>
            )}
            {game.gameState.catBurglarHolderId === playerId && (
              <span title="Đang giữ tượng Mèo Đạo Tặc (Cat Burglar)">🐱‍👤</span>
            )}
            <span>{playerName}</span>
            {isSelf && ' (Bạn)'}
          </div>
          <div className="player-hand border-2 border-black bg-white p-2 rounded">
            Bài: {player.handSize}
          </div>
          {!player.isAlive && (
            <div className="text-xs bg-purple-700 text-white px-2 py-0.5 rounded mt-1 font-semibold flex items-center gap-1 shadow">
              <span>🧟</span>
              <span>Đã Chết (Zombie)</span>
            </div>
          )}
          {game.gameState.towerOfPowerCrownBearer === playerId && (
            <div className="text-xs bg-yellow-400 text-black px-1 rounded mt-1 font-semibold">
              👑 Vương miện ({game.gameState.towerOfPowerStash?.length ?? 0} lá)
            </div>
          )}
          {game.gameState.barkingKittenFaceUpPlayer === playerId && (
            <div className="text-xs bg-orange-500 text-white px-1 rounded mt-1 font-semibold">
              🐶 Barking Kitten
            </div>
          )}
          {!!game.gameState.illTakeThatTargets?.[playerId]?.length && (
            <div className="text-xs bg-pink-500 text-white px-1 rounded mt-1 font-semibold">
              🫳 I'll Take That (x{game.gameState.illTakeThatTargets[playerId].length})
            </div>
          )}
          {game.gameState.catBurglarHolderId === playerId && (
            <div
              className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full mt-1 font-extrabold flex items-center gap-1 shadow-md border border-amber-300"
              title="Đang giữ tượng Mèo Đạo Tặc (Cat Burglar)"
            >
              <span>🐱‍👤</span>
              <span>Mèo Đạo Tặc</span>
            </div>
          )}
          {player.activeTimebombs && player.activeTimebombs.length > 0 && (
            <div className="text-xs bg-red-600 text-white px-2 py-0.5 rounded mt-1 font-semibold flex items-center gap-1 shadow animate-pulse">
              <span>⏰💣</span>
              <span>Timebomb: {player.activeTimebombs.map(tb => `${tb.turnsLeft} lượt`).join(', ')}</span>
            </div>
          )}
          {player.isCardPlayBlocked && (
            <div className="text-xs bg-gray-900 text-amber-300 px-2 py-0.5 rounded mt-1 font-semibold flex items-center gap-1 shadow border border-amber-400">
              <span>🙈⛔</span>
              <span>Bị Cấm Đánh Bài (Blind)</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
