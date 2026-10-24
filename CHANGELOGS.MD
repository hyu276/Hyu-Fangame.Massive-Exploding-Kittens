# Lịch sử cập nhật dự án

Tài liệu công khai này ghi lại các tính năng, cải tiến, sửa lỗi và cơ chế nội bộ, kể cả những chi tiết không được thông báo trong giao diện game. Các mục ban đầu được ghi theo thứ tự triển khai.

## 1. Thêm chế độ Đấu Bot — 21/10/2026

### Tính năng

- Thêm nút **Đấu Bot** trong sảnh, cho phép chọn 1–10 bot, tương ứng tổng cộng 2–11 người chơi.
- Thêm năm mức độ khó: **Dễ, Vừa, Khó, Địa Ngục, Châu Á**. Các mức khác nhau về lựa chọn nước đi, đánh giá rủi ro, giữ bài phòng thủ, chọn mục tiêu, sử dụng Nope và ghi nhớ Future.
- Châu Á xét tối đa 120 hoán vị của 5 lá Future để tối ưu các lượt rút dự kiến và đặt bẫy đối thủ.
- Bot tự xử lý các bước tương tác: rút/đánh bài, chọn mục tiêu, cho bài, gỡ bom, Future, Search, Bury, Dig Deeper, hồi sinh, phòng thủ tráo bài và các bộ mở rộng.
- Trận bot chạy bằng boardgame.io Local trong trình duyệt, không cần game server. Mỗi bot có một client riêng và thực hiện nước đi qua engine.
- Thêm chọn bộ bài, tên bot và mức khó, trạng thái sẵn sàng, chơi lại và rời trận. Không gọi API lấy thông tin phòng online cho trận bot.
- Trận bot chưa lưu qua lần tải lại trang. Giao diện cấu hình nêu rõ giới hạn này.
- Phiên bản đầu chỉ dùng thông tin hợp lệ của ghế bot. Ngoại lệ riêng cho Châu Á được bổ sung ở lần cập nhật thứ hai bên dưới.

### Sửa lỗi và kiểm tra

- Bỏ việc sửa trạng thái đã đóng băng trong callback chọn lượt kế tiếp sau khi người chơi bị loại.
- Sửa xử lý nổ Timebomb ở cuối lượt để không phát sự kiện đổi stage/đổi lượt trong hook `onEnd`.
- Chuyển các thao tác nhận bài và đọc deck ẩn liên quan sang xử lý tại engine, tránh dự đoán client bằng dữ liệu đã bị che gây lỗi hoặc nhân đôi lá bài.
- Sửa chiều cao wrapper boardgame.io để bàn và bài hiển thị đầy đủ.
- Thêm lệnh `npm run test:bots`; tại thời điểm hoàn thành lần đầu, 34 bài kiểm tra đã qua, gồm ván mô phỏng nhiều độ khó/quy mô, các stage tương tác, bộ lập lịch, dừng bot, quyền xem bài và xếp Future.
- Build client/server và kiểm tra giao diện thực tế: tạo bàn, bot tự chơi, người chơi rút bài, chơi lại và rời trận.

## 2. Cải tiến phòng thủ và thông tin nội bộ của bot — 22/10/2026

### Tráo bài theo độ khó — không thông báo trong game

