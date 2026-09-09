/**
 * Thin binding checks for the native adapter — it mostly forwards to the
 * `@react-native-firebase/messaging` v26 modular API (mocked in jest.setup.js).
 */
import * as fb from '@react-native-firebase/messaging';

import * as adapter from '@services/notifications/messaging.native';

beforeEach(() => jest.clearAllMocks());

it('exposes the full adapter surface', () => {
  const surface = Object.keys(adapter).sort();
  expect(surface).toEqual(
    [
      'isSupported',
      'getPlatform',
      'ensureAndroidChannels',
      'requestPermission',
      'getToken',
      'deleteToken',
      'onTokenRefresh',
      'onForegroundMessage',
      'onNotificationOpened',
      'getInitialNotificationData',
    ].sort()
  );
  Object.values(adapter).forEach((fn) => expect(typeof fn).toBe('function'));
});

it('the fallback stub mirrors the native adapter surface', () => {
  const stub = require('@services/notifications/messaging');
  expect(Object.keys(stub).sort()).toEqual(Object.keys(adapter).sort());
});

it('getToken forwards to the modular getToken and swallows errors', async () => {
  fb.getToken.mockResolvedValueOnce('tok-123');
  expect(await adapter.getToken()).toBe('tok-123');

  fb.getToken.mockRejectedValueOnce(new Error('boom'));
  expect(await adapter.getToken()).toBeNull();
});

it('onTokenRefresh subscribes via the modular API', () => {
  const cb = jest.fn();
  adapter.onTokenRefresh(cb);
  expect(fb.onTokenRefresh).toHaveBeenCalledWith(expect.anything(), cb);
});

it('getPlatform returns a valid backend platform value', () => {
  expect(['android', 'ios']).toContain(adapter.getPlatform());
});
