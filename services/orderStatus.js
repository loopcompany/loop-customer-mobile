// وضعیت سفارش برای کارت‌های «تراکنش‌ها/سفارش‌ها» و «سفارش‌های لغوشده».
//
// «تغییرات اپ کاربر» بند ۱: هر سفارش با رنگ و لیبلِ وضعیتش نشان داده شود
// (انجام شده / لغو شده / در انتظار / در حال انجام)، سفارشِ لغوشده «ناموفق» با
// کادر قرمز، و نوشته شود لغو از سوی کاربر بوده یا تکنسین یا پنل.
// بند ۲: لغوشده‌ها فقط در «سفارش‌های لغوشده» بیایند، نه در «سفارشات».
//
// کدهای وضعیت (همان components/OrderItem.js و services/receipt/fromOrderApi.js):
//   0 در انتظار بررسی · 1 در حال انجام · 2 انجام شده
//   3 لغو توسط کاربر · 4 لغو توسط تکنسین · 5 لغو توسط لوپ (پنل) · 6 لغو به‌دلیل انقضا

export const ORDER_STATUS_KIND = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

/** چه کسی سفارش را لغو کرده. مقادیر همان `cancelled_by` سرور است. */
export const CANCELLED_BY = {
  USER: 'user',
  TECHNICIAN: 'technician',
  ADMIN: 'admin',
  SYSTEM: 'system',
};

const CANCELLED_BY_STATUS = {
  3: CANCELLED_BY.USER,
  4: CANCELLED_BY.TECHNICIAN,
  5: CANCELLED_BY.ADMIN,
  6: CANCELLED_BY.SYSTEM,
};

/** کلیدهای i18n برچسب «لغو از سوی ...». */
export const CANCELLED_BY_LABEL_KEYS = {
  [CANCELLED_BY.USER]: 'Canceled by the user',
  [CANCELLED_BY.TECHNICIAN]: 'Canceled by the technician',
  [CANCELLED_BY.ADMIN]: 'Canceled by the panel',
  [CANCELLED_BY.SYSTEM]: 'Canceled by the system (order time expired)',
};

/** کلید i18n لیبلِ وضعیت روی کارت. */
export const ORDER_STATUS_LABEL_KEYS = {
  [ORDER_STATUS_KIND.PENDING]: 'Awaiting Review',
  [ORDER_STATUS_KIND.IN_PROGRESS]: 'In Progress',
  [ORDER_STATUS_KIND.DONE]: 'Completed',
  // طبق مثال سند: «سفارش ناموفق: کادر قرمز و لیبل ناموفق».
  [ORDER_STATUS_KIND.CANCELLED]: 'Order failed',
};

/**
 * @param {object} order یک سفارش از `GET /orders`.
 * @returns {boolean} سفارش لغو شده است (هر کدام از کدهای ۳ تا ۶، یا `cancelled_by` از سرور).
 */
export const isCancelledOrder = (order) => {
  const code = Number(order?.status);
  if (Number.isFinite(code) && code >= 3) return true;
  return Boolean(normaliseCancelledBy(order?.cancelled_by));
};

const normaliseCancelledBy = (value) => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return null;
  // پنل ادمین ممکن است «panel» یا «loop» بفرستد - هر سه یعنی پنل.
  if (raw === 'panel' || raw === 'loop') return CANCELLED_BY.ADMIN;
  return Object.values(CANCELLED_BY).includes(raw) ? raw : null;
};

/**
 * چه کسی سفارش را لغو کرده. `cancelled_by`ِ صریحِ سرور بر کد وضعیت مقدم است؛
 * بدون آن از کد وضعیت خوانده می‌شود.
 *
 * @param {object} order
 * @returns {string|null} یکی از CANCELLED_BY، یا null برای سفارشِ لغونشده.
 */
export const cancelledByOf = (order) => {
  if (!isCancelledOrder(order)) return null;
  return normaliseCancelledBy(order?.cancelled_by) || CANCELLED_BY_STATUS[Number(order?.status)] || null;
};

/**
 * @param {object} order
 * @returns {string} یکی از ORDER_STATUS_KIND.
 */
export const orderStatusKind = (order) => {
  if (isCancelledOrder(order)) return ORDER_STATUS_KIND.CANCELLED;
  const code = Number(order?.status);
  if (code === 2) return ORDER_STATUS_KIND.DONE;
  if (code === 1) return ORDER_STATUS_KIND.IN_PROGRESS;
  return ORDER_STATUS_KIND.PENDING;
};

/** فقط سفارش‌های لغونشده - لیست «سفارشات». */
export const withoutCancelledOrders = (orders) =>
  Array.isArray(orders) ? orders.filter((order) => !isCancelledOrder(order)) : [];

/** فقط سفارش‌های لغوشده - لیست «سفارش‌های لغوشده». */
export const onlyCancelledOrders = (orders) =>
  Array.isArray(orders) ? orders.filter(isCancelledOrder) : [];
