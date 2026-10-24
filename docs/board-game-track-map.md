# Board track: ánh xạ kỹ thuật thử nghiệm

`src/common/board-game/track.ts` dùng node ID logic và cạnh `nextNodeBySide`, không dùng layout Monopoly. Litter Box là index 0, Ribbon là 17, vượt Ribbon quay về index 1. Vị trí token giữ nguyên qua Flip; kiểu ô được tra theo side. Đây là **fixture số hóa để test**, không phải bản đồ chính thức: hai PDF đính kèm không hiển thị toàn bộ từng ô của cả hai mặt đủ rõ để nhập bản đồ chính xác.

| Index | Calm | Chaos |
|---:|---|---|
| 0 | Litter Box | Litter Box |
| 1 | +1 | +2 |
| 2 | +2 | EK |
| 3 | EK | +1 |
| 4 | +1 | +3 |
| 5 | +3 | EK |
| 6 | +2 | +2 |
| 7 | EK | +1 |
| 8 | +1 | EK |
| 9 | +2 | +3 |
| 10 | +3 | +1 |
| 11 | EK | +2 |
| 12 | +2 | EK |
| 13 | +1 | +3 |
| 14 | +3 | +2 |
| 15 | EK | +1 |
| 16 | +2 | EK |
| 17 | Ribbon → 1 | Ribbon → 1 |

Để thay fixture: chụp/đối chiếu bàn vật lý hoặc bản scan hai mặt Calm/Chaos và mũi tên Loop Back; nhập từng node, `nextNodeBySide` và số Action Cards, rồi cập nhật snapshot/test. Không được chỉ đổi màu hoặc ảnh nền mà giữ fixture cũ và gọi là bản chính thức.
