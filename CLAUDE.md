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
- "Hành trình của chúng mình" (`#story`): dòng thời gian 4 mốc (nhánh xen kẽ trái phải trên máy tính, hiện dần khi cuộn tới). Nội dung gốc ở [docs/love-story.md](docs/love-story.md). Giữ nguyên câu "Anh gặp em là hết may mắn!". Chỉ dùng chi tiết thật cô dâu chú rể đã kể, không tự thêm.

## Bài đăng Facebook (`posts/`), trang cảm ơn (`thank-you/`), hướng dẫn game (`game-guide/`), Hint game (`hint-game/`)

- `posts/`: 4 bài trong mảng `POSTS` (nhà gái 28/11, nhà trai 29/11, mini game, cảm ơn). Facebook không có chữ đậm: chữ trong `**…**` được đổi sang ký tự đậm Unicode khi chép (`toBold`: tách dấu NFD, giữ dấu). Nội dung sửa và ảnh đã chọn lưu localStorage `fb-post:text:<id>`, `fb-post:photos:<id>`. Có noindex.
- `thank-you/`: thư cảm ơn, 2 ngày cưới, album 12 ảnh; song ngữ bằng `vi-only` / `en-only`, nhớ chung `phuoc-han-language` với thiệp.
- `game-guide/`: hướng dẫn 3 mini game cho khách (cách vào, luật, mẹo). **Đổi luật game (thời gian, số câu, số quà) thì sửa cả trang này**, bài "🎮 Mini game" trong `posts/` và mảng `CARDS` trong `hint-game/`.
- `hint-game/` (tên hiển thị "Hint game"): 5 ảnh gợi ý mini game khổ dọc Facebook 1080×1350, vẽ bằng canvas (nền `couple.jpg`, font Alex Brush / Lora / Be Vietnam Pro), tải JPG. Có 2 bản (nút chọn, `SIDES`): nhà gái 28.11 và nhà trai 29.11 (tên đảo "Hồng Phước & Ngọc Hân", ảnh Ôn bài trỏ về Hành trình trên thiệp nhà trai; link hướng dẫn game cả hai bên đều về `ngochanhongphuoc.github.io/game-guide`), `?side=groom` mở thẳng bản nhà trai. Nội dung trong mảng `CARDS`, `**chữ**` = in đậm; chữ tự thu nhỏ (40 → 22px) cho vừa khung. Ảnh "Ôn bài" chỉ gợi ý câu hỏi, không ghi đáp án. Có noindex.

## Trang quản lý (`nh/`)

- Một trang duy nhất, sắp theo **thời điểm dùng**: hàng trên **📺 Trong tiệc · mở trên máy TV / LED** là ô rộng **Màn hình tiệc** (`cls: "screen-tile"`) rồi 4 ô lớn (3 game với nút "📺 Mở TV" + Trình phát nhạc tiệc); tiếp theo là 2 khung rộng hết trang, mỗi khung **2 cột** (`.links.grid2`): **🎤 Hỗ trợ MC & khách** (khách nhập mã, MC vào lại, danh sách câu hỏi, "Cách chơi trong tiệc": nút Xem mở ghi chú trong `<template id="how-text">`, nút Chép chép ghi chú gửi MC) và **💌 Gửi khách · trước & sau tiệc**; cuối là khung thu gọn **⚙️ Quản trị** (không nằm trong "Chép tất cả link"). Mọi dòng cùng 1 kiểu (biểu tượng · tên + mô tả nhỏ · nút **Mở** nền đỏ rượu, mở tab mới · nút **Chép** nền trắng). **Thêm link thì thêm dòng vào `groups.tv` / `party` / `guest` / `admin`** trong [nh/index.html](nh/index.html); giữ số dòng mỗi nhóm 2 cột là số chẵn để không trống ô.
- Có `noindex`, không có link từ thiệp.
- 4 kiểu màn hình: FHD ≥1600px (`body { zoom: 1.3 }`, đặt zoom ở body để % không bị tràn), HD 1200–1599px (4 ô + 2 cột), iPad 760–1199px (ô 2 cột, nút to; dưới 900px danh sách 1 cột), iPhone <760px (1 cột).

## Các mini game

Mọi game dùng chung Firebase (project `wedding-game-acf62`, dùng chung với đám cưới Hữu Vinh & Yến Thi; mỗi phòng có mã 6 số riêng), mã phòng 6 số, MC điều khiển từ xa ([shared/remote.js](shared/remote.js)). Mỗi game có 3 trang: TV (`index.html`), khách và MC (`host/`).

