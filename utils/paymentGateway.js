import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

/**
 * باز کردن درگاه پرداخت بدون خارج شدن از برنامه.
 *
 * Opening the gateway with `Linking.openURL` handed the user to an *external*
 * browser app: our task went to the background, Android was free to kill the
 * process on a low-memory device, and the deep link back then cold-started the
 * app — splash video, `Welcome`, entry menu — instead of returning to the order
 * the user had just paid for. Chrome Custom Tabs (Android) and
 * `ASWebAuthenticationSession` (iOS) run *inside* our own task, so the app
 * stays alive and the same screen continues after the payment.
 *
 * `WebBrowser.openAuthSessionAsync` also hands the redirect URL straight back
 * to the caller, which is more reliable than waiting for the `url` deep-link
 * event. The event listener is still installed as a backup: on some devices the
 * OS delivers the deep link to the app before the browser session resolves, and
 * whichever arrives first wins — `settle()` makes sure the result is handled
 * exactly once.
 *
 * Known tradeoff on iOS: `openAuthSessionAsync` shows the system
 * "«لوپ» می‌خواهد از ... استفاده کند" consent sheet before the gateway opens.
 * That is accepted deliberately — it is the same flow the wallet top-up screen
 * has been shipping, and it is the only iOS API that reports the redirect back.
 */

/** مهلت کوتاه بعد از بسته شدن مرورگر، تا لینک عمیقِ دیررس هم برسد. */
const DEEP_LINK_GRACE_MS = 800;

/**
 * آدرس بازگشتی که به بک‌اند فرستاده می‌شود (`linking_url` / `linkingUrl`).
 *
 * @returns {string}
 */
export function createPaymentRedirectUrl() {
  return Linking.createURL('/?');
}

/**
 * وضعیت پرداخت را از آدرس بازگشت می‌خواند.
 *
 * @param {string|null|undefined} url
 * @returns {'OK'|'NOK'|null} `null` یعنی این آدرس نتیجه‌ی پرداخت نیست.
 */
export function parsePaymentStatus(url) {
  if (!url) return null;

  try {
    const { queryParams } = Linking.parse(url);
    const status = queryParams?.status;
    return status === 'OK' || status === 'NOK' ? status : null;
  } catch {
    return null;
  }
}

/**
 * @typedef {object} PaymentSession
 * @property {Promise<boolean>} opened - `false` یعنی درگاه اصلاً باز نشد.
 * @property {() => void} close - پاک‌سازی (مثلاً در unmount). بعد از آن نتیجه‌ای گزارش نمی‌شود.
 */

/**
 * درگاه را باز می‌کند و نتیجه را دقیقاً یک بار به `onResult` می‌دهد.
 *
 * @param {object} params
 * @param {string} params.paymentUrl - آدرس درگاه که بک‌اند برگردانده.
 * @param {string} params.redirectUrl - همان `linking_url` که به بک‌اند فرستاده شد.
 * @param {(status: 'OK'|'NOK'|null) => void} params.onResult - `null` یعنی کاربر
 *   بدون نتیجه برگشت (مرورگر را بست)؛ فراخوان باید حالت loading را آزاد کند.
 * @returns {PaymentSession}
 */
export function openPaymentGateway({ paymentUrl, redirectUrl, onResult }) {
  let settled = false;
  let graceTimer = null;
  let subscription = Linking.addEventListener('url', ({ url }) => {
    const status = parsePaymentStatus(url);
    if (status) settle(status);
  });

  const cleanup = () => {
    if (subscription) {
      subscription.remove();
      subscription = null;
    }
    if (graceTimer) {
      clearTimeout(graceTimer);
      graceTimer = null;
    }
  };

  function settle(status) {
    if (settled) return;
    settled = true;
    cleanup();
    onResult?.(status);
  }

  const run = async () => {
    try {
      if (Platform.OS === 'web') {
        // روی وب، تب فعلی به درگاه می‌رود و بازگشت یک بارگذاری کامل است؛
        // چیزی برای زنده نگه داشتن وجود ندارد.
        await Linking.openURL(paymentUrl);
        return true;
      }

      const result = await WebBrowser.openAuthSessionAsync(paymentUrl, redirectUrl);

      if (result?.type === 'success') {
        settle(parsePaymentStatus(result.url));
      } else if (!settled) {
        // کاربر مرورگر را بست. کمی صبر می‌کنیم چون ممکن است لینک عمیق
        // یک لحظه بعد برسد و نتیجه‌ی واقعی را بیاورد.
        graceTimer = setTimeout(() => settle(null), DEEP_LINK_GRACE_MS);
      }

      return true;
    } catch {
      cleanup();
      settled = true;
      return false;
    }
  };

  return {
    opened: run(),
    close: () => {
      settled = true;
      cleanup();
    },
  };
}

export default openPaymentGateway;
