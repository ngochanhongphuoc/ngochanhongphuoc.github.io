// Điều khiển từ xa bằng điện thoại MC, dùng chung cho các game
// (TV giữ mã bí mật, MC quét QR chứa mã đó hoặc nhập mã ở trang /mc, rồi gửi lệnh vào rooms/<pin>/command).
import { db, ref, set, serverTimestamp, randomId } from './live.js';

// ---------- Mã MC ----------
// Mã MC là 16 chữ số (luật Firebase cần ít nhất 16 ký tự) để MC gõ được trên trang /mc khi lỡ thoát hoặc đổi điện thoại.
// Mã giữ nguyên trên máy TV qua các phòng và các game.
const CTRL_KEY_STORE = 'ph_ctrl_key';
export function controlKey() {
  let key = localStorage.getItem(CTRL_KEY_STORE);
  if (!/^\d{16}$/.test(key || '')) {
    const buf = new Uint32Array(16);
    crypto.getRandomValues(buf);
    key = Array.from(buf, (n) => n % 10).join('');
    localStorage.setItem(CTRL_KEY_STORE, key);
  }
  return key;
}

// 1234567890123456 -> "1234 5678 9012 3456"
export const formatMcCode = (key) => String(key || '').replace(/(\d{4})(?=\d)/g, '$1 ');

// ---------- Phía TV ----------
// Gắn mã bí mật vào phòng; luật Firebase cũ chưa có controlKeys thì game vẫn chạy, chỉ là MC chưa điều khiển được
// Ghi thêm mã MC vào phòng (rooms/<pin>/mcKey) để trang /mc chỉ cần nhập mã phòng là MC vào lại được
export async function registerControl(pin, key) {
  try { await set(ref(db, `rooms/${pin}/mcKey`), key); } catch (e) { /* bỏ qua */ }
  try { await set(ref(db, `controlKeys/${pin}`), key); } catch (e) { console.warn('Chưa cập nhật luật Firebase cho chế độ MC', e); }
}

// Bộ lọc lệnh: bỏ qua lệnh cũ có sẵn lúc mở trang và lệnh trùng. Tạo mới mỗi khi vào phòng khác.
export function commandFilter() {
  let primed = false;
  let lastId = null;
  return (cmd) => {
    if (!cmd) { primed = true; return null; }
    if (!primed) { primed = true; lastId = cmd.id; return null; }
    if (cmd.id === lastId) return null;
    lastId = cmd.id;
    return cmd;
  };
}

// Khối chữ dưới mã QR: MC lỡ thoát vào lại bằng trang /mc, chỉ cần nhập mã phòng
export function mcCodeHtml(pin) {
  const mcPage = new URL('../mc/', import.meta.url).href.replace(/^https?:\/\//, '');
  return `<div style="margin:6px auto 12px;padding:12px 16px;border-radius:14px;background:rgba(0,0,0,0.22);line-height:1.5">
    <div style="font-size:0.85em;opacity:0.85">Lỡ thoát hoặc đổi điện thoại? Vào <b>${mcPage}</b> và nhập</div>
    <div style="margin-top:6px">Mã phòng <b style="font-size:1.35em;letter-spacing:0.08em">${pin}</b></div>
  </div>`;
}

// Bảng mã QR cho MC quét (chỉ hiện trên TV khi bấm nút 🎤 MC)
export function showMcQr(url, what, pin, key) {
  if (document.querySelector('.mc-qr')) return;
  const box = document.createElement('div');
  box.className = 'help-modal tv mc-qr';
  box.innerHTML = `<div class="box" style="max-width:560px;font-size:1.05em">
    <h2>🎤 Mã điều khiển cho MC</h2>
    <p style="opacity:0.9;line-height:1.5">MC quét mã này bằng điện thoại để ${what} từ xa, không cần ai đứng ở máy tính.</p>
    <div class="mc-qr-code" style="display:flex;justify-content:center;margin:14px 0"><div style="background:#fff;padding:12px;border-radius:14px"></div></div>
    ${pin ? mcCodeHtml(pin) : ''}
    <p style="font-weight:800">⚠️ Chỉ cho MC xem, đừng để khách quét hoặc chép mã này!</p>
    <button class="btn" id="mcQrClose">Đóng</button>
  </div>`;
  document.body.appendChild(box);
  new QRCode(box.querySelector('.mc-qr-code div'), { text: url, width: 260, height: 260, correctLevel: QRCode.CorrectLevel.M });
  const close = () => box.remove();
  box.querySelector('#mcQrClose').onclick = close;
  box.onclick = (e) => { if (e.target === box) close(); };
}

// ---------- Phía điện thoại MC ----------
// Đăng ký làm MC của phòng (luật Firebase kiểm tra mã bí mật)
export async function claimControl(pin, uid, key) {
  try { await set(ref(db, `controllerClaims/${pin}/${uid}`), key); return true; } catch (e) { return false; }
}

// Các phòng MC đã điều khiển trên điện thoại này, để trang /mc hiện nút "Tiếp tục"
const MC_SESSIONS = 'ph_mc_sessions';
export function loadMcSessions() {
  try { return JSON.parse(localStorage.getItem(MC_SESSIONS)) || []; } catch (e) { return []; }
}
export function saveMcSession(pin, key, game) {
  try {
    const list = loadMcSessions().filter((s) => s.pin !== pin);
    list.unshift({ pin, key, game, at: Date.now() });
    localStorage.setItem(MC_SESSIONS, JSON.stringify(list.slice(0, 6)));
  } catch (e) { /* trình duyệt chặn lưu thì bỏ qua */ }
}

// Gửi lệnh kèm trạng thái lúc bấm, TV chỉ làm khi trạng thái còn khớp (tránh bấm 2 lần nhảy 2 bước)
export function sendCommand(pin, room, type) {
  return set(ref(db, `rooms/${pin}/command`), {
    type, id: randomId(10), status: room.status, round: room.round ?? null, at: serverTimestamp(),
  });
}
