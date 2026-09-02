/**
 * Native (iOS / Android) messaging adapter.
 *
 * Wraps `@react-native-firebase/messaging` (v26 — modular API only) for token +
 * transport, and `expo-notifications` for *foreground* display and channels.
 * Background / quit-state notifications carrying a `notification` block are
 * drawn by the OS itself; RNFirebase only needs `setBackgroundMessageHandler`
 * registered (done in `index.js`).
 *
 * Every export is also defined in `messaging.web.js` with the same signature —
 * `services/notifications/index.js` imports `./messaging` and Metro resolves
 * the right file per platform.
 */
import {
  AuthorizationStatus,
  deleteToken as fbDeleteToken,
  getInitialNotification,
  getMessaging,
  getToken as fbGetToken,
  isDeviceRegisteredForRemoteMessages,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh as fbOnTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission as fbRequestPermission,
} from '@react-native-firebase/messaging';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { extractData } from './notificationRouting';

const fcm = getMessaging();

/** Show a banner + play sound even when the app is foregrounded. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function isSupported() {
  // Firebase messaging is not available in Expo Go; a dev/production build is
  // required. `Constants.appOwnership === 'expo'` means we're in Expo Go.
  return Device.isDevice && Constants.appOwnership !== 'expo';
}

export function getPlatform() {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

let channelsReady = false;
export async function ensureAndroidChannels() {
  if (Platform.OS !== 'android' || channelsReady) return;
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
    if (!isDeviceRegisteredForRemoteMessages(fcm)) {
      await registerDeviceForRemoteMessages(fcm);
    }
    const status = await fbRequestPermission(fcm);
    return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
  }

  // Android — expo-notifications drives the POST_NOTIFICATIONS runtime prompt.
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted' && existing.canAskAgain !== false) {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  return status === 'granted';
}

export async function getToken() {
  try {
    return await fbGetToken(fcm);
  } catch (e) {
    console.warn('[push] getToken failed', e);
    return null;
  }
}

export async function deleteToken() {
  try {
    await fbDeleteToken(fcm);
  } catch (e) {
    console.warn('[push] deleteToken failed', e);
  }
}

export function onTokenRefresh(cb) {
  return fbOnTokenRefresh(fcm, cb);
}

/** Re-present a foreground message as a local notification. */
async function presentForeground(remoteMessage) {
  const { notification, data } = remoteMessage ?? {};
  const title = notification?.title ?? data?.title;
  const body = notification?.body ?? data?.body;
  if (!title && !body) return; // data-only message, nothing to show
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
  return onMessage(fcm, presentForeground);
}

/**
 * Fires when the user taps a notification and the app was already running
 * (background). Covers both an OS-drawn FCM notification and a local
 * notification we presented in the foreground.
 */
export function onNotificationOpened(cb) {
  const unsubFcm = onNotificationOpenedApp(fcm, (message) => cb(extractData(message)));
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) =>
    cb(extractData(response))
  );
  return () => {
    unsubFcm();
    responseSub.remove();
  };
}

/** The notification (if any) that launched the app from a fully quit state. */
export async function getInitialNotificationData() {
  const fcmMessage = await getInitialNotification(fcm);
  if (fcmMessage) return extractData(fcmMessage);
  const last = await Notifications.getLastNotificationResponseAsync();
  if (last) return extractData(last);
  return null;
}
