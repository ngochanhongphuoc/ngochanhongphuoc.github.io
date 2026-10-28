// Phần dùng chung cho game Loto (TV: /lottery, điện thoại khách: /lottery/ticket).
// Luật kiểu lô tô: mỗi vòng mỗi khách nhận 1 vé gồm các chữ số khác nhau. Mỗi lần quay ra 1 "số may mắn"
// (không lặp lại); vé nào có số đó thì giữ, vé không có là trượt. Khi số vé còn lại <= số giải thì những vé đó trúng.
// Lần quay làm trượt hết mọi vé thì bỏ qua số đó (quay lại). Còn nhiều vé giống nhau quá số giải thì bốc thăm.

// spinMs: thời gian quay 1 số. suspense: mức hồi hộp trên TV (0 nhẹ, 1 tối màn hình, 2 thêm nhịp tim + dừng ở "?")
export const ROUNDS = [
  { name: 'Tiểu Cát', han: '小吉', prize: 'Giải Lộc', digits: 4, winners: 2, emoji: '🧧', spinMs: 2500, suspense: 0 },
  { name: 'Song Hỷ', han: '囍', prize: 'Giải Song Hỷ', digits: 5, winners: 1, emoji: '🏮', spinMs: 4500, suspense: 1 },
  { name: 'Đại Cát', han: '大吉', prize: 'Giải Độc Đắc', digits: 6, winners: 1, emoji: '🐉', spinMs: 5500, suspense: 2 },
];

export const hitsOf = (room, r) => String((room.draws && room.draws[r]) || '');    // các số đã ra và còn người giữ
export const missesOf = (room, r) => String((room.misses && room.misses[r]) || ''); // các số đã ra nhưng không ai giữ
export const ticketOf = (p, r) => (p && p.tickets && p.tickets[r] != null ? String(p.tickets[r]) : null);
export const keeps = (ticket, hits) => hits.split('').every((d) => ticket.includes(d));

// Vé gồm các chữ số khác nhau
export function randomTicket(digits) {
  const pool = '0123456789'.split('');
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, digits).join('');
}

// Người đã trúng ở vòng trước (không bốc vé ở vòng sau)
export function pastWinners(room, beforeRound) {
  const out = new Set();
  for (let r = 0; r < beforeRound; r++) Object.keys((room.winners && room.winners[r]) || {}).forEach((u) => out.add(u));
  return out;
}

// Vé còn giữ được ở vòng r
export function survivors(room, r, hits = hitsOf(room, r)) {
  return Object.entries(room.players || {})
    .filter(([, p]) => { const t = ticketOf(p, r); return t !== null && keeps(t, hits); })
    .map(([uid, p]) => ({ uid, ...p, ticket: ticketOf(p, r) }));
}

export const winnersOf = (room, r) => Object.keys((room.winners && room.winners[r]) || {})
  .map((uid) => ({ uid, ...((room.players || {})[uid] || { name: '?', animal: '🎟️' }), ticket: ticketOf((room.players || {})[uid], r) }));

// Vé số dạng ô chữ số: số nào đã ra thì sáng vàng
export function ticketHtml(ticket, hits, { dead = false, spinning = false } = {}) {
  return `<div class="digits ${dead ? 'dead' : ''} ${spinning ? 'waiting' : ''}">${ticket.split('').map((d) =>
    `<span class="dg ${hits.includes(d) ? 'hit' : ''}">${d}</span>`).join('')}</div>`;
}

// Dãy bi số đã quay: số trúng màu vàng, số không ai giữ bị gạch
export function ballsHtml(hits, order) {
  return (order || '').split('').map((d) =>
    `<span class="ball ${hits.includes(d) ? 'hit' : 'miss'}">${d}</span>`).join('');
}

// Hướng dẫn cách chơi (hiện trên TV ở sảnh chờ và trên điện thoại)
export const HOW_TO = [
  ['📱', 'Quét mã QR, nhập tên và chọn avatar (mặt cô dâu chú rể hoặc con vật) để vào phòng.'],
  ['🎟️', 'Mỗi vòng bạn nhận <b>1 vé số mới</b>, các chữ số trên vé không trùng nhau.'],
  ['🎲', 'MC quay ra từng <b>số may mắn</b>. Vé <b>có</b> số đó (ở vị trí nào cũng được) thì giữ, số sáng vàng. Vé <b>không có</b> là trượt.'],
  ['🧧', 'Khi số vé còn lại bằng số giải thì những vé đó <b>trúng</b>! Vé giống hệt nhau thì bốc thăm chung kết.'],
  ['🤝', 'Đã trúng thì nhường vé vòng sau cho người khác. Trượt vòng này vẫn được vé mới ở vòng sau.'],
];
export const howToHtml = () => `<ol class="howto">${HOW_TO.map(([icon, text]) => `<li><span class="ic">${icon}</span><span>${text}</span></li>`).join('')}</ol>`;

// Đèn lồng treo hai bên
export function lanterns() {
  ['left', 'right'].forEach((side) => {
    const l = document.createElement('div');
    l.className = `lantern ${side}`;
    l.innerHTML = '<span class="cord"></span><span class="body">🏮</span>';
    document.body.appendChild(l);
  });
}

export const COUPLE = '<span class="nm">Ngọc Hân</span> <span class="amp">&amp;</span> <span class="nm">Hồng Phước</span>';
