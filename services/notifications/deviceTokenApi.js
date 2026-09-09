/**
 * Backend registration for FCM device tokens.
 *
 * Endpoints (see `FIREBASE_NOTIFICATIONS.md`):
 *   POST   /api/notifications/device-token   — register / refresh
 *   DELETE /api/notifications/device-token   — remove (on logout)
 *
 * Both are authenticated with the Sanctum bearer token, which the shared
 * axios instance injects from AsyncStorage, so callers never pass it here.
 */
import axios from '@services/axiosConfig';
import { uri } from '@services/URL';

export const DEVICE_TOKEN_ENDPOINT = `${uri}/notifications/device-token`;

const ALLOWED_PLATFORMS = ['android', 'ios', 'web'];

function assertValid(token, platform) {
  if (!token || typeof token !== 'string') {
    throw new Error('device token is required');
  }
  if (!ALLOWED_PLATFORMS.includes(platform)) {
    throw new Error(`platform must be one of ${ALLOWED_PLATFORMS.join(', ')}`);
  }
}

/**
 * @param {{ token: string, platform: 'android'|'ios'|'web', deviceId?: string, appVersion?: string }} input
 */
export async function registerDeviceToken({ token, platform, deviceId, appVersion }) {
  assertValid(token, platform);

  const body = { token, platform };
  if (deviceId) body.device_id = deviceId;
  if (appVersion) body.app_version = appVersion;

  const { data } = await axios.post(DEVICE_TOKEN_ENDPOINT, body);
  return data;
}

/**
 * @param {{ token: string, platform: 'android'|'ios'|'web' }} input
 */
export async function unregisterDeviceToken({ token, platform }) {
  assertValid(token, platform);

  const { data } = await axios.request({
    url: DEVICE_TOKEN_ENDPOINT,
    method: 'DELETE',
    data: { token, platform },
  });
  return data;
}
