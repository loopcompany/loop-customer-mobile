// اشتراک‌گذاری متن/لینک، روی هر سه پلتفرم.
//
// `Share` از react-native روی وب کار نمی‌کند: react-native-web خودش خطای
// «Share is not supported in this browser» را پرتاب می‌کند. بنابراین روی وب
// اول Web Share API امتحان می‌شود (روی موبایل‌ها و بیشتر مرورگرهای مدرن هست)
// و اگر نبود، متن در کلیپ‌بورد کپی می‌شود تا کاربر بدون بازخورد نماند.

import { Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

/**
 * نتیجه‌ی اشتراک‌گذاری:
 *   shared    - از طریق دیالوگ سیستم/مرورگر به اشتراک گذاشته شد
 *   copied    - اشتراک‌گذاری در دسترس نبود، متن کپی شد
 *   dismissed - کاربر خودش منصرف شد (خطا نیست)
 *   failed    - هیچ‌کدام ممکن نشد
 */
export const SHARE_RESULT = {
  SHARED: 'shared',
  COPIED: 'copied',
  DISMISSED: 'dismissed',
  FAILED: 'failed',
};

/** لغو توسط کاربر - نباید مثل خطا گزارش شود. */
const isDismissal = (error) => {
  const name = error?.name || '';
  const message = String(error?.message || '');
  return name === 'AbortError' || /abort|cancel|dismiss/i.test(message);
};

/** آخرین تلاش: کپی در کلیپ‌بورد. */
const copyToClipboard = async (text) => {
  try {
    await Clipboard.setStringAsync(text);
    return SHARE_RESULT.COPIED;
  } catch {
    return SHARE_RESULT.FAILED;
  }
};

/**
 * @param {object} input
 * @param {string} input.message متنی که به اشتراک گذاشته می‌شود.
 * @param {string} [input.title] عنوان دیالوگ (فقط جایی که پلتفرم پشتیبانی کند).
 * @returns {Promise<string>} یکی از SHARE_RESULT.
 */
export const shareContent = async ({ message, title }) => {
  if (!message) return SHARE_RESULT.FAILED;

  if (Platform.OS === 'web') {
    const nav = typeof navigator === 'undefined' ? null : navigator;

    // Web Share API - روی اندروید/iOS و مرورگرهای دسکتاپِ جدید موجود است و
    // فقط در بستر امن (https یا localhost) کار می‌کند.
    if (nav?.share) {
      try {
        await nav.share({ text: message, title });
        return SHARE_RESULT.SHARED;
      } catch (error) {
        if (isDismissal(error)) return SHARE_RESULT.DISMISSED;
        // در غیر این صورت به کپی برمی‌گردیم - مثلاً وقتی مرورگر اجازه نمی‌دهد.
      }
    }
    return copyToClipboard(message);
  }

  try {
    const result = await Share.share({ message, title });
    return result?.action === Share.dismissedAction ? SHARE_RESULT.DISMISSED : SHARE_RESULT.SHARED;
  } catch (error) {
    if (isDismissal(error)) return SHARE_RESULT.DISMISSED;
    return copyToClipboard(message);
  }
};

export default shareContent;
