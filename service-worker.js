const CACHE_NAME = 'gymhub-cache-v1';
const urlsToCache = [
  '/site-de-treino/',
  '/site-de-treino/index.html',
  '/site-de-treino/imagens/logo.png',
  '/site-de-treino/imagens/A.png',
  '/site-de-treino/imagens/B.png',
  '/site-de-treino/imagens/C.png',
  '/site-de-treino/imagens/D.png',
  '/site-de-treino/videos/fundo2.mp4',
  'https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'
];

// Instalação do Service Worker e cache dos arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições para usar o cache ou buscar na rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Retorna do cache
        }
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          // Clona a resposta e armazena no cache para uso futuro
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        }).catch(() => {
          // Se falhar (offline), tenta retornar do cache
          return caches.match(event.request);
        });
      })
  );
});