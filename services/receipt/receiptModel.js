// مدل مشترک «رسید» - تنها قالبی که کامپوننت رسید می‌شناسد.
//
// اپ سه مسیر ثبت سفارش دارد که هیچ‌کدام شکل داده‌ی یکسانی ندارند:
//   • مسیر دسته‌بندی مشتری  (screens/category/Preview.js) → واقعاً روی سرور ثبت می‌شود
//   • «انتخاب جامع»         (org/ComprehensiveSelectionScreen.js) → فقط state محلی
//   • «انتخاب سیستماتیک»    (org/SystematicDeviceScreen.js)      → فقط state محلی
//
// هر مسیر یک adapter جدا دارد (fromOrderApi / fromComprehensive / fromSystematic)
// که خروجی‌اش همین شکل نرمال‌شده است. کامپوننت رسید هیچ‌وقت مستقیم به state یا
// پاسخ API نگاه نمی‌کند - فقط همین object را رندر می‌کند. برای همین می‌شود هر ۹
// حالت را بدون سرور تست کرد.

// ---------------------------------------------------------------------------
// حالت رسید - سه گروهِ «توضیحات رسیدها.pdf»
// ---------------------------------------------------------------------------
export const RECEIPT_STATE = {
  /** انجام شد - رسید اصلی، به اتمام رسیده و پرداخت شده. */
  DONE: 'done',
  /** جزئیات سفارش - پیش‌رسید، در انتظار تایید و پرداخت کاربر. */
  PENDING: 'pending',
  /** ناموفق - لغو شده از سوی کاربر یا لوپ. */
  FAILED: 'failed',
};

// ---------------------------------------------------------------------------
// نوع سفارش - تعیین می‌کند کدام بخش‌های رسید رندر شوند
// ---------------------------------------------------------------------------
export const ORDER_KIND = {
  /** فقط تامین کالا - بدون «مشخصات محصول» و بدون جدول خدمات. */
  GOODS: 'goods',
  /** فقط خدمات - بدون جدول اقلام. */
  SERVICES: 'services',
  /** هر دو. */
  BOTH: 'both',
};

/**
 * نوع سفارش ذخیره نمی‌شود؛ از پر بودن دو سبد اقلام/خدمات مشتق می‌شود.
 *
 * @param {{items?: unknown[], services?: unknown[]}} buckets
 * @returns {string|null} یکی از ORDER_KIND، یا null وقتی هر دو سبد خالی‌اند.
 */
export const deriveOrderKind = ({ items, services }) => {
  const hasItems = Array.isArray(items) && items.length > 0;
  const hasServices = Array.isArray(services) && services.length > 0;
  if (hasItems && hasServices) return ORDER_KIND.BOTH;
  if (hasItems) return ORDER_KIND.GOODS;
  if (hasServices) return ORDER_KIND.SERVICES;
  return null;
};

// ---------------------------------------------------------------------------
// وضعیت کاربری - «تفکیک کاربران با عنوان (وضعیت کاربری)» از توضیحات مهم ۲
// ---------------------------------------------------------------------------
// کلیدها همان مقادیر account_type هستند که org/logreg/Register.js ثبت می‌کند و
// contexts/MenuContext.js برای برچسب منو می‌خواند.
const ACCOUNT_TYPE_LABELS = {
  g_organization: 'سازمانی دولتی',
  s_g_organization: 'سازمانی نیمه دولتی',
  company: 'شرکتی خصوصی',
  individual: 'کاربر عادی',
  // املای غلط موجود در داده‌ی قدیمی سرور - MenuContext هم همین را جبران می‌کند.
  indiviual: 'کاربر عادی',
};

/** انواع حسابی که شخص حقیقی‌اند: «شماره ملی» می‌گیرند، نه «شناسه ملی». */
const INDIVIDUAL_ACCOUNT_TYPES = new Set(['individual', 'indiviual']);

/**
 * @param {string} accountType مقدار account_type کاربر.
 * @returns {string} برچسب فارسی «وضعیت کاربری» برای نمایش در رسید.
 */
export const accountTypeLabel = (accountType) => ACCOUNT_TYPE_LABELS[accountType] || 'کاربر عادی';

/**
 * کاربر عادی «شماره ملی» دارد و بقیه «شناسه ملی» - این تفاوت هم برچسب ردیف
 * و هم برچسب نام (نام کاربری / نام سازمان) را عوض می‌کند.
 *
 * @param {string} accountType مقدار account_type کاربر.
 * @returns {boolean}
 */
export const isOrganizationAccount = (accountType) =>
  Boolean(accountType) && !INDIVIDUAL_ACCOUNT_TYPES.has(accountType);

// ---------------------------------------------------------------------------
// وضعیت تحویل - «توضیحات رسیدها.pdf»
// ---------------------------------------------------------------------------
export const DELIVERY_STATUS = {
  BY_COURIER_USER: 'توسط پیک / کاربر',
  BY_COURIER_LOOP: 'توسط پیک / لوپ',
  BY_USER: 'توسط کاربر',
  BY_LOOP: 'توسط لوپ',
  UNKNOWN: 'نامشخص',
};

