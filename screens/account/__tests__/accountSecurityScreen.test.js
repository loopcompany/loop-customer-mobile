/**
 * (متن‌ها فارسی‌اند چون زبان پیش‌فرض اپ در تست هم فارسی است.)
 *
 * «امنیت حساب» تا وقتی endpointهایش روی سرور نیست باید «به‌زودی» نشان دهد،
 * نه خطا - و وقتی هست، داده‌ی واقعی را.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureStore } from '@reduxjs/toolkit';

import AccountSecurityScreen from '../AccountSecurityScreen';
import * as api from '@services/AccountSecurityApi';

jest.mock('@services/AccountSecurityApi', () => ({
  ...jest.requireActual('@services/AccountSecurityApi'),
  getSecuritySummary: jest.fn(),
  listDevices: jest.fn(),
  listActivities: jest.fn(),
  listSessions: jest.fn(),
  listSecurityAlerts: jest.fn(),
  getDeletionRequest: jest.fn(),
  getAlertSettings: jest.fn(),
}));

jest.mock('@components/ScreenHeaders', () => () => null);
jest.mock('@contexts/MenuContext', () => ({
  ...jest.requireActual('@contexts/MenuContext'),
  useMenu: () => ({ footerSpace: 0 }),
}));

const NOT_FOUND = { ok: false, status: 404 };
const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const makeStore = (userType = 'organization') =>
  configureStore({
    reducer: {
      auth: (s = { token: 'tok', userType }) => s,
      user: (s = { data: { id: 1 } }) => s,
    },
  });

const render = async (params, userType) => {
  let tree;
  await act(async () => {
    tree = TestRenderer.create(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <Provider store={makeStore(userType)}>
          <AccountSecurityScreen navigation={{ navigate: jest.fn() }} route={{ params }} />
        </Provider>
      </SafeAreaProvider>
    );
  });
  return tree;
};

const texts = (tree) =>
  tree.root
    .findAllByType('Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .filter(Boolean);

beforeEach(() => {
  jest.clearAllMocks();
  Object.values(api).forEach((fn) => {
    if (typeof fn?.mockResolvedValue === 'function') fn.mockResolvedValue(NOT_FOUND);
  });
});

describe('AccountSecurityScreen', () => {
  it('lists all nine sections', async () => {
    const tree = await render();
    const all = texts(tree);
    [
      'تأیید دومرحله‌ای',
      'تغییر رمز عبور',
      'دستگاه‌های واردشده',
      'خروج از سایر دستگاه‌ها',
      'فعالیت‌های اخیر حساب',
      'مدیریت نشست‌ها',
      'تأیید شماره موبایل',
      'هشدارهای امنیتی',
      'حذف حساب سازمان / شرکت',
    ].forEach((title) => expect(all).toContain(title));
  });

  it('shows "coming soon" instead of an error when the backend has no endpoint', async () => {
    const tree = await render({ section: 'devices' });
    expect(api.listDevices).toHaveBeenCalled();
    expect(texts(tree)).toContain('این بخش به‌زودی فعال می‌شود.');
  });

  it('renders real devices once the endpoint exists', async () => {
    api.listDevices.mockResolvedValue({
      ok: true,
      data: [
        { id: 1, device_model: 'Samsung Galaxy A25', is_current: true },
        { id: 2, device_model: 'iPhone 13', is_current: false },
      ],
    });
    const tree = await render({ section: 'devices' });
    const all = texts(tree);
    expect(all).toContain('Samsung Galaxy A25');
    expect(all).toContain('iPhone 13');
    // فقط دستگاهِ غیرفعلی دکمه‌ی خروج دارد.
    expect(all.filter((text) => text === 'خروج از این دستگاه')).toHaveLength(1);
  });

  it('hides session management when the backend says sessions are not tracked', async () => {
    api.getSecuritySummary.mockResolvedValue({ ok: true, data: { sessions_supported: false } });
    const tree = await render();
    expect(texts(tree)).not.toContain('مدیریت نشست‌ها');
  });

  it('labels deletion for individual users without the admin-approval wording', async () => {
    const tree = await render(undefined, 'individual');
    expect(texts(tree)).toContain('حذف حساب کاربری');
  });
});
