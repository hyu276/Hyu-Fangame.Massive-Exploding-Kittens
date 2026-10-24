export const SERVER_PORT = 51399;

export const getServerUrl = (): string => {
  // If an explicit API URL is set via environment variable (e.g. in Vite build)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined') {
    // In local development on Vite dev server (e.g. port 5173 or 3000), connect to backend port 51399
    if (window.location.port === '5173' || window.location.port === '3000') {
      return `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`;
    }
    // In production (served from same host/domain), connect directly to the current origin
    return window.location.origin;
  }

  return `http://localhost:${SERVER_PORT}`;
};

export const SERVER_URL = getServerUrl();
export const GAME_NAME = 'Exploding-Kittens';
export { BOARD_GAME_NAME } from '../common/board-game/manifest';
