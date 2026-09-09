/**
 * Native (iOS / Android) messaging adapter.
 *
 * Wraps `@react-native-firebase/messaging` (v26 — modular API only) for token +
 * transport, and `expo-notifications` for *foreground* display and channels.
 * Background / quit-state notifications carrying a `notification` block are
 * drawn by the OS itself; RNFirebase only needs `setBackgroundMessageHandler`
 * registered (done in `index.js`).
 *
 * Both native modules are required **lazily**, behind `isPushRuntimeAvailable()`
 * — in Expo Go one throws when called and the other throws when merely
 * imported, so a top-level `import` would take the whole module down on
 * startup. See `pushEnvironment.js` for the details.
 *
 * Every export is also defined in `messaging.web.js` with the same signature —
 * `services/notifications/index.js` imports `./messaging` and Metro resolves
 * the right file per platform.
 */
import { Platform } from 'react-native';

import { extractData } from './notificationRouting';
import { isPushRuntimeAvailable } from './pushEnvironment';

export function isSupported() {
  return isPushRuntimeAvailable();
}

/** `@react-native-firebase/messaging` + its app instance, or null when unusable. */
let firebase = null;
function fb() {
  if (!isSupported()) return null;
  if (!firebase) {
    try {
      const api = require('@react-native-firebase/messaging');
      firebase = { api, app: api.getMessaging() };
    } catch (e) {
      console.warn('[push] firebase messaging unavailable', e?.message ?? e);
      return null;
    }
  }
  return firebase;
}

/** `expo-notifications`, or null when unusable. Also installs the handler once. */
let expoNotifications = null;
function notifications() {
  if (!isSupported()) return null;
  if (!expoNotifications) {
    try {
      expoNotifications = require('expo-notifications');
      /** Show a banner + play sound even when the app is foregrounded. */
      expoNotifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (e) {
      console.warn('[push] expo-notifications unavailable', e?.message ?? e);
      expoNotifications = null;
      return null;
    }
  }
  return expoNotifications;
}

export function getPlatform() {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

let channelsReady = false;
export async function ensureAndroidChannels() {
  if (Platform.OS !== 'android' || channelsReady) return;
  const Notifications = notifications();
  if (!Notifications) return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'عمومی',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
  await Notifications.setNotificationChannelAsync('orders', {
    name: 'سفارش‌ها',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
  channelsReady = true;
}

export async function requestPermission() {
  await ensureAndroidChannels();

  if (Platform.OS === 'ios') {
    const messaging = fb();
    if (!messaging) return false;
    const { api, app } = messaging;

    if (!api.isDeviceRegisteredForRemoteMessages(app)) {
      await api.registerDeviceForRemoteMessages(app);
    }
    const status = await api.requestPermission(app);
    return (
      status === api.AuthorizationStatus.AUTHORIZED ||
      status === api.AuthorizationStatus.PROVISIONAL
    );
  }

  // Android — expo-notifications drives the POST_NOTIFICATIONS runtime prompt.
  const Notifications = notifications();
  if (!Notifications) return false;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted' && existing.canAskAgain !== false) {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  return status === 'granted';
}

export async function getToken() {
  const messaging = fb();
  if (!messaging) return null;
  try {
    return await messaging.api.getToken(messaging.app);
  } catch (e) {
    console.warn('[push] getToken failed', e);
    return null;
  }
}

export async function deleteToken() {
  const messaging = fb();
  if (!messaging) return;
  try {
    await messaging.api.deleteToken(messaging.app);
  } catch (e) {
    console.warn('[push] deleteToken failed', e);
  }
}

export function onTokenRefresh(cb) {
  const messaging = fb();
  if (!messaging) return () => {};
  return messaging.api.onTokenRefresh(messaging.app, cb);
}

/** Re-present a foreground message as a local notification. */
async function presentForeground(remoteMessage) {
  const { notification, data } = remoteMessage ?? {};
  const title = notification?.title ?? data?.title;
  const body = notification?.body ?? data?.body;
  if (!title && !body) return; // data-only message, nothing to show

  const Notifications = notifications();
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: title ?? '', body: body ?? '', data: data ?? {} },
      trigger: null,
    });
  } catch (e) {
    console.warn('[push] failed to present foreground notification', e);
  }
}

export function onForegroundMessage() {
  const messaging = fb();
  if (!messaging) return () => {};
  return messaging.api.onMessage(messaging.app, presentForeground);
}

/**
 * Fires when the user taps a notification and the app was already running
 * (background). Covers both an OS-drawn FCM notification and a local
 * notification we presented in the foreground.
 */
export function onNotificationOpened(cb) {
  const messaging = fb();
  if (!messaging) return () => {};

  const unsubFcm = messaging.api.onNotificationOpenedApp(messaging.app, message =>
    cb(extractData(message))
  );

  const Notifications = notifications();
  const responseSub = Notifications?.addNotificationResponseReceivedListener(response =>
    cb(extractData(response))
  );

  return () => {
    unsubFcm();
    responseSub?.remove();
  };
}

/** The notification (if any) that launched the app from a fully quit state. */
export async function getInitialNotificationData() {
  const messaging = fb();
  if (!messaging) return null;

  const fcmMessage = await messaging.api.getInitialNotification(messaging.app);
  if (fcmMessage) return extractData(fcmMessage);

  const last = await notifications()?.getLastNotificationResponseAsync();
  if (last) return extractData(last);
  return null;
}
