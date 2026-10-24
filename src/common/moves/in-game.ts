import type {IContext} from '../models';
import {TheGame} from '../entities/game';
import { INVALID_MOVE } from 'boardgame.io/core';

type GameMove<Args extends unknown[]> = (game: TheGame, ...args: Args) => void;

export function inGame<Args extends unknown[]>(move: GameMove<Args>) {
  return (context: IContext, ...args: Args): void | typeof INVALID_MOVE => {
    try {
      const game = new TheGame(context);
      game.animationsQueue.clear()
      move(game, ...args);
    } catch (error) {
      console.error(`Move failed: ${move.name || 'anonymous move'}`, error);
      return INVALID_MOVE;
    }
  };
}

