// Phần dùng chung cho game chơi chung kiểu Kahoot: kết nối Firebase, tính điểm, âm thanh.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase, connectDatabaseEmulator, ref, get, set, update, remove, onValue, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import {
  getAuth, connectAuthEmulator, signInAnonymously, onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { playTrack, stopTrack } from './yt-music.js';

export { ref, get, set, update, remove, onValue, serverTimestamp };

export const QUESTION_MS = 30000; // 30 giây mỗi câu
export const ANIMALS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐧', '🐔', '🦄', '🐙', '🦖'];
export const CHOICES = [
  { letter: 'A', shape: '▲', color: '#E8577A' },
  { letter: 'B', shape: '◆', color: '#4A7BD8' },
  { letter: 'C', shape: '●', color: '#E09A2E' },
  { letter: 'D', shape: '■', color: '#2FA58A' },
];

// ?emu=1 -> chạy với Firebase Emulator trên máy (dùng để test, không cần project thật)
export const EMU = new URLSearchParams(location.search).has('emu');

const config = EMU
  ? { apiKey: 'demo-key', authDomain: 'demo-wedding.firebaseapp.com', projectId: 'demo-wedding', databaseURL: 'http://127.0.0.1:9000/?ns=demo-wedding-default-rtdb', appId: 'demo' }
  : window.FIREBASE_CONFIG;

export const CONFIGURED = Boolean(config && config.apiKey && config.databaseURL);

let db = null;
let auth = null;
if (CONFIGURED) {
  const app = initializeApp(config);
  db = getDatabase(app);
  auth = getAuth(app);
  if (EMU) {
    connectDatabaseEmulator(db, '127.0.0.1', 9000);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
}
export { db };

export const roomRef = (pin, path = '') => ref(db, `rooms/${pin}${path ? '/' + path : ''}`);

// Đăng nhập ẩn danh: mỗi máy có 1 mã riêng, tải lại trang vẫn giữ nguyên -> vào lại không mất điểm
export function signIn() {
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, (user) => {
      if (user) { stop(); resolve(user.uid); }
    });
    signInAnonymously(auth).catch(reject);
  });
}

// Lệch giờ giữa máy này và máy chủ Firebase, để mọi máy đếm giờ giống nhau
let serverOffset = 0;
export function watchServerTime() {
  onValue(ref(db, '.info/serverTimeOffset'), (snap) => { serverOffset = snap.val() || 0; });
}
export const serverNow = () => Date.now() + serverOffset;

// Đúng: 500–1000 điểm tùy tốc độ. Chuỗi đúng liên tiếp từ câu thứ 2: +100 mỗi câu, tối đa +500
export function scoreFor(correct, ms, streak) {
  if (!correct) return { base: 0, bonus: 0 };
  const t = Math.min(Math.max(ms, 0), QUESTION_MS);
  const base = Math.round(1000 * (1 - t / QUESTION_MS / 2));
  const bonus = streak >= 2 ? Math.min(100 * (streak - 1), 500) : 0;
  return { base, bonus };
}

// Xếp hạng: điểm cao hơn đứng trước; bằng điểm thì ai tổng thời gian trả lời đúng ít hơn đứng trước
export function rankPlayers(players) {
  return Object.entries(players || {})
    .map(([uid, p]) => ({ uid, ...p, score: p.score || 0, totalMs: p.totalMs || 0 }))
    .sort((a, b) => b.score - a.score || a.totalMs - b.totalMs || (a.joinedAt || 0) - (b.joinedAt || 0));
}

export const fmtSec = (ms) => (ms / 1000).toFixed(2) + 's';
export const fmtScore = (n) => (n || 0).toLocaleString('vi-VN');

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ---------- Avatar: mặt cô dâu chú rể hoặc con vật ----------
// Mặt cô dâu chú rể lưu mã ngắn '@g1'...'@b6' vào trường animal (luật DB cho tối đa 8 ký tự)
// Chưa có ảnh mặt Phước & Hân: để trống thì ô chọn chỉ hiện con vật. Có ảnh thì thêm lại mã @g1…, @b1… như trên.
export const FACES = [];
// Avatar gán sẵn cho khách mới: mặt cô dâu chú rể nếu có, không thì con vật
export const DEFAULT_AVATARS = FACES.length ? FACES : ANIMALS;
const FACE_DIR = new URL('../assets/images/avatars/', import.meta.url).href;
const isFace = (a) => /^@[gb][1-6]$/.test(a || '');

