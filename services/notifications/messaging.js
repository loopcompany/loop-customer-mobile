/**
 * Platform-resolution fallback for `./messaging`.
 *
 * Metro always resolves `messaging.native.js` (iOS/Android) or
 * `messaging.web.js` (web) ahead of this file, so it should never be the one
 * that actually loads at runtime. It exists for tooling that ignores the
 * platform extensions (Jest, plain Node) — those either mock this module or
 * hit the safe no-op surface below.
 */
export const isSupported = () => false;
export const getPlatform = () => 'android';
export const ensureAndroidChannels = async () => {};
export const requestPermission = async () => false;
export const getToken = async () => null;
export const deleteToken = async () => {};
export const onTokenRefresh = () => () => {};
export const onForegroundMessage = () => () => {};
export const onNotificationOpened = () => () => {};
export const getInitialNotificationData = async () => null;
