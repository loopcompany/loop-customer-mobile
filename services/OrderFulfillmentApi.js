// services/OrderFulfillmentApi.js — تامین کالا (استعلام قیمت، پیش‌پرداخت، باقی‌مانده)
// و مشخصات تحویل سفارش.
//
// بند ۱۱ و ۱۵ سند «توضیحات اپ کاربر». قرارداد سرور در
// docs/BACKEND_REQUIREMENTS_USER_ORG_APP.md (بخش‌های ۹ و ۱۰) است. تا وقتی سرور
// این فیلدها را نفرستد، بخش‌های مربوط در «جزئیات سفارش» اصلاً نمایش داده نمی‌شوند؛
// اگر endpointی هنوز نباشد (404/405/501)، پیام «به‌زودی فعال می‌شود» می‌آید.
//
// خواندن پاسخ سرور در توابع خالص read* انجام می‌شود تا صفحه و رسید یک تفسیر از
// داده داشته باشند و بدون رندر تست شوند.
import i18next from 'i18next';
import axios from './axiosConfig';
import { uri } from './URL';
import { API_ENDPOINTS, buildEndpointWithParams } from './ApiEndpoints';
import { request } from './apiResponse';

const O = API_ENDPOINTS.ORDERS;
const url = (path, id) => `${uri}${buildEndpointWithParams(path, { id })}`;