// ---------------------------------------------------------------------------
// مشخصات صادرکننده - «فقط این دوتا در همه رسیدها گزارده شود» (توضیحات مهم ۲)
// ---------------------------------------------------------------------------
// تصاویر طرح «شناسه ملی» شرکت را هم زیر نام شرکت چاپ کرده بودند، ولی توضیحات
// مهم ۲ فقط «نام شرکت + شماره ثبت» را خواسته بود و کارفرما هم همین را تأیید
// کرد: شناسه ملیِ صادرکننده از سربرگ رسید حذف شد و فقط شماره ثبت می‌ماند.
// (این با «شناسه ملیِ کاربر» در بخش «مشخصات کاربر» فرق دارد - آن سر جایش است.)
export const ISSUER = {
  companyName: 'حلقه بی نهایت رایانه ایرانیان',
  registrationNumber: '044915',
  website: 'www.clpiran.com',
};

/** وقتی مبلغ قطعی نیست (مسیرهای سازمانی قیمت ندارند) به‌جای عدد این می‌آید. */
export const PRICE_ON_REQUEST = 'استعلام';

/** مقدار جایگزین برای فیلدی که در آن مسیر اصلاً منبعی ندارد. */
export const NOT_SET = 'نامشخص';

/**
 * جای «شماره سفارش» تا وقتی سفارش روی سرور ثبت نشده است.
 *
 * پیش‌رسیدها (هر دو مسیر سازمانی و پیش‌نمایشِ ثبت نهایی) هنوز شماره ندارند -
 * شماره را بک‌اند موقع ثبت می‌سازد. «نامشخص» آنجا غلط‌انداز است: انگار داده‌ای
 * گم شده؛ در حالی‌که فقط هنوز ساخته نشده.
 */
export const ORDER_NUMBER_PENDING = 'پس از ثبت نهایی نمایش داده می‌شود';

// ---------------------------------------------------------------------------
// ساخت شیء رسید
// ---------------------------------------------------------------------------

/** جمع یک ستون قیمت؛ اگر هیچ ردیفی قیمت نداشته باشد null برمی‌گرداند. */
export const sumPrices = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const priced = rows.filter((row) => Number.isFinite(Number(row?.totalPrice)));
  if (priced.length === 0) return null;
  return priced.reduce((acc, row) => acc + Number(row.totalPrice), 0);
};

/**
 * همه‌ی adapterها خروجی‌شان را از این تابع رد می‌کنند تا هر رسید دقیقاً یک شکل
 * داشته باشد و کامپوننت لازم نباشد برای فیلدهای غایب optional-chaining بزند.
 *
 * @param {object} input بخش‌های پرشده توسط adapter.
 * @returns {object} رسید نرمال‌شده.
 */
export const buildReceipt = ({
  state,
  issuedAt = null,
  order = {},
  customer = {},
  product = null,
  items = [],
  services = [],
  delivery = {},
  payment = {},
}) => {
  const itemsTotal = sumPrices(items);
  const servicesTotal = sumPrices(services);

  // مبلغ کل = جمع اقلام + جمع خدمات. اگر هیچ‌کدام قیمت نداشتند null می‌ماند تا
  // رسید «استعلام» نشان دهد، نه عدد صفر.
  const grandTotal =
    itemsTotal == null && servicesTotal == null
      ? null
      : Number(itemsTotal || 0) + Number(servicesTotal || 0);

  const discountAmount = Number.isFinite(Number(payment.discountAmount))
    ? Number(payment.discountAmount)
    : null;

  const payable = grandTotal == null ? null : grandTotal - Number(discountAmount || 0);

  return {
    state,
    issuedAt,
    order: {
      number: order.number ?? null,
      userCode: order.userCode ?? null,
      userName: order.userName ?? null,
      channel: order.channel ?? 'اپلیکیشن',
      userStatus: order.userStatus ?? null,
      registeredDate: order.registeredDate ?? null,
      registeredTime: order.registeredTime ?? null,
      kind: order.kind ?? deriveOrderKind({ items, services }),
    },
    customer: {
      isOrganization: Boolean(customer.isOrganization),
      name: customer.name ?? null,
      nationalId: customer.nationalId ?? null,
      phone: customer.phone ?? null,
      landline: customer.landline ?? null,
      address: customer.address ?? null,
    },
    // «مشخصات محصول» فقط وقتی معنا دارد که مسیر، هویت دستگاه را پرسیده باشد.
    // «انتخاب جامع» فقط تعداد می‌گیرد و برند/مدل ندارد، پس null می‌ماند و
    // کامپوننت کل بخش را حذف می‌کند (به‌جای چاپ کادرِ خالی).
    product: product
      ? {
          type: product.type ?? null,
          brand: product.brand ?? null,
          brandLogo: product.brandLogo ?? null,
          model: product.model ?? null,
        }
      : null,
    items,
    itemsTotal,
    services,
    servicesTotal,
    delivery: {
      receiverName: delivery.receiverName ?? null,
      date: delivery.date ?? null,
      status: delivery.status ?? DELIVERY_STATUS.UNKNOWN,
    },
    payment: {
      total: grandTotal,
      discountCode: payment.discountCode ?? null,
      discountAmount,
      payable,
      status: payment.status ?? null,
      method: payment.method ?? null,
    },
  };
};
