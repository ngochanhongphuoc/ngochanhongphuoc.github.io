# Ghi chú cho Claude

## Tổng quan

- Web tĩnh: HTML/CSS/JS thuần, không có bước build.
- Trang chính: `ngochanhongphuoc.github.io` (repo `ngochanhongphuoc/ngochanhongphuoc.github.io`, ở gốc tên miền). Bản sao: repo `huuvinhdocthan/ngochanhongphuoc` (chạy trong thư mục `/ngochanhongphuoc/`). Hai repo cùng mã nguồn; RSVP và lời chúc gửi về Google Sheet qua `SHEET_URL` trong `script.js` (cột "Nhà gái"), mã Apps Script ở `google-sheet/Code.gs` (chỉ lưu trên máy), nên **không dùng đường dẫn bắt đầu bằng `/`**.
- Cấu trúc thư mục: xem mục **Cấu trúc thư mục** trong [README.md](README.md).
- Bộ game được lấy từ dự án `weddding` (Hữu Vinh & Yến Thi) và đổi sang nội dung Phước & Hân.

## Quy tắc đặt tên

- Tên file và thư mục: **tiếng Anh, chữ thường, nối bằng gạch ngang**.
- Mỗi trang là một thư mục chứa `index.html`.
- Ảnh, nhạc, icon, font nằm trong `assets/`. Code dùng chung cho các game nằm trong `shared/`.
- Nội dung hiển thị và comment viết tiếng Việt.

## Thiệp cưới (`index.html`, `styles.css`, `script.js`)

- Song ngữ VI/EN: chữ trong `translations` của `script.js`, hoặc cặp class `vi-only` / `en-only`. Lựa chọn lưu ở localStorage `phuoc-han-language`, link `?lang=en` mở thẳng bản tiếng Anh.
- Font: `--script` Alex Brush (tên cặp đôi viết tay ở bìa và đầu thiệp), `--display` Cormorant Garamond (tiêu đề, số lớn), `--serif` Lora (chữ đọc), `--sans` Be Vietnam Pro (nhãn, nút). Font tự lưu trong `assets/fonts/`.
- Màn hình từ 1024px trở lên có khối CSS riêng ở cuối `styles.css` (bản desktop).
- "Hành trình của chúng mình" (`#story`): dòng thời gian 6 mốc (nhánh xen kẽ trái phải trên máy tính, hiện dần khi cuộn tới). Nội dung gốc ở [docs/love-story.md](docs/love-story.md). Giữ nguyên câu "Anh gặp em là hết may mắn!". Chỉ dùng chi tiết thật cô dâu chú rể đã kể, không tự thêm.

## Trang quản lý (`nh/`)

- Một trang duy nhất: 3 thẻ game (nút mở màn hình TV, số quà, link nhạc) + danh sách tất cả link. **Thêm trang mới thì thêm vào mảng `links`** (hoặc `games`) trong [nh/index.html](nh/index.html).
- Có `noindex`, không có link từ thiệp.

## Các mini game

Mọi game dùng chung Firebase (project `wedding-game-acf62`, dùng chung với đám cưới Hữu Vinh & Yến Thi; mỗi phòng có mã 6 số riêng), mã phòng 6 số, MC điều khiển từ xa ([shared/remote.js](shared/remote.js)). Mỗi game có 3 trang: TV (`index.html`), khách và MC (`host/`).

| Game | Thư mục | Khách | Số quà | Cách chọn người thắng |
|---|---|---|---|---|
| Ai Là Triệu Phú | `quiz/` | `join/` | 3 | Top 3 điểm (15 câu trong `questions.js`) |
| Loto | `lottery/` | `ticket/` | 3 | Lô tô kiểu Việt Nam: mỗi khách 1 vé 3 hàng × 3 số (0–30), **giữ nguyên cả game**, vé tự đánh dấu. **3 vòng, mỗi vòng 1 giải** (Lộc → Song Hỷ → Độc Đắc, `PRIZES` trong `lottery.js`): người KINH (đủ 1 hàng ngang hoặc 1 cột dọc) đầu tiên thắng; sang vòng mới thì **xóa số đã quay, quay lại từ đầu** (`calls` = số của vòng đang chơi, `history/<vòng>` lưu số các vòng trước). Mỗi người tối đa 1 giải (trừ khi ai cũng đã trúng); cùng KINH ở một số thì TV bốc thăm. Có chế độ Tự quay (`room.auto`, phím A). Phòng kiểu mới có `version: 2` |
| Rung Cây, Rinh Quà | `tree/` | `play/` | 3 | 3 vòng × 1 người, **ai lắc nhiều nhất vòng đó thắng**, không bốc thăm, không loại người đã thắng (`drawWinners` trong `tree.js`) |

