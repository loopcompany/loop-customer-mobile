import * as adapter from '@services/notifications/messaging';
import { registerDeviceToken, unregisterDeviceToken } from '@services/notifications/deviceTokenApi';
import * as mod from '@services/notifications';

jest.mock('@services/notifications/messaging', () => ({
  isSupported: jest.fn(() => true),
  getPlatform: jest.fn(() => 'android'),
  ensureAndroidChannels: jest.fn(async () => {}),
  requestPermission: jest.fn(async () => true),
  getToken: jest.fn(async () => 'fcm-1'),
  deleteToken: jest.fn(async () => {}),
  onTokenRefresh: jest.fn(() => jest.fn()),
  onForegroundMessage: jest.fn(() => jest.fn()),
  onNotificationOpened: jest.fn(() => jest.fn()),
  getInitialNotificationData: jest.fn(async () => null),
}));

jest.mock('@services/notifications/deviceTokenApi', () => ({
  registerDeviceToken: jest.fn(async () => ({ success: true })),
  unregisterDeviceToken: jest.fn(async () => ({ success: true })),
}));

jest.mock('@services/notifications/deviceInfo', () => ({
  getInstallationId: jest.fn(async () => 'install-1'),
  getAppVersion: jest.fn(() => '1.0.0'),
}));

beforeEach(() => {
  jest.clearAllMocks();
  // reset the module's internal singleton state between tests
  mod.__setStateForTests({ lastSyncedToken: null, tokenRefreshUnsub: null });
  adapter.isSupported.mockReturnValue(true);
  adapter.getPlatform.mockReturnValue('android');
  adapter.requestPermission.mockResolvedValue(true);
  adapter.getToken.mockResolvedValue('fcm-1');
  adapter.getInitialNotificationData.mockResolvedValue(null);
});

describe('registerForPushNotifications', () => {
  it('requests permission, gets a token and registers it with the backend', async () => {
    const ok = await mod.registerForPushNotifications();
    expect(ok).toBe(true);
    expect(adapter.requestPermission).toHaveBeenCalled();
    expect(registerDeviceToken).toHaveBeenCalledWith({
      token: 'fcm-1',
      platform: 'android',
      deviceId: 'install-1',
      appVersion: '1.0.0',
    });
  });

  it('does not re-POST the same token twice', async () => {
    await mod.registerForPushNotifications();
    await mod.registerForPushNotifications();
    expect(registerDeviceToken).toHaveBeenCalledTimes(1);
  });

  it('bails out (no backend call) when permission is denied', async () => {
    adapter.requestPermission.mockResolvedValue(false);
    const ok = await mod.registerForPushNotifications();
    expect(ok).toBe(false);
    expect(registerDeviceToken).not.toHaveBeenCalled();
  });

  it('returns false when no FCM token is available', async () => {
    adapter.getToken.mockResolvedValue(null);
    expect(await mod.registerForPushNotifications()).toBe(false);
    expect(registerDeviceToken).not.toHaveBeenCalled();
  });

  it('wires a token-refresh listener that re-syncs a rotated token', async () => {
    let refreshCb;
    adapter.onTokenRefresh.mockImplementation((cb) => {
      refreshCb = cb;
      return jest.fn();
    });
    await mod.registerForPushNotifications();
    expect(adapter.onTokenRefresh).toHaveBeenCalledTimes(1);

    await refreshCb('fcm-2');
    expect(registerDeviceToken).toHaveBeenLastCalledWith(
      expect.objectContaining({ token: 'fcm-2' })
    );
  });

  it('is a no-op when push is unsupported', async () => {
    adapter.isSupported.mockReturnValue(false);
    expect(await mod.registerForPushNotifications()).toBe(false);
    expect(adapter.requestPermission).not.toHaveBeenCalled();
  });
});

describe('unregisterForPushNotifications', () => {
  it('DELETEs the token from the backend and drops it from the device', async () => {
    await mod.registerForPushNotifications();
    await mod.unregisterForPushNotifications();
    expect(unregisterDeviceToken).toHaveBeenCalledWith({ token: 'fcm-1', platform: 'android' });
    expect(adapter.deleteToken).toHaveBeenCalled();
  });

  it('never throws even if the backend call fails', async () => {
    unregisterDeviceToken.mockRejectedValueOnce(new Error('network'));
    await mod.registerForPushNotifications();
    await expect(mod.unregisterForPushNotifications()).resolves.toBeUndefined();
    expect(adapter.deleteToken).toHaveBeenCalled();
  });
});

describe('attachNotificationListeners', () => {
  it('subscribes to foreground + open events and replays a cold-start tap', async () => {
    const data = { screen: 'order-detail', order_id: '7' };
    adapter.getInitialNotificationData.mockResolvedValue(data);
    const onOpen = jest.fn();

    const detach = mod.attachNotificationListeners({ onOpen });
    await Promise.resolve();
    await Promise.resolve();

    expect(adapter.onForegroundMessage).toHaveBeenCalled();
    expect(adapter.onNotificationOpened).toHaveBeenCalledWith(onOpen);
    expect(onOpen).toHaveBeenCalledWith(data);
    expect(typeof detach).toBe('function');
  });
});
