import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { CardWithServerIndex } from '../components/board/player/player-cards/PlayerCards';
import { useGame } from './GameContext';

interface CardSelectionContextType {
  selectedCard: CardWithServerIndex | null;
  selectCard: (card: CardWithServerIndex | null) => void;
  clearSelection: () => void;
}

const CardSelectionContext = createContext<CardSelectionContextType>({
  selectedCard: null,
  selectCard: () => {},
  clearSelection: () => {},
});

export function CardSelectionProvider({ children }: { children: ReactNode }) {
  const game = useGame();
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Tìm lá bài thực tế và chỉ số vị trí mới nhất trên tay (serverIndex)
  const selectedCard = useMemo<CardWithServerIndex | null>(() => {
    if (selectedCardId === null) return null;
    const handCards = game.selfPlayer?.hand || [];
    const index = handCards.findIndex(c => c.id === selectedCardId);
    if (index === -1) return null;
    const liveCard = handCards[index];
    return {
      ...liveCard.data,
      serverIndex: index,
    };
  }, [selectedCardId, game.selfPlayer?.hand]);

  const selectCard = (card: CardWithServerIndex | null) => {
    if (!card) {
      setSelectedCardId(null);
      return;
    }
    setSelectedCardId(prev => (prev === card.id ? null : card.id));
  };

  const clearSelection = () => {
    setSelectedCardId(null);
  };

  return (
    <CardSelectionContext.Provider value={{ selectedCard, selectCard, clearSelection }}>
      {children}
    </CardSelectionContext.Provider>
  );
}

export function useCardSelection() {
  return useContext(CardSelectionContext);
}