- Khi vào bước phòng thủ tráo bài 10 giây, bot **Khó** bấm tráo ngẫu nhiên mỗi **2 giây**, **Địa Ngục** mỗi **1 giây**, **Châu Á** mỗi **0,5 giây**.
- Lịch chạy tính từ lúc bắt đầu phòng thủ, không bắt đầu lại mỗi khi nhận một cập nhật trạng thái. Bot giữ bước phòng thủ đến hết 10 giây, gồm lần tráo cuối ở giây 10; Dễ/Vừa tiếp tục kết thúc phòng thủ sớm như trước.
- Các thao tác phòng thủ dùng chung stage này (cướp, đánh dấu, hủy bài, chôn tài nguyên) đều áp dụng lịch trên khi bot là người phòng thủ.
- Thứ tự bài thật thay đổi sau mỗi lần tráo. Khán giả và người chơi đã bị loại chỉ nhận thứ tự bài chụp lại tại các mốc **0–3–6–9–10 giây**, theo quyền xem bài hiện hành; không được mở thêm quyền xem các lá vốn bị ẩn.
- Giữ nguyên thứ tự hand đã chụp khi hiển thị cho khán giả, thay vì tự sắp theo loại bài. Khán giả không thấy cửa sổ hay chuyển động tráo bài trung gian.
- Mốc 0 lưu thứ tự ban đầu; 3/6/9 giây cập nhật ảnh chụp; mốc 10 hoàn tất phòng thủ và trả về hand cuối sau khi xử lý hành động cướp/đánh dấu/hủy bài. Không thêm thời gian chờ sau giây 10.
- Thông tin hand lưu để chụp và dữ liệu điều khiển nội bộ không được đưa nguyên vẹn vào `G` gửi cho các ghế khác.
- Không hiển thị tần suất tráo, quy tắc chụp hoặc các mốc cập nhật này trong mô tả độ khó, thông báo, chat hay giao diện người chơi.

### Quyền biết Future của Châu Á — cơ chế gian lận có chủ đích, không thông báo trong game

- Riêng bot Châu Á biết danh tính và thứ tự những lá người chơi đã xem rồi đặt lại lên deck khi hoàn tất **See the Future 1x/3x/5x**, **Alter the Future 3x/5x/NOW** hoặc **Share the Future**.
- See the Future giữ nguyên thứ tự; Alter/Share cung cấp thứ tự sau khi người chơi sắp xếp xong. Chỉ cung cấp tối đa số lá thuộc hiệu ứng Future đó, không cấp toàn bộ deck hay hand của người chơi.
- Thông tin truyền trực tiếp trong phiên bot qua callback riêng, không lưu vào trạng thái chung, log công khai, chat hoặc giao diện. Các mức còn lại không nhận thông tin này.
- Bot dùng thông tin này khi đánh giá rút bài, né bom, dùng bài thoát hiểm và các quyết định tiếp theo; thông tin được dịch chuyển hoặc xóa khi deck thay đổi, xáo lại hay không còn biết chắc thứ tự.
- Gỡ câu mô tả cũ khẳng định mọi bot chỉ dùng thông tin hợp lệ, vì câu đó không còn chính xác với Châu Á. Không thêm mô tả hay dấu hiệu tiết lộ cơ chế mới trong game.
- Thông tin này chỉ tồn tại trong phiên hiện tại; chơi lại hoặc rời trận sẽ dừng lịch bot và tạo lại trí nhớ cho phiên mới.

### Sửa lỗi và kiểm tra

- Tắt dự đoán client cho các thao tác tráo bài, công bố ảnh chụp, hoàn tất phòng thủ và yêu cầu Favor liên quan tới kho Tower of Power, tránh dùng bài đã che để cập nhật hand.
- Không cho client của người tấn công kết thúc phòng thủ của bot trước lịch tráo cuối. Chốt hết hạn dựa trên đúng thời điểm kết thúc 10 giây.
- Chuẩn hóa ID khán giả của transport Local để các lần cập nhật cũng áp dụng đúng quyền xem bài và ảnh chụp như lúc kết nối ban đầu.
- Thêm kiểm tra nhịp tráo từng độ khó, ảnh chụp của khán giả/người đã bị loại, quyền xem bài, thứ tự Future, thông tin riêng của Châu Á, vô hiệu hóa thông tin sau xáo deck và hủy lịch khi dừng phiên.
- Tách bộ theo dõi nước đi của bot để kiểm tra trực tiếp việc hủy các lịch tráo/ảnh chụp đang chờ khi dừng. Bộ kiểm tra hiện có 50 bài kiểm tra, bao gồm 30 cấu hình ván mô phỏng.

## 3. Rà soát và sửa vận hành game, bot, client và server — 22/10/2026

### Trạng thái trận và luật chơi

