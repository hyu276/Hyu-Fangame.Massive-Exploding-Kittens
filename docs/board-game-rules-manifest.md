# Board Game: nguồn luật và mức phát hành

| Nguồn | Phạm vi dùng | Trạng thái |
|---|---|---|
| `E:/Download/EKBoardGame_FieldGuide_21NOV2024_Web-compressed_1.pdf`, trang 1–2 | Action Cards Classic, NOW, Cat Pair, Defuse và ngoại lệ | Đã đọc text và đối chiếu hình từng trang |
| `E:/Download/EKG-BG-MORE_Instructions_23JUNE2025_Web.pdf`, trang 1–2 | Setup Super Fan, di chuyển, flip, EK space, Ribbon, Move Discs | Đã đọc text và đối chiếu hình từng trang |
| Classic Instructions PDF 20/12/2024 | Setup/board Classic | Chưa có bản đính kèm trực tiếp; V3 trích dẫn. Cần đối chiếu độc lập trước khi gắn nhãn chính thức. |
| Super Fan Field Guide PDF 03/02/2025 | Charity Case, Feral Cat | Chưa có bản đính kèm trực tiếp; hiện dựa trên bản tóm tắt V3, cần đối chiếu nguyên bản. |

Hai PDF đính kèm xác nhận tổng Super Fan **72 Action Cards, 21 Move Discs, 6 Characters**, trong đó **10 Danger Magnets** được tách khỏi Move Deck ban đầu. V3 ghi Classic **64 Action Cards, 21 Move Discs, 6 Characters** từ Classic Instructions chưa được đính kèm. Không có bản kiểm kê số lượng từng subtype, hình đầy đủ Calm/Chaos hoặc chứng cứ license artwork. Vì vậy cả hai edition có `manifestStatus: unverified_manifest`, chỉ có mục đích playtest; UI cũng hiển thị cảnh báo này.

Luồng chơi hiện có: phát 5 bài/người; rút 3 khi bắt đầu lượt tay rỗng; Action/NOW/Nope trước rút Move Disc; move/flip/loop; ô Number/EK; Defuse hoặc swap người cuối rồi bỏ đến 3; thắng khi kết thúc di chuyển đúng Ribbon. Các hiệu ứng Action và Move Disc mô tả trong Field Guide/V3 có logic riêng và test tại `tests/board-game.test.ts`.

Các điểm chưa đạt để phát hành stable: subtype inventory chính xác, bản đồ từng ô hai mặt, timeout/reconnect ở mọi pending choice, kiểm thử trình duyệt mobile/keyboard, kiểm toán license sản phẩm, và Super Fan Field Guide gốc. Không dùng từ “official complete”.
