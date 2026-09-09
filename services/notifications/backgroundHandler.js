/**
 * FCM background / quit-state message handler.
 *
 * Must be registered from the JS entry point (`index.js`), before the React
 * tree mounts and outside any component — a hard requirement of
 * `@react-native-firebase/messaging`.
 *
 * Notifications that carry a `notification` block are drawn by the OS with no
 * work from us; this handler exists so RNFirebase doesn't warn, and so
 * data-only messages still get a chance to run. Keep it lightweight and fast —
 * a headless task only gets a few seconds.
 *
 * There is no FCM native module in Expo Go, so this is a silent no-op there
 * rather than a warning on every startup — `require` is deferred for the same
 * reason (see `pushEnvironment.js`).
 */
import { isPushRuntimeAvailable } from './pushEnvironment';

export function registerPushBackgroundHandler() {
  if (!isPushRuntimeAvailable()) return;

  try {
    const { getMessaging, setBackgroundMessageHandler } = require('@react-native-firebase/messaging');
    setBackgroundMessageHandler(getMessaging(), async () => {
      // Data-only messages land here. Add handling if the backend starts
      // sending any; `notification`-block messages need nothing from us.
    });
  } catch (e) {
    console.warn('[push] could not register background handler', e?.message ?? e);
  }
}
