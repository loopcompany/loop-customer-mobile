import http from '@services/axiosConfig';
import {
  DEVICE_TOKEN_ENDPOINT,
  registerDeviceToken,
  unregisterDeviceToken,
} from '@services/notifications/deviceTokenApi';

jest.mock('@services/axiosConfig', () => ({
  __esModule: true,
  default: { post: jest.fn(), request: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  http.post.mockResolvedValue({ data: { success: true, data: { id: 12, platform: 'android' } } });
  http.request.mockResolvedValue({ data: { success: true } });
});

describe('registerDeviceToken', () => {
  it('POSTs token + platform and the optional fields when present', async () => {
    const res = await registerDeviceToken({
      token: 'fcm-abc',
      platform: 'android',
      deviceId: 'install-1',
      appVersion: '1.0.0',
    });

    expect(http.post).toHaveBeenCalledWith(DEVICE_TOKEN_ENDPOINT, {
      token: 'fcm-abc',
      platform: 'android',
      device_id: 'install-1',
      app_version: '1.0.0',
    });
    expect(res).toEqual({ success: true, data: { id: 12, platform: 'android' } });
  });

  it('omits device_id / app_version when not provided', async () => {
    await registerDeviceToken({ token: 'fcm-abc', platform: 'ios' });
    expect(http.post).toHaveBeenCalledWith(DEVICE_TOKEN_ENDPOINT, {
      token: 'fcm-abc',
      platform: 'ios',
    });
  });

  it('rejects an invalid platform', async () => {
    await expect(registerDeviceToken({ token: 'x', platform: 'windows' })).rejects.toThrow(
      /platform must be one of/
    );
    expect(http.post).not.toHaveBeenCalled();
  });

  it('rejects a missing token', async () => {
    await expect(registerDeviceToken({ platform: 'android' })).rejects.toThrow(/token is required/);
  });

  it('targets the documented endpoint path', () => {
    expect(DEVICE_TOKEN_ENDPOINT).toMatch(/\/api\/notifications\/device-token$/);
  });
});

describe('unregisterDeviceToken', () => {
  it('sends a DELETE with token + platform in the body', async () => {
    await unregisterDeviceToken({ token: 'fcm-abc', platform: 'web' });
    expect(http.request).toHaveBeenCalledWith({
      url: DEVICE_TOKEN_ENDPOINT,
      method: 'DELETE',
      data: { token: 'fcm-abc', platform: 'web' },
    });
  });
});
