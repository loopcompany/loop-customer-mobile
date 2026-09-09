# Firebase push notifications — app side

Implementation of the backend contract in [`../FIREBASE_NOTIFICATIONS.md`](../FIREBASE_NOTIFICATIONS.md).
The backend sends via **FCM HTTP v1**; the app only handles the Firebase **client**
SDK, the device token, and routing a tap to the right screen.

## What was added

| Area | File |
| --- | --- |
| Orchestrator (public API) | `services/notifications/index.js` |
| Native transport (iOS/Android) | `services/notifications/messaging.native.js` — `@react-native-firebase/messaging` + `expo-notifications` for foreground display |
| Web transport | `services/notifications/messaging.web.js` — `firebase/messaging` + `public/firebase-messaging-sw.js` |
| Backend register/unregister | `services/notifications/deviceTokenApi.js` → `POST` / `DELETE /api/notifications/device-token` |
| Tap → screen mapping (pure) | `services/notifications/notificationRouting.js` |
| `device_id` / `app_version` | `services/notifications/deviceInfo.js` |
| Background handler | `services/notifications/backgroundHandler.js`, registered in `index.js` |
| React lifecycle | `hooks/usePushNotifications.js` + `components/PushNotificationProvider.js` (mounted in `App.js`) |
| Logout cleanup | `services/TokenManager.js` → `clearAuthData()` calls `unregisterForPushNotifications()` |
| Config plugins | `app.json` — `expo-notifications`, `@react-native-firebase/app`, `@react-native-firebase/messaging`, `expo-build-properties` (`ios.useFrameworks: static`) |
| Tests | `services/notifications/__tests__/*` — `npm test` |

### Flow

1. `PushNotificationProvider` (below `AuthInitializer`, so the restored token is in
   the store) mounts `usePushNotifications`.
2. **Listeners** attach once: foreground messages are re-shown as a local
   notification; a tap (background or cold start) is routed via
   `resolveNotificationTarget(data)` → `navigationRef.navigate(...)`, queued until
   the navigator is ready.
3. **Registration** runs whenever `state.auth.token` becomes non-null (login,
   account switch): permission → `messaging().getToken()` →
   `POST /api/notifications/device-token`. `onTokenRefresh` re-sends a rotated
   token. Same token is never POSTed twice.
4. **Logout**: `TokenManager.clearAuthData()` `DELETE`s the token (while the bearer
   token is still in storage) and calls `messaging().deleteToken()`.

`data.type` / `data.screen` → route mapping lives in `notificationRouting.js`;
extend the two maps there when the backend adds event kinds. Only whitelisted
`data` keys are turned into route params — the raw payload is never spread.

## One-time setup before the first native build

The config plugins need real Firebase files — the build fails without them (by
design). `google-services.json` / `GoogleService-Info.plist` are Firebase
**client** config (not the secret backend key) and are committed so EAS cloud
builds include them; the `.example` files are templates showing the shape.

### 1. Firebase project

1. Create / open a Firebase project (same one the backend's `FIREBASE_PROJECT_ID`
   points at).
2. **Add an Android app**, package `com.clpiran.loop` → download
   `google-services.json` → repo root (next to `app.json`).
3. **Add an iOS app**, bundle id `com.clpiran.loop` → download
   `GoogleService-Info.plist` → repo root.
4. iOS only: Project settings → **Cloud Messaging** → upload an **APNs auth key**
   (`.p8`) from the Apple Developer portal.
5. **Add a Web app** → copy the config object + generate a **Web Push
   certificate** (VAPID key).

### 2. Web config

Fill `services/notifications/firebaseWebConfig.js` (or set `EXPO_PUBLIC_FIREBASE_*`
env vars) **and** the matching literals in `public/firebase-messaging-sw.js`
(a service worker can't import the module). Web push also needs HTTPS.

### 3. Notification icon (Android, optional but recommended)

Add a 96×96 white-on-transparent `assets/notification-icon.png`, then set it in
`app.json`:

```jsonc
["expo-notifications", { "icon": "./assets/notification-icon.png", "color": "#ffffff" }]
```

Without it Android ≥ 8 shows a white square.

### 4. Build

```bash
npx expo prebuild --clean      # sanity-check the config resolves
eas build --profile development --platform android   # or ios
```

Firebase messaging does **not** work in Expo Go — a dev-client or production build
is required. `isPushSupported()` returns `false` in Expo Go / simulators and every
entry point no-ops.

## Manual device test checklist

With a development build on a physical device and the backend reachable:

1. **Permission + registration** — log in. Accept the OS prompt. Confirm
   `POST /api/notifications/device-token` returns `success: true` (check the
   backend `notification_device_tokens` table for the row, right `platform`).
2. **Foreground** — send an order-event notification (e.g. change an order's
   status) with the app open. A banner appears; tapping it opens the order detail
   screen with the right `orderId`.
3. **Background** — background the app, trigger a notification. It appears in the
   tray; tapping it foregrounds the app on the order detail screen.
4. **Quit / cold start** — swipe the app away, trigger a notification, tap it.
   The app launches straight to the target screen.
5. **Token refresh** — `messaging().deleteToken()` from a debug button (or
   reinstall); confirm a new token is POSTed automatically.
6. **Logout** — log out. Confirm `DELETE /api/notifications/device-token` fires and
   the backend row is gone. Notifications to that device stop.
7. **Account switch** — log in as user A, then user B on the same device. The
   token moves to user B (backend detaches it from A). A no longer receives B's
   notifications.
8. **iOS** — repeat 1–4 on an iOS device (needs the APNs key uploaded).
9. **Web** — `npm run build:web`, serve over HTTPS, repeat 1–3. The service
   worker handles background; `notificationclick` focuses/opens the tab.

## Troubleshooting

- **Build fails on `GoogleService-Info.plist` / `google-services.json` not found** —
  add the real files (step 1).
- **`iOS` build fails linking Firebase** — `expo-build-properties` must keep
  `ios.useFrameworks: "static"`; run `expo prebuild --clean`.
- **Token registers but nothing arrives** — token valid? FCM/APNs enabled in
  Firebase? OS permission granted? foreground handler running? (mirrors the
  backend doc's §5).
- **Android: notification shows a white square** — add the notification icon
  (step 3).
- **Web: no token** — config incomplete (`isWebConfigComplete()` is `false`),
  not HTTPS, or the browser blocked notifications.
