// منطق خالص تقویم (بدون رابط کاربری) برای CalendarPicker / DatePickerModal.
//
// هر تاریخ داخل این ماژول یک آبجکت {y, m, d} در همان سیستم تقویم است
// ('jalaali' یا 'gregorian'). رشته‌ی خروجی دقیقاً همان قالبی است که
// react-native-modern-datepicker قبلاً تولید می‌کرد تا هیچ صفحه‌ای که نتیجه را
// ذخیره یا به سرور می‌فرستد عوض نشود:
//   jalaali   → 'jYYYY/jMM/jDD' (ارقام لاتین)   مثل 1370/05/12
//   gregorian → 'YYYY/MM/DD'                     مثل 1991/08/03
import jalaali from 'jalaali-js';

export const JALAALI = 'jalaali';
export const GREGORIAN = 'gregorian';

export const JALAALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];
export const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
// ستون‌های هفته به ترتیب نمایش: شمسی از شنبه، میلادی از یکشنبه.
export const JALAALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const GREGORIAN_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// اگر کران پایینی داده نشود، فهرست سال‌ها این تعداد سال به عقب می‌رود
// (برای تاریخ تولد کافی است).
export const DEFAULT_YEAR_SPAN = 100;

const PERSIAN_ARABIC_DIGITS = /[۰-۹٠-٩]/g;
const toLatinDigits = (text) =>
  String(text).replace(PERSIAN_ARABIC_DIGITS, (ch) => {
    const code = ch.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });

const pad = (n) => String(n).padStart(2, '0');

export const monthLength = (system, y, m) =>
  system === JALAALI ? jalaali.jalaaliMonthLength(y, m) : new Date(y, m, 0).getDate();

const toGregorianDate = (system, { y, m, d }) => {
  if (system === JALAALI) {
    const g = jalaali.toGregorian(y, m, d);
    return new Date(g.gy, g.gm - 1, g.gd);
  }
  return new Date(y, m - 1, d);
};

export const fromGregorianDate = (system, date) => {
  if (system === JALAALI) {
    const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return { y: jy, m: jm, d: jd };
  }
  return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
};

const isValid = (system, { y, m, d }) =>
  Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d) &&
  m >= 1 && m <= 12 && d >= 1 && d <= monthLength(system, y, m);

/**
 * هر رشته‌ی تاریخ (شمسی یا میلادی، با / یا -، با ارقام فارسی یا لاتین، حتی با
 * بخش ساعت) را به {y,m,d} در سیستم خواسته‌شده تبدیل می‌کند. سال کمتر از ۱۷۰۰
 * شمسی فرض می‌شود - همان قاعده‌ی parsePickerDate در helpers/Common.js.
 */
export const parseDate = (value, system) => {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : fromGregorianDate(system, value);
  const match = toLatinDigits(value).trim().match(/^(\d{3,4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) return null;
  const parts = { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  const sourceSystem = parts.y < 1700 ? JALAALI : GREGORIAN;
  if (!isValid(sourceSystem, parts)) return null;
  if (sourceSystem === system) return parts;
  return fromGregorianDate(system, toGregorianDate(sourceSystem, parts));
};

export const formatDate = (system, { y, m, d }) => `${y}/${pad(m)}/${pad(d)}`;

export const dayKey = ({ y, m, d }) => y * 10000 + m * 100 + d;

export const today = (system, now = new Date()) => fromGregorianDate(system, now);

/**
 * @returns {{ min: object|null, max: object|null, minYear: number, maxYear: number }}
 * minYear/maxYear بازه‌ی فهرست سال‌هاست؛ همیشه سالِ انتخاب‌شده را هم در بر می‌گیرد.
 */
export const resolveBounds = (system, { minimumDate, maximumDate, selected, now = new Date() } = {}) => {
  const min = parseDate(minimumDate, system);
  const max = parseDate(maximumDate, system);
  const current = today(system, now);
  let maxYear = max ? max.y : current.y;
  let minYear = min ? min.y : maxYear - DEFAULT_YEAR_SPAN;
  if (selected) {
    if (!max) maxYear = Math.max(maxYear, selected.y);
    if (!min) minYear = Math.min(minYear, selected.y);
  }
  return { min, max, minYear, maxYear: Math.max(minYear, maxYear) };
};

export const isDayDisabled = (date, { min, max }) =>
  Boolean((min && dayKey(date) < dayKey(min)) || (max && dayKey(date) > dayKey(max)));

// یک ماه کامل خارج از بازه است (نه فقط بخشی از آن).
export const isMonthDisabled = (system, y, m, { min, max }) => {
  const first = { y, m, d: 1 };
  const last = { y, m, d: monthLength(system, y, m) };
  return Boolean((min && dayKey(last) < dayKey(min)) || (max && dayKey(first) > dayKey(max)));
};

/** ماه نمایش‌داده‌شده را داخل بازه نگه می‌دارد. */
export const clampMonth = (y, m, { min, max }) => {
  const key = y * 100 + m;
  if (min && key < min.y * 100 + min.m) return { y: min.y, m: min.m };
  if (max && key > max.y * 100 + max.m) return { y: max.y, m: max.m };
  return { y, m };
};

export const addMonths = ({ y, m }, delta) => {
  const index = y * 12 + (m - 1) + delta;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
};

/**
 * خانه‌های جدول روزهای یک ماه، به ترتیب نمایش (شمسی: شنبه اول هفته).
 * خانه‌های خالی ابتدای ماه null هستند؛ طول آرایه مضرب ۷ است.
 */
export const monthGrid = (system, y, m) => {
  const firstWeekday = toGregorianDate(system, { y, m, d: 1 }).getDay(); // 0 = یکشنبه
  const offset = system === JALAALI ? (firstWeekday + 1) % 7 : firstWeekday;
  const cells = Array(offset).fill(null);
  for (let d = 1; d <= monthLength(system, y, m); d += 1) cells.push({ y, m, d });
  while (cells.length % 7) cells.push(null);
  return cells;
};

export const yearRange = ({ minYear, maxYear }) => {
  const years = [];
  for (let y = minYear; y <= maxYear; y += 1) years.push(y);
  return years;
};