| Game | Thư mục | Khách | Số quà | Cách chọn người thắng |
|---|---|---|---|---|
| Ai Là Triệu Phú | `quiz/` | `join/` | 3 | Top 3 điểm (15 câu trong `questions.js`) |
| Loto | `lottery/` | `ticket/` | 4 | Lô tô kiểu Việt Nam: mỗi khách 1 vé 3 hàng × 3 số (0–30), **giữ nguyên cả game**, vé tự đánh dấu. **4 vòng, mỗi vòng 1 giải** (Lộc → Song Hỷ → Phát Tài → Độc Đắc, `PRIZES` trong `lottery.js`): người KINH (đủ 1 hàng ngang hoặc 1 cột dọc) đầu tiên thắng; sang vòng mới thì **xóa số đã quay, quay lại từ đầu** (`calls` = số của vòng đang chơi, `history/<vòng>` lưu số các vòng trước). Mỗi người tối đa 1 giải (trừ khi ai cũng đã trúng); cùng KINH ở một số thì TV bốc thăm. Có chế độ Tự quay (`room.auto`, phím A). Phòng kiểu mới có `version: 2` |
| Rung Cây, Rinh Quà | `tree/` | `play/` | 3 | 3 vòng × 1 người, **ai lắc nhiều nhất vòng đó thắng**, không bốc thăm, không loại người đã thắng (`drawWinners` trong `tree.js`) |

- **Nhạc nền theo kịch bản** là file trong `assets/audio/game/`: `quiz-intro.mp3` (Ai Là Triệu Phú: giới thiệu/sảnh chờ), `quiz-music.mp3` (lúc trả lời), `tree-music.mp3` (Rung Cây: chỉ phát lúc đang lắc, **file đã cắt sẵn từ 0:58 bản gốc**, phát từ đầu; sảnh chờ, đếm ngược, kết quả thì phát nhạc thiệp `assets/audio/vi-phuoc-han.mp3` nhỏ 35%), `lottery-music.mp3` (Loto, đã cắt 10 phút đầu từ bản 69 phút). Chọn bài theo trạng thái phòng ở `MUSIC_FILES` trong `shared/live.js` (mỗi bài: tên file hoặc `{ file, start, volume }`; mỗi bài 1 trình phát riêng, đổi bài không tải lại); Loto ở `lottery/sound.js`. File lỗi thì dùng bài YouTube dự phòng ([shared/yt-music.js](shared/yt-music.js)), rồi nhạc tổng hợp. Chỉ trang TV phát nhạc. Đổi bài: chép mp3 đè lên file cùng tên.
- **Tự phát nhạc:** trình duyệt chặn phát tiếng khi trang chưa được bấm. Nút "📺 Mở TV" ở `/nh` mở **tab mới** (theo yêu cầu) nên có thể bị chặn. **Nhạc luôn chạy, không có nút bật/tắt và không hiện dòng nhắc** (theo yêu cầu): `needGesture()` trong `shared/live.js` tự thử phát lại mỗi 2 giây và phát ngay khi có cú bấm/phím bất kỳ. Để chắc chắn có nhạc ngay khi mở: bật `edge://settings/content/mediaAutoplay` → Cho phép trên máy TV. (Mở cùng tab thì tự phát được, đã thử trên Edge.)
- **Avatar mặt cô dâu chú rể** (`FACES` trong `shared/live.js`: `@g1…@g6` chú rể, `@b1…@b6` cô dâu): ảnh 160px `assets/images/avatars/groom-N.webp`, `bride-N.webp`, cắt từ `couple.jpg` và ảnh album 02, 03, 05, 10, 11, 12. Khách mới được gán ngẫu nhiên 1 mặt, vẫn chọn được con vật.
- **Nền ảnh cưới** cho mọi trang game: [shared/couple-bg.css](shared/couple-bg.css) đặt `couple.jpg` ở `html::before`, màu nền của từng game phủ trong mờ lên trên (`--tint-a`, `--tint-b` theo class của body: `live` quiz, `xs` lô tô, `sk` rung cây, `right`/`wrong`/`none` màn đúng/sai). Không dùng `body::before` vì Lô tô đã dùng cho hiệu ứng tối màn hình.
- **Mã MC**: 16 chữ số, tạo trên máy TV (`controlKey()` trong `shared/remote.js`, lưu localStorage `ph_ctrl_key`). TV ghi sẵn mã này vào phòng (`rooms/<pin>/mcKey`), nên MC lỡ thoát/đổi điện thoại chỉ cần vào `/mc` **nhập mã phòng** (theo yêu cầu, đổi bảo mật lấy sự nhanh gọn: ai biết `/mc` + mã phòng đều điều khiển được; `/mc` không có link trên thiệp, có noindex). Trang tự chọn đúng game theo `type` của phòng. Phòng đã điều khiển lưu ở localStorage `ph_mc_sessions` (nút "Tiếp tục").
- **Song ngữ VI/EN chỉ ở trang người chơi** (`quiz/join`, `lottery/ticket`, `tree/play`): [shared/i18n.js](shared/i18n.js) (`initLang`, `L(vi, en)`, nút VI|EN góc dưới phải, nhớ chung localStorage `phuoc-han-language` với thiệp, `?lang=en`). TV và MC không gọi `initLang()` nên luôn tiếng Việt. Câu hỏi quiz có `qEn`, `optionsEn`, `rightEn`, `wrongEn`; TV gửi kèm xuống điện thoại trong `room.current` / `room.reveal`. Lời chúc lì xì Rung Cây lưu `wish` + `wishEn`. Thêm chữ mới ở trang người chơi thì bọc `L('…', '…')`.
- Danh sách lưu lên Firebase có thể bị trả về dạng object `{0: …, 1: …}`. Đọc bằng `Array.isArray(x) ? x : Object.values(x || {})`.
- Kiểm tra trang TV ở 1366×768 và trang khách trên điện thoại.

