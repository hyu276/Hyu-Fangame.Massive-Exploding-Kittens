import React from 'react';
import './CardInfoBox.css';
import { getCardInfo, ICardInfo } from '../../../common';

interface CardInfoBoxProps {
  card?: { name: string; index?: number } | string | null;
  className?: string;
  style?: React.CSSProperties;
}

export const CardInfoBox: React.FC<CardInfoBoxProps> = ({ card, className = '', style }) => {
  if (!card) return null;

  const info: ICardInfo = getCardInfo(card);

  return (
    <div className={`card-info-box ${className}`} style={style}>
      <div className="card-info-header">
        <div className="card-info-title-group">
          <span className="card-info-vn-name">{info.vietnameseName}</span>
          <span className="card-info-en-name">{info.englishName}</span>
        </div>
        <span
          className="card-info-category-badge"
          style={{ backgroundColor: info.badgeColor || '#64748b' }}
        >
          {info.category}
        </span>
      </div>

      <div className="card-info-short-effect">
        {info.shortEffect}
      </div>

      <div className="card-info-description">
        {info.description}
      </div>

      {info.instructions && (
        <div className="card-info-instructions">
          <span>{info.instructions}</span>
        </div>
      )}
    </div>
  );
};

export default CardInfoBox;
