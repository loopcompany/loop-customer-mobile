/**
 * ساعت/تاریخ رسید داخل متن فارسی («ساعت 17 : 53») نمایش داده می‌شود. بدون
 * علامت LRM در ابتدای رشته، الگوریتم دوطرفه‌ی یونیکد دو عددِ جداشده با « : » را
 * راست‌به‌چپ می‌چیند و کاربر «53 : 17» می‌بیند (بند ۱۳ سند کارفرما).
 */

import { toReceiptDate, toReceiptTime } from '../receiptDates';
import { formatDateTime, ltr } from '@helpers/Common';

const LRM = '‎';

describe('receipt dates keep their visual order inside Persian text', () => {
  const at = new Date(2026, 9, 6, 17, 53); // 1405/07/14 17:53 local

  it('marks the time so hour stays before minute', () => {
    expect(toReceiptTime(at)).toBe(`${LRM}17 : 53`);
  });

  it('marks the date as well', () => {
    expect(toReceiptDate(at)).toBe(`${LRM}1405 / 07 / 14`);
  });

  it('returns null, not a bare mark, for unreadable input', () => {
    expect(toReceiptTime('not a date')).toBeNull();
    expect(toReceiptDate(null)).toBeNull();
  });

  it('marks the shared Persian date-time formatter', () => {
    expect(formatDateTime(at.toISOString(), true)).toBe(`${LRM}1405/7/14 - 17:53`);
  });

  it('ltr() leaves empty values alone', () => {
    expect(ltr('')).toBe('');
    expect(ltr(null)).toBeNull();
    expect(ltr(undefined)).toBeUndefined();
  });
});
