const CACHE_NAME = 'philosophy-app-v1';
const urlsToCache = [
  'ph-index.html',
  'ph-style.css',
  'ph-main.js',
  'ph-data.json',
  'alyamama.ttf',
  'magrabi.ttf',
  'img.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح التخزين المؤقت');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// استرجاع الملفات من التخزين المؤقت
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع الملف من التخزين إذا وجد
        if (response) {
          return response;
        }
        // إذا لم يوجد، قم بتحميله من الشبكة
        return fetch(event.request).then(
          response => {
            // لا نقوم بتخزين الملفات الجديدة تلقائياً
            return response;
          }
        );
      })
  );
});

// تحديث Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});