// Avatar dạng HTML: ảnh tròn nếu là mặt cô dâu chú rể, còn lại là emoji
export function avatarHtml(a, size = '1.2em') {
  if (!isFace(a)) return escapeHtml(a || '🙂');
  const file = `${a[1] === 'g' ? 'groom' : 'bride'}-${a[2]}.webp`;
  return `<img src="${FACE_DIR}${file}" alt="" style="width:${size};height:auto;aspect-ratio:1;border-radius:50%;object-fit:cover;vertical-align:middle;box-shadow:0 0 0 2px #fff">`;
}

// Avatar dạng chữ, cho chỗ chỉ hiện được text (file CSV, chữ chạy lúc quay số)
export const avatarText = (a) => (isFace(a) ? (a[1] === 'g' ? '🤵' : '👰') : a || '');

// Ô chọn avatar lúc nhập tên: 2 hàng mặt cô dâu chú rể + các con vật
export function avatarPickerHtml(chosen) {
  const btn = (a, face) => `<button type="button" class="animal ${a === chosen ? 'on' : ''}" data-a="${a}"${face ? ' style="padding:3px;min-width:0"' : ' style="padding:0;min-width:0;font-size:1.5rem"'}>${face ? avatarHtml(a, '100%') : a}</button>`;
  const title = (t) => `<div style="font-size:0.85em;font-weight:700;opacity:0.75;margin:6px 0">${t}</div>`;
  const faces = FACES.length
    ? title('🤵👰 Mặt cô dâu chú rể') + `<div class="animals" style="grid-template-columns:repeat(6,minmax(0,1fr))">${FACES.map((a) => btn(a, true)).join('')}</div>` + title('🐾 Hoặc con vật')
    : '';
  return faces
    + `<div class="animals" style="grid-template-columns:repeat(7,minmax(0,1fr))">${ANIMALS.map((a) => btn(a, false)).join('')}</div>`;
}

// ---------- Âm thanh (tạo bằng Web Audio, không cần file nhạc) ----------
let ctx = null;
let muted = false;
let lobbyTimer = null;

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
}

export function setMuted(value) {
  muted = value;
  if (muted) { stopLobbyMusic(); stopGameMusic(); }
}
export const isMuted = () => muted;

function tone(freq, start, dur, { type = 'sine', vol = 0.15 } = {}) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// ---------- Âm thanh tự chọn ----------
// Chép file mp3 vào assets/audio/game/ đúng tên (xem README.md trong đó) là game tự dùng.
// File chưa có, rỗng hoặc lỗi thì dùng âm thanh có sẵn.
const CUSTOM_DIR = new URL('../assets/audio/game/', import.meta.url).href;
const customSfx = {};

function loadCustom(name) {
  const entry = { audio: new Audio(CUSTOM_DIR + name + '.mp3'), ok: false };
  entry.audio.preload = 'auto';
  entry.audio.addEventListener('canplaythrough', () => { entry.ok = true; }, { once: true });
  customSfx[name] = entry;
  return entry;
}

// Phát file tự chọn; trả về false nếu chưa có file để dùng tiếng tổng hợp thay thế
function playCustom(name, vol = 0.8) {
  const entry = customSfx[name] || loadCustom(name);
  if (muted || !entry.ok) return false;
  const a = entry.audio.cloneNode();
  a.volume = vol;
  a.play().catch(() => {});
  return true;
}

// Audio ưu tiên file tự chọn <name>.mp3, lỗi hoặc rỗng thì chuyển sang file mặc định
export function audioWithFallback(name, fallbackUrl) {
  const a = new Audio(CUSTOM_DIR + name + '.mp3');
  a.addEventListener('error', () => { a.src = fallbackUrl; }, { once: true });
  return a;
}

