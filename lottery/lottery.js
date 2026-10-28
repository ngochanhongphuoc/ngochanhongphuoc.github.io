// Phần dùng chung cho game Loto (TV: /lottery, điện thoại khách: /lottery/ticket, MC: /lottery/host).
// Lô tô kiểu Việt Nam: mỗi khách 1 vé 3 hàng × 3 số (9 số khác nhau, 0–30), giữ nguyên từ đầu đến cuối game.
// Chơi 4 vòng, mỗi vòng 1 giải: TV quay ra từng số (không lặp), vé có số đó tự đánh dấu, người đầu tiên đủ 1 hàng
// hoặc 1 cột dọc ("KINH") thắng giải của vòng. Sang vòng mới thì xóa hết số đã quay, quay lại từ đầu (vé giữ nguyên).
// Mỗi người tối đa 1 giải; nhiều người cùng KINH ở một số thì TV bốc thăm.

import { L } from '../shared/i18n.js'; // TV/MC không bật song ngữ nên luôn là tiếng Việt

export const MAX_NUM = 30;                 // số từ 0 đến 30
export const ALL_NUMS = Array.from({ length: MAX_NUM + 1 }, (_, i) => i);

// spinMs: thời gian quay 1 số. suspense: mức hồi hộp trên TV (0 nhẹ, 1 tối màn hình, 2 thêm nhịp tim + dừng ở "?")
// Mỗi vòng 1 giải, vòng sau quay hồi hộp hơn
export const PRIZES = [
  { name: 'Giải Lộc', nameEn: 'Fortune Prize', short: 'Vòng 1 · Lộc', shortEn: 'Round 1 · Fortune', rows: 1, emoji: '🧧', han: '小吉', spinMs: 1600, suspense: 0 },
  { name: 'Giải Song Hỷ', nameEn: 'Double Happiness Prize', short: 'Vòng 2 · Song Hỷ', shortEn: 'Round 2 · Double Happiness', rows: 1, emoji: '🏮', han: '囍', spinMs: 2000, suspense: 1 },
  { name: 'Giải Phát Tài', nameEn: 'Prosperity Prize', short: 'Vòng 3 · Phát Tài', shortEn: 'Round 3 · Prosperity', rows: 1, emoji: '💰', han: '發', spinMs: 2300, suspense: 2 },
  { name: 'Giải Độc Đắc', nameEn: 'Jackpot', short: 'Vòng 4 · Độc Đắc', shortEn: 'Round 4 · Jackpot', rows: 1, emoji: '🐉', han: '大吉', spinMs: 2800, suspense: 2 },
];
// Tên giải theo ngôn ngữ đang dùng
export const prizeName = (P) => L(P.name, P.nameEn);
export const prizeShort = (P) => L(P.short, P.shortEn);
export const ROW_TEXT = ['', 'KINH đầu tiên (đủ 1 hàng ngang hoặc dọc)', 'đủ 2 hàng', 'đủ cả 3 hàng'];

// ---------- Vé ----------
// Vé lưu dạng chuỗi "3,12,25|0,8,19|5,17,30" ở players/<uid>/tickets/0 (TV ghi, luật Firebase cho phép)
export function randomTicket() {
  const pool = ALL_NUMS.slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const nine = pool.slice(0, 9);
  return [0, 1, 2].map((r) => nine.slice(r * 3, r * 3 + 3).sort((a, b) => a - b).join(',')).join('|');
}
export const ticketOf = (p) => (p && p.tickets && p.tickets[0] != null ? String(p.tickets[0]) : null);
export const parseTicket = (t) => (t ? String(t).split('|').map((row) => row.split(',').map(Number)) : null);

// Các số đã quay của vòng đang chơi (theo thứ tự); sang vòng mới thì xóa
export const callsOf = (room) => String((room && room.calls) || '').split(',').filter((x) => x !== '').map(Number);
export const stageOf = (room) => Math.min(PRIZES.length, (room && room.stage) || 0);

// 6 đường KINH của vé: 3 hàng ngang + 3 cột dọc
export const linesOf = (rows) => rows.concat([0, 1, 2].map((c) => rows.map((row) => row[c])));
// Số đường (ngang hoặc dọc) đã đủ 3 số
export function rowsDone(rows, called) {
  return linesOf(rows).filter((line) => line.every((n) => called.has(n))).length;
}
// Còn thiếu bao nhiêu số để đạt "need" đường, và những số đang chờ khi chỉ còn thiếu 1
export function progress(rows, called, need) {
  const missing = linesOf(rows).map((line) => line.filter((n) => !called.has(n))).sort((a, b) => a.length - b.length);
  const left = missing.slice(0, need).reduce((s, m) => s + m.length, 0);
  // Còn thiếu đúng 1 số: đã đủ need-1 hàng, hàng nào thiếu 1 số thì số đó là số đang chờ
  const waiting = left === 1 ? [...new Set(missing.filter((m) => m.length === 1).flat())] : [];
  return { left, waiting };
}

// Người đã trúng (mọi giải)
export function winnerUids(room) {
  const out = new Set();
  Object.values((room && room.winners) || {}).forEach((w) => Object.keys(w || {}).forEach((u) => out.add(u)));
  return out;
}
export const winnersAt = (room, stage) => Object.keys((room.winners && room.winners[stage]) || {})
  .map((uid) => ({ uid, ...((room.players || {})[uid] || { name: '?', animal: '🎟️' }), ticket: ticketOf((room.players || {})[uid]) }));

