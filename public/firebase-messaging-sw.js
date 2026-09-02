/* global importScripts, firebase, clients */
/**
 * Firebase Cloud Messaging service worker (web).
 *
 * Served from the site root as `/firebase-messaging-sw.js` (files in `public/`
 * are copied there by the Expo web export). Handles notifications while the tab
 * is closed or backgrounded, and routes a click back to the app.
 *
 * The config below MUST match `services/notifications/firebaseWebConfig.js`
 * (a service worker can't import app modules). Replace the REPLACE_* values.
 */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'REPLACE_WITH_WEB_API_KEY',
  authDomain: 'REPLACE_PROJECT.firebaseapp.com',
  projectId: 'REPLACE_PROJECT_ID',
  storageBucket: 'REPLACE_PROJECT.appspot.com',
  messagingSenderId: 'REPLACE_SENDER_ID',
  appId: 'REPLACE_WEB_APP_ID',
});

const messaging = firebase.messaging();

// Background messages that carry only `data` (no `notification` block) — draw
// them ourselves. Messages with a `notification` block are shown automatically.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title;
  const body = payload.notification?.body || payload.data?.body;
  if (!title && !body) return;
  self.registration.showNotification(title || '', {
    body: body || '',
    icon: '/favicon.png',
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'notification-click', data });
          return client.focus();
        }
      }
      // No open tab — store the payload so the app can pick it up on load.
      return clients.openWindow('/?notification=1').then((client) => {
        if (client) client.postMessage({ type: 'notification-click', data });
      });
    })
  );
});
