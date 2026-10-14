// ردیف‌های خلاصه‌ی سفارش سازمانی (بخش «نمایش / استعلام / ثبت سفارش»).
//
// بند ۴ سند «توضیحات نسخه دسکتاپ ۲»: برای «نرم افزار / سخت افزار (پیش فرض)» و
// همه‌ی انتخاب‌های چندگانه فقط تعداد («۱») نوشته می‌شد، نه خود متن گزینه‌ها؛ و
// توضیحی که کاربر برای هر قلم «تامین کالا» یا «خدمات سخت‌افزاری» نوشته بود
// (مثلاً «ماوس» برای لوازم جانبی) اصلاً در خلاصه نمی‌آمد. همین خلاصه به‌عنوان
// `description` سفارش برای سرور فرستاده می‌شود، پس پنل هم همان «۱» را می‌دید.
//
// توابع خالص‌اند و عنوان‌ها را با تابع ترجمه‌ی ورودی (L / LO) می‌سازند.

const titleIn = (options, id) => options.find((option) => option.id === id)?.title || id;

const trimmed = (value) => String(value || '').trim();

/** متن گزینه‌های انتخاب‌شده، جداشده با «، ». */
export const selectedTitles = (options, selected) => {
  const ids = Array.isArray(selected) ? selected : selected == null ? [] : [selected];
  return ids.map((id) => titleIn(options || [], id)).join('، ');
};

/**
 * ردیف‌های «تامین تجهیزات / کالا»: تعداد آکبند و کارکرده، و توضیح کاربر.
 * @param {Record<string, {new?: number, used?: number, desc?: string}>} entries
 * @param {Array<{id: string, title: string}>} catalog عنوان‌های ترجمه‌شده
 * @param {(fa: string) => string} L
 */
export const procurementLines = (entries, catalog, L) => {
  const lines = [];
  catalog.forEach((item) => {
    const entry = entries?.[item.id];
    if (!entry) return;
    const hasCount = entry.new > 0 || entry.used > 0;
    if (entry.new > 0) lines.push({ label: `${item.title} / ${L('آکبند')}`, value: entry.new });
    if (entry.used > 0) lines.push({ label: `${item.title} / ${L('کارکرده')}`, value: entry.used });
    if (hasCount && trimmed(entry.desc)) {
      lines.push({ label: `${item.title} / ${L('توضیحات')}`, value: trimmed(entry.desc) });
    }
  });
  return lines;
};

/**
 * ردیف‌های شمارشی با توضیح (خدمات سخت‌افزاری / نرم‌افزاری): «عنوان: تعداد» و
 * در صورت وجود، «عنوان / توضیحات: متن».
 * @param {Record<string, {count?: number, desc?: string}>} entries
 * @param {Array<{id: string, title: string}>} catalog
 * @param {(fa: string) => string} L
 */
export const counterLines = (entries, catalog, L) => {
  const lines = [];
  catalog.forEach((item) => {
    const entry = entries?.[item.id];
    if (!(entry?.count > 0)) return;
    lines.push({ label: item.title, value: entry.count });
    if (trimmed(entry.desc)) {
      lines.push({ label: `${item.title} / ${L('توضیحات')}`, value: trimmed(entry.desc) });
    }
  });
  return lines;
};

/** عنوان قلم رسید با توضیح کاربر: «لوازم جانبی (ماوس)». */
export const titleWithNote = (title, desc) =>
  trimmed(desc) ? `${title} (${trimmed(desc)})` : title;
