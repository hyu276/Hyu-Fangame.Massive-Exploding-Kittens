import { resolveArtworkTexture } from './card-artwork-map';

/**
 * Cache Egress Optimization:
 * Thay vì tải trước ồ ạt 250+ lá bài (~215MB) ngay khi mở ứng dụng làm phình to Cache Egress,
 * hệ thống chỉ tải trước các thẻ bài cốt lõi (Core Essentials) xuất hiện trong mọi trận đấu.
 * Các thẻ bài mở rộng còn lại sẽ được nạp lười (Lazy-load on demand) khi ván chơi bắt đầu
 * hoặc khi thẻ bài xuất hiện trên tay người chơi.
 */

// Bộ nhớ đệm URL đã tải trong phiên để loại trừ hoàn toàn các request trùng lặp
const preloadedUrls = new Set<string>();

/**
 * Danh sách các lá bài cốt lõi luôn có mặt trong mọi trận đấu.
 * Tổng dung lượng < 4MB (thay vì 215MB), giảm 98% egress ban đầu.
 */
export const CORE_CARD_TYPES = [
  'back',
  'exploding_kitten',
  'defuse',
  'nope',
  'attack',
  'skip',
  'favor',
  'see_the_future',
  'shuffle',
];

/**
 * Tải trước một ảnh đơn lẻ với cơ chế deduplication
 */
export function preloadSingleImage(src: string): Promise<void> {
  if (preloadedUrls.has(src)) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      preloadedUrls.add(src);
      resolve();
    };
    img.onerror = () => {
      // Không crash hoặc retry loop khi thiếu asset
      resolve();
    };
    img.src = src;
  });
}

/**
 * Tải trước các thẻ cốt lõi khi khởi động ứng dụng (Minimal Egress Boot)
 */
export const preloadCoreCardImages = (): Promise<void[]> => {
  const coreUrls = CORE_CARD_TYPES.map(type => {
    if (type === 'back') return '/assets/cards/back/0.jpg';
    // Use the same path and revision as the in-game renderer, including WebP/JPEG.
    return resolveArtworkTexture({ name: type, index: 0, artworkSlot: 0 }) ??
      `/assets/cards/${type}/0.png`;
  });

  return Promise.all(coreUrls.map(url => preloadSingleImage(url)));
};

/**
 * Tải trước theo ngữ cảnh trận đấu: chỉ tải các lá thuộc bộ bài được kích hoạt trong match
 */
export const preloadMatchCardImages = (cardNames: string[]): void => {
  if (typeof window === 'undefined' || !Array.isArray(cardNames)) return;

  // Sử dụng requestIdleCallback hoặc setTimeout để không chiếm băng thông và CPU của websocket match
  const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));

  idleCallback(() => {
    const uniqueCards = Array.from(new Set(cardNames));
    uniqueCards.slice(0, 15).forEach(cardName => {
      const url = resolveArtworkTexture({ name: cardName, index: 0, artworkSlot: 0 }) ??
        `/assets/cards/${cardName}/0.png`;
      void preloadSingleImage(url);
    });
  });
};

/**
 * Tương thích ngược: Mặc định nạp Core Essentials để đảm bảo Egress tối giản
 */
export const preloadCardImages = preloadCoreCardImages;
