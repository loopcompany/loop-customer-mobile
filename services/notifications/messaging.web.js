/**
 * Web messaging adapter (Firebase JS SDK).
 *
 * Same export surface as `messaging.native.js`. Web push needs:
 *   - a filled-in `firebaseWebConfig` + VAPID key
 *   - `public/firebase-messaging-sw.js` served from the site root
 *   - a secure context (https or localhost) and a browser that supports the
 *     Push API + service workers
 *
 * When any of that is missing every call degrades to a safe no-op so the app
 * keeps working without notifications.
 */
import { initializeApp, getApps } from 'firebase/app';
import {
  deleteToken as fbDeleteToken,
  getMessaging,
  getToken as fbGetToken,
  isSupported as fbIsSupported,
  onMessage,
} from 'firebase/messaging';

import { firebaseVapidKey, firebaseWebConfig, isWebConfigComplete } from './firebaseWebConfig';
import { extractData } from './notificationRouting';

const SW_URL = '/firebase-messaging-sw.js';

let supportPromise = null;
let messagingInstance = null;
let swRegistration = null;

async function resolveSupport() {
  if (supportPromise) return supportPromise;
  supportPromise = (async () => {
    if (typeof window === 'undefined' || !isWebConfigComplete()) return false;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return false;
    try {
      return await fbIsSupported();
    } catch {
      return false;
    }
  })();
  return supportPromise;
}

async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;
  if (!(await resolveSupport())) return null;
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseWebConfig);
  swRegistration = await navigator.serviceWorker.register(SW_URL);
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export function isSupported() {
  // Synchronous best-effort; the async guards above do the real check.
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    isWebConfigComplete()
  );
}

export function getPlatform() {
  return 'web';
}

export async function ensureAndroidChannels() {
  /* no-op on web */
}

export async function requestPermission() {
  if (!(await resolveSupport())) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function getToken() {
  const instance = await getMessagingInstance();
  if (!instance) return null;
  try {
    return await fbGetToken(instance, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: swRegistration,
    });
  } catch (e) {
    console.warn('[push] web getToken failed', e);
    return null;
  }
}

export async function deleteToken() {
  const instance = await getMessagingInstance();
  if (!instance) return;
  try {
    await fbDeleteToken(instance);
  } catch (e) {
    console.warn('[push] web deleteToken failed', e);
  }
}

export function onTokenRefresh() {
  // The web SDK has no token-refresh event. Callers re-fetch on next launch.
  return () => {};
}

export function onForegroundMessage() {
  let unsub = () => {};
  getMessagingInstance().then((instance) => {
    if (!instance) return;
    unsub = onMessage(instance, (payload) => {
      const { title, body } = payload.notification ?? {};
      if ((title || body) && Notification.permission === 'granted' && swRegistration) {
        swRegistration.showNotification(title ?? '', {
          body: body ?? '',
          data: payload.data ?? {},
        });
      }
    });
  });
  return () => unsub();
}

export function onNotificationOpened(cb) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return () => {};
  const handler = (event) => {
    if (event.data?.type === 'notification-click') {
      cb(extractData({ data: event.data.data }));
    }
  };
  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
}

export async function getInitialNotificationData() {
  // The service worker stashes the payload of a click that opened the tab.
  try {
    const raw = window.sessionStorage.getItem('pendingNotification');
    if (raw) {
      window.sessionStorage.removeItem('pendingNotification');
      return extractData({ data: JSON.parse(raw) });
    }
  } catch {
    /* ignore */
  }
  return null;
}
