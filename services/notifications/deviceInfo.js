/**
 * Small helpers for the optional `device_id` / `app_version` fields the
 * device-token endpoint accepts.
 *
 * `device_id` is a random, app-generated installation id (not a hardware id),
 * persisted so the same install keeps the same id across launches. The backend
 * uses it only to de-duplicate tokens per device.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const INSTALLATION_ID_KEY = 'pushInstallationId';

function uuidv4() {
  // Not crypto-grade; only needs to be unique enough to key a device row.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let cachedId = null;

export async function getInstallationId() {
  if (cachedId) return cachedId;
  try {
    let id = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
    if (!id) {
      id = uuidv4();
      await AsyncStorage.setItem(INSTALLATION_ID_KEY, id);
    }
    cachedId = id;
    return id;
  } catch {
    // Storage unavailable — fall back to an ephemeral id rather than failing
    // the whole registration.
    cachedId = cachedId || uuidv4();
    return cachedId;
  }
}

export function getAppVersion() {
  return (
    Constants.expoConfig?.version ||
    Constants.manifest2?.extra?.expoClient?.version ||
    Constants.nativeAppVersion ||
    undefined
  );
}

export const __testables = { uuidv4, INSTALLATION_ID_KEY };
