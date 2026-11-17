// Nối trình phát nhạc tiệc (máy LED) với remote điện thoại qua Firebase.
// Máy LED tạo 1 phòng (rooms/<pin>, type 'music'), ghi trạng thái đang phát vào rooms/<pin>/state,
// danh sách bài / pad vào rooms/<pin>/tracks, /pads; điện thoại chỉ ghi lệnh vào rooms/<pin>/command.
// File chạy riêng (type=module): mất mạng hay Firebase lỗi thì trình phát vẫn dùng chuột / phím bình thường.
import {
  CONFIGURED, get, set, onValue, roomRef, signIn, watchServerTime, serverNow, escapeHtml,
} from '../shared/live.js';
import { controlKey, registerControl, commandFilter } from '../shared/remote.js';

const PIN_KEY = 'mp_host_pin';
const btn = document.getElementById('remoteBtn');
let pin = null;
let key = null;

function whenReady() {
  return window.MP ? Promise.resolve() : new Promise((r) => document.addEventListener('mp-ready', r, { once: true }));
}

async function createRoom(uid) {
  for (let i = 0; i < 6; i++) {
    const candidate = String(Math.floor(100000 + Math.random() * 900000));
    try {
      const snap = await get(roomRef(candidate));
      if (snap.exists()) continue;
      await set(roomRef(candidate), { hostUid: uid, createdAt: serverNow(), type: 'music', status: 'live' });
      return candidate;
    } catch (e) { /* mã trùng của người khác (không có quyền ghi): thử mã khác */ }
  }
  throw new Error('Không tạo được phòng');
}

async function init() {
  if (!CONFIGURED) return;
  await whenReady();
  const uid = await signIn();
  watchServerTime();
  // Dùng lại phòng cũ trên máy này (mã QR đã in / đã quét vẫn dùng được)
  const saved = localStorage.getItem(PIN_KEY);
  if (saved) {
    try {
      const room = (await get(roomRef(saved))).val();
      if (room && room.hostUid === uid && room.type === 'music') pin = saved;
    } catch (e) { /* tạo phòng mới */ }
  }
  if (!pin) {
    pin = await createRoom(uid);
    localStorage.setItem(PIN_KEY, pin);
  }
  key = controlKey();
  await registerControl(pin, key);

  // Nhận lệnh từ điện thoại
  const take = commandFilter();
  onValue(roomRef(pin, 'command'), (snap) => {
    const cmd = take(snap.val());
    if (cmd) { try { window.MP.run(cmd.type, cmd.arg); } catch (e) { console.warn(e); } pushState(true); }
  });

  // Gửi trạng thái: đổi gì thì gửi ngay, không thì 5 giây gửi lại 1 lần (để điện thoại biết máy LED còn online)
  set(roomRef(pin, 'pads'), window.MP.padList()).catch(() => {});
  setInterval(() => pushState(false), 500);
  setInterval(pushTracks, 3000);
  pushTracks();
  pushState(true);

  btn.hidden = false;
  btn.addEventListener('click', showQr);
}

let lastSig = '';
let lastPush = 0;
function pushState(force) {
  const s = window.MP.state();
  const { cur, ...rest } = s;
  const sig = JSON.stringify(rest);
  const now = Date.now();
  if (!force && sig === lastSig && now - lastPush < 5000) return;
  lastSig = sig;
  lastPush = now;
  set(roomRef(pin, 'state'), { ...s, pads: s.pads.length ? s.pads : null, at: serverNow() }).catch(() => {});
}

let lastTracks = '';
function pushTracks() {
  const list = window.MP.tracks();
  const sig = JSON.stringify(list);
  if (sig === lastTracks) return;
  lastTracks = sig;
  set(roomRef(pin, 'tracks'), list).catch(() => { lastTracks = ''; });
}

// Bảng mã QR cho người điều khiển quét (chỉ hiện khi bấm nút 📱)
function showQr() {
  if (document.querySelector('.mp-qr')) return;
  const url = new URL(`remote/?pin=${pin}&key=${key}`, import.meta.url).href;
  const mcPage = new URL('../mc/', import.meta.url).href.replace(/^https?:\/\//, '');
  const box = document.createElement('div');
  box.className = 'mp-qr';
  box.style.cssText = 'position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:16px;background:rgba(10,3,5,0.78);backdrop-filter:blur(6px)';
  box.innerHTML = `<div style="width:min(460px,100%);max-height:100%;overflow:auto;text-align:center;padding:24px 22px;border-radius:22px;background:linear-gradient(160deg,#4A1520,#24090E);border:1px solid rgba(227,182,168,0.35);color:#F7E9E2;font-family:Montserrat,system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
    <h2 style="margin:0 0 6px;font-family:'Playfair Display',Georgia,serif;font-size:1.6em">📱 Điều khiển bằng điện thoại</h2>
    <p style="margin:0;opacity:0.85;line-height:1.5">Quét mã để phát / dừng, chuyển bài, bấm pad nghi lễ từ xa.</p>
    <div style="display:flex;justify-content:center;margin:16px 0"><div class="mp-qr-code" style="background:#fff;padding:12px;border-radius:14px"></div></div>
    <div style="padding:10px 14px;border-radius:14px;background:rgba(0,0,0,0.25);line-height:1.5">
      <div style="font-size:0.85em;opacity:0.85">Lỡ thoát hoặc đổi điện thoại? Vào <b>${escapeHtml(mcPage)}</b> và nhập</div>
      <div>Mã phòng <b style="font-size:1.4em;letter-spacing:0.08em">${pin}</b></div>
    </div>
    <p style="margin:12px 0;font-weight:700">⚠️ Chỉ cho người điều khiển xem, đừng để khách quét!</p>
    <button type="button" class="mp-qr-close" style="padding:12px 28px;border-radius:999px;border:0;background:#F7E9E2;color:#3A0F18;font:inherit;font-weight:800;cursor:pointer">Đóng</button>
  </div>`;
  document.body.appendChild(box);
  if (window.QRCode) new QRCode(box.querySelector('.mp-qr-code'), { text: url, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.M });
  else box.querySelector('.mp-qr-code').textContent = url;
  const close = () => { box.remove(); document.removeEventListener('keydown', onKey, true); };
  // Đang mở bảng: phím Esc đóng bảng, các phím khác không bấm nhầm pad
  const onKey = (e) => { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); close(); } };
  document.addEventListener('keydown', onKey, true);
  box.querySelector('.mp-qr-close').onclick = close;
  box.onclick = (e) => { if (e.target === box) close(); };
}

init().catch((e) => console.warn('Remote điện thoại chưa sẵn sàng:', e));
