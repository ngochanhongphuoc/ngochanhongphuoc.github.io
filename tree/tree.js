// Phần dùng chung cho game Rung Cây, Rinh Quà (TV: /tree, điện thoại khách: /tree/play, MC: /tree/host).
// Cả phòng cùng lắc điện thoại để "rung cây may mắn". Hết giờ mỗi vòng, WINNERS người lắc nhiều nhất vòng đó thắng.
// Không bốc thăm, không nhường: mỗi vòng tính lại từ đầu, đã thắng vòng trước vẫn thắng tiếp nếu lắc nhiều nhất.
// Số lần lắc lưu ở rooms/<pin>/shakes (luật Firebase có sẵn cho đường này).

export const DURATION = 20000;  // thời gian lắc mỗi vòng
export const COUNTDOWN = 4000;  // đếm ngược trước khi lắc
export const ROUNDS = 3;        // số vòng rung cây
export const WINNERS = 1;       // số người trúng lộc mỗi vòng (3 vòng × 1 người = 3 phần quà)
export const MAX_SHAKES = 400;  // giới hạn mỗi người mỗi vòng (khớp luật Firebase)
export const PER_PERSON = 60;   // mỗi người lắc chừng này lần thì thanh "Lộc" đầy 100%

export const COUPLE = '<span class="nm">Ngọc Hân</span> <span class="amp">&amp;</span> <span class="nm">Hồng Phước</span>';

// Lời chúc trong bao lì xì (người trúng lộc và lì xì ảo rơi trên điện thoại)
export const WISHES = [
  'Năm sau tới lượt bạn lên xe hoa! 💍',
  'Tiền vô như nước, tiền ra nhỏ giọt 💸',
  'Ăn hoài không mập, ngủ hoài vẫn đẹp 😴',
  'Đi đâu cũng gặp người thương 💘',
  'Sếp khen, lương tăng, thưởng Tết dày cộm 🧧',
  'Vạn sự như ý, tỷ sự như mơ ✨',
  'Hay ăn chóng lớn, sớm có người yêu 🥰',
  'Lắc tay ra lộc, lắc chân ra tài 💃',
  'Một vợ một chồng, cả đời hạnh phúc 💑',
  'Mua gì cũng trúng sale, đi đâu cũng có chỗ đậu xe 🚗',
];
export const randomWish = () => WISHES[Math.floor(Math.random() * WISHES.length)];

export const shakesOf = (room, r) => (room.shakes && room.shakes[r]) || {};
export const totalOf = (room, r) => Object.values(shakesOf(room, r)).reduce((s, c) => s + (c || 0), 0);

// Thanh "Lộc": tổng số lần lắc so với mục tiêu theo số người trong phòng
export function meterOf(room, r) {
  const n = Math.max(1, Object.keys(room.players || {}).length);
  return Math.min(1, totalOf(room, r) / (n * PER_PERSON));
}

// Người lắc nhiều nhất vòng r
export function topOf(room, r) {
  const players = room.players || {};
  return Object.entries(shakesOf(room, r))
    .filter(([uid, c]) => players[uid] && c > 0)
    .map(([uid, count]) => ({ uid, count, ...players[uid] }))
    .sort((a, b) => b.count - a.count || (a.joinedAt || 0) - (b.joinedAt || 0));
}

// Danh sách người trúng của 1 vòng (Firebase có thể trả mảng về dạng object {0:..,1:..})
export const winnersOf = (res) => { const w = res && res.winners; return Array.isArray(w) ? w : Object.values(w || {}); };

// Những người đã trúng lộc ở các vòng trước vòng r
// (không còn dùng: mỗi vòng tính lại từ đầu)
export function pastWinners(room, beforeRound = ROUNDS) {
  const out = new Set();
  for (let r = 0; r < beforeRound; r++) winnersOf(room.results && room.results[r]).forEach((w) => out.add(w.uid));
  return out;
}

// Người thắng: k người lắc nhiều nhất vòng r (bằng số lần lắc thì ai vào phòng trước đứng trước)
export function drawWinners(room, r, k = WINNERS) {
  return topOf(room, r)
    .slice(0, k)
    .map((p) => ({ uid: p.uid, name: p.name, animal: p.animal, count: p.count, wish: randomWish() }));
}

// Tổng số lần lắc của mỗi người qua các vòng (để tìm "Tay rung vàng")
export function overallTop(room) {
  const sum = {};
  Object.values(room.shakes || {}).forEach((round) => Object.entries(round || {}).forEach(([uid, c]) => { sum[uid] = (sum[uid] || 0) + (c || 0); }));
  const players = room.players || {};
  return Object.entries(sum).filter(([uid]) => players[uid]).map(([uid, count]) => ({ uid, count, ...players[uid] })).sort((a, b) => b.count - a.count);
}

export const played = (room) => Object.keys(room.results || {}).length;
export const isOver = (room) => played(room) >= ROUNDS;

// Hướng dẫn cách chơi (TV và điện thoại)
export const HOW_TO = [
  ['📱', 'Quét mã QR, nhập tên, chọn avatar rồi bấm <b>Bật lắc</b> (iPhone sẽ hỏi quyền cảm biến).'],
  ['🌳', 'Đếm 3-2-1 là cả phòng <b>cùng lắc thật mạnh 20 giây</b> để rung cây may mắn trên TV.'],
  ['🧧', `Hết giờ, <b>${WINNERS > 1 ? `${WINNERS} người` : 'người'} lắc nhiều nhất trúng lộc</b>. Không bốc thăm, chỉ tính số lần lắc!`],
  ['🎁', 'Mỗi vòng tính lại từ đầu, vòng nào cũng có cơ hội. Lên nhận quà từ cô dâu chú rể nha!'],
];
export const howToHtml = () => `<ol class="howto">${HOW_TO.map(([icon, text]) => `<li><span class="ic">${icon}</span><span>${text}</span></li>`).join('')}</ol>`;

// Bảng cách chơi bật lên giữa màn hình (gắn ngoài #app để không mất khi vẽ lại)
export function showHelp(extraClass = '') {
  if (document.querySelector('.help-modal')) return;
  const box = document.createElement('div');
  box.className = `help-modal ${extraClass}`;
  box.innerHTML = `<div class="box"><h2>🌳 Cách chơi Rung Cây, Rinh Quà</h2>${howToHtml()}
    <button class="btn" id="helpClose">Đã hiểu, rung thôi! 🧧</button></div>`;
  document.body.appendChild(box);
  const close = () => box.remove();
  box.querySelector('#helpClose').onclick = close;
  box.onclick = (e) => { if (e.target === box) close(); };
}
