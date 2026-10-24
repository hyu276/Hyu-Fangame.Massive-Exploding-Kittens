import { useState } from 'react';
import { createPortal } from 'react-dom';
import './Rulebook.css';

// Card Images
const CARD_IMAGES = {
  attack: '/assets/cards/attack/0.png',
  skip: '/assets/cards/skip/0.png',
  favor: '/assets/cards/favor/0.png',
  shuffle: '/assets/cards/shuffle/0.png',
  seeFuture: '/assets/cards/see_the_future/0.png',
  nope: '/assets/cards/nope/0.png',
  defuse: '/assets/cards/defuse/0.png',
  exploding: '/assets/cards/exploding_kitten/0.png',
  catCard: '/assets/cards/cat_card/0.png',
  alterTheFuture: '/assets/cards/alter_the_future/0.png',
  alterTheFuture3xNow: '/assets/cards/alter_the_future_3x_now/0.png',
  alterTheFuture5x: '/assets/cards/alter_the_future_5x/0.png',
  targetedAttack: '/assets/cards/targeted_attack/0.png',
  drawFromTheBottom: '/assets/cards/draw_from_the_bottom/0.png',
  feralCat: '/assets/cards/feral_cat/0.png',
  implodingKitten: '/assets/cards/imploding_kitten/0.png',
  reverse: '/assets/cards/reverse/0.png',
  barkingKitten: '/assets/cards/barking_kitten/0.png',
  bury: '/assets/cards/bury/0.png',
  illTakeThat: '/assets/cards/ill_take_that/0.png',
  personalAttack3x: '/assets/cards/personal_attack_3x/0.png',
  potluck: '/assets/cards/potluck/0.png',
  shareTheFuture3x: '/assets/cards/share_the_future_3x/0.png',
  superSkip: '/assets/cards/super_skip/0.png',
  towerOfPower: '/assets/cards/tower_of_power/0.png',
  catomicBomb: '/assets/cards/catomic_bomb/0.png',
  curseOfTheCatButt: '/assets/cards/curse_of_the_cat_butt/0.png',
  garbageCollection: '/assets/cards/garbage_collection/0.png',
  mark: '/assets/cards/mark/0.png',
  seeTheFuture5x: '/assets/cards/see_the_future_5x/0.png',
  streakingKitten: '/assets/cards/streaking_kitten/0.png',
  swapTopAndBottom: '/assets/cards/swap_top_and_bottom/0.png',
  attackOfTheDead: '/assets/cards/attack_of_the_dead/0.png',
  clairvoyance: '/assets/cards/clairvoyance/0.png',
  clone: '/assets/cards/clone/0.png',
  digDeeper: '/assets/cards/dig_deeper/0.png',
  feedTheDead: '/assets/cards/feed_the_dead/0.png',
  graveRobber: '/assets/cards/grave_robber/0.png',
  shuffleNow: '/assets/cards/shuffle_now/0.png',
  zombieKitten: '/assets/cards/zombie_kitten/0.png',
  timebombKitten: '/assets/cards/timebomb_kitten/0.png',
  defuseTimebomb: '/assets/cards/defuse_timebomb/0.png',
  discard: '/assets/cards/discard/0.png',
  search: '/assets/cards/search/0.png',
  copycat: '/assets/cards/copycat/0.png',
};

