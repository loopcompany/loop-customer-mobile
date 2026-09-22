// محاسبه‌ی مبلغ پایه‌ی سفارش — قرارداد: FRONTEND_SERVICE_RATES.md
//
// این فایل تنها جایی است که نرخ‌ها جمع زده می‌شوند. دو مسیر ثبت سفارش داریم و
// هر دو باید یک عدد بدهند:
//
//   ۱) مسیر عادی مشتری — `screens/category/Preview.js`
//      مراحل را `/steps/fetch` می‌دهد، کاربر مستقیم روی همان ساختار انتخاب
//      می‌کند (`slices/stepSlice.js`) و `calculateStepsPrice` جمعش می‌زند.
//
//   ۲) مسیرهای سازمانی — `screens/orders/OrderSummaryScreen.js`
//      فرمِ محلی (org/systematicFlows.js، ComprehensiveSelectionScreen) هیچ
//      نرخی ندارد؛ نرخ‌ها باید از همان `/steps/fetch` دسته بیایند و
//      `applySelectionsToSteps` انتخاب‌های محلی را روی آن ساختار می‌نشاند.
//
// بک‌اند `total_price` را بازمحاسبه نمی‌کند و همان را در `orders.pakar_price`
// می‌نویسد (§۶ سند) — پس خطای این فایل مستقیماً مبلغِ سفارش را خراب می‌کند.

// ---------------------------------------------------------------------------
// خواندن یک گزینه
// ---------------------------------------------------------------------------

// قیمتِ خامِ گزینه را به عدد تبدیل می‌کند. بک‌اند قیمت را گاهی عدد و گاهی
// رشته ("200000.00") می‌فرستد و «قیمتِ تعیین‌نشده» را با null/'' نشان می‌دهد.
// null برمی‌گردانیم تا «تعیین‌نشده» با «صفر/رایگان» یکی گرفته نشود (§۸ سند).
export const resolveDetailPrice = (detail) => {
  const raw = detail?.price;
  if (raw === null || raw === undefined || raw === '') return null;
  const price = Number(raw);
  return Number.isFinite(price) ? price : null;
};

// مقدارِ انتخابیِ کاربر: برای radioButton/checkbox صفر یا یک، برای counter
// تعداد و برای input متنِ تایپ‌شده.
//
// قبلاً فقط `typeof value === 'number'` چک می‌شد و هر رشته‌ای در غیر این حالت
// «انتخاب‌شده» حساب می‌شد؛ یعنی اگر بک‌اند مقدارها را به‌صورت رشته بفرستد
// (`"0"`)، قیمتِ گزینه‌های انتخاب‌نشده هم در جمع می‌آمد.
export const resolveDetailValue = (detail) => {
  const raw = detail?.value;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (typeof raw === 'boolean') return raw ? 1 : 0;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return 0;
    const numeric = Number(trimmed);
    // "0" یعنی انتخاب‌نشده، "2" یعنی تعداد، و متنِ آزاد یعنی فیلدِ پرشده.
    return Number.isFinite(numeric) ? numeric : 1;
  }
  return 0;
};

// چند واحد از این گزینه در فاکتور است. فقط جایی ضرب می‌کنیم که واقعاً شمارنده
// دارد — دقیقاً همان قاعده‌ای که Counter/CheckBox/RadioButton برای نمایشِ
// «+ X تومان» به کار می‌برند. در فیلدِ input مقدار، متنِ کاربر است نه تعداد،
// پس هرگز ضرب نمی‌شود (وگرنه تایپِ «۵» قیمت را پنج برابر می‌کرد).
export const resolveDetailUnits = (field, detail) => {
  const value = resolveDetailValue(detail);
  if (!(value > 0)) return 0;
  if (detail?.type === 'input') return 1;
  const hasQuantity =
    Number(detail?.has_counter) === 1 || detail?.type === 'counter' || field?.type === 'counter';
  return hasQuantity ? value : 1;
};

// `affect_on_price == 0` یعنی گزینه طبق تنظیماتِ سرور روی مبلغ اثر ندارد و
// نباید در جمع بیاید. نبودنِ این فیلد در پاسخ (بعضی مراحلِ شرطی) به معنی
// «اثر ندارد» نیست، پس فقط صفرِ صریح را کنار می‌گذاریم.
export const detailAffectsPrice = (detail) => {
  const flag = detail?.affect_on_price;
  if (flag === undefined || flag === null) return true;
  return !(flag === 0 || flag === '0' || flag === false);
};

