// اقلام «تامین تجهیزات / کالا» برای `POST /orders/submit`.
//
// تا پیش از این، اقلام تامین کالا فقط در متن `description` سفارش می‌رفت و پنل
// نمی‌توانست برایشان قیمت اعلام کند. حالا ساختاریافته هم فرستاده می‌شوند تا پنل
// استعلام قیمت (پیش‌رسید تامین کالا، بند ۱۱ سند) را روی همین اقلام بسازد.
// عنوان همیشه فارسی است چون مخاطبش پنل است، نه زبان فعلی اپ.
import { PROCUREMENT_ITEMS } from './deviceCatalog';

const titleOf = (id) => PROCUREMENT_ITEMS.find((item) => item.id === id)?.title || id;

/**
 * @param {Record<string, {new?: number, used?: number, desc?: string}>} procurementItems
 * @returns {Array<{item_id: string, title: string, new_count: number, used_count: number, description: string|null}>}
 */
export const toProcurementItemsPayload = (procurementItems) =>
  Object.entries(procurementItems || {})
    .map(([id, entry]) => ({
      item_id: id,
      title: titleOf(id),
      new_count: Math.max(0, Number(entry?.new) || 0),
      used_count: Math.max(0, Number(entry?.used) || 0),
      description: String(entry?.desc || '').trim() || null,
    }))
    .filter((item) => item.new_count > 0 || item.used_count > 0);

/** فیلدهای اضافه‌ای که OrderSummaryScreen در بدنه‌ی ثبت سفارش می‌گذارد. */
export const ORDER_EXTRA_KEYS = ['procurement_items', 'delivery_mode', 'technician_gender'];

/**
 * فقط کلیدهای مجاز و غیرخالی را برمی‌دارد، تا پارامتر route نتواند فیلدهای اصلی
 * سفارش (address_id، total_price، ...) را بازنویسی کند.
 */
export const pickOrderExtras = (extras) =>
  ORDER_EXTRA_KEYS.reduce((acc, key) => {
    const value = extras?.[key];
    const empty = value == null || value === '' || (Array.isArray(value) && value.length === 0);
    if (!empty) acc[key] = value;
    return acc;
  }, {});
