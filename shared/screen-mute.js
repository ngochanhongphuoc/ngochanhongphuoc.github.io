// Dùng khi trang nằm trong Màn hình tiệc (screen/): màn hình đang ẩn vẫn chạy bình thường (game, nhạc không bị tắt)
// nhưng không phát ra tiếng. Màn hình tiệc gọi window.__screenMute(true/false) khi đổi màn hình.
// Phải nạp TRƯỚC mọi script khác của trang (để bắt được mọi Audio / AudioContext tạo ra sau đó).
(function () {
  if (window.self === window.top) return;
  var muted = false;
  try { muted = !!(window.frameElement && window.frameElement.dataset.muted === '1'); } catch (e) { /* khác tên miền */ }
  var media = new Set();
  var ctxs = new Set();

  // Mọi thẻ audio / video đều phải gọi play() mới phát: ghi lại để tắt / bật tiếng
  var proto = HTMLMediaElement.prototype;
  var play = proto.play;
  proto.play = function () {
    media.add(this);
    if (muted) this.muted = true;
    return play.apply(this, arguments);
  };

  // Web Audio (tiếng hiệu ứng tổng hợp, bộ cân bằng âm lượng của trình phát nhạc)
  var AC = window.AudioContext || window.webkitAudioContext;
  var resume = AC && AC.prototype.resume;
  if (AC) {
    AC.prototype.resume = function () {
      ctxs.add(this);
      return muted ? Promise.resolve() : resume.apply(this, arguments);
    };
    var Wrapped = function (opts) {
      var c = opts ? new AC(opts) : new AC();
      ctxs.add(c);
      if (muted) c.suspend();
      return c;
    };
    Wrapped.prototype = AC.prototype;
    window.AudioContext = Wrapped;
    if (window.webkitAudioContext) window.webkitAudioContext = Wrapped;
  }

  window.__screenMute = function (on) {
    muted = !!on;
    media.forEach(function (m) { m.muted = muted; });
    ctxs.forEach(function (c) { try { muted ? c.suspend() : resume.call(c); } catch (e) { /* bỏ qua */ } });
  };
})();