// ---------------------------------------------------------------------------
// جمعِ مبلغ
// ---------------------------------------------------------------------------

/**
 * مبلغ پایه‌ی سفارش از روی ساختار `steps` (همان شکلی که API می‌دهد و ما با
 * انتخاب‌های کاربر پرش می‌کنیم).
 *
 * @param {Array<Array<object>>} steps
 * @returns {{ total: number, showPrice: boolean }}
 *   `total` عددِ صحیحِ غیرمنفی است و `showPrice=false` یعنی دست‌کم یک گزینه‌ی
 *   انتخاب‌شده نرخِ تعیین‌شده ندارد، پس این عدد مبلغِ کاملِ سفارش نیست.
 */
export const calculateStepsPrice = (steps) => {
  let total = 0;
  let showPrice = true;

  (Array.isArray(steps) ? steps : []).forEach((group) => {
    (Array.isArray(group) ? group : []).forEach((field) => {
      if (!Array.isArray(field?.field_details)) return;

      field.field_details.forEach((detail) => {
        const units = resolveDetailUnits(field, detail);
        // گزینه‌ی انتخاب‌نشده اصلاً بخشی از سفارش نیست.
        if (units <= 0) return;
        if (!detailAffectsPrice(detail)) return;

        const price = resolveDetailPrice(detail);
        if (price === null) {
          // کاربر چیزی را انتخاب کرده که نرخش هنوز تعیین نشده، پس جمعِ
          // به‌دست‌آمده مبلغِ کاملِ سفارش نیست و باید به‌جای عدد،
          // «نیاز به بررسی» نشان داده شود.
          showPrice = false;
          return;
        }

        total += units * price;
      });
    });
  });

  // §۴ سند: مبلغ باید عددِ صحیحِ غیرمنفی برود، نه اعشاری.
  return { total: Math.max(0, Math.round(total)), showPrice };
};

// ---------------------------------------------------------------------------
// نشاندنِ انتخاب‌های فرمِ محلی روی مراحلِ واقعیِ API
// ---------------------------------------------------------------------------

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * عنوان‌ها را برای مقایسه یکدست می‌کند: نیم‌فاصله/فاصله‌های تکراری، ی و ک عربی،
 * اعداد فارسی و علائم اضافه. بدون این، «لپ تاپ» و «لپ‌تاپ» دو چیز می‌شوند.
 */
export const normalizeTitle = (text) => {
  if (text === null || text === undefined) return '';
  let out = String(text);
  for (let i = 0; i < 10; i += 1) {
    out = out.split(PERSIAN_DIGITS[i]).join(String(i)).split(ARABIC_DIGITS[i]).join(String(i));
  }
  return (
    out
      .replace(/[\u064A\u0649]/g, '\u06CC') // ي/ى → ی
      .replace(/\u0643/g, '\u06A9') // ك → ک
      .replace(/[\u064B-\u0652]/g, '') // اعراب
      // فاصله، نیم‌فاصله و هر علامت دیگری کلاً حذف می‌شوند تا «لپ تاپ»، «لپ‌تاپ»
      // و «لپتاپ» یک کلید بدهند؛ نیم‌فاصله‌ی حذف‌شده وگرنه با فاصله یکی نمی‌شد.
      .replace(/[^\p{L}\p{N}]+/gu, '')
      .toLowerCase()
  );
};

/** آیا این مقدار «تعداد» است یا عنوانِ یک گزینه؟ */
const asCount = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value !== 'string') return null;
  const normalized = normalizeTitle(value);
  if (!normalized || !/^\d+$/.test(normalized)) return null;
  const count = Number(normalized);
  return count > 0 ? count : null;
};

/**
 * هر خطِ خلاصه را به «عنوان گزینه + عنوان فیلد + تعداد» ترجمه می‌کند.
 *
 * دو شکل داریم:
 *   { label: 'نصب سیستم عامل', value: 'ویندوز 11' } → گزینه‌ی انتخابی، تعداد ۱
 *   { label: 'لپ تاپ', value: 3 }                   → شمارنده، عنوان در label
 * و شکل سوم، ردیف‌های تامین کالا: { label: 'لپ تاپ / آکبند', value: 2 }.
 */