## Màn hình tiệc (`screen/`)

- **1 link cho máy TV / LED**, mặc định chiếu thiệp cưới; MC đổi màn hình từ điện thoại (theo yêu cầu: không phải về máy bấm từng game / chuyển tab). Mỗi màn hình là 1 iframe cùng tên miền (`VIEWS`: `invite` thiệp, `music` trình phát, `quiz`, `lottery`, `tree` trang TV game). Nhạc tiệc giữ khung (chuyển đi thì dừng nhạc + pad, nhớ bài), thiệp và game chuyển đi thì tải `about:blank` để không phát nhạc chồng; game mở lại dùng lại phòng cũ nên chơi tiếp được.
- Phòng Firebase riêng `type: screen` (localStorage `sc_host_pin`, màn hình đang chiếu `sc_view`), `rooms/<pin>/state = { show, games: { music|quiz|lottery|tree: mã phòng }, auto }`. Mã phòng game đọc từ localStorage của game (`mp_host_pin`, `kh_host_pin`, `xs_host_pin`, `tr_host_pin`), chỉ báo khi `hostUid` trùng (iframe dùng chung tài khoản ẩn danh, nên game chỉ mở sau khi trang ngoài đăng nhập xong). Lệnh: `show`, `hello` (đóng bảng QR), `inviteOpen/Up/Down/Top/Auto` (điều khiển thẳng trong iframe thiệp, tự cuộn dùng `behavior: instant` vì thiệp có scroll-behavior smooth).
- Mở trang là hiện mã QR, MC quét xong tự đóng. Thanh dưới đáy (rê chuột) chuyển màn hình tại máy, "📱 Mã MC", toàn màn hình.
- Điện thoại [screen/remote/](screen/remote/index.html): 5 ô chọn màn hình ở trên (chuyển đi khỏi game có `confirm`), phần dưới là iframe trang điều khiển sẵn có (`../../<game>/host/`, `musicplay/remote/`, cùng mã MC `ph_ctrl_key`) hoặc nút điều khiển thiệp. `/mc` nhận phòng qua `GAMES.screen`. Thêm game mới thì thêm vào `VIEWS` ở cả 2 trang.

## Trình phát nhạc tiệc (`musicplay/`)

