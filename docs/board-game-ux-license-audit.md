# Board Game UX và nguồn asset

Renderer chọn React/CSS 2D, không thêm dependency. Bàn là track 18 node focusable, có nhãn Calm/Chaos, legend, HUD người chơi/đếm bài/deck/discard/reserve, zoom cơ bản, bố cục một cột trên màn hẹp và `prefers-reduced-motion`. Token hình tròn và ký hiệu ô do code/CSS tạo mới. Không import code, nhân vật, token, board art, sprite, logo, font hay âm thanh từ các repo Monopoly được V3 dẫn; vì vậy không có dependency/license Monopoly cần phân phối.

Các URL tham khảo UX trong V3 chỉ là ý tưởng trải nghiệm, không phải nguồn asset. Không dùng ảnh chụp PDF luật làm texture. Artwork Exploding Kittens trong phần card game hiện hữu của repo không được tái sử dụng trong Board Game mới; quyền sử dụng của phần card game không nằm trong phạm vi kiểm toán này.

QA còn thiếu: ảnh chụp 1440×900, 768×1024, 390×844 và 360×800; thử bằng touch, keyboard-only và screen reader trên trình duyệt thật; kiểm tra tương phản. Chưa có bằng chứng để tuyên bố đạt accessibility hoàn toàn. Một số lựa chọn kỹ thuật như thẻ ô focusable có thể cải tiến khi kiểm thử thực tế.
