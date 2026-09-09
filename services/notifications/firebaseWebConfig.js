/**
 * Firebase **web** client configuration.
 *
 * Unlike the backend service-account key (which must never reach the client),
 * these values are public web-app config and are safe to ship in the bundle.
 * Fill them from your Firebase project: Project settings → General → "Your apps"
 * → Web app. The VAPID key is under Cloud Messaging → "Web Push certificates".
 *
 * Values are read from `EXPO_PUBLIC_*` env vars first (so CI / .env can supply
 * them) and fall back to the inline literals below.
 *
 * IMPORTANT: `public/firebase-messaging-sw.js` needs the same config — keep the
 * two in sync (the service worker cannot import this module).
 */
export const firebaseWebConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'REPLACE_WITH_WEB_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'REPLACE_PROJECT.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'REPLACE_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'REPLACE_PROJECT.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'REPLACE_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'REPLACE_WEB_APP_ID',
};

export const firebaseVapidKey =
  process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY || 'REPLACE_WITH_WEB_PUSH_VAPID_KEY';

export function isWebConfigComplete() {
  return (
    !Object.values(firebaseWebConfig).some((v) => !v || String(v).startsWith('REPLACE')) &&
    !firebaseVapidKey.startsWith('REPLACE')
  );
}
