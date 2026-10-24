# Board Game rule ledger

`[CT]` là luật đọc trực tiếp từ PDF đính kèm; `[VC]` có implementation/test; `[CX]` chưa đủ nguồn; `[LN]` là quyết định số hóa thử nghiệm. Trang PDF tính từ 1.

| Luật | Nguồn | Code/test | Mức |
|---|---|---|---|
| 5 Action Cards/người, tay rỗng đầu lượt rút 3, 10 Magnet ngoài Move Deck | Super Fan Instructions tr.1 | `createBoardState`, `startTurn`; BG-01/02 | CT+VC |
| Move 1–5, OR Flip, Flip Then Move, Cut The Line, Danger Magnet | Super Fan Instructions tr.1–2 | `resolveDisc`, `cutTheLine`, `dangerMagnet`; BG-04/05/06 | CT+VC một phần |
| Flip tự thân không kích hoạt ô; Number/EK chỉ khi dừng di chuyển | Super Fan Instructions tr.1–2 | `flip`, `landAt`; BG-04/05 | CT+VC |
| Defuse giữ nguyên EK; nếu không thì đổi với người cuối, bỏ đến 3; swap không kích hoạt ô | Super Fan Instructions tr.2; Classic Field Guide tr.2 | `explosion`, `afterSwap`; BG-07/08/09 | CT+VC |
| Ribbon phải đáp đúng; vượt thì Loop Back | Super Fan Instructions tr.1 | `nextIndex`, `landAt`; BG-10/11 | CT+VC trên fixture track |
| Expose bỏ qua đĩa đã ngửa; Alter kín và vẫn giữ face-up | Classic Field Guide tr.1 | `resolveAction`, `reorderFuture`; BG-12/13 | CT+VC |
| Shuffle NOW hợp lệ khi Move Discard rỗng; Ditto cần Discard | Classic Field Guide tr.2 | `resolveAction`, `proposeAction`; BG-14/15 | CT+VC |
| Mega tính số, zero không kích hoạt ô; Slow extra turn sau nổ | Classic Field Guide tr.2 | `resolveAction`; BG-17/19 | CT+VC |
| NOW trước rút đầu, Nope chỉ Action Card | Classic Field Guide tr.1–2 | `proposeAction`, `nope`, `drawAndResolve` | CT+VC logic; CX mạng/timeout |
| Charity Case/Feral Cat | Super Fan Field Guide được V3 tóm tắt, bản PDF gốc chưa đính kèm | `resolveAction`; BG-21/22 | CX nguồn trực tiếp |
| Từng subtype count và từng ô Calm/Chaos | Không có trong hai PDF đính kèm | `manifest.ts`, `track.ts` | LN playtest, unverified |
| Thứ tự đồng thời nhiều NOW trên mạng | Hai PDF không định nghĩa | server xử lý thứ tự move nhận được, actor chốt pending | LN digital arbitration, cần UX timeout |
