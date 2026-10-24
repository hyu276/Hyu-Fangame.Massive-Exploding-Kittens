export interface CatBurglarCardOption {
  index: number;
  name: string;
  vietnameseName: string;
  avatar: string;
}

export const CAT_BURGLAR_TARGET_CARDS: CatBurglarCardOption[] = [
  { index: 0, name: 'Tacocat', vietnameseName: 'Tacocat', avatar: '/assets/cards/cat_card/0.png' },
  { index: 1, name: 'Cattermelon', vietnameseName: 'Cattermelon (Mèo Dưa Hấu)', avatar: '/assets/cards/cat_card/1.png' },
  { index: 2, name: 'Hairy Potato Cat', vietnameseName: 'Hairy Potato Cat (Mèo Khoai Tây)', avatar: '/assets/cards/cat_card/2.png' },
  { index: 3, name: 'Beard Cat', vietnameseName: 'Beard Cat (Mèo Có Râu)', avatar: '/assets/cards/cat_card/3.png' },
  { index: 4, name: 'Rainbow-Ralphing Cat', vietnameseName: 'Rainbow-Ralphing Cat (Mèo Nôn Cầu Vồng)', avatar: '/assets/cards/cat_card/4.png' },
];

export interface CatBurglarActionResult {
  robberId: string;
  targetId: string;
  requestedCatIndex: number;
  catName: string;
  success: boolean;
  timestamp: number;
}
