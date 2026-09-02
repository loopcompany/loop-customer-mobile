/**
 * Push-notification orchestration — the module the rest of the app talks to.
 *
 * Lifecycle:
 *   - `registerForPushNotifications()` after login: permission → FCM token →
 *     `POST /api/notifications/device-token`, and wire the token-refresh
 *     listener so a rotated token is re-sent.
 *   - `unregisterForPushNotifications()` before logout: `DELETE` the token from
 *     the backend and drop it from the device.
 *   - `attachNotificationListeners({ onOpen })` once, near app start: foreground
 *     display + tap routing (background and cold-start).
 *
 * Everything is a safe no-op where push isn't supported (Expo Go, web without
 * config, simulators), so callers don't need their own guards.
 */
import * as adapter from './messaging';
import { registerDeviceToken, unregisterDeviceToken } from './deviceTokenApi';
import { getAppVersion, getInstallationId } from './deviceInfo';
import { resolveNotificationTarget } from './notificationRouting';

export { resolveNotificationTarget };

export function isPushSupported() {
  try {
    return adapter.isSupported();
  } catch {
    return false;
  }
}

const state = {
  lastSyncedToken: null,
  tokenRefreshUnsub: null,
};

async function syncToken(fcmToken) {
  if (!fcmToken || fcmToken === state.lastSyncedToken) return;
  const [deviceId, appVersion] = [await getInstallationId(), getAppVersion()];
  await registerDeviceToken({
    token: fcmToken,
    platform: adapter.getPlatform(),
    deviceId,
    appVersion,
  });
  state.lastSyncedToken = fcmToken;
}

/**
 * Idempotent. Returns `true` once a token has been registered with the backend.
 */
export async function registerForPushNotifications() {
  if (!isPushSupported()) return false;

  const granted = await adapter.requestPermission();
  if (!granted) {
    console.warn('[push] notification permission not granted');
    return false;
  }

  await adapter.ensureAndroidChannels();

  const token = await adapter.getToken();
  if (!token) return false;

  try {
    await syncToken(token);
  } catch (e) {
    console.warn('[push] failed to register device token with backend', e?.message ?? e);
    return false;
  }

  if (!state.tokenRefreshUnsub) {
    state.tokenRefreshUnsub = adapter.onTokenRefresh((next) => {
      syncToken(next).catch((e) =>
        console.warn('[push] failed to sync refreshed token', e?.message ?? e)
      );
    });
  }

  return true;
}

/**
 * Best-effort teardown — never throws, so it can't block logout.
 */
export async function unregisterForPushNotifications() {
  if (!isPushSupported()) return;

  const token = state.lastSyncedToken || (await adapter.getToken().catch(() => null));

  if (token) {
    try {
      await unregisterDeviceToken({ token, platform: adapter.getPlatform() });
    } catch (e) {
      console.warn('[push] failed to unregister device token', e?.message ?? e);
    }
  }

  await adapter.deleteToken();

  if (state.tokenRefreshUnsub) {
    state.tokenRefreshUnsub();
    state.tokenRefreshUnsub = null;
  }
  state.lastSyncedToken = null;
}

/**
 * Wire foreground display + tap handling. `onOpen(data)` is called with the raw
 * FCM `data` object whenever a notification is tapped (running or cold start).
 * Returns an unsubscribe function.
 */
export function attachNotificationListeners({ onOpen }) {
  if (!isPushSupported()) return () => {};

  const subs = [adapter.onForegroundMessage()];

  if (typeof onOpen === 'function') {
    subs.push(adapter.onNotificationOpened(onOpen));
    adapter
      .getInitialNotificationData()
      .then((data) => {
        if (data) onOpen(data);
      })
      .catch(() => {});
  }

  return () => subs.forEach((u) => typeof u === 'function' && u());
}

/** Testing seam. */
export const __setStateForTests = (patch) => Object.assign(state, patch);
