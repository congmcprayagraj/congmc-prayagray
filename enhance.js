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
    '.cta-inner > *', '.footer-grid > *', '.quick-grid > *'
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
})();
