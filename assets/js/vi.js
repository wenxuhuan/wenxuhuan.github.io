/* ============================================================
   vi.js
   复刻 iissnan.com 的入场编排：
     标题 → 引文（左右横线 + 上下引号 → 正文 → 出处）→ 链接逐个 → 所在地
   原站用 jQuery 的 .delay().animate() 串行，这里用原生 Promise 链实现同样时序。
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DURATION = 400;   // jQuery .animate() 默认时长
  var STEP = 200;       // 链接之间的间隔（原站 DELAY_STEP）

  /* ---------- 动效类名 → 关键帧 ---------- */
  var FRAMES = {
    down:  [{ opacity: 0, top: '-10px' },    { opacity: 1, top: '0px' }],
    up:    [{ opacity: 0, bottom: '-10px' }, { opacity: 1, bottom: '0px' }],
    left:  [{ left: '-100%' },               { left: '0%' }],
    right: [{ right: '-100%' },              { right: '0%' }]
  };

  function typeOf(el) {
    if (el.classList.contains('animate-slide-in-down')) return 'down';
    if (el.classList.contains('animate-slide-in-up')) return 'up';
    if (el.classList.contains('animate-slide-in-left')) return 'left';
    if (el.classList.contains('animate-slide-in-right')) return 'right';
    return null;
  }

  function animate(el, delay) {
    var type = typeOf(el);
    if (!type || typeof el.animate !== 'function') return Promise.resolve();
    var anim = el.animate(FRAMES[type], {
      duration: DURATION,
      delay: delay || 0,
      easing: 'ease',
      fill: 'both'
    });
    return anim.finished ? anim.finished.catch(function () {}) : Promise.resolve();
  }

  function play(selector, delay, index) {
    var list = document.querySelectorAll(selector);
    if (!list.length) return Promise.resolve();
    var i = index || 0;
    var el = list[i];
    return el ? animate(el, delay) : Promise.resolve();
  }

  function playAll(selector, delayStep) {
    var list = Array.prototype.slice.call(document.querySelectorAll(selector));
    return Promise.all(list.map(function (el, i) {
      return animate(el, (delayStep || 0) * i);
    }));
  }

  /* ---------- 首页：与原站一一对应的四段编排 ---------- */
  function animateTitle() {
    return play('h1', 0);
  }

  function animateQuote() {
    var lines = Promise.all([
      play('.quote-line-start'),
      play('.quote-line-end'),
      play('.quote-icon-start'),
      play('.quote-icon-end')
    ]);
    return lines
      .then(function () { return play('.quote-content'); })
      .then(function () { return play('.quote-author'); });
  }

  function animateLinks() {
    return playAll('.links a', STEP);
  }

  function animateLocation() {
    return Promise.all([
      play('.location-icon'),
      play('.location-text')
    ]);
  }

  function executeHome() {
    return Promise.resolve()
      .then(animateTitle)
      .then(animateQuote)
      .then(animateLinks)
      .then(animateLocation);
  }

  /* ---------- 内页：按文档顺序逐级入场 ---------- */
  function executeStagger() {
    var all = Array.prototype.slice.call(
      document.querySelectorAll('[class*="animate-slide-in"]')
    );
    return Promise.all(all.map(function (el, i) {
      return animate(el, i * 90);
    }));
  }

  /* ---------- 主题：跟随系统，可手动覆盖 ---------- */
  function setupTheme() {
    var KEY = 'vi-theme';
    try {
      var saved = localStorage.getItem(KEY);
      if (saved) root.setAttribute('data-theme', saved);
    } catch (e) {}

    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', '切换深浅色');
    btn.title = '切换深浅色';
    btn.innerHTML =
      '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M20 13.6A8.6 8.6 0 1 1 10.4 4a6.9 6.9 0 0 0 9.6 9.6z"/>' +
      '</svg>' +
      '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="4.2"/>' +
        '<path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2' +
        'M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/>' +
      '</svg>';

    btn.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark' ||
        (!root.getAttribute('data-theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });

    document.body.appendChild(btn);
  }

  /* ---------- 彩蛋：按 B 键，原站跳 bookmarks.html ---------- */
  function registerCheatCode() {
    var target = document.body.getAttribute('data-cheat-target');
    if (!target) return;
    var label = document.body.getAttribute('data-cheat-label') || 'Page';
    var KEY_B = 66;

    document.body.addEventListener('keydown', function (event) {
      if (event.which !== KEY_B) return;
      var box = document.querySelector('.relocate-location');
      var bar = document.querySelector('.relocating');
      if (box) box.textContent = label;
      if (bar) bar.style.opacity = 1;
      window.setTimeout(function () { window.location.href = target; }, 1000);
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    setupTheme();
    registerCheatCode();

    if (reduceMotion) {
      root.classList.add('no-anim');
      return;
    }

    var page = document.body.getAttribute('data-page');
    if (page === 'home') {
      executeHome();
    } else {
      executeStagger();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
