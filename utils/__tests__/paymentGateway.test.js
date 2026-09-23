/**
 * باز کردن درگاه با `Linking.openURL` کاربر را به مرورگرِ بیرونی می‌فرستاد و
 * اندروید روی گوشی‌های کم‌حافظه پروسه‌ی اپ را می‌کشت؛ لینکِ بازگشت بعد از پرداخت
 * برنامه را از اول (ویدیوی اسپلش و منوی ورود) بالا می‌آورد. این تست قرارداد
 * جایگزین را قفل می‌کند: مرورگر درون‌برنامه‌ای، و نتیجه‌ای که دقیقاً یک بار
 * گزارش می‌شود — چه از خود مرورگر بیاید، چه از لینک عمیق.
 */

import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { openPaymentGateway, parsePaymentStatus } from '../paymentGateway';

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'loop://?'),
  parse: jest.fn((url) => {
    const query = String(url).split('?')[1] ?? '';
    const queryParams = Object.fromEntries(
      query
        .split('&')
        .filter(Boolean)
        .map((pair) => pair.split('='))
    );
    return { queryParams };
  }),
  addEventListener: jest.fn(),
  openURL: jest.fn(async () => true),
}));

jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));

const PAYMENT_URL = 'https://gateway.test/pay/123';
const REDIRECT_URL = 'loop://?';

/** Platform.OS فقط-خواندنی است؛ برای هر تست جایگزینش می‌کنیم. */
const setPlatform = (os) => {
  Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });
};

/** آخرین شنونده‌ی `url` که ماژول نصب کرده. */
let emitDeepLink;
let removeListener;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  setPlatform('android');
  removeListener = jest.fn();
  Linking.addEventListener.mockImplementation((_event, handler) => {
    emitDeepLink = handler;
    return { remove: removeListener };
  });
});

describe('parsePaymentStatus', () => {
  it('فقط OK و NOK را می‌شناسد', () => {
    expect(parsePaymentStatus('loop://?status=OK&x=1')).toBe('OK');
    expect(parsePaymentStatus('loop://?status=NOK')).toBe('NOK');
    expect(parsePaymentStatus('loop://?status=weird')).toBeNull();
    expect(parsePaymentStatus('loop://?')).toBeNull();
    expect(parsePaymentStatus(null)).toBeNull();
  });
});

describe('openPaymentGateway روی موبایل', () => {
  it('درگاه را در مرورگر درون‌برنامه‌ای باز می‌کند، نه با openURL', async () => {
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'loop://?status=OK',
    });
    const onResult = jest.fn();

    const session = openPaymentGateway({
      paymentUrl: PAYMENT_URL,
      redirectUrl: REDIRECT_URL,
      onResult,
    });

    await expect(session.opened).resolves.toBe(true);
    expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(PAYMENT_URL, REDIRECT_URL);
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledWith('OK');
  });

  it('نتیجه‌ی ناموفق را گزارش می‌کند', async () => {
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'loop://?status=NOK',
    });
    const onResult = jest.fn();

    const session = openPaymentGateway({
      paymentUrl: PAYMENT_URL,
      redirectUrl: REDIRECT_URL,
      onResult,
    });
    await session.opened;

    expect(onResult).toHaveBeenCalledWith('NOK');
  });

  it('اگر لینک عمیق زودتر برسد، نتیجه دو بار گزارش نمی‌شود', async () => {
    let resolveBrowser;
    WebBrowser.openAuthSessionAsync.mockReturnValue(
      new Promise((resolve) => {
        resolveBrowser = resolve;
      })
    );
    const onResult = jest.fn();

    const session = openPaymentGateway({
      paymentUrl: PAYMENT_URL,
      redirectUrl: REDIRECT_URL,
      onResult,
    });

    // سیستم‌عامل لینک را پیش از بسته شدن مرورگر تحویل می‌دهد.
    emitDeepLink({ url: 'loop://?status=OK' });
    resolveBrowser({ type: 'success', url: 'loop://?status=OK' });
    await session.opened;

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('OK');
    expect(removeListener).toHaveBeenCalled();
  });

  it('بستن مرورگر بدون نتیجه، بعد از مهلتِ کوتاه، null گزارش می‌کند', async () => {
    jest.useFakeTimers();
    WebBrowser.openAuthSessionAsync.mockResolvedValue({ type: 'dismiss' });
    const onResult = jest.fn();

    const session = openPaymentGateway({
      paymentUrl: PAYMENT_URL,
      redirectUrl: REDIRECT_URL,
      onResult,
    });
    await session.opened;

    expect(onResult).not.toHaveBeenCalled();

    jest.runAllTimers();
    expect(onResult).toHaveBeenCalledWith(null);
  });

  it('لینکِ دیررس بعد از بستن مرورگر هنوز برنده است', async () => {
    jest.useFakeTimers();
    WebBrowser.openAuthSessionAsync.mockResolvedValue({ type: 'dismiss' });
    const onResult = jest.fn();

    const session = openPaymentGateway({
      paymentUrl: PAYMENT_URL,
      redirectUrl: REDIRECT_URL,
      onResult,
    });
    await session.opened;

    emitDeepLink({ url: 'loop://?status=OK' });
    jest.runAllTimers();

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('OK');
  });

  it('بعد از close هیچ نتیجه‌ای گزارش نمی‌شود', async () => {
    WebBrowser.openAuthSessionAsync.mockResolvedValue({ type: 'dismiss' });
    const onResult = jest.fn();

    const session = openPaymentGateway({
      paymentUrl: PAYMENT_URL,
      redirectUrl: REDIRECT_URL,
      onResult,
    });
    session.close();
    await session.opened;
    emitDeepLink({ url: 'loop://?status=OK' });

    expect(onResult).not.toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalled();
  });

  it('خطای باز نشدن مرورگر را به فراخوان برمی‌گرداند', async () => {
    WebBrowser.openAuthSessionAsync.mockRejectedValue(new Error('no browser'));
    const onResult = jest.fn();

    const session = openPaymentGateway({
      paymentUrl: PAYMENT_URL,
      redirectUrl: REDIRECT_URL,
      onResult,
    });

    await expect(session.opened).resolves.toBe(false);
    expect(onResult).not.toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalled();
  });
});

describe('openPaymentGateway روی وب', () => {
  it('همان تب را به درگاه می‌برد', async () => {
    setPlatform('web');
    const onResult = jest.fn();

    const session = openPaymentGateway({
      paymentUrl: PAYMENT_URL,
      redirectUrl: REDIRECT_URL,
      onResult,
    });

    await expect(session.opened).resolves.toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith(PAYMENT_URL);
    expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
  });
});