- Nước đi gặp lỗi trả về `INVALID_MOVE`; trạng thái plugin người chơi được tách riêng theo giao dịch. Deck, hand, lượt và các sự kiện đang chờ cùng được hoàn tác khi nước đi thất bại, tránh mất bài do chỉ bắt lỗi rồi giữ thay đổi dở dang.
- Chỉ nhận chỉ số nguyên hợp lệ khi thao tác hand, chôn bài, chọn vị trí rút và đặt lại bom. Không cho tự nhắm vào mình trong các hành động dành cho đối thủ.
- Sửa đếm lượt tấn công: số lượt hiển thị trùng số lượt phải thực hiện, cộng dồn đúng phần còn nợ, giữ người chơi qua lượt cuối còn nợ và đặt lại chuỗi khi sang lượt bình thường. Áp dụng cho Attack, Targeted Attack, Reverse Attack, Slap, Personal Attack và Attack of the Dead.
- Khi bàn đông thiếu bài, bổ sung từ bộ cơ bản và giữ dự trữ bài an toàn sau khi chia. Bỏ việc âm thầm thêm các gói mở rộng chưa được chọn.
- Bảo toàn thuộc tính lá bài khi di chuyển, gồm trạng thái ngửa của Imploding Kitten và khóa bài. Imploding đặt lại trên đỉnh được hiển thị công khai và nổ đúng khi rút lần tiếp theo.
- Kiểm tra lá cứu bom đang bị khóa; không coi lá bị khóa là khả năng cứu hợp lệ.
- Sửa tên hàm kiểm tra điều kiện của Feed the Dead để không mở bước chọn mục tiêu khi không có người chết hợp lệ.

### Rời trận và trải nghiệm người chơi

- Mỗi ghế được đầu hàng ở bất kỳ bước tương tác nào; ghế đang chờ chỉ có nước đầu hàng, không được rút hoặc đánh thay người khác.
- Người rời trận bị đánh dấu đã rời, giải phóng hàng đợi nộp bài và bước phòng thủ. Rời ở giữa lượt hiện tại dọn các hiệu ứng đang chờ và chuyển lượt; rời ngoài lượt không hủy lá đang chờ của người khác.
- Người Zombie chủ động rời trận bỏ hand, được loại khỏi danh sách hồi sinh/Feed the Dead và không giữ kẹt bước Grave Robber. Quy tắc này khác với chết do bom nhưng vẫn tiếp tục ở lại bàn.
- Cửa sổ rời trận chờ xác nhận trạng thái từ engine trước khi ngắt kết nối; khóa nút trong khi chờ và hiện lỗi để thử lại nếu chưa được xác nhận.
- Giữ ổn định component client để render của ứng dụng không tạo lại kết nối. Loại bỏ hai luồng khôi phục phiên chạy trùng nhau.
- Tách lịch cập nhật thông tin phòng khỏi thao tác đổi tần suất polling; bỏ phản hồi cũ khi đổi trận và tránh cập nhật tên/số ghế của trận trước vào trận mới.
- Sảnh xử lý được phòng không có `setupData`; số ghế đã có tên không bị coi là ghế trống chỉ vì mất kết nối. Lỗi tham gia phòng không tạo promise bị bỏ quên.
- Chỉ chủ phòng ghế 0 được bắt đầu trận hoặc đổi bộ bài; kiểm tra cả giao diện và engine.
- Sửa thứ tự gọi React hook của âm thanh, dọn hiệu ứng nhấp nháy tiêu đề khi rời bàn, tránh phát lại âm đánh bài trên mọi cập nhật trạng thái và xử lý giá trị âm lượng không hợp lệ.
- Thông báo gỡ bom dùng đúng người thực hiện và chỉ hiện một lần cho mỗi sự kiện, không gán nhầm cho người nhận lượt tiếp theo hay lặp lại ở mọi lượt sau. Thông báo chủ động rời trận được phân biệt với nổ bom.
- Ổn định các callback kéo vị trí bài và phụ thuộc effect; lint bỏ qua file khai báo Cloudflare được sinh tự động.

