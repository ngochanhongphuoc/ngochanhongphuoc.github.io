// Nhạc DỰ PHÒNG từ YouTube: chỉ dùng khi file nhạc trong assets/audio/game/ bị lỗi (xem MUSIC_FILES trong live.js).
// Một trình phát YouTube ẩn trên trang TV, phát lặp lại một đoạn nhạc.
// Đổi bài: sửa mã video (phần sau "v=" hoặc "youtu.be/") trong TRACKS. start = giây bắt đầu phát.
// Video bị chặn nhúng hoặc mất mạng thì gọi onFail để game dùng nhạc có sẵn thay thế.

export const TRACKS = {
  quizIntro: { id: 'AaE30Vh_zJU', start: 0 },   // Ai là triệu phú: giới thiệu + sảnh chờ
  quizPlay: { id: 'qEffVaNigsI', start: 0 },    // Ai là triệu phú: trong lúc trả lời
  tree: { id: '059Cpy79D84', start: 20 },       // Rung cây, rinh quà: phát từ giây 0:20
  lottery: { id: 'D9b_gUe-D24', start: 0 },     // Loto
};

let apiPromise = null;
function loadApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) { resolve(window.YT); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return apiPromise;
}

let player = null;
let playerReady = null;
let current = null;   // bài đang muốn phát
let volume = 60;
let failHandler = null;

function getPlayer() {
  if (playerReady) return playerReady;
  playerReady = loadApi().then((YT) => new Promise((resolve) => {
    const box = document.createElement('div');
    // Đặt ngoài màn hình (không dùng display:none vì trình duyệt có thể không phát)
    box.style.cssText = 'position:fixed;left:-9999px;top:0;width:200px;height:200px;pointer-events:none;opacity:0';
    box.innerHTML = '<div id="yt-music-player"></div>';
    document.body.appendChild(box);
    player = new YT.Player('yt-music-player', {
      width: 200, height: 200,
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: () => { player.setVolume(volume); resolve(player); },
        onStateChange: (e) => {
          // Hết bài: quay lại đoạn bắt đầu để lặp
          if (e.data === YT.PlayerState.ENDED && current) { player.seekTo(current.start || 0, true); player.playVideo(); }
        },
        onError: () => { const t = current; current = null; if (failHandler) failHandler(t); },
      },
    });
  }));
  return playerReady;
}

// Trình duyệt chặn phát nhạc khi chưa có cú bấm nào: bấm vào trang lần đầu thì phát lại
let gestureHooked = false;
function hookGesture() {
  if (gestureHooked) return;
  gestureHooked = true;
  const resume = () => { if (current && player && player.getPlayerState && player.getPlayerState() !== 1) player.playVideo(); };
  document.addEventListener('pointerdown', resume);
  document.addEventListener('keydown', resume);
}

// Phát một bài trong TRACKS (bài đang phát thì giữ nguyên, không phát lại từ đầu)
export function playTrack(name, onFail) {
  const track = TRACKS[name];
  if (!track) return false;
  failHandler = onFail || null;
  if (current && current.id === track.id) {
    if (player && player.getPlayerState && player.getPlayerState() !== 1) player.playVideo();
    return true;
  }
  current = track;
  hookGesture();
  getPlayer().then((p) => {
    if (current !== track) return;
    p.loadVideoById({ videoId: track.id, startSeconds: track.start || 0 });
  }).catch(() => { current = null; if (failHandler) failHandler(track); });
  return true;
}

export function stopTrack() {
  current = null;
  if (player && player.pauseVideo) player.pauseVideo();
}

// 0–100
export function setTrackVolume(v) {
  volume = Math.round(Math.max(0, Math.min(100, v)));
  if (player && player.setVolume) player.setVolume(volume);
}
export const trackVolume = () => volume;
