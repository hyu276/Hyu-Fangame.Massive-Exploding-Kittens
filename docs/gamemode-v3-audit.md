# Kiểm kê gamemode V3 — 23/10/2026

Đây là trạng thái mã nguồn hiện tại, không phải tuyên bố tương thích hoàn toàn với bản in. Repo có nhiều thay đổi chưa commit từ trước; đợt này không reset/commit những thay đổi đó.

| Phạm vi | Mã nguồn/UI | Bằng chứng | Trạng thái |
|---|---|---|---|
| Card game ID 0–13 | `src/common/constants/game-modes.ts`, `src/common/exploding-kittens.ts`, lobby cũ | `tests/game-modes.test.ts`, `tests/game-audit.test.ts`; 103 test tổng thể qua | PASS về hồi quy engine hiện có; chưa phải xác nhận toàn bộ luật sản phẩm |
| Cat Burglar official-compatible mix | Mode ID 4 còn `setupKind: standalone`, `allowsExpansionSelection: false` | Chưa có interaction test đầy đủ với ba expansion được nêu | CHƯA TRIỂN KHAI |
| Zombie compatibility matrix | Các mode 5–7 và Zombie expansion tách riêng | Có test setup/bot; chưa có ma trận interaction cross-expansion | MỘT PHẦN |
| Good vs Evil mixed profile | Mode ID 9 còn standalone | Test setup/bot; chưa có mixed profile | MỘT PHẦN |
| Recipes for Disaster | `src/common/constants/recipes.ts`; 15 tên/link online trong catalog, ba fixture cũ; chỉ Sticky Fingers mở playtest | Sticky Fingers smoke test; server từ chối `recipeSlug` khác; Ingredients chưa đối chiếu nguồn | MỘT PHẦN; mode đổi `experimental`, recipe còn lại khóa |
| Quarantined Kittens | Chưa có ID 14/game state grid | Chưa có test | CHƯA TRIỂN KHAI |
| Duels / Convention Tournament | Chưa có bracket/multi-match state | Chưa có test | CHƯA TRIỂN KHAI |
| Board Game Classic/Super Fan | `src/common/board-game/`, `src/client/components/board-game/`, server game riêng | `tests/board-game.test.ts`, `tests/server-audit.test.ts` | BẢN THỬ NGHIỆM CHƠI ĐƯỢC; manifest/track chưa xác minh |

Mode ID 0–13 giữ nguyên; Board Game dùng `Exploding-Kittens-Board-Game` tách biệt, không chiếm ID 14. Chưa có thay đổi migration state của card game.

Kiểm tra: `npm test` 103/103; `npm run build` và `npm run build:server` qua; `npm run test:server` 2/2; `npm run lint` toàn repo qua. Trên máy Windows này, `tsx` gặp lỗi môi trường `uv_os_get_passwd ENOMEM`; kiểm thử chạy với preload cục bộ `tmp/tsx-os-userinfo.cjs`, không phải sửa logic sản phẩm.
