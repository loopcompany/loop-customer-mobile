/**
 * `Share` از react-native روی مرورگر خطای «Share is not supported in this
 * browser» می‌داد و دکمه‌ی اشتراک‌گذاری روی وب عملاً کار نمی‌کرد. این تست
 * مسیرهای جایگزین را قفل می‌کند: Web Share API، و اگر نبود کلیپ‌بورد.
 */

import { Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { shareContent, SHARE_RESULT } from '../shareContent';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }));

const MESSAGE = 'شماره سفارش: 55689965';

/** Platform.OS فقط-خواندنی است؛ برای هر تست جایگزینش می‌کنیم. */
const setPlatform = (os) => {
  Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });
};

describe('shareContent روی وب', () => {
  beforeEach(() => {
    setPlatform('web');
    jest.clearAllMocks();
    delete global.navigator.share;
  });

  it('وقتی Web Share API هست، از آن استفاده می‌کند', async () => {
    global.navigator.share = jest.fn(async () => {});
    await expect(shareContent({ message: MESSAGE })).resolves.toBe(SHARE_RESULT.SHARED);
    expect(global.navigator.share).toHaveBeenCalledWith({ text: MESSAGE, title: undefined });
    expect(Clipboard.setStringAsync).not.toHaveBeenCalled();
  });

  it('وقتی Web Share API نیست، متن را کپی می‌کند', async () => {
    await expect(shareContent({ message: MESSAGE })).resolves.toBe(SHARE_RESULT.COPIED);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(MESSAGE);
  });

  it('انصراف کاربر خطا نیست و به کلیپ‌بورد هم نمی‌افتد', async () => {
    const abort = Object.assign(new Error('share canceled'), { name: 'AbortError' });
    global.navigator.share = jest.fn(async () => {
      throw abort;
    });
    await expect(shareContent({ message: MESSAGE })).resolves.toBe(SHARE_RESULT.DISMISSED);
    expect(Clipboard.setStringAsync).not.toHaveBeenCalled();
  });

  it('خطای واقعیِ مرورگر به کپی برمی‌گردد', async () => {
    global.navigator.share = jest.fn(async () => {
      throw new Error('Permission denied');
    });
    await expect(shareContent({ message: MESSAGE })).resolves.toBe(SHARE_RESULT.COPIED);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(MESSAGE);
  });
});

describe('shareContent روی موبایل', () => {
  beforeEach(() => {
    setPlatform('ios');
    jest.clearAllMocks();
  });

  it('از دیالوگ سیستم استفاده می‌کند', async () => {
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    await expect(shareContent({ message: MESSAGE })).resolves.toBe(SHARE_RESULT.SHARED);
    expect(Clipboard.setStringAsync).not.toHaveBeenCalled();
  });

  it('اگر دیالوگ سیستم شکست بخورد، متن کپی می‌شود', async () => {
    jest.spyOn(Share, 'share').mockRejectedValue(new Error('no activity found'));
    await expect(shareContent({ message: MESSAGE })).resolves.toBe(SHARE_RESULT.COPIED);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(MESSAGE);
  });
});

it('پیام خالی هیچ‌کاری نمی‌کند', async () => {
  await expect(shareContent({ message: '' })).resolves.toBe(SHARE_RESULT.FAILED);
});
