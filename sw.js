const CACHE_NAME = 'philosophy-app-v2';
const DYNAMIC_CACHE = 'philosophy-dynamic-v2';
const urlsToCache = [
  'index.html',
  'ph-style.css',
  'ph-main.js',
  'ph-data.json',
  'alyamama.ttf',
  'img.jpg',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap',
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
      .catch(err => console.error('خطأ في تثبيت Service Worker:', err))
  );
});

// استرجاع الملفات من التخزين المؤقت مع استراتيجية Cache First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // تخزين الملفات الجديدة ديناميكياً
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        }).catch(() => {
          // عرض صفحة احتياطية في حالة عدم الاتصال
          if (event.request.destination === 'document') {
            return caches.match('index.html');
          }
        });
      })
  );
});

// تحديث Service Worker وحذف الكاشات القديمة
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
