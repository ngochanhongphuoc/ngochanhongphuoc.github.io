# Nhạc tiệc

Bỏ file nhạc vào thư mục `musicplay/party/` này, chạy `python3 musicplay/party/update-list.py` để cập nhật `list.json`, rồi đẩy lên GitHub. Trang `/musicplay` sẽ hiện các bài trong nhóm **🎉 Nhạc tiệc** (danh sách bên phải). Quên chạy lệnh này thì web không thấy bài mới, vì repo để private nên trang không tự đọc được thư mục.

- Đặt tên file dạng `01 - Tên bài - Ca sĩ.m4a` để có thứ tự và hiện tên ca sĩ. Số đầu tên file chỉ dùng để sắp xếp, không hiện lên màn hình.
- **Chuyển sang m4a cho nhẹ trước khi bỏ vào** (máy Mac có sẵn lệnh `afconvert`):
  - Bài lẻ, playlist dài: `afconvert -f m4af -d aach -b 64000 "bai-goc.mp3" "01 - Tên bài - Ca sĩ.m4a"` (HE-AAC 64 kbps, khoảng 0,5 MB mỗi phút).
- Mỗi file phải dưới 100 MB, cả trang web nên dưới 1 GB.
- File gốc (mp3, wav, mp4) cất ở `assets/audio/originals/party/`, chỉ lưu trên máy, không đẩy lên GitHub.
- Nhạc nghi lễ cho các ô **Pad** dưới đĩa nằm ở `assets/audio/pads/` (AAC 96 kbps), khai báo trong mảng `PAD_TABS` của `musicplay/index.html`.
- File ở đây ai có link cũng tải được. Nhạc chỉ muốn phát tại tiệc thì dùng nút **📁 Thư mục trên máy** trên trang.
