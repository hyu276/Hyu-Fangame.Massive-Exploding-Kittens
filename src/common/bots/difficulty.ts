export const BOT_DIFFICULTIES = {
  easy: { label: 'Dễ', level: 0, description: 'Chơi ngẫu nhiên, ít dùng bài và thường bỏ lỡ cơ hội phòng thủ.' },
  medium: { label: 'Vừa', level: 1, description: 'Biết giữ bài gỡ bom, dùng bài tấn công và tránh nguy hiểm đã thấy.' },
  hard: { label: 'Khó', level: 2, description: 'Ghi nhớ tương lai, cân nhắc rủi ro và chọn mục tiêu có lợi.' },
  hell: { label: 'Địa Ngục', level: 3, description: 'Phản đòn bằng Nope, xếp bẫy và giữ bài thoát hiểm cho cuối trận.' },
  asia: { label: 'Châu Á', level: 4, description: 'Khó nhất: tính nhiều lượt rút, tối ưu bẫy tương lai và khai thác bài công khai.' },
} as const;

export type BotDifficulty = keyof typeof BOT_DIFFICULTIES;

export interface BotMatchOptions {
  botCount: number;
  difficulty: BotDifficulty;
  playerName: string;
  selectedDecks: string[];
  gameMode?: number;
}
