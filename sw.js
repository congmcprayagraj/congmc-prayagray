/* sw.js — service worker for the College of Nursing website.
   Makes the site installable and usable offline.
   • Pages, CSS, JS and data files: network first (you always see the newest version when online), cached copy when offline.
   • Photos and fonts: cache first (fast, saves mobile data).
   Change CACHE below (e.g. con-v2) if you ever need to force every phone to clear its old copy. */
const CACHE = 'con-v1';
const MAX_GALLERY_ITEMS = 150;

const SHELL = [
  './', 'index.html', 'notices.html', 'blog.html', 'gallery.html', 'offline.html',
  'styles.css', 'enhance.css', 'gallery.css', 'content.css',
  'script.js', 'enhance.js', 'gallery.js', 'notices.js', 'blog.js',
  'data/gallery-manifest.js', 'data/notices-data.js', 'data/blog-data.js',
  'college-logo.png', 'principal-photo.png',
  'college-photo-66.png', 'college-photo-67.png', 'college-photo-68.png', 'college-photo-69.png',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // add one by one so a single missing file never blocks installation
      Promise.all(SHELL.map((u) => cache.add(u).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(request, timeoutMs) {
  const nav = request.mode === 'navigate';
  return new Promise((resolve) => {
    let settled = false;
    const fromCache = () =>
      caches.match(request, { ignoreSearch: nav })
        .then((hit) => hit || (nav ? caches.match('offline.html') : null));
    const timer = setTimeout(() => {
      fromCache().then((hit) => { if (hit && !settled) { settled = true; resolve(hit); } });
    }, timeoutMs);
    fetch(request).then((res) => {
      clearTimeout(timer);
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
      }
      if (!settled) { settled = true; resolve(res); }
    }).catch(() => {
      clearTimeout(timer);
      if (settled) return;
      fromCache().then((hit) => { settled = true; resolve(hit || Response.error()); });
    });
  });
}

function cacheFirst(request) {
  return caches.match(request).then((hit) => {
    if (hit) return hit;
    return fetch(request).then((res) => {
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).then(trimGallery);
      }
      return res;
    });
  });
}

function trimGallery() {
  return caches.open(CACHE).then((cache) =>
    cache.keys().then((keys) => {
      const photos = keys.filter((r) => new URL(r.url).pathname.includes('/gallery/'));
      const extra = photos.length - MAX_GALLERY_ITEMS;
      return extra > 0 ? Promise.all(photos.slice(0, extra).map((r) => cache.delete(r))) : null;
    })
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;           // Google Fonts, Instagram etc. are left to the browser
  if (url.pathname.endsWith('.pdf')) return;                  // notice PDFs are always fetched live
  if (url.pathname.endsWith('/sw.js')) return;

  const type = request.destination;
  if (type === 'image' || type === 'font') {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request, request.mode === 'navigate' ? 4000 : 6000));
  }
});