const candidatesFor = (line) => {
  const count = asCount(line?.value);
  const label = String(line?.label ?? '');
  const parts = label
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  if (count === null) {
    // عنوانِ گزینه در `value` است و `label` عنوانِ فیلد.
    return { units: 1, options: [{ detail: line?.value, field: label }] };
  }

  // شمارنده: عنوانِ قلم در `label` است. «لپ تاپ / آکبند» یعنی گزینه‌ی «آکبند»
  // زیر فیلدِ «لپ تاپ» — و اگر بک‌اند این‌طور نچیده باشد، خودِ کلِ عنوان.
  const options = [{ detail: label, field: null }];
  if (parts.length === 2) {
    options.unshift({ detail: parts[1], field: parts[0] });
    options.push({ detail: parts[0], field: null });
  }
  return { units: count, options };
};

/**
 * انتخاب‌های فرمِ محلیِ سازمانی را روی مراحلِ واقعیِ دسته (پاسخ `/steps/fetch`)
 * می‌نشاند تا هم `total_price` واقعی درآید و هم `steps` پرشده ارسال شود
 * (بک‌اند `order_details` را از همین می‌سازد — §۵ سند).
 *
 * نگاشت بر اساسِ برابریِ عنوانِ نرمال‌شده است، چون فرمِ محلی شناسه‌ی فیلدهای
 * بک‌اند را ندارد. عمداً محافظه‌کار است: عنوانی که به بیش از یک گزینه بخورد
 * «مبهم» حساب می‌شود و کنار گذاشته می‌شود، نه اینکه حدس بزنیم.
 *
 * @param {Array<Array<object>>} apiSteps پاسخ خام `/steps/fetch`.
 * @param {Array<{label: string, value: any}>} selections همان summaryLines صفحه.
 * @returns {{ steps: Array, matched: object[], unmatched: string[], ambiguous: string[] }}
 */
export const applySelectionsToSteps = (apiSteps, selections) => {
  const steps = Array.isArray(apiSteps) ? JSON.parse(JSON.stringify(apiSteps)) : [];
  const matched = [];
  const unmatched = [];
  const ambiguous = [];

  // فهرستِ تختِ همه‌ی گزینه‌ها، برای جست‌وجو بر اساس عنوان.
  const index = [];
  steps.forEach((group) => {
    (Array.isArray(group) ? group : []).forEach((field) => {
      (Array.isArray(field?.field_details) ? field.field_details : []).forEach((detail) => {
        index.push({
          field,
          detail,
          detailKey: normalizeTitle(detail?.title),
          fieldKey: normalizeTitle(field?.title),
        });
      });
    });
  });

  const taken = new Set();

  (Array.isArray(selections) ? selections : []).forEach((line) => {
    const { units, options } = candidatesFor(line);
    const label = String(line?.label ?? '');

    for (const option of options) {
      const detailKey = normalizeTitle(option.detail);
      if (!detailKey) continue;

      let hits = index.filter((entry) => entry.detailKey === detailKey && !taken.has(entry.detail));
      if (hits.length === 0) continue;

      // اگر عنوانِ فیلد هم می‌دانیم، اول همان را می‌خواهیم — همین جلوی
      // برخوردِ «لپ تاپ»ِ سخت‌افزار با «لپ تاپ»ِ تامین کالا را می‌گیرد.
      const fieldKey = normalizeTitle(option.field);
      if (fieldKey) {
        const scoped = hits.filter((entry) => entry.fieldKey === fieldKey);
        if (scoped.length) hits = scoped;
      }

      if (hits.length > 1) {
        ambiguous.push(label);
        return;
      }

      const hit = hits[0];
      hit.detail.value = units;
      taken.add(hit.detail);
      matched.push({ label, title: hit.detail?.title, units });
      return;
    }

    unmatched.push(label);
  });

  return { steps, matched, unmatched, ambiguous };
};

/**
 * همان کار بالا، به‌علاوه‌ی جمعِ مبلغ — چیزی که صفحه‌ی پیش‌نمایشِ سازمانی
 * می‌خواهد.
 *
 * @returns {{ steps: Array, total: number, showPrice: boolean, matched: object[],
 *   unmatched: string[], ambiguous: string[] }}
 */
export const priceSelections = (apiSteps, selections) => {
  const { steps, matched, unmatched, ambiguous } = applySelectionsToSteps(apiSteps, selections);
  const { total, showPrice } = calculateStepsPrice(steps);
  return { steps, total, showPrice, matched, unmatched, ambiguous };
};
