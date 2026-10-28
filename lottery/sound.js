// Âm thanh cho màn hình TV lô tô (điện thoại khách vẫn dùng tiếng tổng hợp trong live.js cho nhẹ).
// Nguồn và giấy phép các file: xem assets/audio/CREDITS.md
import { isMuted, audioWithFallback, needGesture } from '../shared/live.js';

const BASE = new URL('../assets/audio/', import.meta.url);
const MUSIC_VOL = 0.35;
const DUCK_VOL = 0.08; // nhạc nền nhỏ lại lúc quay số

function load(file, { loop = false, volume = 1 } = {}) {
  // Ưu tiên file tự chọn assets/audio/game/<tên>.mp3 (vd lottery-music.mp3), không có thì dùng file sẵn
  const a = audioWithFallback(file.replace(/\.\w+$/, ''), new URL(file, BASE).href);
  a.loop = loop;
  a.volume = volume;
  a.preload = 'auto';
  return a;
}

const bgm = load('lottery-music.opus', { loop: true, volume: MUSIC_VOL });
const drum = load('drum-roll.ogg', { loop: true, volume: 0.9 }); // lặp lại cho giải quay lâu, dừng bằng snd.stopDrum()
const gong = load('gong.ogg', { volume: 0.9 });
const phao = load('firecrackers.ogg', { volume: 0.75 });

let musicOn = false;
// Nhạc nền: assets/audio/game/lottery-music.mp3 (lỗi thì dùng assets/audio/lottery-music.opus)
function bgmPlay() {
  bgm.play().catch((e) => {
    // Trình duyệt chặn phát nhạc khi chưa ai bấm vào TV: tự thử lại (needGesture)
    if (e && e.name === 'NotAllowedError') needGesture(() => { if (musicOn && !isMuted()) bgmPlay(); });
  });
}
function bgmPause() { bgm.pause(); }
let phaoTimer = null;

function play(a) {
  if (isMuted()) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

// Bật/tắt nhạc nền (trình duyệt chỉ cho phát sau khi người dùng bấm vào trang)
export function music(on) {
  musicOn = on;
  if (on && !isMuted()) bgmPlay();
  else bgmPause();
}

// Mở lại nhạc sau khi bấm "Bật âm thanh"
export function applyMute() {
  if (isMuted()) { bgmPause(); [drum, gong, phao].forEach((a) => a.pause()); return; }
  if (musicOn) bgmPlay();
}

// Nhạc nền nhỏ lại / to lại từ từ
let fadeTimer = null;
export function duck(on) {
  clearInterval(fadeTimer);
  const target = on ? DUCK_VOL : MUSIC_VOL;
  fadeTimer = setInterval(() => {
    const v = bgm.volume + (target > bgm.volume ? 0.03 : -0.03);
    if (Math.abs(target - bgm.volume) <= 0.03) { bgm.volume = target; clearInterval(fadeTimer); } else bgm.volume = v;
  }, 50);
}

export const snd = {
  drum: () => play(drum),
  stopDrum: () => drum.pause(),
  gong: () => play(gong),
  // Tiếng pháo: phát vài giây rồi nhỏ dần
  firecrackers(ms = 7000) {
    if (isMuted()) return;
    clearInterval(phaoTimer);
    phao.volume = 0.75;
    phao.currentTime = 0;
    phao.play().catch(() => {});
    const t0 = Date.now();
    phaoTimer = setInterval(() => {
      const left = ms - (Date.now() - t0);
      if (left <= 0) { phao.pause(); clearInterval(phaoTimer); return; }
      if (left < 2000) phao.volume = 0.75 * (left / 2000);
    }, 100);
  },
};