const synth = {
  join: () => { tone(660, 0, 0.12, { type: 'triangle' }); tone(990, 0.08, 0.18, { type: 'triangle' }); },
  tick: (urgent) => tone(urgent ? 1200 : 800, 0, 0.08, { type: 'square', vol: urgent ? 0.08 : 0.04 }),
  timeUp: () => { tone(220, 0, 0.5, { type: 'sawtooth', vol: 0.12 }); tone(165, 0.15, 0.6, { type: 'sawtooth', vol: 0.1 }); },
  correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, { type: 'triangle', vol: 0.18 })),
  wrong: () => { tone(300, 0, 0.25, { type: 'square', vol: 0.08 }); tone(200, 0.18, 0.4, { type: 'square', vol: 0.08 }); },
  answer: () => tone(880, 0, 0.1, { type: 'triangle', vol: 0.12 }),
  start: () => [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.25, { type: 'triangle', vol: 0.16 })),
  fanfare: () => {
    [[523, 0], [523, 0.15], [523, 0.3], [659, 0.45], [784, 0.75], [659, 1.0], [784, 1.15], [1047, 1.4]]
      .forEach(([f, t]) => tone(f, t, 0.4, { type: 'triangle', vol: 0.2 }));
  },
  drum: () => { for (let i = 0; i < 16; i++) tone(120 + (i % 2) * 20, i * 0.06, 0.06, { type: 'square', vol: 0.05 }); },
};

// Tên file tự chọn của từng hiệu ứng (assets/audio/game/<tên>.mp3)
const SFX_FILES = { join: 'join', tick: 'tick', timeUp: 'time-up', correct: 'correct', wrong: 'wrong', answer: 'answer', start: 'start', fanfare: 'fanfare', drum: 'drum-roll' };
Object.values(SFX_FILES).forEach(loadCustom);

// Âm lượng riêng của từng hiệu ứng (0–1), mặc định 0.8. join.mp3 gốc rất to nên để nhỏ cho khỏi đè nhạc nền.
const SFX_VOL = { join: 0.2 };
let lastJoinSfx = 0;

export const sfx = Object.fromEntries(Object.entries(synth).map(([key, play]) => [key, (arg) => {
  // Tiếng khách vào phòng: nhiều người quét QR cùng lúc thì chỉ kêu 1 lần mỗi 0,8 giây, không phát chồng
  if (key === 'join') { const now = Date.now(); if (now - lastJoinSfx < 800) return; lastJoinSfx = now; }
  const vol = SFX_VOL[key] ?? (key === 'tick' && !arg ? 0.5 : 0.8);
  if (!playCustom(SFX_FILES[key], vol)) play(arg);
}]));

// Nhạc sảnh chờ: vòng hợp âm C – Am – F – G vui tươi
export function startLobbyMusic() {
  if (lobbyTimer || muted) return;
  const chords = [[262, 330, 392], [220, 262, 330], [175, 220, 262], [196, 247, 294]];
  let step = 0;
  const play = () => {
    const chord = chords[Math.floor(step / 4) % chords.length];
    const note = chord[step % 3] * (step % 4 === 3 ? 2 : 1);
    tone(note, 0, 0.35, { type: 'triangle', vol: 0.06 });
    if (step % 4 === 0) tone(chord[0] / 2, 0, 0.8, { type: 'sine', vol: 0.08 });
    step++;
  };
  play();
  lobbyTimer = setInterval(play, 250);
}

export function stopLobbyMusic() {
  clearInterval(lobbyTimer);
  lobbyTimer = null;
}

// Nhạc nền của game theo kịch bản: file trong assets/audio/game/ (xem MUSIC_FILES).
// File lỗi/rỗng thì dùng bài YouTube cùng vai trò trong yt-music.js, YouTube cũng lỗi thì phát nhạc tổng hợp.
const GAME_NAME = ['tree'].find((g) => location.pathname.toLowerCase().includes(`/${g}`)) || 'quiz';
// Mỗi bài: tên file (không đuôi .mp3), hoặc { file, start: giây bắt đầu phát, volume: 0–1 }
const MUSIC_FILES = {
  quiz: { lobby: 'quiz-intro', question: 'quiz-music' }, // Ai Là Triệu Phú: giới thiệu/sảnh chờ, lúc trả lời
  tree: {
    idle: { file: 'lottery-music', volume: 0.25 },          // Rung Cây: sảnh chờ, đếm ngược, kết quả: nhạc nhẹ của Lô tô
    shake: { file: 'tree-music', start: 38, volume: 0.5 },   // lúc cả phòng đang lắc: phát từ giây 0:38
  },
};
const trackOf = (entry) => (typeof entry === 'string' ? { file: entry } : entry);
const YT_BACKUP = { 'quiz-intro': 'quizIntro', 'quiz-music': 'quizPlay', 'tree-music': 'tree', 'lottery-music': 'lottery' };
const failedFiles = new Set();
let gameAudio = null;
let currentFile = null;
let lastPhase = null;
let ytFailed = false;
let gameSynthTimer = null;
let wantMusic = false;
let waitingForGesture = false;