export function RulebookModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return createPortal(
    <div className="rulebook-modal-wrapper">
      <div className="rulebook-backdrop" onClick={onClose} />
      <div className="rulebook-content">
        <div className="rulebook-header">
          <h2>LUẬT CHƠI CHÍNH THỨC</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="rulebook-nav-tabs">
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-rules')}>📖 Cơ chế</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('game-modes-section')}>🎮 Chế độ chơi</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-original')}>🃏 Tiêu chuẩn</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-imploding')}>💣 Imploding</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-streaking')}>🩲 Streaking</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-barking')}>🐶 Barking</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-zombie')}>🧟 Zombie</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-aggro')}>🔥 Aggro</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-attacking')}>⚔️ Attacking</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-defending')}>🛡️ Defending</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-creepy')}>👁️ Creepy</button>
          <button type="button" className="nav-tab-btn" onClick={() => scrollTo('deck-timebomb')}>⏰ Timebomb</button>
        </div>
        <div className="rulebook-body">
          <section className="rule-section" id="deck-rules">
            <h3>CƠ CHẾ HOẠT ĐỘNG</h3>
            <p>
              Trong bộ bài có chứa một số chú Mèo Nổ (Exploding Kittens). Bộ bài được đặt úp giữa bàn, các người chơi lần lượt đến lượt mình sẽ rút bài cho đến khi có người rút phải một chú Mèo Nổ.
            </p>
            <p>
              Khi điều đó xảy ra, người đó sẽ bị nổ tung! Họ đã chết và bị loại khỏi cuộc chơi ngay lập tức.
            </p>
            <p>
              Quá trình này tiếp diễn cho đến khi chỉ còn đúng 1 người chơi duy nhất sống sót — người đó sẽ chiến thắng trò chơi!
            </p>
          </section>

          <section className="rule-section">
            <h3>TÓM LẠI LÀ</h3>
            <p>
              Nếu bạn nổ, bạn thua. Nếu bạn không nổ, BẠN THẮNG. Tất cả các lá bài khác sinh ra là để giúp bạn giảm thiểu tối đa nguy cơ bị Mèo Nổ nổ tung!
            </p>
          </section>

          <section className="rule-section">
            <h3>LƯỢT CHƠI CỦA BẠN</h3>
            <ol>
              <li>Quan sát các lá bài trên tay. Bạn có thể chọn 1 trong 2 cách:
                <ul>
                  <li><strong>Không đánh lá bài nào cả.</strong></li>
                  <li><strong>Đánh bao nhiêu lá bài tùy thích</strong> (lần lượt từng lá hoặc đánh theo cặp thẻ mèo).</li>
                </ul>
              </li>
              <li>
                <strong>Kết thúc lượt bằng cách RÚT 1 LÁ BÀI</strong> từ trên đỉnh của Chồng bài rút và cầu nguyện lá đó không phải là Mèo Nổ!
              </li>
            </ol>
          </section>
          
          <section className="rule-section">
            <h3>3 ĐIỀU CẦN LƯU Ý</h3>
            <ul>
              <li>Chiến thuật khôn ngoan là tích lũy các lá bài quan trọng ở đầu game, khi xác suất bốc phải Mèo Nổ vẫn còn thấp.</li>
              <li>Bạn luôn có thể đếm số lá bài còn lại trong Chồng bài rút để tính toán tỉ lệ nguy hiểm nổ bom.</li>
              <li>Không có giới hạn số lượng bài tối đa hoặc tối thiểu trên tay. Nếu bạn hết sạch bài trên tay, bạn vẫn tiếp tục chơi bình thường và sẽ rút ít nhất 1 lá bài ở lượt kế tiếp.</li>
            </ul>
          </section>

          <section className="rule-section" id="deck-original">
            <h3>CẨM NANG THẺ BÀI (BỘ TIÊU CHUẨN)</h3>
            <div className="card-list">
              <div className="card-item">
                <img src={CARD_IMAGES.exploding} alt="Mèo Nổ" />
                <div className="card-info">
                  <h4>Mèo Nổ (Exploding Kitten)</h4>
                  <p>Bạn phải lật lá này ngay lập tức. Nếu không có thẻ Gỡ Bom (Defuse), bạn sẽ chết và bị loại khỏi trò chơi. Toàn bộ bài trên tay bạn sẽ bị hủy.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.defuse} alt="Gỡ Bom" />
                <div className="card-info">
                  <h4>Gỡ Bom (Defuse)</h4>
                  <p>Nếu bạn rút phải Mèo Nổ, thẻ này giúp bạn thoát chết! Bạn được quyền bí mật chọn bất kỳ vị trí nào trong Chồng bài rút để nhét Mèo Nổ trở lại (trên cùng, dưới đáy, vị trí tùy chọn).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.attack} alt="Tấn Công" />
                <div className="card-info">
                  <h4>Tấn Công (Attack)</h4>
                  <p>Kết thúc lượt của bạn ngay lập tức mà KHÔNG CẦN RÚT BÀI, đồng thời ép người chơi kế tiếp phải thực hiện 2 lượt liên tiếp. Các lượt Tấn Công có thể cộng dồn nếu người kế tiếp cũng đánh Tấn Công.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.skip} alt="Bỏ Lượt" />
                <div className="card-info">
                  <h4>Bỏ Lượt (Skip)</h4>
                  <p>Kết thúc lượt hiện tại của bạn ngay lập tức mà không cần rút bài. (Nếu bạn đang chịu 2 lượt do bị Tấn Công, 1 lá Skip chỉ giúp bạn bỏ qua 1 trong 2 lượt đó).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.favor} alt="Xin Xỏ" />
                <div className="card-info">
                  <h4>Xin Xỏ / Ban Ơn (Favor)</h4>
                  <p>Ép một người chơi bất kỳ còn sống phải tự chọn 1 lá bài trên tay họ để giao nộp cho bạn.</p>
                </div>
              </div>
              
              <div className="card-item">
                <img src={CARD_IMAGES.shuffle} alt="Xáo Bài" />
                <div className="card-info">
                  <h4>Xáo Bài (Shuffle)</h4>
                  <p>Xáo trộn ngẫu nhiên toàn bộ Chồng bài rút mà không nhìn trộm bài. Cực kỳ hữu hiệu khi bạn biết sắp có Mèo Nổ trên đỉnh!</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.seeFuture} alt="Nhìn Trước Tương Lai" />
                <div className="card-info">
                  <h4>Nhìn Trước Tương Lai (See The Future)</h4>
                  <p>Nhìn trộm 3 lá bài đầu tiên trên đỉnh Chồng bài rút theo thứ tự từ trên xuống dưới mà không để người khác nhìn thấy.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.nope} alt="Chặn" />
                <div className="card-info">
                  <h4>Chặn (Nope)</h4>
                  <p>Vô hiệu hóa bất kỳ hành động nào của người khác vừa đánh ra (trừ Mèo Nổ và Gỡ Bom). Bạn có thể đánh lá này bất cứ lúc nào trong thời gian đếm ngược, kể cả khi không phải lượt của bạn. Bạn cũng có thể dùng Nope để chặn một lá Nope khác (Hủy chặn).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.catCard} alt="Thẻ Mèo Thường" />
                <div className="card-info">
                  <h4>Thẻ Mèo Thường (Cat Cards)</h4>
                  <p>Những thẻ bài này không có hiệu ứng khi đánh riêng lẻ. Nhưng khi bạn gom đủ một CẶP (2 lá cùng hình/loại mèo), bạn có thể đánh ra để cướp ngẫu nhiên 1 lá bài từ tay người chơi khác.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rule-section" id="deck-imploding">
            <h3>GÓI MỞ RỘNG: IMPLODING KITTENS (20 LÁ)</h3>
            <div className="card-list">
              <div className="card-item">
                <img src={CARD_IMAGES.implodingKitten} alt="Imploding Kitten" />
                <div className="card-info">
                  <h4>Imploding Kitten (1 lá)</h4>
                  <p>Lần đầu rút úp: không nổ, bạn không cần Defuse! Lật ngửa mặt lá bài và bí mật nhét lại vào bất kỳ vị trí nào trong Chồng bài rút. Lần sau ai rút trúng khi bài đang ngửa mặt sẽ nổ tung và bị loại ngay lập tức (không thể dùng Defuse cứu mạng!).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.reverse} alt="Đảo Chiều" />
                <div className="card-info">
                  <h4>Đảo Chiều (Reverse) (4 lá)</h4>
                  <p>Đảo ngược chiều vòng chơi và kết thúc lượt ngay lập tức mà không cần rút bài.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.drawFromTheBottom} alt="Rút Đáy" />
                <div className="card-info">
                  <h4>Rút Đáy (Draw from the Bottom) (4 lá)</h4>
                  <p>Kết thúc lượt của bạn bằng cách rút lá bài ở dưới cùng của Chồng bài rút thay vì trên đỉnh.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.alterTheFuture} alt="Thay Đổi Tương Lai (3x)" />
                <div className="card-info">
                  <h4>Thay Đổi Tương Lai (Alter the Future 3x) (4 lá)</h4>
                  <p>Bí mật nhìn 3 lá trên cùng của Chồng bài rút và tự do sắp xếp lại thứ tự của chúng trước khi trả lại.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.feralCat} alt="Mèo Hoang (Feral Cat)" />
                <div className="card-info">
                  <h4>Mèo Hoang (Feral Cat) (4 lá)</h4>
                  <p>Thẻ mèo vạn năng! Có thể kết hợp với bất kỳ lá Cat Card nào khác trên tay bạn để tạo thành 1 cặp bài cướp bài.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.targetedAttack} alt="Tấn Công Chỉ Định" />
                <div className="card-info">
                  <h4>Tấn Công Chỉ Định (Targeted Attack 2x) (3 lá)</h4>
                  <p>Kết thúc lượt không cần rút bài, chỉ định đích danh một người chơi bất kỳ phải nhận 2 lượt chơi liên tiếp.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rule-section" id="deck-streaking">
            <h3>GÓI MỞ RỘNG: STREAKING KITTENS (15 LÁ)</h3>
            <div className="card-list">
              <div className="card-item">
                <img src={CARD_IMAGES.streakingKitten} alt="Mèo Khỏa Thân (Streaking Kitten)" />
                <div className="card-info">
                  <h4>Mèo Khỏa Thân (Streaking Kitten) (1 lá)</h4>
                  <p>Khi giữ lá này trên tay, bạn được phép giữ bí mật 1 Exploding Kitten mà không nổ! Nếu đối thủ cướp trúng Exploding Kitten từ tay bạn, họ sẽ nổ ngay. Nhưng nếu bạn mất Streaking Kitten khi vẫn còn Exploding Kitten, bạn sẽ phải xử lý vụ nổ.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.superSkip} alt="Siêu Bỏ Lượt (Super Skip)" />
                <div className="card-info">
                  <h4>Siêu Bỏ Lượt (Super Skip) (1 lá)</h4>
                  <p>Bỏ qua toàn bộ lượt đi hiện tại của bạn, kể cả khi đang phải chịu nhiều lượt dồn do Attack mà không cần rút bài.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.seeTheFuture5x} alt="Nhìn Trước Tương Lai (See the Future 5x)" />
                <div className="card-info">
                  <h4>Nhìn Trước Tương Lai (See the Future 5x) (1 lá)</h4>
                  <p>Bí mật xem 5 lá bài trên cùng của bộ bài rút, giữ nguyên thứ tự.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.alterTheFuture5x} alt="Thay Đổi Tương Lai (5x)" />
                <div className="card-info">
                  <h4>Thay Đổi Tương Lai (Alter the Future 5x) (1 lá)</h4>
                  <p>Bí mật xem và tự do sắp xếp lại thứ tự của cả 5 lá bài trên cùng của bộ bài rút.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.swapTopAndBottom} alt="Đổi Đỉnh Và Đáy (Swap Top and Bottom)" />
                <div className="card-info">
                  <h4>Đổi Đỉnh Và Đáy (Swap Top and Bottom) (3 lá)</h4>
                  <p>Hoán đổi vị trí lá bài trên đỉnh và lá bài dưới đáy của bộ bài rút mà không nhìn chúng.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.garbageCollection} alt="Thu Gom Rác (Garbage Collection)" />
                <div className="card-info">
                  <h4>Thu Gom Rác (Garbage Collection) (1 lá)</h4>
                  <p>Mỗi người chơi có bài trên tay phải bí mật chọn 1 lá nộp vào bộ bài rút, sau đó xáo trộn toàn bộ bộ bài.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.catomicBomb} alt="Bom Hạt Nhân Mèo (Catomic Bomb)" />
                <div className="card-info">
                  <h4>Bom Hạt Nhân Mèo (Catomic Bomb) (1 lá)</h4>
                  <p>Lấy tất cả Exploding Kitten khỏi bộ bài rút, xáo trộn phần còn lại rồi đặt toàn bộ Exploding Kitten lên trên cùng. Kết thúc lượt không rút bài.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.mark} alt="Đánh Dấu Bài (Mark)" />
                <div className="card-info">
                  <h4>Đánh Dấu Bài (Mark) (3 lá)</h4>
                  <p>Chọn một người chơi và rút ngẫu nhiên một lá từ tay họ để lật ngửa công khai cho tất cả mọi người cùng thấy.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.curseOfTheCatButt} alt="Lời Nguyền Mông Mèo (Curse of the Cat Butt)" />
                <div className="card-info">
                  <h4>Lời Nguyền Mông Mèo (Curse of the Cat Butt) (2 lá)</h4>
                  <p>Khiến người bị chọn phải úp và xáo bài trên tay, sau đó phải sử dụng bài mù hú họa cho tới khi rút thành công một lá an toàn từ bộ bài.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rule-section" id="deck-barking">
            <h3>GÓI MỞ RỘNG: BARKING KITTENS (20 LÁ) & PHỤ KIỆN VƯƠNG MIỆN</h3>
            <p><strong>Phụ kiện Vương miện Tower of Power Crown:</strong> Chiếc vương miện bảo hộ đi kèm kho dự trữ 6 lá bài bí mật. Khi bạn đội vương miện, bất kỳ ai cố cướp bài từ bạn (Favor, bộ 2 lá, bộ 3 lá) sẽ buộc phải bốc ngẫu nhiên từ kho dự trữ này thay vì từ tay bạn cho đến khi kho cạn sạch!</p>
            <div className="card-list">
              <div className="card-item">
                <img src={CARD_IMAGES.barkingKitten} alt="Mèo Sủa (Barking Kitten)" />
                <div className="card-info">
                  <h4>Mèo Sủa (Barking Kitten) (2 lá)</h4>
                  <p>Khi chơi, tìm người đang giữ lá Barking Kitten còn lại. Theo luật cập nhật, người đó phải lập tức dùng Defuse hoặc bị nổ loại khỏi trận đấu! Nếu chưa ai có lá thứ 2, đặt lá này công khai trước mặt và trở thành mục tiêu khi ai đó đánh lá thứ 2 sau này.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.towerOfPower} alt="Tháp Quyền Lực (Tower of Power)" />
                <div className="card-info">
                  <h4>Tháp Quyền Lực (Tower of Power) (1 lá)</h4>
                  <p>Đội chiếc Vương miện Tower of Power! Kho dự trữ gồm 6 lá bài bí mật bên trong sẽ thay bạn hứng chịu mọi đòn cướp bài từ đối thủ cho đến khi cạn kiệt.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.alterTheFuture3xNow} alt="Đổi Tương Lai (3x, NOW)" />
                <div className="card-info">
                  <h4>Đổi Tương Lai (Alter the Future 3x, NOW) (2 lá)</h4>
                  <p>Bí mật xem và sắp xếp lại 3 lá trên đỉnh bộ bài. Thẻ NOW có thể đánh bất cứ lúc nào, kể cả ngoài lượt của bạn!</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.bury} alt="Chôn Bài (Bury)" />
                <div className="card-info">
                  <h4>Chôn Bài (Bury) (2 lá)</h4>
                  <p>Kết thúc lượt bằng cách rút lá trên cùng, bí mật xem và chôn nó vào bất kỳ vị trí nào trong bộ bài. Kể cả rút phải Mèo Nổ bạn cũng an toàn không bị nổ!</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.personalAttack3x} alt="Tự Tấn Công (Personal Attack 3x)" />
                <div className="card-info">
                  <h4>Tự Tấn Công (Personal Attack 3x) (4 lá)</h4>
                  <p>Tự áp dụng Attack lên bản thân: kết thúc lượt mà không cần rút bài, và buộc bản thân thực hiện 3 lượt liên tiếp.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.shareTheFuture3x} alt="Chia Sẻ Tương Lai (Share the Future 3x)" />
                <div className="card-info">
                  <h4>Chia Sẻ Tương Lai (Share the Future 3x) (2 lá)</h4>
                  <p>Xem và sắp xếp lại 3 lá trên cùng bộ bài, sau đó người chơi kế tiếp cũng được bí mật xem thứ tự mới.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.illTakeThat} alt="Cái Đó Của Tôi! (I'll Take That)" />
                <div className="card-info">
                  <h4>Cái Đó Của Tôi! (I'll Take That) (4 lá)</h4>
                  <p>Đặt trước một người chơi: Lần rút bài tiếp theo của họ sẽ bị cướp và chuyển thẳng sang tay bạn! (Cảnh báo: nếu là Mèo Nổ thì bạn phải tự gỡ).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.superSkip} alt="Siêu Bỏ Lượt (Super Skip)" />
                <div className="card-info">
                  <h4>Siêu Bỏ Lượt (Super Skip) (1 lá)</h4>
                  <p>Xóa sạch toàn bộ lượt đi còn lại của bạn mà không cần rút bài.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.potluck} alt="Góp Cơm (Potluck)" />
                <div className="card-info">
                  <h4>Góp Cơm (Potluck) (2 lá)</h4>
                  <p>Bắt đầu từ người đánh lá này, từng người chơi còn sống lần lượt chọn một lá trên tay để đặt úp lên trên cùng của bộ bài rút.</p>
                </div>
              </div>

              {/* GÓI MỞ RỘNG: ZOMBIE KITTENS */}
              <div id="deck-zombie" style={{ gridColumn: '1 / -1', marginTop: '16px', marginBottom: '8px', borderTop: '2px dashed #059669', paddingTop: '16px' }}>
                <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
                  <span>🧟</span> GÓI MỞ RỘNG: ZOMBIE KITTENS (22 LÁ)
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                  <strong>Cơ chế Undead (Xác Sống):</strong> Khi chọn gói này, các lá Defuse được thay thế hoàn toàn bằng <strong>Zombie Kitten</strong>. Người chết <strong>không bị loại khỏi trò chơi</strong> mà vẫn giữ nguyên bài trên tay! Họ không thực hiện lượt đi bình thường nhưng có thể chơi các lá <strong>NOW</strong> hoặc đánh Zombie Kitten để tự hồi sinh. Khi người sống dùng Zombie Kitten thoát nổ, họ <strong>bắt buộc phải chọn 1 người chết để hồi sinh</strong>!
                </p>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.zombieKitten} alt="Zombie Kitten" />
                <div className="card-info">
                  <h4>Zombie Kitten (5 lá)</h4>
                  <p>Thay thế Defuse. Cứu bạn khi rút phải Mèo Nổ, đồng thời bắt buộc chọn 1 người chết để hồi sinh! Người chết có thể đánh lá này bất kỳ lúc nào để tự hồi sinh chính mình.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.clone} alt="Nhân Bản (Clone)" />
                <div className="card-info">
                  <h4>Nhân Bản (Clone) (2 lá)</h4>
                  <p>Sao chép và kích hoạt công dụng của lá bài ngay bên dưới nó trong Chồng bài bỏ (không thể sao chép Clone khác).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.digDeeper} alt="Đào Sâu (Dig Deeper)" />
                <div className="card-info">
                  <h4>Đào Sâu (Dig Deeper) (4 lá)</h4>
                  <p>Bí mật xem lá đầu bộ bài rút. Bạn có thể nhận lá đó vào tay và kết thúc lượt, hoặc trả lại và bắt buộc rút lá thứ 2 (dù là Mèo Nổ).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.feedTheDead} alt="Cho Người Chết Ăn (Feed the Dead)" />
                <div className="card-info">
                  <h4>Cho Người Chết Ăn (Feed the Dead) (2 lá)</h4>
                  <p>Lá bài NOW. Chọn 1 người chơi đã chết: tất cả người sống khác bắt buộc phải chọn 1 lá trên tay để nộp cho người chết đó!</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.graveRobber} alt="Kẻ Trộm Mộ (Grave Robber)" />
                <div className="card-info">
                  <h4>Kẻ Trộm Mộ (Grave Robber) (1 lá)</h4>
                  <p>Tất cả người chơi đã chết còn bài trên tay phải chọn 1 lá nộp lại vào bộ bài rút, sau đó xáo bài.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.attackOfTheDead} alt="Tấn Công Của Xác Sống (Attack of the Dead)" />
                <div className="card-info">
                  <h4>Tấn Công Của Xác Sống (Attack of the Dead) (3 lá)</h4>
                  <p>Kết thúc lượt mà không cần rút bài, ép người kế tiếp phải nhận số lượt chơi = 3 lượt x (số người chơi đã chết).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.shuffleNow} alt="Xáo Bài Ngay (Shuffle NOW)" />
                <div className="card-info">
                  <h4>Xáo Bài Ngay (Shuffle NOW) (1 lá)</h4>
                  <p>Lá bài NOW. Xáo trộn Chồng bài rút ngay lập tức vào bất kỳ lúc nào, kể cả ngoài lượt đi của mình.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.clairvoyance} alt="Thấu Thị (Clairvoyance)" />
                <div className="card-info">
                  <h4>Thấu Thị (Clairvoyance) (2 lá)</h4>
                  <p>Lá bài NOW. Đánh ra khi có người giấu Mèo Nổ trở lại bộ bài (dùng Zombie Kitten hoặc Defuse) để biết chính xác vị trí lá Mèo Nổ đó.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.superSkip} alt="Siêu Bỏ Lượt (Super Skip)" />
                <div className="card-info">
                  <h4>Siêu Bỏ Lượt (Super Skip) (2 lá)</h4>
                  <p>Xóa sạch toàn bộ lượt đi còn lại của bạn mà không cần rút bài.</p>
                </div>
              </div>

              {/* GÓI MỞ RỘNG: AGGRO KITTENS */}
              <div id="deck-aggro" style={{ gridColumn: '1 / -1', marginTop: '16px', marginBottom: '8px', borderTop: '2px dashed #ea580c', paddingTop: '16px' }}>
                <h3 style={{ color: '#f97316', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
                  <span>🔥</span> GÓI MỞ RỘNG: AGGRO KITTENS (11 LÁ)
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                  <strong>Lối chơi Aggro tốc độ cao và phản đòn dữ dội:</strong> Tập trung vào khả năng đảo chiều tấn công với Reverse Attack (2x), cướp đoạt tài nguyên chôn xuống đáy bài với Buried Treasure, và cướp quyền đặt bom với I'll Take It From Here!
                </p>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#7c2d12', borderRadius: '6px', border: '2px solid #ea580c' }}>
                  🔃
                </div>
                <div className="card-info">
                  <h4>Tấn Công Đảo Chiều (Reverse Attack 2x) (4 lá)</h4>
                  <p>Kết thúc lượt mà không rút bài, đảo ngược chiều vòng chơi và ép người chơi kế tiếp theo chiều mới phải thực hiện 2 lượt liên tiếp.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#78350f', borderRadius: '6px', border: '2px solid #f59e0b' }}>
                  🏴‍☠️
                </div>
                <div className="card-info">
                  <h4>Kho Báu Chôn Giấu (Buried Treasure) (1 lá)</h4>
                  <p>Lấy ngẫu nhiên 1 lá bài từ mỗi đối thủ còn sống, xáo trộn tất cả các lá bài vừa lấy được và đặt chúng xuống dưới đáy của Chồng bài rút.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#5b21b6', borderRadius: '6px', border: '2px solid #8b5cf6' }}>
                  🙋‍♂️
                </div>
                <div className="card-info">
                  <h4>Để Đó Tôi Lo! (I'll Take It From Here, NOW) (1 lá)</h4>
                  <p>Lá bài NOW. Khi người khác sử dụng Gỡ Bom (Defuse hoặc Zombie Kitten), bạn được đánh lá này để thay họ bí mật quyết định vị trí đặt lại lá Mèo Nổ vào bộ bài.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.superSkip} alt="Siêu Bỏ Lượt (Super Skip)" />
                <div className="card-info">
                  <h4>Siêu Bỏ Lượt (Super Skip) (2 lá)</h4>
                  <p>Xóa sạch toàn bộ lượt đi còn lại của bạn mà không cần rút bài.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.alterTheFuture} alt="Thay Đổi Tương Lai (3x)" />
                <div className="card-info">
                  <h4>Nhìn Trước Tương Lai (Alter the Future 3x) (3 lá)</h4>
                  <p>Bí mật xem và sắp xếp lại thứ tự của 3 lá bài trên cùng trong Chồng bài rút.</p>
                </div>
              </div>

              {/* GÓI MỞ RỘNG: ATTACKING KITTENS */}
              <div id="deck-attacking" style={{ gridColumn: '1 / -1', marginTop: '16px', marginBottom: '8px', borderTop: '2px dashed #ea580c', paddingTop: '16px' }}>
                <h3 style={{ color: '#f97316', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
                  <span>⚔️</span> GÓI MỞ RỘNG: ATTACKING KITTENS (14 LÁ)
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                  <strong>Lối chơi tấn công phủ đầu và khống chế:</strong> Ép đối thủ nhận liên tiếp các lượt chơi với Slap (1x, 2x, 3x), khóa chặt quân bài hiểm của đối phương với Annoy, và cướp bài trực diện với Steal a Card (đối thủ có 10 giây tráo bài phòng thủ).
                </p>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#7f1d1d', borderRadius: '6px', border: '2px solid #ef4444' }}>
                  🔒
                </div>
                <div className="card-info">
                  <h4>Làm Phiền (Annoy) (1 lá)</h4>
                  <p>Chọn một đối thủ. Khóa ngẫu nhiên 2 lá bài trên tay họ cho đến hết lượt sau của họ (kể cả Defuse).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.alterTheFuture} alt="Thay Đổi Tương Lai (3x)" />
                <div className="card-info">
                  <h4>Thay Đổi Tương Lai (Alter the Future 3x) (1 lá)</h4>
                  <p>Bí mật xem và sắp xếp lại thứ tự 3 lá bài trên cùng trong Chồng bài rút.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#064e3b', borderRadius: '6px', border: '2px solid #10b981' }}>
                  🛡️
                </div>
                <div className="card-info">
                  <h4>Gỡ Bom (Defuse) (2 lá)</h4>
                  <p>Hóa giải Mèo Nổ khi bốc trúng và bí mật nhét trở lại vào Chồng bài rút.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#9a3412', borderRadius: '6px', border: '2px solid #ea580c' }}>
                  👋
                </div>
                <div className="card-info">
                  <h4>Tát (Slap 1x, 2x, 3x) (4 lá: 1x, 2x, 2x, 3x)</h4>
                  <p>Bỏ lượt không rút bài, ép người chơi kế tiếp phải thực hiện ngay 1, 2 hoặc 3 lượt chơi liên tiếp.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#4c1d95', borderRadius: '6px', border: '2px solid #a855f7' }}>
                  🫳
                </div>
                <div className="card-info">
                  <h4>Cướp 1 Lá Bài (Steal a Card) (4 lá)</h4>
                  <p>Cướp ngẫu nhiên 1 lá bài từ tay đối thủ được chọn. Đối thủ có 10 giây để kéo thả tráo đổi bài trên tay nhằm đánh lạc hướng.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#881337', borderRadius: '6px', border: '2px solid #f43f5e' }}>
                  💣
                </div>
                <div className="card-info">
                  <h4>Mèo Nổ (Exploding Kitten) (2 lá)</h4>
                  <p>Mèo Nổ bổ sung được xáo vào bộ bài sau khi chia bài, tăng thêm kịch tính cho bàn chơi nhiều người.</p>
                </div>
              </div>

              {/* GÓI MỞ RỘNG: DEFENDING KITTENS */}
              <div id="deck-defending" style={{ gridColumn: '1 / -1', marginTop: '16px', marginBottom: '8px', borderTop: '2px dashed #0284c7', paddingTop: '16px' }}>
                <h3 style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
                  <span>🛡️</span> GÓI MỞ RỘNG: DEFENDING KITTENS (14 LÁ)
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                  <strong>Chiến thuật phòng ngự và kiểm soát bộ bài tối ưu:</strong> Chống lại các đòn tấn công với Rút Đáy, Đảo Chiều, Nhìn và Sắp Xếp Tương Lai. Đặc biệt trang bị <strong>cơ chế Chống Xáo Bài (Anti-Shuffle)</strong> vô hiệu hóa khả năng giải vây của đối thủ khi bom đã cận kề!
                </p>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.drawFromTheBottom} alt="Rút Đáy" />
                <div className="card-info">
                  <h4>Rút Đáy (Draw From the Bottom) (1 lá)</h4>
                  <p>Kết thúc lượt bằng cách rút lá bài dưới cùng của Chồng bài rút thay vì trên đỉnh.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#7f1d1d', borderRadius: '6px', border: '2px solid #ef4444' }}>
                  🔒
                </div>
                <div className="card-info">
                  <h4>Làm Phiền (Annoy) (1 lá)</h4>
                  <p>Khóa 2 lá bài ngẫu nhiên trên tay đối thủ trong 1 lượt (kể cả Defuse).</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.reverse} alt="Đảo Chiều" />
                <div className="card-info">
                  <h4>Đảo Chiều (Reverse) (2 lá)</h4>
                  <p>Kết thúc lượt mà không cần rút bài, đảo ngược chiều vòng chơi.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#831843', borderRadius: '6px', border: '2px solid #f43f5e' }}>
                  👁️
                </div>
                <div className="card-info">
                  <h4>Nhìn Trước Tương Lai (See the Future) (4 lá: 1x [1], 3x [2], 5x [1])</h4>
                  <p>Bí mật xem các lá trên cùng bộ bài rút (1 lá, 3 lá hoặc 5 lá) mà không làm thay đổi vị trí.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.alterTheFuture} alt="Thay Đổi Tương Lai" />
                <div className="card-info">
                  <h4>Thay Đổi Tương Lai (Alter the Future) (2 lá: 3x [1], 5x [1])</h4>
                  <p>Bí mật xem và tự do sắp xếp lại thứ tự 3 lá hoặc 5 lá trên đỉnh Chồng bài rút.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#713f12', borderRadius: '6px', border: '2px solid #eab308' }}>
                  🌽
                </div>
                <div className="card-info">
                  <h4>Lời Nguyền Ngô Pha Lê (The Curse of Crystal Corn, NOW) (1 lá)</h4>
                  <p>Thẻ phản ứng NOW: Đánh ngay khi ai đó vừa dùng Shuffle để vô hiệu hóa lá Shuffle của họ, hoặc đánh trong lượt để cấm người kế tiếp dùng Shuffle!</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#7f1d1d', borderRadius: '6px', border: '2px solid #dc2626' }}>
                  📣
                </div>
                <div className="card-info">
                  <h4>Điểm Danh Mèo Nổ (Kitten Roll Call) (1 lá)</h4>
                  <p>Tìm tất cả Mèo Nổ (Exploding và Imploding Kittens) trong bộ bài rút đặt lên đỉnh, đồng thời cấm hoàn toàn người chơi kế tiếp sử dụng Shuffle!</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#1e1b4b', borderRadius: '6px', border: '2px solid #6366f1' }}>
                  🔀
                </div>
                <div className="card-info">
                  <h4>Xáo Bài (Shuffle) (2 lá)</h4>
                  <p>Xáo trộn ngẫu nhiên toàn bộ Chồng bài rút để giải vây khi biết trên đỉnh có Mèo Nổ.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rule-section" id="deck-creepy">
            <h3>GÓI MỞ RỘNG: CREEPY KITTENS (11 LÁ)</h3>
            <p>
              Gói mở rộng <strong>Creepy Kittens</strong> giới thiệu cơ chế lật mặt thẻ bài úp/ngửa công khai trong Chồng bài rút cùng khả năng thao túng đỉnh và đáy bộ bài vô cùng độc đáo.
            </p>
            <div className="cards-list">
              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#0369a1', borderRadius: '6px', border: '2px solid #38bdf8' }}>
                  🔍
                </div>
                <div className="card-info">
                  <h4>Nhìn Đáy Bài (Look at the Bottom) (2 lá)</h4>
                  <p>Bí mật xem lá bài dưới cùng của Chồng bài rút. Bạn có quyền chọn giữ nguyên nó ở đáy hoặc chuyển nó lên trên cùng bộ bài rút. Không kết thúc lượt.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#581c87', borderRadius: '6px', border: '2px solid #a855f7' }}>
                  🎯
                </div>
                <div className="card-info">
                  <h4>Rút Tùy Ý (Draw From Anywhere) (1 lá)</h4>
                  <p>Kết thúc lượt của bạn bằng cách rút một lá bài ở bất kỳ vị trí độ sâu nào mà bạn chọn trong Chồng bài rút.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#881337', borderRadius: '6px', border: '2px solid #f43f5e' }}>
                  ⚖️
                </div>
                <div className="card-info">
                  <h4>Định Đoạt Số Phận (Choose Your Fate) (1 lá)</h4>
                  <p>Kết thúc lượt mà không cần rút bài. Người chơi tiếp theo bị cấm hoàn toàn không được đánh bài trên tay và buộc phải rút một lá từ bất kỳ vị trí nào trong Chồng bài rút.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.drawFromTheBottom} alt="Rút Từ Đáy" />
                <div className="card-info">
                  <h4>Rút Từ Đáy (Draw From the Bottom) (2 lá)</h4>
                  <p>Kết thúc lượt của bạn bằng cách rút lá bài dưới cùng của Chồng bài rút thay vì rút từ trên đỉnh.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#713f12', borderRadius: '6px', border: '2px solid #eab308' }}>
                  🔀
                </div>
                <div className="card-info">
                  <h4>Xáo Bài (Shuffle) (1 lá)</h4>
                  <p>Xáo trộn toàn bộ Chồng bài rút ngay lập tức. Không kết thúc lượt.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#134e4a', borderRadius: '6px', border: '2px solid #14b8a6' }}>
                  🔄4
                </div>
                <div className="card-info">
                  <h4>Lật 4 Lá (Flip Four) (4 lá)</h4>
                  <p>Lấy 4 lá trên cùng của Chồng bài rút, đảo ngược thứ tự và lật ngược hướng mặt của chúng (úp thành ngửa, ngửa thành úp) rồi đặt lại lên đỉnh bộ bài rút. Các lá ngửa mặt trên đỉnh bộ bài sẽ được hiển thị công khai cho mọi người cùng thấy!</p>
                </div>
              </div>

              {/* GÓI MỞ RỘNG: TIMEBOMB KITTENS */}
              <div id="deck-timebomb" style={{ gridColumn: '1 / -1', marginTop: '16px', marginBottom: '8px', borderTop: '2px dashed #f59e0b', paddingTop: '16px' }}>
                <h3 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
                  <span>⏰💣</span> GÓI MỞ RỘNG: TIMEBOMB KITTENS (15 LÁ)
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                  <strong>Cơ chế đếm ngược sinh tử:</strong> Timebomb Kitten khi rút phải không nổ ngay mà bắt đầu đếm ngược 3 lượt trước mặt người chơi. Người chơi phải tìm Defuse Timebomb để gỡ trước khi hết giờ hoặc sẽ bị nổ tung! Đi kèm các thẻ chiến thuật Blind (cấm đánh bài), Search (tìm bài), Discard (hủy bài đối thủ), và Copycat (sao chép hiệu ứng).
                </p>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.timebombKitten} alt="Mèo Bom Hẹn Giờ (Timebomb Kitten)" />
                <div className="card-info">
                  <h4>Mèo Bom Hẹn Giờ (Timebomb Kitten) (2 lá)</h4>
                  <p>Khi rút phải, không phát nổ ngay mà đặt công khai trước mặt bạn và bắt đầu đếm ngược 3 lượt. Hết 3 lượt mà không gỡ, bạn sẽ nổ tung và bị loại khỏi trò chơi!</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.defuseTimebomb} alt="Gỡ Bom Hẹn Giờ (Defuse Timebomb)" />
                <div className="card-info">
                  <h4>Gỡ Bom Hẹn Giờ (Defuse Timebomb) (3 lá)</h4>
                  <p>Dùng để gỡ 1 Timebomb đang đếm ngược (Timebomb bị loại khỏi ván đấu và thay bằng 1 Exploding Kitten vào bộ bài rút). Thẻ này cũng có thể dùng như thẻ Gỡ Bom (Defuse) thông thường khi rút phải Mèo Nổ. (Lưu ý: Defuse thường không gỡ được Timebomb!).</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#374151', borderRadius: '6px', border: '2px solid #9ca3af' }}>
                  🙈⛔
                </div>
                <div className="card-info">
                  <h4>Làm Mù (Blind) (1 lá)</h4>
                  <p>Chọn một người chơi bất kỳ. Người đó sẽ bị khóa hoàn toàn, cấm không được đánh bất kỳ lá bài nào trên tay trong suốt lượt chơi tiếp theo của họ.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.search} alt="Tìm Kiếm (Search)" />
                <div className="card-info">
                  <h4>Tìm Kiếm (Search) (3 lá)</h4>
                  <p>Xem 5 lá bài trên đỉnh của Chồng bài rút, chọn 1 lá lấy về tay của bạn, sau đó xáo trộn 4 lá còn lại trở lại Chồng bài rút. Không kết thúc lượt.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.discard} alt="Hủy Bài (Discard)" />
                <div className="card-info">
                  <h4>Hủy Bài (Discard) (3 lá)</h4>
                  <p>Chọn một người chơi đối thủ. Đối thủ có tối đa 10 giây tráo bài để bảo vệ bài, sau đó hệ thống sẽ chọn ngẫu nhiên 2 lá trên tay đối thủ vứt vào Chồng bài bỏ.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.copycat} alt="Mèo Bắt Chước (Copycat)" />
                <div className="card-info">
                  <h4>Mèo Bắt Chước (Copycat) (3 lá)</h4>
                  <p>Sao chép toàn bộ hiệu ứng của lá bài hành động hợp lệ vừa được đánh gần nhất trong ván (không thể sao chép Nope, Defuse, các loại Bom hoặc combo mèo thường).</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rule-section" id="game-modes-section">
            <h3>CÁC CHẾ ĐỘ CHƠI (GAME MODES & RULESETS)</h3>
            <p>
              Exploding Kittens trong hệ thống hỗ trợ nhiều chế độ chơi độc lập. Mỗi chế độ có bộ quy tắc, số người và thiết lập bài riêng biệt:
            </p>

            <div className="cards-grid">
              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#334155', borderRadius: '6px', border: '2px solid #cbd5e1' }}>
                  🎲
                </div>
                <div className="card-info">
                  <h4>[CT] Chế độ Tiêu Chuẩn (Normal)</h4>
                  <p>2 - 10 người chơi. Áp dụng luật tiêu chuẩn cùng khả năng kết hợp tự do bất kỳ gói mở rộng (Expansion packs) nào mong muốn.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#0c4a6e', borderRadius: '6px', border: '2px solid #38bdf8' }}>
                  ⚡
                </div>
                <div className="card-info">
                  <h4>[CT] Đấu Nhanh 1v1 (Quick Play)</h4>
                  <p>Cố định đúng 2 người chơi. Chồng bài rút được rút gọn còn 16 lá và đúng 2 Mèo Nổ. Nhịp độ nhanh, kịch tính từng lượt rút.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#7f1d1d', borderRadius: '6px', border: '2px solid #f87171' }}>
                  🔥
                </div>
                <div className="card-info">
                  <h4>[LN] Liên Hoàn (Combo Chain x2 - x3)</h4>
                  <p>Luật nhà (House Rule): Khi đánh bài hành động (trừ Gỡ Bom), người chơi có cơ hội kích hoạt hiệu ứng nhân đôi (x2) hoặc nhân ba (x3) sức mạnh lá bài.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#581c87', borderRadius: '6px', border: '2px solid #c084fc' }}>
                  👥
                </div>
                <div className="card-info">
                  <h4>[LN] Đấu Đội (Team-Up 2 Đội)</h4>
                  <p>Luật nhà: 2 đến 8 người chơi (số chẵn). Chia làm Đội Đỏ 🔴 và Đội Xanh 🔵. Đội chiến thắng khi toàn bộ thành viên đội đối phương nổ tung.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#064e3b', borderRadius: '6px', border: '2px solid #34d399' }}>
                  🐱‍👤
                </div>
                <div className="card-info">
                  <h4>[CT] Mèo Đạo Tặc (Cat Burglar)</h4>
                  <p>2 - 5 người chơi. Đi kèm tượng Mèo Đạo Tặc. Người giữ tượng có thể chuyển tượng cho đối thủ và gọi tên 1 loại Cat Card để cướp bài. Không Nope tượng; holder chết thì tượng rời ván.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#065f46', borderRadius: '6px', border: '2px solid #10b981' }}>
                  🧟
                </div>
                <div className="card-info">
                  <h4>[CT] Zombie Kittens Độc Lập (Standalone 61 lá)</h4>
                  <p>4 - 5 người chơi (hộp độc lập 61 lá). Không thêm Defuse mặc định; Zombie Kitten thay thế Defuse. Khi chết, người chơi giữ nguyên bài trên tay, có thể tung bài NOW và Nope. Người chơi dùng Zombie Kitten bắt buộc phải hồi sinh 1 người chết nếu có.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#1e293b', borderRadius: '6px', border: '2px solid #64748b' }}>
                  💀
                </div>
                <div className="card-info">
                  <h4>[CT] Zombie 2 Người Với Carl [CX: 2 Mèo Nổ]</h4>
                  <p>2 người chơi thật + Carl là người chơi ảo đặt giữa vòng chơi với 1 Zombie Kitten ngửa. Carl lật bài mỗi lượt; bài thường đưa xuống đáy, bài bom kích hoạt Zombie hoặc làm Carl Dead.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#78350f', borderRadius: '6px', border: '2px solid #f59e0b' }}>
                  ☣️
                </div>
                <div className="card-info">
                  <h4>[CT] Zombie Apocalypse (Ghép 2 Hộp)</h4>
                  <p>2 - 9 người chơi. Ghép hộp Original và Zombie Kittens theo bảng tỷ lệ bài chuẩn xác, cân bằng riêng biệt số Defuse và Zombie Kitten. Bỏ toàn bộ Cat Cards từ Original, giữ Cat Cards từ Zombie. Defuse không hồi sinh; Zombie Kitten có hồi sinh. Người chết giữ bài trên tay.</p>
                  <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '4px' }}>
                    <strong>Bảng thiết lập chính thức:</strong> 2P (2 Zombie, 0 Defuse, 15 bài, 1 Bom) · 3P (3 Zombie, 0 Defuse, 20 bài, 2 Bom) · 4P (4 Zombie, 0 Defuse, 25 bài, 3 Bom) · 5P (5 Zombie, 0 Defuse, 30 bài, 4 Bom) · 6P (5 Zombie, 1 Defuse, 35 bài, 5 Bom) · 7P (5 Zombie, 2 Defuse, 35 bài, 6 Bom) · 8P (5 Zombie, 3 Defuse, 35 bài, 7 Bom) · 9P (5 Zombie, 4 Defuse, 35 bài, 8 Bom).
                  </p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#831843', borderRadius: '6px', border: '2px solid #ec4899' }}>
                  📜
                </div>
                <div className="card-info">
                  <h4>[CT] Recipes for Disaster (Công Thức Bài)</h4>
                  <p>Chơi theo các công thức bài chế tạo sẵn từ nhà phát hành (bắt đầu với Sticky Fingers: P Mèo Nổ, P+1 Defuse, 4 Attack, 4 Skip, 4 I'll Take That, 4 Mark, 1 Streaking, 16 Cat, 6 Feral Cat).</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#713f12', borderRadius: '6px', border: '2px solid #eab308' }}>
                  ⚖️
                </div>
                <div className="card-info">
                  <h4>[CT] Good vs Evil (Thiện vs Ác)</h4>
                  <p>Godcat và Devilcat ngự trên sàn đấu playmat với cơ chế bốc bài giấu mặt Armageddon kịch tính.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#450a0a', borderRadius: '6px', border: '2px solid #dc2626' }}>
                  💢
                </div>
                <div className="card-info">
                  <h4>[CT] Rage Mode (Cuồng Nộ)</h4>
                  <p>Tượng Rage Cat đổi chủ liên tục sau mỗi lần cướp bài, cùng các lá bẫy Booby Trap phát nổ khi bị cướp khỏi tay.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#3b0764', borderRadius: '6px', border: '2px solid #8b5cf6' }}>
                  🔮
                </div>
                <div className="card-info">
                  <h4>[SC] Curse You! (Thử Nghiệm)</h4>
                  <p>Variant thử nghiệm từ scan cộng đồng: Các thẻ Charm (Bùa Lợi) và Curse (Lời Nguyền) tồn tại vĩnh viễn trước mặt người chơi cùng chiến dịch mở khóa pack.</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#164e63', borderRadius: '6px', border: '2px solid #06b6d4' }}>
                  🎂
                </div>
                <div className="card-info">
                  <h4>[SC] 10th Anniversary Legacy (Thử Nghiệm)</h4>
                  <p>8 thẻ bài di sản kỷ niệm 10 năm với cơ chế đặc biệt (Amateur Archeology, Creepy Peeky, Hip Cat, Hip Bat, Plus Plus, Robin Hood, Battle Hamster, The Twins).</p>
                </div>
              </div>

              <div className="card-item">
                <div style={{ width: '60px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#713f12', borderRadius: '6px', border: '2px solid #facc15' }}>
                  🍌
                </div>
                <div className="card-info">
                  <h4>[CT] Exploding Minions</h4>
                  <p>Hộp bài Minions độc lập 68 lá với 3 loại Character Cards và cơ chế Clone bài cọc bỏ.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function RulebookButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button className="open-rules-btn" onClick={() => setIsOpen(true)} aria-label="Xem Luật Chơi" title="Xem Luật Chơi">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <circle cx="12" cy="12" r="10"></circle>
           <line x1="12" y1="16" x2="12" y2="12"></line>
           <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>
      <RulebookModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
