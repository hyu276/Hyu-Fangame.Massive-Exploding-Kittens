import { useEffect, useId, useRef, useState } from 'react';
import './Credits.css';

const FORK_URL = 'https://github.com/hyu276/Hyu-Fangame.Massive-Exploding-Kittens';
const ORIGINAL_URL = 'https://github.com/DomiIRL/exploding-kittens';

interface CreditsButtonProps {
  appearance?: 'card' | 'board';
}

/** Native modal dialog: Escape closes it, focus is trapped by the browser and restored on close. */
export function CreditsButton({ appearance = 'card' }: CreditsButtonProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`game-credits-trigger game-credits-trigger--${appearance}`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">★</span> Credits / Ghi công
      </button>
      <dialog
        ref={dialogRef}
        className="game-credits-dialog"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={event => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="game-credits-head">
          <p className="game-credits-eyebrow">EXPLODING KITTENS · FAN PROJECT</p>
          <h2 id={titleId}>Những người đứng sau cuộc chơi</h2>
          <p>Một trò chơi được tiếp nối từ mã nguồn mở, phát triển và cải tiến cho cộng đồng.</p>
          <button type="button" className="game-credits-close" onClick={() => dialogRef.current?.close()} aria-label="Đóng Credits">
            ✕
          </button>
        </div>
        <div className="game-credits-body">
          <section className="game-credits-section game-credits-feature">
            <p className="game-credits-label">PHÁT TRIỂN & MỞ RỘNG PHIÊN BẢN NÀY</p>
            <h3>Hyu <small>(@hyu276)</small></h3>
            <p>
              Phát triển và duy trì bản fan-game Massive Exploding Kittens, dựa trên nền tảng mã nguồn mở:
              mở rộng chế độ và bộ bài, cải tiến luật chơi và luồng tương tác, phát triển tính năng
              đấu bot, bản địa hóa giao diện tiếng Việt, hoàn thiện trải nghiệm người chơi
              và xây dựng công cụ quản lý artwork.
            </p>
            <p>
              Những phần mở rộng, thiết kế tương tác và tính năng bổ sung thuộc công việc cải tiến
              của phiên bản này; không đồng nghĩa với quyền tác giả đối với trò chơi hoặc mọi
              hình minh họa gốc.
            </p>
            <a href={FORK_URL} target="_blank" rel="noopener noreferrer">Xem phiên bản Massive Exploding Kittens ↗</a>
          </section>
          <section className="game-credits-section">
            <p className="game-credits-label">NỀN TẢNG MÃ NGUỒN MỞ</p>
            <h3>Dominik · DomiIRL</h3>
            <p>
              Tác giả của repository gốc <em>exploding-kittens</em> và các cộng tác viên đóng góp
              cho dự án nguồn. Phiên bản này được phát triển dựa trên mã nguồn đó.
            </p>
            <a href={ORIGINAL_URL} target="_blank" rel="noopener noreferrer">Repository gốc ↗</a>
            <a href={ORIGINAL_URL + '/graphs/contributors'} target="_blank" rel="noopener noreferrer">Danh sách người đóng góp ↗</a>
          </section>
          <section className="game-credits-section">
            <p className="game-credits-label">BẢN QUYỀN PHẦN MỀM</p>
            <h3>MIT License</h3>
            <p>
              Copyright © 2025 Dominik. Thông báo bản quyền và giấy phép MIT của
              mã nguồn gốc được giữ nguyên trong repository. MIT cho phép sử dụng,
              chỉnh sửa và phân phối phần mềm theo các điều kiện ghi trong giấy phép.
            </p>
            <a href={FORK_URL + '/blob/main/LICENSE'} target="_blank" rel="noopener noreferrer">Đọc MIT License đầy đủ ↗</a>
          </section>
          <section className="game-credits-section game-credits-notice">
            <p className="game-credits-label">MỤC ĐÍCH DỰ ÁN</p>
            <p>
              Dự án fan-made, phục vụ học tập, nghiên cứu và trải nghiệm phi thương mại.
              Không phải sản phẩm chính thức, không có quan hệ tài trợ hay bảo trợ với
              chủ sở hữu thương hiệu Exploding Kittens.
            </p>
            <p>
              Thương hiệu Exploding Kittens, hình ảnh và các nội dung của bên thứ ba
              thuộc về chủ sở hữu tương ứng. Giấy phép MIT của mã nguồn không tự động
              cấp quyền đối với các tài sản trí tuệ độc lập này.
            </p>
            <a href="https://www.explodingkittens.com/" target="_blank" rel="noopener noreferrer">Ủng hộ trò chơi chính thức ↗</a>
          </section>
        </div>
        <div className="game-credits-actions">
          <button type="button" onClick={() => dialogRef.current?.close()}>Quay lại trò chơi</button>
        </div>
      </dialog>
    </>
  );
}
