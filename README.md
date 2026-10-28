# 💌 Ngọc Hân & Hồng Phước - Wedding Invitation

Thiệp cưới online song ngữ (Việt, Anh), ngày cưới 28.11.2026, kèm mini game chơi chung trong tiệc.
Web tĩnh (HTML/CSS/JS thuần, không có bước build), tự động deploy lên GitHub Pages khi push vào nhánh `main` (xem `.github/workflows/static.yml`).

## Tính năng

- Hiệu ứng mở thiệp, nhạc nền theo ngôn ngữ, tự cuộn qua từng phần
- Thông tin lễ cưới, "Hành trình của chúng mình", album ảnh coverflow + xem ảnh lớn
- Đếm ngược, lịch tháng 11, thêm vào Google Calendar, bản đồ chỉ đường
- Xác nhận tham dự (RSVP) và sổ lưu bút
- Giao diện riêng cho điện thoại và máy tính
- 3 mini game chơi chung trong tiệc: Ai Là Triệu Phú, Loto, Rung Cây Rinh Quà (10 phần quà)

## Các trang

| Link | Trang |
|---|---|
| `/` | Thiệp cưới (`?lang=en` mở bản tiếng Anh) |
| `/nh` | Trang quản lý: mở màn hình TV của 3 game, tất cả link, nút sao chép link |
| `/mc` | MC lỡ thoát hoặc đổi điện thoại: nhập mã phòng + mã MC để điều khiển tiếp |
| `/musicplay` | Trình phát nhạc tiệc cho màn LED: đĩa than, pad nhạc nghi lễ, danh sách nhạc tiệc |
| `/quiz` | Ai Là Triệu Phú (TV). Khách: `/quiz/join` (trang nhập mã phòng dùng chung cho mọi game). MC: `/quiz/host` |
| `/lottery` | Loto (TV). Khách: `/lottery/ticket`. MC: `/lottery/host` |
| `/tree` | Rung Cây, Rinh Quà (TV). Khách: `/tree/play`. MC: `/tree/host` |

## Cấu trúc thư mục

```
ngochanhongphuoc/
├── index.html            # Thiệp cưới (song ngữ VI/EN)
├── styles.css            # Giao diện thiệp (điện thoại + máy tính)
├── script.js             # Song ngữ, nhạc, album ảnh, đếm ngược, RSVP, sổ lưu bút
├── thumbnail.png         # Ảnh xem trước khi chia sẻ link (1200×630)
├── 404.html              # Trang lỗi + tự chuyển link cũ (/games/...) sang link mới
│
├── nh/                   # Trang quản lý (link /nh): 3 game + tất cả link, noindex
│   └── index.html · nh.css
├── mc/                   # MC vào lại (link /mc): nhập mã phòng + mã MC, hoặc bấm phòng vừa điều khiển
├── musicplay/            # Trình phát nhạc tiệc cho màn LED (link /musicplay)
│   └── party/            #   Nhạc tiệc (m4a) + list.json (chạy update-list.py khi thêm/bớt bài)
├── quiz/                 # Game Ai Là Triệu Phú (đố vui, cả tiệc trả lời cùng lúc)
│   ├── index.html        #   Màn hình TV
│   ├── join/             #   Khách nhập mã phòng (dùng chung cho mọi game)
│   ├── host/             #   MC điều khiển bằng điện thoại
│   └── questions.js      #   Bộ 15 câu hỏi
├── lottery/              # Game Loto (3 vòng, 4 giải): index.html · ticket/ · host/ · lottery.js · lottery.css · sound.js
├── tree/                 # Game Rung Cây, Rinh Quà (ai lắc nhiều nhất thắng): index.html · play/ · host/ · tree.js · tree.css
├── shared/               # Code chung cho các game
│   └── firebase-config.js · database.rules.json · live.js · live.css · remote.js · shake.css · yt-music.js (nhạc YouTube dự phòng)
│
├── assets/
│   ├── images/           # couple.jpg, phong bì, hoa, nền giấy, lâu đài
│   │   └── gallery/      #   Album ảnh: wedding-01.jpg … wedding-12.jpg
│   ├── audio/            # Nhạc thiệp: vi-phuoc-han.mp3, en-phuoc-han.mp3 · Âm thanh game: gong, drum-roll, firecrackers, lottery-music (nguồn: CREDITS.md)
│   │   ├── pads/         #   22 file nhạc nghi lễ cho pad của /musicplay (m4a)
│   │   └── game/         #   Nhạc nền game theo kịch bản (quiz-intro, quiz-music, tree-music, lottery-music) + hiệu ứng; đổi bài: chép mp3 đè lên
│   ├── icons/            # Favicon emoji của từng trang
│   └── fonts/            # Alex Brush (tên viết tay), Cormorant Garamond (tiêu đề), Lora (chữ đọc), Be Vietnam Pro (nhãn, nút); kèm giấy phép OFL
├── docs/
│   └── love-story.md     # Nội dung "Hành trình của chúng mình" (VI + EN)
│
├── CLAUDE.md             # Ghi chú cho Claude Code
└── README.md
```

## Quy ước

- Tên file và thư mục: chữ thường, không dấu, nối bằng gạch ngang (`envelope-cover.webp`).
- Mỗi trang là một thư mục chứa `index.html` (`quiz/join/index.html` → link `/quiz/join`).
- Mọi đường dẫn trong code là **đường dẫn tương đối** (`../assets/...`), để chạy được cả trên máy lẫn trong thư mục repo của GitHub Pages.
- Ảnh album đánh số hai chữ số: `wedding-13.jpg`… và thêm đường dẫn vào danh sách ảnh trong `script.js`.
- Chữ song ngữ của thiệp: thêm khóa vào cả `translations.vi` và `translations.en` trong `script.js`, hoặc dùng cặp `vi-only` / `en-only` trong `index.html`.
- Đổi tên thư mục của một trang đã gửi link: thêm cặp `['/link-cu', '/link-moi']` vào `MOVED` trong `404.html`.

## Xem thử trên máy

Game dùng ES module nên cần chạy qua web server (mở file trực tiếp sẽ không chạy game):

```
npx serve .
```
