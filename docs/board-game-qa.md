# Board Game QA — 23/10/2026

| ID | Trạng thái | Bằng chứng / khoảng trống |
|---|---|---|
| BG-01, 02, 03, 04, 05, 06 | PASS logic | `tests/board-game.test.ts` setup, refill, occupied, flip, OR branch |
| BG-07, 08, 09, 10, 11 | PASS logic | Defuse/swap/discard, exact Ribbon/loop trên fixture |
| BG-12, 13, 14, 15, 16, 17 | PASS logic | Expose/Alter/Shuffle/Ditto/Magnet/Mega zero |
| BG-18 | PASS logic | Fast Pass bỏ Move 2 và Magnet, dừng ở Move 5 OR Flip |
| BG-19 | PASS logic | Slow extra sau EK swap |
| BG-20 | PASS logic | Ba Nope toggle pending Action, Nope muộn bị từ chối |
| BG-21, 22 | PASS logic / CX nguồn | Charity/Feral unit test; thiếu Super Fan Field Guide gốc |
| BG-23 | MỘT PHẦN | SocketIO reconnect giữ phase/vị trí sau rút; chưa có test riêng mọi pending Defuse/OR Flip/Alter và timeout |
| BG-24 | CHƯA XÁC MINH | Chưa chạy browser viewport/keyboard/touch |
| BG-25, 26 | PASS kiến trúc | Game definition/lobby riêng, SocketIO filter secret, card mode IDs giữ nguyên |
| BG-27 | PASS engine smoke | Hai và sáu ghế tự động đến người thắng; chưa có bot-only qua browser |
| BG-28 | PASS release gate | `unverified_manifest` trong state, lobby và HUD có nhãn playtest |

Lệnh đã chạy: `npm test` 103/103, `npm run test:server` 2/2, `npm run build`, `npm run build:server`, `npm run lint` toàn repo. Lệnh `tsx` trên Windows host cần preload cục bộ vì `node:os.userInfo()` trả `ENOMEM`; không phải lỗi test.

Chưa có screenshot/video demo. Không khẳng định edition Classic/Super Fan hoàn toàn đúng bản in khi card subtype counts và track map chưa xác minh.
