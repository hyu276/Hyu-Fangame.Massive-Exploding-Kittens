# Board Game: card/disc manifest thử nghiệm

Nguồn đã xem: `EKG-BG-MORE_Instructions_23JUNE2025_Web.pdf` trang 1–2 và `EKBoardGame_FieldGuide_21NOV2024_Web-compressed_1.pdf` trang 1–2. Tổng số trên hộp/PDF không đủ suy ra multiplicity từng loại. `src/common/board-game/manifest.ts` chứa phân phối tự chọn cho playtest, **không được coi là deck chính thức**.

## Action Cards

Classic fixture 64 lá: Expose 1/3, Alter 2 NOW, Swap Top/Bottom NOW, Flip NOW, Shuffle NOW, Fast Pass mỗi loại 2; Add Magnet NOW và Nope NOW mỗi loại 4; Defuse 6; ba Cat type mỗi loại 5; Skip/Draw 3, Draw to Five, Draw Bottom, Mega Move, Slow and Steady, 1 Small Step, Ditto mỗi loại 3. Super Fan fixture thêm 4 Charity Case và 4 Feral Cat = 72. Tất cả số theo subtype trong câu này **chưa xác minh**.

## Move Discs

Fixture 11 đĩa ban đầu: Move 1–5, Move 1/3/5 OR Flip, Flip Then Move 2/4, Cut The Line — mỗi loại 1. Reserve 10 Danger Magnets, ID `magnet0`…`magnet9`, ban đầu không nằm trong Move Draw. Đây là phương án thử nghiệm để đạt tổng 21 và bao phủ các loại effect đã được rulebook liệt kê, **không phải bằng chứng bản in có một bản mỗi subtype**.

`BoardRace` duy trì ID riêng của Action, Move và Magnet; Action/Move discard được xáo lại đúng loại khi cạn. `Ditto` tái dùng effect của top Move Discard mà không sinh ID mới. `Mega Move` lấy hai ID khác nhau rồi mới đưa vào discard. `Shuffle NOW` gộp Move Draw + Move Discard, úp tất cả và xáo. Public view che order của đĩa úp, magnet insertion index, tay đối thủ và Action Draw order.

**Release gate:** `unverified_manifest` cho cả Classic và Super Fan cho đến khi có ảnh cardlist/inventory từng subtype được kiểm kê. Cần lưu checksum của manifest đã xác minh trong một phiên bản sau; hiện không có checksum chính thức.
