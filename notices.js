/* notices.js — renders the Notice Board (homepage preview + full notices page).
   Data: data/notices.js. No dependencies. If data fails to load, the original static list stays. */
(function () {
  'use strict';
  var host = document.getElementById('noticeList');
  var DATA = window.NOTICES;
  if (!host || !DATA || !DATA.length) return;

  var NEW_DAYS = 14;
  var CATS = window.NOTICE_CATEGORIES || ['Admission', 'Examination', 'Academic', 'Results', 'Events', 'General Announcements'];
  var mode = host.getAttribute('data-mode') || 'home';
  var homeLimit = parseInt(host.getAttribute('data-limit') || '6', 10);
  var PAGE = 10;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function fmt(d) { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function tint(cat) { var i = CATS.indexOf(cat); return 'tint-' + (i < 0 ? 5 : i % 6); }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function isNew(d) { if (!d) return false; var age = (today - d) / 86400000; return age >= -1 && age <= NEW_DAYS; }

  var list = DATA.map(function (n, i) { return { n: n, d: parseDate(n.date), i: i }; });
  list.sort(function (a, b) {
    if (!!b.n.pinned !== !!a.n.pinned) return b.n.pinned ? 1 : -1;
    if (!!a.d !== !!b.d) return a.d ? -1 : 1;            // dated first
    if (a.d && b.d && b.d - a.d) return b.d - a.d;       // newest first
    return a.i - b.i;
  });

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
      var v = el('a', 'nb-btn', 'View PDF ↗'); v.href = href; v.target = '_blank'; v.rel = 'noopener';
      v.setAttribute('aria-label', 'View PDF: ' + n.title);
      var d = el('a', 'nb-btn nb-btn-ghost', 'Download'); d.href = href; d.setAttribute('download', '');
      d.setAttribute('aria-label', 'Download PDF: ' + n.title);
      act.appendChild(v); act.appendChild(d);
    }
    if (n.url) {
      var o = el('a', 'nb-btn' + (n.pdf ? ' nb-btn-ghost' : ''), 'Open ↗'); o.href = n.url; o.target = '_blank'; o.rel = 'noopener';
      o.setAttribute('aria-label', 'Open: ' + n.title);
      act.appendChild(o);
    }
    row.appendChild(act);
    return row;
  }

  host.className = 'nb-list';

  /* ---------- homepage preview ---------- */
  if (mode === 'home') {
    host.innerHTML = '';
    list.slice(0, homeLimit).forEach(function (x, i) { host.appendChild(item(x, i)); });
    return;
  }

  /* ---------- full page: filters + search + load more ---------- */
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
    var res = matches();
    host.innerHTML = '';
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
      var b = el('button', 'chip' + (c === cat ? ' is-active' : ''), c); b.type = 'button';
      b.setAttribute('aria-pressed', c === cat ? 'true' : 'false');
      b.addEventListener('click', function () { cat = c; shown = PAGE; buildFilters(); draw(); });
      elFilters.appendChild(b);
    });
  }
  if (elSearch) elSearch.addEventListener('input', function () { q = elSearch.value.trim().toLowerCase(); shown = PAGE; draw(); });
  if (elMore) elMore.addEventListener('click', function () { shown += PAGE; draw(); });
  buildFilters(); draw();
})();