### Bài kín và vận hành bot

- Che tham số của các nước đi tiết lộ vị trí hoặc thứ tự bài kín trong log, gồm Alter Future, đặt lại bom, nộp bài và tráo hand. Wrapper Future riêng của Châu Á cũng giữ quy tắc che log.
- Lá Exploding Kitten được Streaking Kitten bảo vệ không bị lộ qua animation rút bài. Các quyền xem bài đã cấu hình vẫn được áp dụng.
- Các nước đọc dữ liệu kín chạy trên trạng thái có thẩm quyền, tránh client dự đoán bằng bài đã che. Sửa thứ tự kết thúc Favor qua Tower of Power để không ghi đè bước gỡ bom vừa được kích hoạt.
- Bot chọn lá Nope chưa bị khóa và thu ngắn thời gian phản ứng khi cửa sổ sắp hết hạn. Cập nhật cùng phiên bản trạng thái không liên tục đặt lại lịch bot.
- Các tần suất tráo, mốc ảnh chụp của khán giả và quyền biết Future riêng của Châu Á tiếp tục là cơ chế nội bộ; không thêm mô tả tiết lộ chúng trong game.

### Backend, lưu trữ và phụ thuộc

- Thêm `node-persist` vào phụ thuộc chạy thực tế để FlatFile hoạt động. Lỗi khởi tạo lưu trữ làm server báo lỗi và dừng khởi động thay vì âm thầm dùng RAM; lỗi khởi động bất đồng bộ được ghi nhận.
- Sửa thứ tự middleware phục vụ bản build: API và health hoạt động, asset nhận đúng nội dung, đường dẫn mời trận nhận HTML, asset thiếu trả 404. Chặn tải mã backend trong thư mục `dist/server` qua HTTP.
- Server tự xử lý deadline của lá đang chờ và phòng thủ, kể cả khi chủ thao tác ngắt kết nối. Thao tác deadline dùng cùng hàng đợi với nước đi socket để tránh xử lý đồng thời một trạng thái.
- Chặn packet socket giả mạo sự kiện đổi lượt/kết thúc game hoặc có ID ghế trong action không khớp ID gửi kèm. Các nước đi hợp lệ vẫn phải qua xác thực của engine.
- Kiểm tra số ghế, tên phòng, bộ bài và cờ xem bài ở API tạo phòng; cấu hình deck sai bị từ chối trước các kiểm tra riêng của chế độ chơi.
- Cập nhật các bản vá phụ thuộc và khóa phiên bản thay thế cho WebSocket, Socket.IO parser, cookie, CORS và esbuild. Nâng Socket.IO bên trong `koa-socket-2` để loại nhánh engine/parser cũ.
- Bỏ nodemon; `server:dev` dùng tsx theo dõi source và launcher biên dịch rồi chạy server bằng Node thông thường, tránh lỗi tương tác bộ nạp tsx với phụ thuộc Koa. Launcher theo dõi cả server và common.
- Sau cập nhật, `npm audit` còn **2 cảnh báo mức vừa**, liên quan Svelte cũ do boardgame.io kéo theo và cảnh báo tổng hợp của boardgame.io. Chưa coi audit là sạch; không dùng đề xuất hạ boardgame.io xuống bản cũ làm thay đổi API. Cần xử lý riêng việc nâng/thay phụ thuộc debug Svelte này.

### Kiểm tra

- `npm test`: 68 bài kiểm tra logic, gồm 30 cấu hình ván bot, các cơ chế bot nội bộ, lỗi giao dịch, bài kín, thông báo gỡ bom, đầu hàng, Zombie rời trận và các chế độ chơi đang có.
- `npm run test:server`: kiểm tra server production thật ở cổng/thư mục lưu trữ tạm riêng: asset/API, cấu hình sai, các client đã xác thực, packet giả mạo, deadline khi ngắt kết nối và khôi phục trạng thái/credentials sau restart.
- Kiểm tra build client/server và lint; bổ sung hướng dẫn lệnh kiểm tra vào README.
