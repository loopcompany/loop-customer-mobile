/**
 * Where can push actually run?
 *
 * Two native pieces are needed and *neither* exists in Expo Go:
 *
 *   - `@react-native-firebase/messaging` — `getMessaging()` throws
 *     "Native module NativeRNFBTurboApp is not registered".
 *   - `expo-notifications` — since SDK 53 the module *throws on import* on
 *     Android in Expo Go: its `DevicePushTokenAutoRegistration.fx` side-effect
 *     module registers a push-token listener at module scope, and that call
 *     hard-errors with "Android Push notifications (remote notifications)
 *     functionality provided by expo-notifications was removed from Expo Go".
 *
 * Because the second one fails at *import* time, guarding the call sites is not
 * enough — the modules must not be required at all unless push is available.
 * That is what this module is for: everything under `services/notifications/`
 * requires the native modules lazily, behind `isPushRuntimeAvailable()`.
 *
 * Push needs a development build or a production build. Expo Go, simulators and
 * emulators all degrade to a silent no-op.
 */
import { isRunningInExpoGo } from 'expo';
import * as Device from 'expo-device';

export { isRunningInExpoGo };

/** True only where the FCM + expo-notifications native modules really exist. */
export function isPushRuntimeAvailable() {
  return Device.isDevice && !isRunningInExpoGo();
}
