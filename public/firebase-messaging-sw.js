// Taste of Village - Background Notification Service Worker (FCM Web Push)
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: "taste-of-village-21052",
  appId: "1:299893522694:web:1726d5d4dd2337c6ba5e87",
  messagingSenderId: "299893522694",
});

const messaging = firebase.messaging();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const title = payload.notification?.title || payload.data?.title || 'Taste of Village';
  const body = payload.notification?.body || payload.data?.body || 'You have an update on your order.';
  const icon = payload.notification?.icon || payload.data?.icon || '/assets/tov-sign-logo.png';
  const tag = payload.data?.tag || payload.data?.orderId || 'tov-order-notification';
  const targetUrl = payload.data?.url || (payload.data?.orderId ? `/track/${payload.data.orderId}` : '/');

  const notificationOptions = {
    body,
    icon,
    badge: '/assets/tov-sign-logo.png',
    vibrate: [200, 100, 200, 100, 400],
    tag,
    renotify: true,
    data: {
      url: targetUrl,
      orderId: payload.data?.orderId,
      ...payload.data,
    },
    actions: [
      {
        action: 'open_order',
        title: 'View Order Tracker',
      },
    ],
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Notification click event: focus existing window or open order tracking URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = data.url || (data.orderId ? `/track/${data.orderId}` : '/');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open with the site, focus it and navigate
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (client.url.includes(targetUrl) || client.url.includes('tasteofvillage')) {
            client.focus();
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
            return;
          }
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
