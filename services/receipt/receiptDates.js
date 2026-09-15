// قالب‌بندی تاریخ/ساعت مخصوص رسید.
//
// در طرحِ رسید تاریخ همیشه شمسیِ صفرپرشده با فاصله دور اسلش است («1404 / 08 / 08»)
// و ساعت با فاصله دور دونقطه («16 : 45»). هیچ‌کدام از فرمترهای helpers/Common.js
// دقیقاً این شکل را نمی‌دهند (formatJalaaliDate صفر نمی‌گذارد و ساعت را می‌چسباند)،
// ولی تبدیل تقویم از همان‌جا می‌آید - این فایل تبدیل تازه‌ای ننوشته است.

import { toJalaali } from 'jalaali-js';
import { parsePickerDate } from '@helpers/Common';

const padZero = (value) => String(value).padStart(2, '0');

/**
 * هر ورودی تاریخی (Date، ISO سرور، یا رشته‌ی DatePicker شمسی/میلادی) را به
 * Date میلادی تبدیل می‌کند.
 *
 * @param {Date|string|number|null|undefined} value
 * @returns {Date|null}
 */
const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  // رشته‌های DatePicker اپ (هم شمسی هم میلادی) را parsePickerDate می‌فهمد.
  const picked = parsePickerDate(value);
  if (picked) return picked;

  // ISO سرور («2025-10-30T16:45:00Z») از مسیر بالا رد نمی‌شود چون بخش زمان دارد.
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * تاریخ رسید - «1404 / 08 / 08».
 *
 * @param {Date|string|number|null|undefined} value
 * @returns {string|null} null وقتی ورودی قابل تفسیر نیست، تا کامپوننت بتواند
 *   به‌جای تاریخِ غلط، «نامشخص» نشان دهد.
 */
export const toReceiptDate = (value) => {
  const date = toDate(value);
  if (!date) return null;
  const { jy, jm, jd } = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${jy} / ${padZero(jm)} / ${padZero(jd)}`;
};

/**
 * ساعت رسید - «16 : 45».
 *
 * @param {Date|string|number|null|undefined} value
 * @returns {string|null}
 */
export const toReceiptTime = (value) => {
  const date = toDate(value);
  if (!date) return null;
  return `${padZero(date.getHours())} : ${padZero(date.getMinutes())}`;
};

/** تاریخ امروز به قالب رسید - «تاریخ صدور / نمایش». */
export const todayReceiptDate = () => toReceiptDate(new Date());