// Mỗi bài có 1 trình phát riêng, tải 1 lần rồi giữ lại: đổi bài chỉ tạm dừng bài này, phát bài kia (không tải lại)
const players = {};
function getGameAudio(name) {
  if (players[name]) return players[name];
  const a = new Audio(CUSTOM_DIR + name + '.mp3');
  a.loop = true;
  a.volume = 0.5;
  a.preload = 'auto';
  a.addEventListener('error', () => {
    // File này lỗi/rỗng: chuyển sang bài dự phòng
    failedFiles.add(name);
    if (currentFile === name) { currentFile = null; gameAudio = null; if (wantMusic && !muted) startGameMusic(lastPhase); }
  });
  players[name] = a;
  return a;
}

// Trình duyệt chặn phát nhạc khi chưa ai bấm vào trang (MC điều khiển bằng điện thoại thì không ai chạm vào TV).
// Hiện dòng nhắc trên TV; bấm/nhấn phím 1 lần là chạy resume() và ẩn dòng nhắc.
export function needGesture(resume) {
  if (document.getElementById('sound-gate')) return;
  const bar = document.createElement('button');
  bar.id = 'sound-gate';
  bar.type = 'button';
  bar.textContent = '🔇 Bấm vào màn hình để bật nhạc';
  bar.style.cssText = 'position:fixed;z-index:200;left:50%;bottom:22px;transform:translateX(-50%);padding:14px 28px;border:0;border-radius:9999px;background:#fff;color:#5d1821;font:800 1.15rem Montserrat,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,0.35);cursor:pointer;animation:pop 0.4s ease';
  document.body.appendChild(bar);
  const go = () => {
    bar.remove();
    document.removeEventListener('pointerdown', go, true);
    document.removeEventListener('keydown', go, true);
    unlockAudio();
    resume();
  };
  document.addEventListener('pointerdown', go, true);
  document.addEventListener('keydown', go, true);
}

// phase: chọn bài trong MUSIC_FILES (Ai Là Triệu Phú: "lobby" / "question"; Rung Cây: "idle" / "shake")
export function startGameMusic(phase) {
  wantMusic = true;
  lastPhase = phase;
  if (muted) return;
  const files = MUSIC_FILES[GAME_NAME];
  const track = trackOf(files[phase] || files.default || Object.values(files)[0]);
  const name = track.file;
  if (failedFiles.has(name)) {
    if (gameAudio) gameAudio.pause();
    gameAudio = null;
    if (!ytFailed && playTrack(YT_BACKUP[name], () => { ytFailed = true; if (wantMusic && !muted) startSynthGameMusic(); })) return;
    startSynthGameMusic();
    return;
  }
  if (waitingForGesture) return; // đang chờ bấm vào màn hình
  stopTrack();
  const audio = getGameAudio(name);
  if (currentFile !== name) {
    // Đổi bài: dừng bài cũ; bài có "start" (vd nhạc lắc 0:38) thì tua về đúng giây đó mỗi lần vào
    if (gameAudio && gameAudio !== audio) gameAudio.pause();
    currentFile = name;
    gameAudio = audio;
    if (track.start != null) {
      const seek = () => { try { audio.currentTime = track.start; } catch (e) { /* bỏ qua */ } };
      if (audio.readyState >= 1) seek(); else audio.addEventListener('loadedmetadata', seek, { once: true });
    }
  } else if (!audio.paused) return;
  audio.volume = track.volume ?? 0.5;
  audio.play().catch((e) => {
    if (e && e.name === 'NotAllowedError') {
      // Trình duyệt chặn tự phát nhạc khi chưa có cú bấm nào: hiện dòng nhắc, phát ngay khi bấm vào màn hình
      if (waitingForGesture) return;
      waitingForGesture = true;
      needGesture(() => {
        waitingForGesture = false;
        if (wantMusic && !muted) startGameMusic(lastPhase);
      });
    }
    // Lỗi khác (file rỗng/hỏng) đã được xử lý trong sự kiện 'error' của gameAudio
  });
}

