/* blog.js — blog cards (homepage preview), listing, and full article view.
   Data: data/blog.js. Article body is rendered safely (no raw HTML is ever injected). */
(function () {
  'use strict';
  var POSTS = (window.BLOG_POSTS || []).filter(function (p) { return p && p.slug && p.title; });
  var CATS = window.BLOG_CATEGORIES || ['College Activities', 'Nursing Education', 'Student Achievements', 'Health Awareness', 'Workshops and Seminars', 'College News'];
  var preview = document.getElementById('blogPreview'), root = document.getElementById('blogRoot');
  var section = document.getElementById('blog');
  var SITE = 'https://congmcprayagraj.is-local.org/';

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function fmt(s) { var d = parseDate(s); return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''; }
  function tint(c) { var i = CATS.indexOf(c); return 'tint-' + (i < 0 ? 5 : i % 6); }
  function mins(p) { return Math.max(1, Math.round(((p.body || '').split(/\s+/).length) / 200)); }
  function link(slug) { return 'blog.html?post=' + encodeURIComponent(slug); }
  function safeSrc(s) { return /^(https?:\/\/|[\w][\w ./%()-]*$)/.test(s || '') && !/^\s*javascript:/i.test(s) ? (function(){ try { return encodeURI(decodeURI(s)); } catch (e) { return ''; } })() : ''; }

  POSTS.sort(function (a, b) { var da = parseDate(a.date), db = parseDate(b.date); return (db || 0) - (da || 0); });

  /* ---------- card ---------- */
  function card(p, i) {
    var c = el('article', 'blog-card');
    c.style.setProperty('--i', Math.min(i, 8));
    var media = el('a', 'blog-media'); media.href = link(p.slug); media.tabIndex = -1; media.setAttribute('aria-hidden', 'true');
    var src = safeSrc(p.cover);
    if (src) {
      var img = new Image(); img.loading = 'lazy'; img.decoding = 'async'; img.alt = p.coverAlt || ''; img.src = src;
      img.addEventListener('error', function () { img.remove(); media.classList.add('blog-ph'); media.appendChild(el('span', '', p.category)); }, { once: true });
      media.appendChild(img);
    } else { media.classList.add('blog-ph'); media.appendChild(el('span', '', p.category)); }
    c.appendChild(media);

    var body = el('div', 'blog-body');
    var top = el('div', 'blog-top');
    top.appendChild(el('span', 'nb-cat ' + tint(p.category), p.category));
    if (p.demo) top.appendChild(el('span', 'nb-badge nb-demo', 'Demo'));
    body.appendChild(top);
    var h = el('h3', 'blog-title'); var a = el('a', '', p.title); a.href = link(p.slug); h.appendChild(a); body.appendChild(h);
    if (p.excerpt) body.appendChild(el('p', 'blog-excerpt', p.excerpt));
    var meta = el('p', 'blog-meta');
    var t = el('time', '', fmt(p.date)); t.setAttribute('datetime', p.date || ''); meta.appendChild(t);
    if (p.author) meta.appendChild(document.createTextNode(' · ' + p.author));
    body.appendChild(meta);
    var rm = el('a', 'btn btn-outline blog-more', 'Read More →'); rm.href = link(p.slug);
    rm.setAttribute('aria-label', 'Read more: ' + p.title);
    body.appendChild(rm);
    c.appendChild(body);
    return c;
  }

  /* ---------- homepage preview ---------- */
  if (preview) {
    if (!POSTS.length) { if (section) section.hidden = true; }
    else {
      var lim = parseInt(preview.getAttribute('data-limit') || '3', 10);
      POSTS.slice(0, lim).forEach(function (p, i) { preview.appendChild(card(p, i)); });
    }
  }
  if (!root) return;

  /* ---------- safe article body renderer ---------- */
  function inline(parent, text) {
    text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).forEach(function (part) {
      if (!part) return;
      if (/^\*\*[^*]+\*\*$/.test(part)) parent.appendChild(el('strong', '', part.slice(2, -2)));
      else if (/^\*[^*]+\*$/.test(part)) parent.appendChild(el('em', '', part.slice(1, -1)));
      else parent.appendChild(document.createTextNode(part));
    });
  }
  function renderBody(text) {
    var box = el('div', 'post-body');
    String(text || '').replace(/\r/g, '').trim().split(/\n{2,}/).forEach(function (block) {
      var lines = block.split('\n'), m;
      if (/^### /.test(block)) { var h3 = el('h3'); inline(h3, block.slice(4)); box.appendChild(h3); }
      else if (/^## /.test(block)) { var h2 = el('h2'); inline(h2, block.slice(3)); box.appendChild(h2); }
      else if (lines.every(function (l) { return /^- /.test(l); })) {
        var ul = el('ul'); lines.forEach(function (l) { var li = el('li'); inline(li, l.slice(2)); ul.appendChild(li); }); box.appendChild(ul);
      } else if (lines.every(function (l) { return /^\d+\. /.test(l); })) {
        var ol = el('ol'); lines.forEach(function (l) { var li = el('li'); inline(li, l.replace(/^\d+\.\s/, '')); ol.appendChild(li); }); box.appendChild(ol);
      } else if (/^> /.test(block)) { var bq = el('blockquote'); inline(bq, lines.map(function (l) { return l.replace(/^>\s?/, ''); }).join(' ')); box.appendChild(bq); }
      else if ((m = /^!\[(.*)\]\((.+)\)$/.exec(block.trim()))) {
        var s = safeSrc(m[2]); if (s) { var f = el('figure', 'post-fig'); var im = new Image(); im.loading = 'lazy'; im.alt = m[1]; im.src = s; f.appendChild(im); box.appendChild(f); }
      } else { var p = el('p'); inline(p, lines.join(' ')); box.appendChild(p); }
    });
    return box;
  }

  /* ---------- page meta (for article view) ---------- */
  function setMeta(sel, attr, val) { var m = document.querySelector(sel); if (m) m.setAttribute(attr, val); }

  function showArticle(p) {
    var banner = document.getElementById('blogBanner'); if (banner) banner.hidden = true;
    document.title = p.title + ' | College of Nursing GMC Prayagraj';
    var desc = p.excerpt || '';
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('link[rel="canonical"]', 'href', SITE + link(p.slug));
    setMeta('meta[property="og:title"]', 'content', p.title);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:url"]', 'content', SITE + link(p.slug));
    if (p.demo) { var r = document.createElement('meta'); r.name = 'robots'; r.content = 'noindex'; document.head.appendChild(r); }
    else {
      var ld = document.createElement('script'); ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date,
        author: { '@type': 'Person', name: p.author || 'College of Nursing' }, description: desc,
        publisher: { '@type': 'Organization', name: 'College of Nursing, Government Medical College, Prayagraj' } });
      document.head.appendChild(ld);
    }

    var art = el('article', 'post');
    var back = el('a', 'post-back', '← All articles'); back.href = 'blog.html'; art.appendChild(back);
    var top = el('div', 'blog-top'); top.appendChild(el('span', 'nb-cat ' + tint(p.category), p.category));
    if (p.demo) top.appendChild(el('span', 'nb-badge nb-demo', 'Demo article'));
    art.appendChild(top);
    art.appendChild(el('h1', 'post-title', p.title));
    var meta = el('p', 'post-meta');
    var t = el('time', '', fmt(p.date)); t.setAttribute('datetime', p.date || ''); meta.appendChild(t);
    meta.appendChild(document.createTextNode((p.author ? ' · By ' + p.author : '') + ' · ' + mins(p) + ' min read'));
    art.appendChild(meta);
    if (p.demo) art.appendChild(el('p', 'post-demo', 'This is demo content created to show the layout. It is not an official college announcement.'));
    var src = safeSrc(p.cover);
    if (src) { var fg = el('figure', 'post-cover'); var im = new Image(); im.alt = p.coverAlt || p.title; im.src = src; im.decoding = 'async';
      im.addEventListener('error', function () { fg.remove(); }, { once: true }); fg.appendChild(im); art.appendChild(fg); }
    art.appendChild(renderBody(p.body));

    var rel = POSTS.filter(function (x) { return x.slug !== p.slug; });
    rel.sort(function (a, b) { return (b.category === p.category) - (a.category === p.category); });
    rel = rel.slice(0, 3);
    if (rel.length) {
      var aside = el('aside', 'related'); aside.appendChild(el('h2', '', 'Related articles'));
      var g = el('div', 'blog-grid'); rel.forEach(function (x, i) { g.appendChild(card(x, i)); }); aside.appendChild(g); art.appendChild(aside);
    }
    root.innerHTML = ''; root.appendChild(art);
    window.scrollTo(0, 0);
  }

  function showList() {
    var cat = 'All', q = '', shown = 9, PAGE = 9;
    root.innerHTML = '';
    var tools = el('div', 'nb-tools');
    var chips = el('div', 'chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Filter by category');
    var search = el('input', 'nb-search'); search.type = 'search'; search.placeholder = 'Search articles…'; search.setAttribute('aria-label', 'Search articles');
    tools.appendChild(chips); tools.appendChild(search);
    var count = el('p', 'nb-count'); count.setAttribute('aria-live', 'polite');
    var grid = el('div', 'blog-grid');
    var more = el('button', 'btn btn-outline nb-more', 'Load more articles'); more.type = 'button';
    root.appendChild(tools); root.appendChild(count); root.appendChild(grid); root.appendChild(more);

    function res() { return POSTS.filter(function (p) {
      if (cat !== 'All' && p.category !== cat) return false;
      return !q || (p.title + ' ' + (p.excerpt || '') + ' ' + p.category).toLowerCase().indexOf(q) >= 0; }); }
    function draw() {
      var r = res(); grid.innerHTML = '';
      r.slice(0, shown).forEach(function (p, i) { grid.appendChild(card(p, i)); });
      if (!r.length) grid.appendChild(el('p', 'nb-empty', POSTS.length ? 'No articles match your search.' : 'No articles have been published yet.'));
      count.textContent = r.length + (r.length === 1 ? ' article' : ' articles');
      more.hidden = r.length <= shown;
    }
    function chipsDraw() {
      chips.innerHTML = '';
      ['All'].concat(CATS.filter(function (c) { return POSTS.some(function (p) { return p.category === c; }); })).forEach(function (c) {
        var b = el('button', 'chip' + (c === cat ? ' is-active' : ''), c); b.type = 'button'; b.setAttribute('aria-pressed', String(c === cat));
        b.addEventListener('click', function () { cat = c; shown = PAGE; chipsDraw(); draw(); }); chips.appendChild(b);
      });
    }
    search.addEventListener('input', function () { q = search.value.trim().toLowerCase(); shown = PAGE; draw(); });
    more.addEventListener('click', function () { shown += PAGE; draw(); });
    chipsDraw(); draw();
  }

  var slug = new URLSearchParams(location.search).get('post');
  if (slug) {
    var post = POSTS.filter(function (p) { return p.slug === slug; })[0];
    if (post) showArticle(post);
    else { root.innerHTML = ''; var nf = el('div', 'post'); nf.appendChild(el('h1', 'post-title', 'Article not found'));
      nf.appendChild(el('p', '', 'The article you are looking for does not exist or has been moved.'));
      var b = el('a', 'btn btn-primary', 'View all articles'); b.href = 'blog.html'; nf.appendChild(b); root.appendChild(nf); }
  } else showList();
})();