// صفحه پیام خطای خودش را نشان می‌دهد؛ alert سراسری interceptor تکراری است.
// توکن صریح فرستاده می‌شود، چون interceptor فقط توکنِ «مرا به خاطر بسپار» را می‌خواند.
const config = (token) => ({
  skipGlobalErrorAlert: true,
  headers: {
    'Accept-Language': i18next.language || 'fa',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

// ---------------------------------------------------------------------------
// ثابت‌ها
// ---------------------------------------------------------------------------

/** پیش‌پرداخت پیش‌فرض تامین کالا (درصد). مقدار واقعی را پنل تعیین می‌کند. */
export const DEFAULT_PREPAYMENT_PERCENT = 60;

export const PROCUREMENT_STATUS = {
  AWAITING_QUOTE: 'awaiting_quote', // پیش‌رسید ارسال شده، منتظر اعلام قیمت پنل
  QUOTED: 'quoted', // قیمت اعلام شده، منتظر تأیید کاربر
  ACCEPTED: 'accepted', // کاربر تأیید کرده، منتظر پیش‌پرداخت
  REJECTED: 'rejected',
  EXPIRED: 'expired', // اعتبار استعلام (پایان ساعات کاری روز) گذشته
  PREPARING: 'preparing', // پیش‌پرداخت انجام شده، لوپ در حال آماده‌سازی
  READY: 'ready', // آماده؛ پرداخت باقی‌مانده لازم است
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
};

export const PROCUREMENT_STATUS_LABELS = {
  awaiting_quote: 'در انتظار اعلام قیمت',
  quoted: 'قیمت اعلام شد - در انتظار تأیید شما',
  accepted: 'تأیید شد - در انتظار پیش‌پرداخت',
  rejected: 'رد شد',
  expired: 'اعتبار استعلام به پایان رسید',
  preparing: 'در حال آماده‌سازی کالا',
  ready: 'کالا آماده است - در انتظار پرداخت باقی‌مانده',
  shipped: 'ارسال شد',
  delivered: 'تحویل داده شد',
};

/** مراحل پرداخت تامین کالا. */
export const PAYMENT_STAGE = { PREPAYMENT: 'prepayment', REMAINING: 'remaining' };

/** روش ارسال/تحویل (بند ۱۱ و ۱۵): تکنسین لوپ، خود کاربر، پیک. */
export const DELIVERY_METHOD = {
  LOOP_TECHNICIAN: 'loop_technician',
  USER: 'user',
  COURIER: 'courier',
};

export const DELIVERY_METHOD_LABELS = {
  loop_technician: 'توسط تکنسین لوپ',
  user: 'توسط کاربر (تحویل حضوری)',
  courier: 'توسط پیک حمل و نقل',
};

export const RECEIVER_TYPE = { SELF: 'self', REPRESENTATIVE: 'representative' };

export const DELIVERY_STATUS_LABELS = {
  pending: 'در انتظار ارسال',
  ready: 'آماده‌ی ارسال',
  shipped: 'ارسال شد',
  delivered: 'تحویل داده شد',
};

// ---------------------------------------------------------------------------
// خواندن پاسخ سرور
// ---------------------------------------------------------------------------

const toAmount = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toBool = (value) => value === true || value === 1 || value === '1' || value === 'true';

const toTime = (value) => {
  if (!value) return null;
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * درصد پیش‌پرداخت معتبر (۰ < درصد ≤ ۱۰۰)، وگرنه پیش‌فرض ۶۰.
 * @param {any} value
 */
export const readPrepaymentPercent = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && num <= 100 ? num : DEFAULT_PREPAYMENT_PERCENT;
};

/**
 * `order.procurement` را می‌خواند. null یعنی سفارش تامین کالا ندارد (یا سرور
 * هنوز این بخش را نمی‌فرستد) و صفحه آن را نشان نمی‌دهد.
 *
 * @param {object} order پاسخ `/orders/detail`
 * @param {Date} [now]
 */
export const readProcurement = (order, now = new Date()) => {
  const raw = order?.procurement;
  if (!raw || typeof raw !== 'object') return null;

  const items = (Array.isArray(raw.items) ? raw.items : []).map((item, index) => {
    const quantity = toAmount(item?.quantity) ?? 0;
    const unitPrice = toAmount(item?.unit_price);
    const totalPrice =
      toAmount(item?.total_price) ?? (unitPrice != null ? unitPrice * quantity : null);
    return {
      key: String(item?.id ?? `${item?.item_id ?? 'item'}-${item?.condition ?? ''}-${index}`),
      title: item?.title || '-',
      condition: item?.condition === 'used' ? 'used' : item?.condition === 'new' ? 'new' : null,
      quantity,
      unitPrice,
      totalPrice,
      description: item?.description || null,
    };
  });

  const itemsTotal =
    items.every((item) => item.totalPrice != null) && items.length
      ? items.reduce((sum, item) => sum + item.totalPrice, 0)
      : null;
  const totalAmount = toAmount(raw.total_amount) ?? itemsTotal;

  const payment = raw.payment || {};
  const percent = readPrepaymentPercent(payment.prepayment_percent);
  const prepaymentAmount =
    toAmount(payment.prepayment_amount) ??
    (totalAmount != null ? Math.round((totalAmount * percent) / 100) : null);
  const remainingAmount =
    toAmount(payment.remaining_amount) ??
    (totalAmount != null && prepaymentAmount != null ? totalAmount - prepaymentAmount : null);

  const validUntil = toTime(raw.valid_until);
  let status = Object.values(PROCUREMENT_STATUS).includes(raw.status)
    ? raw.status
    : PROCUREMENT_STATUS.AWAITING_QUOTE;
  // سرور ممکن است هنوز وضعیت را «quoted» نگه داشته باشد ولی زمان اعتبار گذشته.
  if (status === PROCUREMENT_STATUS.QUOTED && validUntil && validUntil.getTime() <= now.getTime()) {
    status = PROCUREMENT_STATUS.EXPIRED;
  }

  const prepaymentPaid = toBool(payment.prepayment_paid);
  const remainingPaid = toBool(payment.remaining_paid);

  return {
    status,
    statusLabel: PROCUREMENT_STATUS_LABELS[status],
    items,
    totalAmount,
    quotedAt: toTime(raw.quoted_at),
    validUntil,
    note: raw.note || null,
    payment: {
      percent,
      prepaymentAmount,
      prepaymentPaid,
      prepaymentPaidAt: toTime(payment.prepayment_paid_at),
      remainingAmount,
      remainingPaid,
      remainingPaidAt: toTime(payment.remaining_paid_at),
    },
    // کدام اقدام الان برای کاربر مجاز است.
    canDecide: status === PROCUREMENT_STATUS.QUOTED,
    canRequote: status === PROCUREMENT_STATUS.EXPIRED,
    payableStage:
      status === PROCUREMENT_STATUS.ACCEPTED && !prepaymentPaid
        ? PAYMENT_STAGE.PREPAYMENT
        : status === PROCUREMENT_STATUS.READY && !remainingPaid
          ? PAYMENT_STAGE.REMAINING
          : null,
  };
};

/**
 * `order.delivery` را می‌خواند. همیشه یک شیء برمی‌گرداند (با مقادیر null) تا
 * رسید و فرم بدون شرط‌های تودرتو از آن بخوانند.
 *
 * @param {object} order پاسخ `/orders/detail`
 */
export const readDelivery = (order) => {
  const raw = order?.delivery && typeof order.delivery === 'object' ? order.delivery : {};
  const method = Object.values(DELIVERY_METHOD).includes(raw.method) ? raw.method : null;
  const receiverType = Object.values(RECEIVER_TYPE).includes(raw.receiver_type)
    ? raw.receiver_type
    : null;
  const deliveredAt = toTime(raw.delivered_at);
  // پنل ادمین مشخصات تحویل را تأیید و برای کاربر می‌فرستد؛ تا آن لحظه رسید
  // «نامشخص» نشان می‌دهد («تغییرات اپ کاربر»، مشخصات تحویل).
  const confirmedAt = toTime(raw.confirmed_at);
  const status = deliveredAt ? 'delivered' : DELIVERY_STATUS_LABELS[raw.status] ? raw.status : null;
  return {
    present: Boolean(order?.delivery),
    receiverType,
    receiverName: raw.receiver_name || null,
    receiverMobile: raw.receiver_mobile || null,
    receiverNationalId: raw.receiver_national_id || null,
    method,
    methodLabel: method ? DELIVERY_METHOD_LABELS[method] : null,
    status,
    statusLabel: status ? DELIVERY_STATUS_LABELS[status] : null,
    deliveredAt,
    confirmedAt,
    confirmed: Boolean(confirmedAt),
    // بعد از ارسال، تغییر تحویل‌گیرنده یا روش ارسال معنایی ندارد.
    editable: !deliveredAt && status !== 'shipped',
  };
};

/**
 * فرم تحویل را پیش از ارسال بررسی می‌کند.
 * @returns {string|null} پیام خطای فارسی یا null.
 */
export const validateDeliveryForm = ({
  receiverType,
  receiverName,
  receiverMobile,
  receiverNationalId,
  method,
}) => {
  if (!receiverType) return 'تحویل‌گیرنده را مشخص کنید.';
  if (receiverType === RECEIVER_TYPE.REPRESENTATIVE) {
    if (!String(receiverName || '').trim()) return 'نام و نام خانوادگی تحویل‌گیرنده را وارد کنید.';
    if (!/^09\d{9}$/.test(String(receiverMobile || '').trim())) {
      return 'شماره موبایل تحویل‌گیرنده باید ۱۱ رقم و با ۰۹ شروع شود.';
    }
    const nationalId = String(receiverNationalId || '').trim();
    if (nationalId && !/^\d{10}$/.test(nationalId)) return 'کد ملی تحویل‌گیرنده باید ۱۰ رقم باشد.';
  }
  if (!method) return 'روش ارسال را انتخاب کنید.';
  return null;
};

// ---------------------------------------------------------------------------
// اقدامات
// ---------------------------------------------------------------------------

export const acceptProcurementQuote = (token, orderId) =>
  request(() => axios.post(url(O.PROCUREMENT_ACCEPT, orderId), {}, config(token)));

export const rejectProcurementQuote = (token, orderId, reason) =>
  request(() =>
    axios.post(url(O.PROCUREMENT_REJECT, orderId), { reason: reason || undefined }, config(token))
  );

/** استعلام دوباره، وقتی اعتبار قیمت‌ها (پایان ساعات کاری روز) گذشته است. */
export const requestProcurementRequote = (token, orderId) =>
  request(() => axios.post(url(O.PROCUREMENT_REQUOTE, orderId), {}, config(token)));

/**
 * پرداخت پیش‌پرداخت یا باقی‌مانده‌ی تامین کالا.
 * پاسخ: کیف پول → `{ remaining_balance }`؛ درگاه → `{ payment_url }`.
 *
 * @param {string} token
 * @param {number|string} orderId
 * @param {{ stage: 'prepayment'|'remaining', method: 'wallet'|'gateway', linkingUrl?: string }} options
 */
export const payProcurementStage = (token, orderId, { stage, method, linkingUrl }) =>
  request(() =>
    axios.post(
      url(O.PROCUREMENT_PAY, orderId),
      { stage, method, ...(method === 'gateway' ? { linking_url: linkingUrl } : {}) },
      config(token)
    )
  );

/**
 * ثبت/ویرایش تحویل‌گیرنده و روش ارسال.
 * برای «خودم» نام و موبایل را سرور از خود حساب پر می‌کند.
 */
export const updateDeliveryDetails = (token, orderId, form) =>
  request(() =>
    axios.put(
      url(O.DELIVERY, orderId),
      {
        receiver_type: form.receiverType,
        method: form.method,
        ...(form.receiverType === RECEIVER_TYPE.REPRESENTATIVE
          ? {
              receiver_name: String(form.receiverName || '').trim(),
              receiver_mobile: String(form.receiverMobile || '').trim(),
              receiver_national_id: String(form.receiverNationalId || '').trim() || null,
            }
          : {}),
      },
      config(token)
    )
  );

export default {
  readProcurement,
  readDelivery,
  validateDeliveryForm,
  acceptProcurementQuote,
  rejectProcurementQuote,
  requestProcurementRequote,
  payProcurementStage,
  updateDeliveryDetails,
};