// Người đủ điều kiện nhận giải "stage" với các số đã quay. Mỗi người tối đa 1 giải,
// trừ khi mọi người có vé đều đã trúng (vẫn phải đủ 4 giải).
export function candidates(room, stage, called, extraWon = new Set()) {
  const won = new Set([...winnerUids(room), ...extraWon]);
  const holders = Object.entries(room.players || {}).filter(([, p]) => ticketOf(p));
  const fresh = holders.filter(([u]) => !won.has(u));
  const pool = fresh.length ? fresh : holders;
  return pool
    .filter(([, p]) => rowsDone(parseTicket(ticketOf(p)), called) >= PRIZES[stage].rows)
    .map(([uid, p]) => ({ uid, ...p, ticket: ticketOf(p) }));
}

// Người chỉ còn thiếu 1 số để nhận giải đang quay ("đang chờ")
export function waitingList(room, called) {
  const stage = stageOf(room);
  if (stage >= PRIZES.length) return [];
  const won = winnerUids(room);
  const holders = Object.entries(room.players || {}).filter(([, p]) => ticketOf(p));
  const fresh = holders.filter(([u]) => !won.has(u));
  const pool = fresh.length ? fresh : holders;
  return pool.map(([uid, p]) => ({ uid, ...p, ...progress(parseTicket(ticketOf(p)), called, PRIZES[stage].rows) }))
    .filter((x) => x.left === 1);
}

// ---------- Giao diện ----------
// Vé 3 × 3: số đã quay đánh dấu, hàng ngang hoặc cột dọc đủ 3 số sáng vàng kèm chữ KINH, số vừa quay nhấp nháy
export function ticketGridHtml(ticket, called, { last = null, compact = false } = {}) {
  const rows = parseTicket(ticket);
  if (!rows) return '';
  const colDone = [0, 1, 2].map((c) => rows.every((row) => called.has(row[c])));
  const anyCol = colDone.some(Boolean);
  return `<div class="lt-grid ${compact ? 'compact' : ''}">${anyCol ? `<div class="lt-colbadges">${colDone.map((d) => `<span>${d ? 'KINH ↓' : ''}</span>`).join('')}</div>` : ''}${rows.map((row) => {
    const done = row.every((n) => called.has(n));
    return `<div class="lt-row ${done ? 'done' : ''}">${row.map((n, c) =>
      `<span class="lt-cell ${called.has(n) ? 'hit' : ''} ${colDone[c] ? 'col-done' : ''} ${n === last ? 'last' : ''}">${n}</span>`).join('')}${done ? '<span class="kinh">KINH</span>' : ''}</div>`;
  }).join('')}</div>`;
}

// Bảng 31 số 0–30: số đã quay sáng vàng
export function boardHtml(calls, last) {
  const set = new Set(calls);
  return `<div class="board">${ALL_NUMS.map((n) => `<span class="bn ${set.has(n) ? 'hit' : ''} ${n === last ? 'last' : ''}">${n}</span>`).join('')}</div>`;
}

// Bậc giải: giải đang quay sáng lên, giải đã có chủ hiện tên
export function ladderHtml(room, avatarHtml, escapeHtml) {
  const stage = stageOf(room);
  return `<ul class="ladder">${PRIZES.map((P, i) => {
    const ws = winnersAt(room, i);
    const state = i < stage ? 'done' : i === stage ? 'now' : '';
    return `<li class="${state}"><span class="han">${P.han}</span><div><b>${prizeShort(P)}</b><small>${L(ROW_TEXT[P.rows], 'first KINH (a full row or column)')}</small>${ws.length ? `<div class="who">${ws.map((w) => `${avatarHtml(w.animal)} ${escapeHtml(w.name)}`).join(', ')}</div>` : ''}</div></li>`;
  }).join('')}</ul>`;
}

// Hướng dẫn cách chơi (TV ở sảnh chờ và điện thoại)
export const HOW_TO = [
  ['📱', 'Quét mã QR, nhập tên và chọn avatar để vào phòng.', 'Scan the QR code, enter your name and pick an avatar to join.'],
  ['🎟️', 'Mỗi người nhận <b>1 vé gồm 3 hàng, mỗi hàng 3 số</b> (từ 0 đến 30). Vé <b>giữ nguyên đến hết game</b>.', 'Everyone gets <b>1 ticket with 3 rows of 3 numbers</b> (0 to 30). You <b>keep the same ticket the whole game</b>.'],
  ['🎲', 'TV quay ra từng số. Vé có số đó <b>tự đánh dấu</b>, không cần chạm gì.', 'The TV draws numbers one by one. Your ticket <b>marks them automatically</b>, no tapping needed.'],
  ['🧧', 'Đủ 3 số một <b>hàng ngang</b> hoặc một <b>cột dọc</b> là <b>KINH</b>! Người KINH đầu tiên trúng giải của vòng.', 'Complete a <b>row</b> or a <b>column</b> and that is <b>KINH</b>! The first KINH wins the round.'],
  ['🔁', 'Chơi <b>4 vòng</b>: <b>Lộc</b> → <b>Song Hỷ</b> → <b>Phát Tài</b> → <b>Độc Đắc</b>. Sang vòng mới thì <b>xóa hết số, quay lại từ đầu</b>, vé giữ nguyên.', '<b>4 rounds</b>: <b>Fortune</b> → <b>Double Happiness</b> → <b>Prosperity</b> → <b>Jackpot</b>. Each new round <b>clears all numbers and starts over</b>, same ticket.'],
  ['🎲', 'Mỗi người tối đa 1 giải. Nhiều người cùng KINH ở một số thì TV <b>bốc thăm</b>.', 'One prize per person. If several people KINH on the same number, the TV <b>draws</b> a winner.'],
];
export const howToHtml = () => `<ol class="howto">${HOW_TO.map(([icon, vi, en]) => `<li><span class="ic">${icon}</span><span>${L(vi, en)}</span></li>`).join('')}</ol>`;

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
