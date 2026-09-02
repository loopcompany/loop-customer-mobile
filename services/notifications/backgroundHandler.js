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
 */
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

export function registerPushBackgroundHandler() {
  try {
    setBackgroundMessageHandler(getMessaging(), async () => {
      // Data-only messages land here. Add handling if the backend starts
      // sending any; `notification`-block messages need nothing from us.
    });
  } catch (e) {
    console.warn('[push] could not register background handler', e?.message ?? e);
  }
}