- Lấy từ dự án `weddding`, đã đổi sang Phước & Hân: tông đỏ rượu, ảnh `couple.jpg`, ảnh bìa ngẫu nhiên từ album 12 ảnh, ngày 28.11.2026. Bỏ bài "Ván Bài Năm Ấy" (của đám trước); nhóm chính chỉ có nhạc thiệp "Beauty And A Beat (Ballad)" (mảng `BUILTIN`).
- Nhạc tiệc: file trong `musicplay/party/`, tên dạng `NN - Tên bài - Ca sĩ.m4a`. **Thêm/bớt bài thì chạy `python3 musicplay/party/update-list.py`** để cập nhật `list.json` (trên web chỉ đọc file này). Trên máy, server có liệt kê thư mục thì đọc thẳng thư mục, không thì đọc `list.json`.
- Pad nghi lễ: `assets/audio/pads/`, khai báo trong `PAD_TABS` (mỗi pad `[tên, file, mode, lặp cố định, giây bắt đầu]`; file không ghi đuôi thì là `.m4a`). Nhóm đầu **Kịch bản** là 5 bài lễ cưới cô dâu chú rể gửi (23–27, mp3), theo thứ tự: chú rể xuất hiện (từ 0:05), ba dẫn cô dâu trao tay chú rể, ba mẹ lên sân khấu, cắt bánh/thổi nến (từ 0:11), rót gạo; pad có giây bắt đầu thì lặp lại về giây đó. Bảng pad **không có tab**: cả 31 pad trên một màn hình, **mỗi nhóm 1 cột** (chấm màu + tên, 4 hàng ô cùng màu nhóm). Mỗi nhóm trong `PAD_TABS` khai báo `cols` (số cột ô, cũng là độ rộng cột nhóm), `keys` (phím tắt theo thứ tự ô, hiện ở góc ô), `color` (màu ô), `dot` (màu chấm). Phím: Kịch bản 1–5, Hiệu ứng 6–9, Nghi lễ QWEYUIOADGJZ, Cắt bánh XCVB, Đoạn lễ N M , . / ; (tránh phím đã dùng Space K H P F R S L T [ ] Esc). Thêm pad thì thêm phím vào `keys` và giữ số ô mỗi nhóm ≤ `cols` × 4. Đĩa than nhỏ (`--disc: min(36vh, 22vw)`) để nhường chỗ cho bảng pad (`--pads-h` 40vh, màn ngang thấp ≤900px là 44vh). Không đặt class `.bg` trong bảng pad (trùng lớp ảnh nền phủ toàn màn hình). `musicplay/local-tools.js` chỉ dùng trên máy (có trong `.gitignore`).
- Nhạc tiệc ~190 MB + pad 53 MB; ai có link cũng tải được.
- Lặp nhạc nền 3 chế độ (`repeatMode`: lặp cả danh sách / lặp 1 bài / không lặp, phím R) và nút **🔁 Lặp pad** (`padLoopAll`, **mặc định bật**, phím P); cả hai nhớ ở localStorage `mp-repeat`, `mp-pad-loop`.
- **Pad nhạc chạy thì nhạc nền dừng**, hết pad nhạc (bấm lại ô, Dừng pad, Esc, pad hết bài) thì nhạc nền **không tự phát lại** (theo yêu cầu), người điều khiển bấm ▶ / Space để phát tiếp từ chỗ cũ; bấm ▶ khi pad đang chạy thì tắt pad và phát nhạc nền (`toggle`). `resumeMain` luôn false (giữ để bật lại kiểu tự phát tiếp nếu cần). Pad hiệu ứng phát chồng, nhạc nền chỉ nhỏ lại (`setDuck`).
- **⚖️ Cân bằng âm lượng** (`levelOn`, mặc định bật, localStorage `mp-level`): mỗi nguồn (nhạc nền, từng pad nhạc) có bộ đo RMS + gain tự chỉnh về `LEVEL_TARGET` (giới hạn `LEVEL_MIN`…`LEVEL_MAX`, bỏ qua đoạn lặng), tất cả qua 1 `DynamicsCompressor` chung trước loa. Chỉ máy tính (điện thoại không dùng Web Audio).
- **📱 Remote điện thoại** (nút `#remoteBtn` cạnh nút ?, hiện khi đã nối Firebase): [musicplay/tv-remote.js](musicplay/tv-remote.js) (module riêng, lỗi mạng không ảnh hưởng trình phát) tạo phòng `type: 'music'` (localStorage `mp_host_pin`, dùng chung mã MC `ph_ctrl_key` với game), ghi `rooms/<pin>/state` (đổi gì gửi ngay, không thì 5 giây/lần), `tracks`, `pads`; nhận lệnh `rooms/<pin>/command` (`{type, arg}`) rồi gọi `window.MP.run` (cổng cuối script trình phát: `state`, `tracks`, `padList`, `run`). Trang điện thoại [musicplay/remote/](musicplay/remote/index.html) chỉ ghi lệnh; đổi bài khi đang phát và Dừng pad có `confirm`. `/mc` nhận phòng nhạc qua `GAMES.music`. Thêm lệnh mới thì thêm vào cả `MP.run` lẫn trang remote.
- Bảng **Hướng dẫn sử dụng** (`#help`, nút ? hoặc phím H) tự mở ở lần đầu vào trang trên mỗi máy (`mp-help-seen`). Thêm chức năng mới thì nhớ thêm dòng vào bảng này.

## Đổi tên trang đã public

1. Thêm cặp `['/link-cu', '/link-moi']` vào mảng `MOVED` trong [404.html](404.html). Đặt link dài lên trước link ngắn.
2. Kiểm tra không còn chỗ nào trỏ tới tên cũ: `grep -rn "ten-cu" --include=*.html --include=*.js .`
