// تبدیلِ یک نقطه‌ی نقشه به آدرسِ خوانا — با دو منبع و یک ترتیبِ مشخص.
//
// چرا این فایل هست: `services/neshan.js` برای ژئوکدینگِ معکوس به کلیدِ
// `service.*` نشان نیاز دارد و آن کلید در این مخزن تنظیم نشده. نتیجه این بود
// که انتخابِ نقطه روی نقشه *هیچ* فیلدی را پر نمی‌کرد، در حالی که خودِ صفحه
// وعده‌ی «آدرس خودکار پر می‌شود» را می‌داد.
//
// ترتیب:
//   1) نشان (اگر کلیدِ سرویس ست شده باشد) — بهترین نتیجه برای ایران، و تنها
//      منبعی که «منطقه‌ی شهرداری» را می‌دهد؛ همان چیزی که فرم می‌خواهد.
//   2) ژئوکدرِ سیستم‌عامل از راهِ expo-location — کلید نمی‌خواهد و روی
//      دستگاهِ واقعی کار می‌کند.
//   3) هیچ — صفحه به «فقط مختصات» تنزل می‌کند و کاربر آدرس را دستی می‌نویسد.
import { Platform } from 'react-native';
import * as Location from 'expo-location';

import { extractZoneNumber, hasNeshanServiceKey, reverseGeocode } from './neshan';

/**
 * ژئوکدرِ سیستم‌عامل روی وب وجود ندارد (expo-location آنجا کلیدِ گوگل می‌خواهد)،
 * پس روی وب فقط نشان می‌ماند.
 */
export const isReverseGeocodeAvailable = () => hasNeshanServiceKey() || Platform.OS !== 'web';

const clean = (value) => String(value ?? '').trim();

/** قطعه‌های تکراری/خالی را دور می‌ریزد و با ویرگولِ فارسی به هم می‌چسباند. */
const joinParts = (parts) => {
  const seen = [];
  parts.map(clean).forEach((part) => {
    if (part && !seen.includes(part)) seen.push(part);
  });
  return seen.join('، ');
};

/** «منطقه» فقط وقتی پذیرفته می‌شود که واقعاً عددِ منطقه‌ی شهرداری باشد. */
const asRegionNumber = (value) => {
  const zone = extractZoneNumber(value);
  const number = Number(zone);
  return zone && number >= 1 && number <= 22 ? zone : '';
};

/**
 * ژئوکدرِ سیستم‌عامل. خروجی‌اش استاندارد نیست و بسته به دستگاه فرق می‌کند،
 * پس هر فیلدی که نبود ساده نادیده گرفته می‌شود.
 */
const osReverseGeocode = async (latitude, longitude) => {
  if (Platform.OS === 'web') return null;

  const places = await Location.reverseGeocodeAsync({ latitude, longitude });
  const place = Array.isArray(places) ? places[0] : null;
  if (!place) return null;

  const street = joinParts([place.street || place.name, place.streetNumber]);
  const formatted = joinParts([place.city, place.district, place.subregion, street]);
  if (!formatted) return null;

  return {
    formatted,
    city: clean(place.city || place.subregion),
    neighbourhood: clean(place.district),
    region: asRegionNumber(place.district || place.subregion),
    number: clean(place.streetNumber),
    postalCode: clean(place.postalCode),
    source: 'device',
  };
};

/**
 * نقطه → آدرس.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{formatted: string, city: string, region: string, neighbourhood: string, number?: string, source: string} | null>}
 *   `null` وقتی هیچ منبعی جواب نداد — خطا پرتاب نمی‌شود.
 */
export const resolvePoint = async (latitude, longitude) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const fromNeshan = await reverseGeocode(latitude, longitude);
  if (fromNeshan?.formatted) {
    return {
      ...fromNeshan,
      region: asRegionNumber(fromNeshan.region),
      source: 'neshan',
    };
  }

  try {
    return await osReverseGeocode(latitude, longitude);
  } catch (error) {
    console.warn('[geocoding] device reverse geocode failed:', error?.message);
    return null;
  }
};

export default { resolvePoint, isReverseGeocodeAvailable };
