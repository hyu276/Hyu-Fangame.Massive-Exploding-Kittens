export interface Position {
  top: string;
  left: string;
}

export interface CardPosition extends Position {
  angle: number;
}

export interface PlayerPositions {
  cardPosition: CardPosition;
  infoPosition: Position;
}

export const calculateCircularPosition = (
  angle: number,
  radius: string
): Position => {
  const radian = (angle * Math.PI) / 180;
  return {
    top: `calc(50% - ${radius} * ${Math.cos(radian)})`,
    left: `calc(50% + ${radius} * ${Math.sin(radian)})`,
  };
};

const calculateAngleFromSlot = (slotPosition: number, totalSlots: number): number => {
  return 180 + (slotPosition * (360 / totalSlots));
};

const getRelativePosition = (
  targetIndex: number,
  referenceIndex: number,
  arrayLength: number
): number => {
  return (targetIndex - referenceIndex + arrayLength) % arrayLength;
};

export const calculatePlayerAngle = (
  playerIndex: number,
  totalPlayers: number,
  selfIndex: number | null,
  isSelfDead: boolean
): number => {
  if (isSelfDead) {
    // Slot 0 (bottom) is always the empty seat for the dead viewer.
    // Shift all alive players by 1 to leave that slot vacant.
    const relativePosition = (playerIndex + 1) % (totalPlayers + 1);
    return calculateAngleFromSlot(relativePosition, totalPlayers + 1);
  }

  const relativePosition = getRelativePosition(playerIndex, selfIndex ?? 0, totalPlayers);
  return calculateAngleFromSlot(relativePosition, totalPlayers);
};

export const calculatePlayerPositions = (
  playerIndex: number,
  totalPlayers: number,
  selfIndex: number | null,
  isSelfDead: boolean
): PlayerPositions => {
  const angle = calculatePlayerAngle(playerIndex, totalPlayers, selfIndex, isSelfDead);
  const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth && window.innerWidth <= 768;

  // On portrait mobile, spread vertically while preventing horizontal edge clipping
  const cardRadiusX = isPortrait ? 'min(36vw, 36vh)' : 'min(35vw, 35vh)';
  const cardRadiusY = isPortrait ? 'min(32vh, 44vw)' : 'min(35vw, 35vh)';
  const infoRadiusX = isPortrait ? 'min(42vw, 42vh)' : 'min(45vw, 45vh)';
  const infoRadiusY = isPortrait ? 'min(38vh, 50vw)' : 'min(45vw, 45vh)';

  const radian = (angle * Math.PI) / 180;

  return {
    cardPosition: {
      top: `calc(50% - ${cardRadiusY} * ${Math.cos(radian)})`,
      left: `calc(50% + ${cardRadiusX} * ${Math.sin(radian)})`,
      angle: angle - 90,
    },
    infoPosition: {
      top: `calc(50% - ${infoRadiusY} * ${Math.cos(radian)})`,
      left: `calc(50% + ${infoRadiusX} * ${Math.sin(radian)})`,
    },
  };
};
