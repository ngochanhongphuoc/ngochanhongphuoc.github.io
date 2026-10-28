// Song ngữ VI/EN cho trang NGƯỜI CHƠI (quiz/join, lottery/ticket, tree/play).
// Màn hình TV và trang MC không gọi initLang() nên luôn là tiếng Việt.
// Lựa chọn lưu chung với thiệp cưới (localStorage "phuoc-han-language"); link ?lang=en mở thẳng tiếng Anh.
const KEY = 'phuoc-han-language';
let lang = 'vi';
const listeners = [];

// Chọn chữ theo ngôn ngữ đang dùng: L('Xin chào', 'Hello')
export const L = (vi, en) => (lang === 'en' && en != null ? en : vi);
export const getLang = () => lang;
export function onLangChange(fn) { listeners.push(fn); }

export function initLang() {
  let l = new URLSearchParams(location.search).get('lang');
  if (l !== 'en' && l !== 'vi') { try { l = localStorage.getItem(KEY); } catch (e) { l = null; } }
  lang = l === 'en' ? 'en' : 'vi';
  document.documentElement.lang = lang;
  renderSwitch();
  return lang;
}

function setLang(l) {
  if (l === lang) return;
  lang = l;
  try { localStorage.setItem(KEY, lang); } catch (e) { /* bỏ qua */ }
  document.documentElement.lang = lang;
  updateSwitch();
  listeners.forEach((fn) => fn(lang));
}

// Nút VI | EN nhỏ ở góc dưới bên phải màn hình
function renderSwitch() {
  if (document.getElementById('lang-switch')) return;
  const box = document.createElement('div');
  box.id = 'lang-switch';
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Ngôn ngữ / Language');
  box.style.cssText = 'position:fixed;z-index:95;right:12px;bottom:12px;display:flex;gap:2px;padding:3px;border-radius:9999px;background:rgba(255,255,255,0.95);box-shadow:0 4px 16px rgba(0,0,0,0.25)';
  box.innerHTML = ['vi', 'en'].map((l) => `<button type="button" data-lang="${l}" style="min-width:40px;min-height:32px;padding:4px 10px;border:0;border-radius:9999px;font:800 12px Montserrat,sans-serif;cursor:pointer">${l.toUpperCase()}</button>`).join('');
  box.querySelectorAll('button').forEach((b) => { b.onclick = () => setLang(b.dataset.lang); });
  document.body.appendChild(box);
  updateSwitch();
}
function updateSwitch() {
  document.querySelectorAll('#lang-switch button').forEach((b) => {
    const on = b.dataset.lang === lang;
    b.style.background = on ? '#5d1821' : 'transparent';
    b.style.color = on ? '#fff' : '#5d1821';
    b.setAttribute('aria-pressed', String(on));
  });
}
