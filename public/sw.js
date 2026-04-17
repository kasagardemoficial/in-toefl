// In-TOEFL Service Worker — Push Notifications
const CACHE_NAME = 'intoefl-v1';

// Install
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification received
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'In-TOEFL';
  const options = {
    body: data.body || 'Hora de estudar! Sua lição de hoje está esperando.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'intoefl-reminder',
    renotify: true,
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'study', title: '📖 Estudar agora' },
      { action: 'later', title: '⏰ Depois' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'study' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          if (client.url.includes('intoefl') && 'focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(event.notification.data.url || '/');
      })
    );
  }
});
