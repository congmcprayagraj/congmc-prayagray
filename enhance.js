/* enhance.js — Phase 3: reveal, counters, sticky header, scroll-to-top.
   Additive and dependency-free. Does not touch slider, menu, gallery or
   facility-popup logic (only adds Escape-to-close for the facility popup). */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');

  /* ---------- Scroll reveal ---------- */
  var groups = [
    '.section-heading', '.two-col > *', '.vision-grid > *', '.course-card', '.faculty-wrap > .section-kicker',
    '.faculty-wrap > h3', '.faculty-grid > *', '.principal-card > *', '.admission-grid > *',
    '.facility-grid > *', '.notice-board > *', '.gallery-albums', '.gallery-note',
    '.cta-inner > *', '.footer-grid > *', '.quick-grid > *', '.lead-card', '.nu-panel', '.sc-panel', '.ic-box'
  ];
  var targets = [];
  groups.forEach(function (sel) {
    var list = document.querySelectorAll(sel);
    Array.prototype.forEach.call(list, function (el, i) {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      el.style.setProperty('--d', Math.min(i % 4, 3) * 0.08 + 's'); // gentle stagger
      targets.push(el);
    });
  });

  function show(el) { el.classList.add('is-visible'); }
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated counters (numeric stats only) ---------- */
  var statEls = document.querySelectorAll('.stats strong');
  function runCounter(el) {
    var final = el.getAttribute('data-final') || el.textContent.trim();
    if (!/^\d+$/.test(final)) return;               // skip "B.Sc." etc.
    var end = parseInt(final, 10);
    var start = end >= 1900 ? end - 25 : 0;          // years count up from a nearby value
    if (reduce) { el.textContent = final; return; }
    var dur = 1300, t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * eased);
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    }
    requestAnimationFrame(step);
  }
  Array.prototype.forEach.call(statEls, function (el) {
    el.setAttribute('data-final', el.textContent.trim());
    if (!('IntersectionObserver' in window) || reduce) return;
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    co.observe(el);
  });

  /* ---------- Sticky header state, scroll-to-top, scroll-spy ---------- */
  var header = document.querySelector('.site-header');
  var toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Scroll to top');
  toTop.innerHTML = '&#8593;';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var spy = navLinks.map(function (a) {
    var id = a.getAttribute('href').slice(1);
    return { a: a, el: id && id !== 'home' ? document.getElementById(id) : null };
  }).filter(function (x) { return x.el; });

  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset || doc.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    toTop.classList.toggle('show', y > 600);
    var current = null, line = y + 140;
    spy.forEach(function (x) { if (x.el.offsetTop <= line) current = x.a; });
    navLinks.forEach(function (a) { a.classList.toggle('is-current', a === current); });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Facility popup: Escape to close (existing logic untouched) ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var p = document.getElementById('facilityPopup');
    var img = document.getElementById('popupImage');
    if (p && p.classList.contains('active')) { p.classList.remove('active'); if (img) img.src = ''; }
  });

  /* ---------- Intro splash controller ---------- */
  (function () {
    var intro = document.getElementById('intro');
    if (!intro) return;
    if (!doc.classList.contains('intro-on')) { intro.remove(); return; }
    var done = false;
    function finish() {
      if (done) return; done = true;
      try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
      doc.classList.add('intro-done');            // lets the hero text start
      intro.classList.add('is-leaving');
      setTimeout(function () { intro.remove(); doc.classList.remove('intro-on'); }, 1050);
    }
    // Count the show from when its first animation really starts (fonts/slow networks can delay first paint)
    var logo = intro.querySelector('.intro-logo');
    if (logo) logo.addEventListener('animationstart', function () { setTimeout(finish, 3400); }, { once: true });
    setTimeout(finish, 7000);                    // fallback if animationstart never fires
    intro.addEventListener('click', finish);
    var skip = document.getElementById('introSkip');
    if (skip) skip.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter') finish(); });
  })();

  /* ---------- Pointer-follow 3D tilt (mouse only) ---------- */
  if (!reduce && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var TILT = '.info-card,.person,.facility,.blog-card,.gal-card:not(.is-empty),.course-card,.about-card,.lead-card,.ic-box';
    var cur = null, raf = 0, px = 0, py = 0;
    function apply() {
      raf = 0; if (!cur) return;
      var r = cur.getBoundingClientRect();
      var x = (px - r.left) / r.width - 0.5, y = (py - r.top) / r.height - 0.5;
      cur.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
      cur.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg');
    }
    function leave(el) { if (!el) return; el.classList.add('tilt-leave'); el.classList.remove('tilt-on');
      el.style.removeProperty('--rx'); el.style.removeProperty('--ry');
      setTimeout(function () { el.classList.remove('tilt-leave'); }, 460); }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var t = e.target.closest ? e.target.closest(TILT) : null;
      if (t !== cur) { leave(cur); cur = t; if (cur) cur.classList.add('tilt-on'); }
      if (cur) { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(apply); }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { leave(cur); cur = null; }, true);
    window.addEventListener('blur', function () { leave(cur); cur = null; });
  }

  /* ---------- Logo coin: only spins while visible ---------- */
  var coin = document.querySelector('.cta-coin');
  if (coin && !reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { en.forEach(function (x) { coin.classList.toggle('is-live', x.isIntersecting); }); }).observe(coin);
  }

  /* ---------- Mobile menu: 3D drawer built from the page's own nav links ---------- */
  (function () {
    var toggle = document.querySelector('.menu-toggle'), nav = document.querySelector('.nav');
    if (!toggle || !nav) return;
    var ICONS = {
      Home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
      About: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
      Academics: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
      Admissions: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
      Facilities: '<path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01"/>',
      Notices: '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21h4"/>',
      Gallery: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/>',
      Blog: '<path d="M5 4h12v16H7a2 2 0 01-2-2z"/><path d="M17 8h3v10a2 2 0 01-2 2M8 8h6M8 12h6M8 16h4"/>',
      Contact: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
    };
    var DESC = { Home: 'Welcome to the college', About: 'Our college & vision', Academics: 'B.Sc. Nursing & faculty',
      Admissions: 'CNET • eligibility • documents', Facilities: 'Explore our facilities', Notices: 'Latest announcements',
      Gallery: 'Events & photo albums', Blog: 'News & articles', Contact: 'Reach the college' };
    var ACT = {
      call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
      wa: '<path d="M4 20l1.4-4.2A8 8 0 1112 20a8 8 0 01-3.8-1z"/><path d="M9 11h.01M12 11h.01M15 11h.01"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
    };
    function svg(path) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>'; }

    var links = Array.prototype.slice.call(nav.querySelectorAll('a')).filter(function (a) { return !a.classList.contains('nav-enquiry'); });
    var enquiry = document.querySelector('.nav-enquiry');
    var logoSrc = (document.querySelector('.brand img') || {}).src || 'college-logo.png';

    var rows = links.map(function (a, i) {
      var label = a.textContent.trim();
      return '<a class="mm-link" style="--i:' + i + '" href="' + a.getAttribute('href') + '" data-label="' + label + '">' +
        '<span class="mm-ico">' + svg(ICONS[label] || ICONS.About) + '</span>' +
        '<span class="mm-txt"><b>' + label + '</b><small>' + (DESC[label] || '') + '</small></span><span class="mm-chev" aria-hidden="true">›</span></a>';
    }).join('');

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="mm-backdrop" id="mmBackdrop"></div>' +
      '<aside class="mm" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden="true">' +
        '<div class="mm-coin" aria-hidden="true"><div class="coin"><img src="' + logoSrc + '" alt=""><img src="' + logoSrc + '" alt=""></div></div>' +
        '<div class="mm-head"><span class="mm-logo"><img src="' + logoSrc + '" alt=""></span>' +
          '<div class="mm-title"><strong>College of Nursing</strong><span>Government Medical College, Prayagraj</span></div>' +
          '<button class="mm-close" type="button" aria-label="Close menu">&times;</button></div>' +
        '<nav class="mm-links" aria-label="Mobile navigation">' + rows + '</nav>' +
        '<div class="mm-actions">' +
          '<a class="mm-act" href="tel:+917897383084">' + svg(ACT.call) + 'Call</a>' +
          '<a class="mm-act wa" href="https://wa.me/917897383084" target="_blank" rel="noopener">' + svg(ACT.wa) + 'WhatsApp</a>' +
          '<a class="mm-act" href="mailto:congmcprayagraj@gmail.com">' + svg(ACT.mail) + 'Email</a></div>' +
        (enquiry ? '<a class="mm-enquiry" href="' + enquiry.getAttribute('href') + '">Send an Enquiry</a>' : '') +
        '<button class="mm-install" type="button" hidden>' + svg('<path d="M12 3v12M7 11l5 5 5-5M5 21h14"/>') + 'Install app on your phone</button>' +
        '<div class="mm-foot"><em>सेवा परमो: धर्म:</em>North Malaka, Prayagraj, Uttar Pradesh 211001</div>' +
      '</aside>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    var menu = document.getElementById('mobileMenu'), backdrop = document.getElementById('mmBackdrop');
    var closeBtn = menu.querySelector('.mm-close'), open = false;
    menu.inert = true;
    toggle.innerHTML = '<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>';
    toggle.setAttribute('aria-controls', 'mobileMenu');

    function syncCurrent() {
      var any = false;
      Array.prototype.forEach.call(menu.querySelectorAll('.mm-link'), function (m, i) {
        var on = links[i].classList.contains('is-current') || links[i].getAttribute('aria-current') === 'page';
        m.classList.toggle('is-current', on); if (on) any = true;
      });
      if (!any && !/(notices|blog|gallery)\.html$/.test(location.pathname)) {
        var home = menu.querySelector('.mm-link[data-label="Home"]'); if (home) home.classList.add('is-current');
      }
    }
    function setOpen(v, restoreFocus) {
      if (v === open) return; open = v;
      if (v) syncCurrent();
      document.body.classList.toggle('menu-open', v);
      menu.setAttribute('aria-hidden', String(!v)); menu.inert = !v;
      toggle.setAttribute('aria-expanded', String(v)); toggle.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
      nav.classList.remove('open');                           // keep script.js's old state in sync
      if (v) closeBtn.focus({ preventScroll: true }); else if (restoreFocus) toggle.focus({ preventScroll: true });
    }
    toggle.addEventListener('click', function () { setOpen(!open, false); });
    closeBtn.addEventListener('click', function () { setOpen(false, true); });
    backdrop.addEventListener('click', function () { setOpen(false, true); });
    menu.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setOpen(false, false); });
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { setOpen(false, true); return; }
      if (e.key === 'Tab') {
        var f = Array.prototype.slice.call(menu.querySelectorAll('a,button'));
        var pos = f.indexOf(document.activeElement); e.preventDefault();
        f[(pos + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus({ preventScroll: true });
      }
    });
    if (window.matchMedia) matchMedia('(min-width: 821px)').addEventListener('change', function (m) { if (m.matches) setOpen(false, false); });
  })();

  /* ---------- Installable app (PWA): service worker + install prompt ---------- */
  (function () {
    var secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if ('serviceWorker' in navigator && secure) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    if (standalone) return;                                    // already running as an installed app

    var KEY = 'conInstallDismissed', WEEK = 7 * 86400000;
    function dismissedRecently() { try { var t = +localStorage.getItem(KEY); return t && Date.now() - t < WEEK; } catch (e) { return false; } }
    function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
    var logo = (document.querySelector('.brand img') || {}).src || 'college-logo.png';
    var deferred = null, bar = null;

    function hideBar() { if (!bar) return; bar.classList.remove('show'); document.body.classList.remove('has-install-bar');
      var b = bar; bar = null; setTimeout(function () { b.remove(); }, 600); }
    function showBar(ios) {
      if (bar || dismissedRecently()) return;
      bar = document.createElement('div'); bar.className = 'install-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Install app');
      bar.innerHTML = '<img src="' + logo + '" alt="" width="44" height="44">' +
        '<div class="ib-txt"><b>Install College of Nursing app</b><span>' +
        (ios ? 'Tap the Share button, then “Add to Home Screen”.' : 'Opens like an app, works offline too.') + '</span></div>' +
        (ios ? '' : '<button class="ib-yes" type="button">Install</button>') +
        '<button class="ib-no" type="button" aria-label="Dismiss">&times;</button>';
      document.body.appendChild(bar);
      document.body.classList.add('has-install-bar');
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (bar) bar.classList.add('show'); }); });
      var yes = bar.querySelector('.ib-yes');
      if (yes) yes.addEventListener('click', install);
      bar.querySelector('.ib-no').addEventListener('click', function () { remember(); hideBar(); });
    }
    function install() {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function (c) { if (c.outcome !== 'accepted') remember(); deferred = null; hideBar(); setDrawerBtn(false); });
    }
    function setDrawerBtn(on) {
      var b = document.querySelector('.mm-install'); if (b) b.hidden = !on;
    }
    function whenReady(fn) {                                    // wait until the intro splash has finished
      if (!doc.classList.contains('intro-on')) return setTimeout(fn, 4000);
      var t = setInterval(function () { if (!doc.classList.contains('intro-on')) { clearInterval(t); setTimeout(fn, 3000); } }, 500);
    }

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); deferred = e;
      setDrawerBtn(true);
      var b = document.querySelector('.mm-install'); if (b && !b.__bound) { b.__bound = true; b.addEventListener('click', install); }
      whenReady(function () { if (deferred) showBar(false); });
    });
    window.addEventListener('appinstalled', function () { deferred = null; remember(); hideBar(); setDrawerBtn(false); });

    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    var safari = /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
    if (ios && safari) whenReady(function () { showBar(true); });
  })();
})();