export function stopGameMusic() {
  wantMusic = false;
  stopTrack();
  if (gameAudio) gameAudio.pause();
  clearInterval(gameSynthTimer);
  gameSynthTimer = null;
}

// Nhạc tổng hợp nhịp nhanh, vui tươi (kiểu nhạc chờ trả lời của Kahoot)
function startSynthGameMusic() {
  if (gameSynthTimer || muted) return;
  const bass = [131, 131, 165, 165, 110, 110, 147, 147];
  const melody = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 988, 784, 659, 587];
  let step = 0;
  const play = () => {
    if (step % 2 === 0) tone(bass[(step / 2) % bass.length], 0, 0.18, { type: 'triangle', vol: 0.1 });
    tone(melody[step % melody.length], 0, 0.12, { type: 'square', vol: 0.025 });
    if (step % 4 === 2) tone(2400, 0, 0.03, { type: 'square', vol: 0.015 });
    step++;
  };
  play();
  gameSynthTimer = setInterval(play, 150);
}

// Cánh hoa anh đào bay nhẹ trên nền
export function petals(count = 12) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.textContent = i % 3 === 0 ? '🌸' : '💮';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = 10 + Math.random() * 10 + 's';
    p.style.animationDelay = -Math.random() * 20 + 's';
    document.body.appendChild(p);
  }
}

// Pháo hoa emoji
export function burst(emojis, count, box = document.body) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'piece';
    p.textContent = emojis[i % emojis.length];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = 2 + Math.random() * 2 + 's';
    p.style.animationDelay = Math.random() * 0.6 + 's';
    box.appendChild(p);
    setTimeout(() => p.remove(), 5000);
  }
}

// Chuỗi ngẫu nhiên (mã điều khiển của MC, mã lệnh)
export function randomId(len = 20) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => chars[n % chars.length]).join('');
}

// ---------- Danh sách kết quả (dùng chung cho TV và điện thoại MC) ----------
export function resultsData(r) {
  const total = r.total || 0;
  const played = r.q >= 0 ? Math.min(r.q + 1, total) : 0;
  const rows = rankPlayers(r.players).map((p, i) => ({
    ...p,
    rank: i + 1,
    medal: ['🥇', '🥈', '🥉'][i] || String(i + 1),
    correct: p.correct || 0,
    avg: p.correct ? fmtSec(p.totalMs / p.correct) : '-',
  }));
  return { rows, total, played, date: r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '' };
}

export const loadGiven = (pin) => { try { return JSON.parse(localStorage.getItem(`kh_given_${pin}`)) || {}; } catch (e) { return {}; } };
export const saveGiven = (pin, given) => localStorage.setItem(`kh_given_${pin}`, JSON.stringify(given));

// Tải file CSV mở được bằng Excel (có BOM để giữ dấu tiếng Việt)
export function downloadResultsCsv(r, pin) {
  const { rows, played } = resultsData(r);
  const given = loadGiven(pin);
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [['Hạng', 'Con vật', 'Tên', 'Điểm', 'Số câu đúng', 'Thời gian TB mỗi câu đúng (giây)', 'Đã trao quà']]
    .concat(rows.map((p) => [p.rank, avatarText(p.animal), p.name, p.score, `${p.correct}/${played}`,
      p.correct ? (p.totalMs / p.correct / 1000).toFixed(2) : '', given[p.uid] ? 'x' : '']));
  const csv = '\ufeff' + lines.map((row) => row.map(esc).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `ket-qua-mini-game-${pin}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// GitHub Pages luôn thêm "/" vào cuối link thư mục (/quiz -> /quiz/): bỏ đi trên thanh địa chỉ cho gọn.
// Trả về địa chỉ thư mục gốc của trang (có "/") để tính các link tương đối cho đúng.
export function tidyUrl() {
  const base = new URL('./', location.href).href;
  const path = location.pathname;
  if (path.length > 1 && path.endsWith('/')) history.replaceState(history.state, '', path.slice(0, -1) + location.search + location.hash);
  return base;
}