- **Nhạc nền theo kịch bản** là file trong `assets/audio/game/`: `quiz-intro.mp3` (Ai Là Triệu Phú: giới thiệu/sảnh chờ), `quiz-music.mp3` (lúc trả lời), `tree-music.mp3` (Rung Cây), `lottery-music.mp3` (Loto, đã cắt 10 phút đầu từ bản 69 phút). Chọn bài theo trạng thái phòng ở `MUSIC_FILES` trong `shared/live.js`; Loto ở `lottery/sound.js`. File lỗi thì dùng bài YouTube dự phòng ([shared/yt-music.js](shared/yt-music.js)), rồi nhạc tổng hợp. Chỉ trang TV phát nhạc. Đổi bài: chép mp3 đè lên file cùng tên.
- **Tự phát nhạc:** trình duyệt chặn phát tiếng khi trang chưa được bấm. Nút "📺 Mở TV" ở `/nh` mở **cùng tab** (không `target=_blank`) để cú bấm được tính cho trang game, nhạc tự phát (đã thử trên Edge). Bị chặn thì `needGesture()` trong `shared/live.js` hiện nút "🔇 Bấm vào màn hình để bật nhạc". Rung Cây phát nhạc ở sảnh chờ và lúc lắc, dừng khi công bố kết quả.
- Avatar mặt cô dâu chú rể đang tắt (`FACES = []` trong `shared/live.js`), khách chọn con vật. Có ảnh thì cắt vuông 160px vào `assets/images/avatars/groom-N.webp`, `bride-N.webp` rồi thêm lại mã `@g1`… vào `FACES`.
- **Mã MC**: 16 chữ số, tạo trên máy TV (`controlKey()` trong `shared/remote.js`, lưu localStorage `ph_ctrl_key`), hiện dưới mã QR trong bảng "🎤 MC". MC lỡ thoát/đổi điện thoại vào `/mc` nhập mã phòng + mã MC; trang tự chọn đúng game theo `type` của phòng. Phòng đã điều khiển lưu ở localStorage `ph_mc_sessions` (nút "Tiếp tục").
- **Song ngữ VI/EN chỉ ở trang người chơi** (`quiz/join`, `lottery/ticket`, `tree/play`): [shared/i18n.js](shared/i18n.js) (`initLang`, `L(vi, en)`, nút VI|EN góc dưới phải, nhớ chung localStorage `phuoc-han-language` với thiệp, `?lang=en`). TV và MC không gọi `initLang()` nên luôn tiếng Việt. Câu hỏi quiz có `qEn`, `optionsEn`, `rightEn`, `wrongEn`; TV gửi kèm xuống điện thoại trong `room.current` / `room.reveal`. Lời chúc lì xì Rung Cây lưu `wish` + `wishEn`. Thêm chữ mới ở trang người chơi thì bọc `L('…', '…')`.
- Danh sách lưu lên Firebase có thể bị trả về dạng object `{0: …, 1: …}`. Đọc bằng `Array.isArray(x) ? x : Object.values(x || {})`.
- Kiểm tra trang TV ở 1366×768 và trang khách trên điện thoại.

## Trình phát nhạc tiệc (`musicplay/`)

- Lấy từ dự án `weddding`, đã đổi sang Phước & Hân: tông đỏ rượu, ảnh `couple.jpg`, ảnh bìa ngẫu nhiên từ album 12 ảnh, ngày 28.11.2026. Bỏ bài "Ván Bài Năm Ấy" (của đám trước); nhóm chính chỉ có nhạc thiệp "Beauty And A Beat (Ballad)" (mảng `BUILTIN`).
- Nhạc tiệc: file trong `musicplay/party/`, tên dạng `NN - Tên bài - Ca sĩ.m4a`. **Thêm/bớt bài thì chạy `python3 musicplay/party/update-list.py`** để cập nhật `list.json` (trên web chỉ đọc file này). Trên máy, server có liệt kê thư mục thì đọc thẳng thư mục, không thì đọc `list.json`.
- Pad nghi lễ: `assets/audio/pads/`, khai báo trong `PAD_TABS`. Tab **⊞ Tất cả** (`PAD_ALL`, mặc định, lưới 9 cột, class `body.pads-all`) hiện cả 26 pad một lượt, viền trái tô màu theo nhóm (`GROUP_COLORS`); phím 1…= ở tab này bấm nhóm Nghi lễ. Tab đang chọn nhớ ở localStorage `mp-pad-tab`. `musicplay/local-tools.js` chỉ dùng trên máy (có trong `.gitignore`).
- Nhạc tiệc ~190 MB + pad 36 MB; ai có link cũng tải được.
- Lặp nhạc nền 3 chế độ (`repeatMode`: lặp cả danh sách / lặp 1 bài / không lặp, phím R) và nút **🔁 Lặp pad** (`padLoopAll`, **mặc định bật**, phím P); cả hai nhớ ở localStorage `mp-repeat`, `mp-pad-loop`.
- **Pad nhạc chạy thì nhạc nền tạm dừng**, hết pad nhạc (bấm lại ô, Dừng pad, Esc, pad hết bài) thì nhạc nền tự phát tiếp (`resumeMain`, `maybeResumeMain`). Đổi từ pad này sang pad khác thì nhạc nền vẫn chờ (`padStarting`). Pad hiệu ứng phát chồng, nhạc nền chỉ nhỏ lại (`setDuck`).
- **⚖️ Cân bằng âm lượng** (`levelOn`, mặc định bật, localStorage `mp-level`): mỗi nguồn (nhạc nền, từng pad nhạc) có bộ đo RMS + gain tự chỉnh về `LEVEL_TARGET` (giới hạn `LEVEL_MIN`…`LEVEL_MAX`, bỏ qua đoạn lặng), tất cả qua 1 `DynamicsCompressor` chung trước loa. Chỉ máy tính (điện thoại không dùng Web Audio).
- Bảng **Hướng dẫn sử dụng** (`#help`, nút ? hoặc phím H) tự mở ở lần đầu vào trang trên mỗi máy (`mp-help-seen`). Thêm chức năng mới thì nhớ thêm dòng vào bảng này.

## Đổi tên trang đã public

1. Thêm cặp `['/link-cu', '/link-moi']` vào mảng `MOVED` trong [404.html](404.html). Đặt link dài lên trước link ngắn.
2. Kiểm tra không còn chỗ nào trỏ tới tên cũ: `grep -rn "ten-cu" --include=*.html --include=*.js .`
