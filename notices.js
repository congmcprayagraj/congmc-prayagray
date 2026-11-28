/* notices.js — everything that reads data/notices-data.js
   1) Announcement bar (right-to-left sliding ticker)      -> #annBar         (every page)
   2) News & Updates auto-scrolling panel (homepage)         -> #noticeList data-mode="ticker"
   3) Full notices page with filters/search/load more        -> #noticeList data-mode="page"
   No dependencies. If the data fails to load, the static HTML stays as it is. */
(function () {
  'use strict';
  var DATA = window.NOTICES || [];
  var NEW_DAYS = 14;
  var CATS = window.NOTICE_CATEGORIES || ['Admission', 'Examination', 'Academic', 'Results', 'Events', 'General Announcements'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function fmt(d) { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function tint(cat) { var i = CATS.indexOf(cat); return 'tint-' + (i < 0 ? 5 : i % 6); }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function isNew(d) { if (!d) return false; var age = (today - d) / 86400000; return age >= -1 && age <= NEW_DAYS; }
  function isExternal(u) { return /^https?:\/\//i.test(u || ''); }
  function hrefOf(n) { return n.pdf ? encodeURI(n.pdf) : (n.url || ''); }

  var list = DATA.map(function (n, i) { return { n: n, d: parseDate(n.date), i: i }; });
  list.sort(function (a, b) {
    if (!!b.n.pinned !== !!a.n.pinned) return b.n.pinned ? 1 : -1;
    if (!!a.d !== !!b.d) return a.d ? -1 : 1;
    if (a.d && b.d && b.d - a.d) return b.d - a.d;
    return a.i - b.i;
  });

  /* ================= 1) ANNOUNCEMENT BAR ================= */
  (function announcementBar() {
    var bar = document.getElementById('annBar'), move = document.getElementById('annMove'), pauseBtn = document.getElementById('annPause');
    if (!bar || !move) return;
    var manual = (window.ANNOUNCEMENTS || []).filter(function (a) { return a && a.text; });
    var items = manual.length ? manual.map(function (a) { return { text: a.text, url: a.url || 'notices.html', isNew: !!a.new }; })
      : list.slice(0, 8).map(function (x) { return { text: x.n.title, url: hrefOf(x.n) || 'notices.html', isNew: isNew(x.d), pinned: !!x.n.pinned, pdf: !!x.n.pdf }; });
    if (!items.length) return;

    function group() {
      var g = el('span', 'ann-grp');
      items.forEach(function (it) {
        var a = el('a', 'ann-item'); a.href = it.url;
        if (isExternal(it.url) || it.pdf) { a.target = '_blank'; a.rel = 'noopener'; }
        if (it.pinned) a.appendChild(el('b', 'ann-tag ann-imp', 'IMPORTANT'));
        if (it.isNew) a.appendChild(el('b', 'ann-tag ann-new', 'NEW'));
        a.appendChild(document.createTextNode(it.text));
        g.appendChild(a); g.appendChild(el('span', 'ann-dot', '◆'));
      });
      return g;
    }
    bar.hidden = false;
    var first = group(); move.appendChild(first);
    if (reduce) { bar.classList.add('is-static'); if (pauseBtn) pauseBtn.hidden = true; return; }

    function build() {
      var track = move.parentNode, w = first.getBoundingClientRect().width;
      if (!w) return;
      while (move.children.length > 1) move.removeChild(move.lastChild);
      var copies = Math.ceil(track.clientWidth / w) + 1;
      for (var i = 0; i < copies; i++) { var c = group(); c.setAttribute('aria-hidden', 'true');
        Array.prototype.forEach.call(c.querySelectorAll('a'), function (a) { a.tabIndex = -1; }); move.appendChild(c); }
      move.style.setProperty('--shift', w + 'px');
      move.style.setProperty('--dur', Math.max(18, w / 55) + 's');       // ~55px per second, always readable
      move.classList.add('is-running');
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 250); });
    if (pauseBtn) pauseBtn.addEventListener('click', function () {
      var p = bar.classList.toggle('is-paused');
      pauseBtn.setAttribute('aria-pressed', String(p)); pauseBtn.textContent = p ? '▶' : '❚❚';
      pauseBtn.setAttribute('aria-label', p ? 'Play announcements' : 'Pause announcements');
    });
  })();

  var host = document.getElementById('noticeList');
  if (!host || !DATA.length) return;
  var mode = host.getAttribute('data-mode') || 'home';

  /* ================= 2) NEWS & UPDATES (auto-scrolling panel) ================= */
  if (mode === 'ticker') {
    var view = host.querySelector('.nu-view') || host;
    var ul = host.querySelector('.nu-list');
    if (!ul) return;
    ul.innerHTML = '';
    function row(x) {
      var n = x.n, href = hrefOf(n);
      var r = el(href ? 'a' : 'div', 'nu-item');
      if (href) { r.href = href; if (isExternal(href) || n.pdf) { r.target = '_blank'; r.rel = 'noopener'; } }
      var ico = el('span', 'nu-ico ' + tint(n.category), n.pdf ? 'PDF' : (n.category || 'N').charAt(0));
      var txt = el('span', 'nu-txt');
      var top = el('span', 'nu-top'); top.appendChild(el('em', 'nu-cat ' + tint(n.category), n.category || 'General Announcements'));
      if (n.pinned) top.appendChild(el('b', 'nb-badge nb-pin', 'Important'));
      if (isNew(x.d)) top.appendChild(el('b', 'nb-badge nb-new', 'NEW'));
      txt.appendChild(top); txt.appendChild(el('strong', 'nu-title', n.title));
      txt.appendChild(el('span', 'nu-meta', x.d ? fmt(x.d) : (n.note || 'Official link')));
      r.appendChild(ico); r.appendChild(txt); r.appendChild(el('span', 'nu-arrow', href ? '›' : ''));
      return r;
    }
    list.slice(0, 12).forEach(function (x) { ul.appendChild(row(x)); });

    var btnUp = document.getElementById('nuUp'), btnDown = document.getElementById('nuDown'), btnPause = document.getElementById('nuPause');
    var overflows = ul.scrollHeight > view.clientHeight + 4;
    if (reduce || !overflows) { view.classList.add('is-static'); [btnUp, btnDown, btnPause].forEach(function (b) { if (b) b.hidden = true; }); return; }

    var oneH = ul.scrollHeight;                           // height of a single set
    var clones = ul.cloneNode(true); var kids = Array.prototype.slice.call(clones.children);
    kids.forEach(function (c) { c.setAttribute('aria-hidden', 'true'); if (c.tagName === 'A') c.tabIndex = -1; ul.appendChild(c); });
    var y = 0, last = 0, paused = false, hover = false, tween = null, visible = true, SPEED = 22;
    function paint() { ul.style.transform = 'translate3d(0,' + (-y) + 'px,0)'; }
    function wrap() { if (y >= oneH) y -= oneH; if (y < 0) y += oneH; }
    function frame(t) {
      var dt = last ? Math.min(t - last, 64) : 0; last = t;
      if (tween) {
        var p = Math.min((t - tween.t0) / tween.dur, 1), e = 1 - Math.pow(1 - p, 3);
        y = tween.from + (tween.to - tween.from) * e; if (p >= 1) tween = null;
      } else if (!paused && !hover && visible) y += SPEED * dt / 1000;
      wrap(); paint(); requestAnimationFrame(frame);
    }
    function step(dir) {
      var h = (ul.firstElementChild ? ul.firstElementChild.offsetHeight : 90) + 0;
      tween = { from: y, to: y + dir * h, t0: performance.now(), dur: 380 };
    }
    if (btnUp) btnUp.addEventListener('click', function () { step(-1); });
    if (btnDown) btnDown.addEventListener('click', function () { step(1); });
    if (btnPause) btnPause.addEventListener('click', function () {
      paused = !paused; btnPause.textContent = paused ? '▶' : '❚❚';
      btnPause.setAttribute('aria-pressed', String(paused)); btnPause.setAttribute('aria-label', paused ? 'Play news ticker' : 'Pause news ticker');
    });
    view.addEventListener('mouseenter', function () { hover = true; });
    view.addEventListener('mouseleave', function () { hover = false; });
    view.addEventListener('focusin', function () { hover = true; });
    view.addEventListener('focusout', function () { hover = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(view);
    requestAnimationFrame(frame);
    return;
  }

  /* ================= 3) FULL NOTICES PAGE ================= */
  var PAGE = 10;
  function item(x, idx) {
    var n = x.n;
    var row = el('article', 'nb-item' + (n.pinned ? ' is-pinned' : ''));
    row.style.setProperty('--i', Math.min(idx, 10));
    row.appendChild(el('span', 'nb-cat ' + tint(n.category), n.category || 'General Announcements'));
    var main = el('div', 'nb-main');
    var h = el('h3', 'nb-title', n.title);
    if (n.pinned) h.appendChild(el('span', 'nb-badge nb-pin', 'Important'));
    if (isNew(x.d)) h.appendChild(el('span', 'nb-badge nb-new', 'NEW'));
    main.appendChild(h);
    if (n.note) main.appendChild(el('p', 'nb-note', n.note));
    row.appendChild(main);
    if (x.d) { var t = el('time', 'nb-date', fmt(x.d)); t.setAttribute('datetime', n.date); row.appendChild(t); }
    else row.appendChild(el('span', 'nb-date', 'Official link'));
    var act = el('div', 'nb-actions');
    if (n.pdf) {
      var href = encodeURI(n.pdf);
      var v = el('a', 'nb-btn', 'View PDF ↗'); v.href = href; v.target = '_blank'; v.rel = 'noopener'; v.setAttribute('aria-label', 'View PDF: ' + n.title);
      var d = el('a', 'nb-btn nb-btn-ghost', 'Download'); d.href = href; d.setAttribute('download', ''); d.setAttribute('aria-label', 'Download PDF: ' + n.title);
      act.appendChild(v); act.appendChild(d);
    }
    if (n.url) {
      var o = el('a', 'nb-btn' + (n.pdf ? ' nb-btn-ghost' : ''), 'Open ↗'); o.href = n.url; o.target = '_blank'; o.rel = 'noopener'; o.setAttribute('aria-label', 'Open: ' + n.title);
      act.appendChild(o);
    }
    row.appendChild(act);
    return row;
  }
  host.className = 'nb-list';
  if (mode === 'home') { host.innerHTML = ''; list.slice(0, 6).forEach(function (x, i) { host.appendChild(item(x, i)); }); return; }

  var elFilters = document.getElementById('noticeFilters'), elSearch = document.getElementById('noticeSearch'),
      elCount = document.getElementById('noticeCount'), elMore = document.getElementById('noticeMore');
  var cat = 'All', q = '', shown = PAGE;
  function matches() {
    return list.filter(function (x) {
      if (cat !== 'All' && x.n.category !== cat) return false;
      if (q) { var hay = (x.n.title + ' ' + (x.n.note || '') + ' ' + (x.n.category || '')).toLowerCase(); if (hay.indexOf(q) < 0) return false; }
      return true;
    });
  }
  function draw() {
    var res = matches(); host.innerHTML = '';
    res.slice(0, shown).forEach(function (x, i) { host.appendChild(item(x, i)); });
    if (!res.length) host.appendChild(el('p', 'nb-empty', 'No notices match your search.'));
    if (elCount) elCount.textContent = res.length + (res.length === 1 ? ' notice' : ' notices');
    if (elMore) elMore.hidden = res.length <= shown;
  }
  function buildFilters() {
    if (!elFilters) return;
    var used = ['All'].concat(CATS.filter(function (c) { return DATA.some(function (n) { return n.category === c; }); }));
    elFilters.innerHTML = '';
    used.forEach(function (c) {
      var b = el('button', 'chip' + (c === cat ? ' is-active' : ''), c); b.type = 'button'; b.setAttribute('aria-pressed', c === cat ? 'true' : 'false');
      b.addEventListener('click', function () { cat = c; shown = PAGE; buildFilters(); draw(); });
      elFilters.appendChild(b);
    });
  }
  if (elSearch) elSearch.addEventListener('input', function () { q = elSearch.value.trim().toLowerCase(); shown = PAGE; draw(); });
  if (elMore) elMore.addEventListener('click', function () { shown += PAGE; draw(); });
  buildFilters(); draw();
})();
