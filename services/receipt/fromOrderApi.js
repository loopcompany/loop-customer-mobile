// Adapter پاسخ سرور (`POST /orders/detail`) → مدل رسید.
//
// تنها مسیری که واقعاً سفارش را روی سرور ثبت می‌کند، مسیر دسته‌بندی مشتری است
// (screens/category/Preview.js → POST /orders/submit). بنابراین فقط این adapter
// می‌تواند رسیدهای «انجام شد» و «ناموفق» را بسازد؛ دو مسیر سازمانی هیچ رکوردی
// روی سرور ندارند و فقط پیش‌رسید تولید می‌کنند.
//
// نام فیلدها از مصرف‌کننده‌های موجود همین پاسخ استخراج شده‌اند
// (screens/orders/Details.js و components/OrderItem.js)، نه از docs/ - که طبق
// CLAUDE.md درباره‌ی endpoint سفارش با هم اختلاف دارند.

import {
  RECEIPT_STATE,
  DELIVERY_STATUS,
  buildReceipt,
  accountTypeLabel,
  isOrganizationAccount,
} from './receiptModel';
import { resolveCustomer, resolveUserCode } from './receiptCustomer';
import { toReceiptDate, toReceiptTime, todayReceiptDate } from './receiptDates';

// کدهای وضعیت، از buttonConfig در components/OrderItem.js:
//   0 در انتظار بررسی · 1 در حال انجام · 2 انجام شده
//   3 لغو توسط کاربر · 4 لغو توسط تکنسین · 5 لغو توسط لوپ · 6 لغو به‌دلیل انقضا
const CANCELLED_FROM = 3;

/**
 * @param {number|string} status کد وضعیت سفارش.
 * @returns {string} یکی از RECEIPT_STATE.
 */
export const receiptStateForStatus = (status) => {
  const code = Number(status);
  if (!Number.isFinite(code)) return RECEIPT_STATE.PENDING;
  if (code >= CANCELLED_FROM) return RECEIPT_STATE.FAILED;
  if (code === 2) return RECEIPT_STATE.DONE;
  return RECEIPT_STATE.PENDING;
};

/** عددِ قیمت یا null - رشته‌ی خالی و undefined نباید صفر شوند. */
const toPrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && String(value ?? '').trim() !== '' ? num : null;
};

/**
 * بخش‌های `order_details` (همان SectionList صفحه‌ی جزئیات) را به ردیف‌های
 * «خدمات» تبدیل می‌کند: هر بخش یک ردیف، و انتخاب‌های داخلش شرح آن ردیف.
 */
const servicesFromOrderDetails = (sections, categoryTitle) => {
  if (!Array.isArray(sections)) return [];
  return sections
    .map((section) => {
      const descriptions = (section?.data || [])
        .map((entry) => {
          const label =
            entry?.type === 'input'
              ? entry?.field_detail?.second_title
              : entry?.field_detail?.title;
          if (!label) return null;
          // فقط مقادیر شمارنده‌دار عدد دارند؛ بقیه صرفاً انتخاب شده‌اند.
          const hasCount = Number(entry?.field_detail?.has_counter) >= 1;
          return hasCount && entry?.value ? `${label} × ${entry.value}` : label;
        })
        .filter(Boolean);

      if (descriptions.length === 0) return null;
      return {
        title: section?.title || categoryTitle || null,
        description: descriptions.join(' / '),
        qty: 1,
      };
    })
    .filter(Boolean);
};

/**
 * @param {object} data پاسخ خام `POST /orders/detail`.
 * @param {object} [context]
 * @param {object} [context.user] state.user.data - برای وضعیت کاربری و شناسه‌ی ملی.
 * @param {object} [context.orgProfile] state.organization.profileData
 * @param {object[]} [context.addresses] state.address.data - پشتیبانِ آدرسِ سفارش.
 * @param {string|number} [context.selectedAddressId] state.step.addressId
 * @returns {object} رسید نرمال‌شده.
 */
export const receiptFromOrderApi = (
  data,
  { user = null, orgProfile = null, addresses = null, selectedAddressId = null } = {}
) => {
  const state = receiptStateForStatus(data?.status);

  const basePrice = toPrice(data?.technician_price ?? data?.pakar_price);
  const extraPrice = toPrice(data?.extra_price);
  const discount = toPrice(data?.discount_price);

  const categoryTitle = data?.category?.title || null;
  const services = servicesFromOrderDetails(data?.order_details, categoryTitle);

  // قیمت سفارش روی خودِ سفارش است، نه روی تک‌تک ردیف‌ها. برای اینکه جمعِ
  // ستون با «مبلغ کل» یکی دربیاید، کل مبلغ روی ردیف اول می‌نشیند.
  const servicesTotal =
    basePrice == null && extraPrice == null
      ? null
      : Number(basePrice || 0) + Number(extraPrice || 0);

  if (services.length > 0 && servicesTotal != null) {
    services[0] = { ...services[0], unitPrice: servicesTotal, totalPrice: servicesTotal };
  }

  const address = data?.user_address;
  const isOrg = isOrganizationAccount(user?.account_type);
  const addressName = [address?.fname, address?.lname].filter(Boolean).join(' ');

  // آدرسِ خودِ سفارش منبع اصلی است؛ آدرس‌های ذخیره‌شده فقط وقتی به کار می‌آیند
  // که پاسخِ سرور `user_address` نداشته باشد (سفارش‌های قدیمی‌تر).
  const customer = resolveCustomer({
    isOrganization: isOrg,
    name: isOrg ? null : addressName || null,
    addressEntry: address,
    addresses,
    selectedAddressId,
    orgProfile,
    user,
  });

  return buildReceipt({
    state,
    issuedAt: todayReceiptDate(),
    order: {
      number: data?.id ?? null,
      userCode: resolveUserCode(user),
      userName: addressName || [user?.fname, user?.lname].filter(Boolean).join(' ') || null,
      userStatus: accountTypeLabel(user?.account_type),
      registeredDate: toReceiptDate(data?.created_at),
      registeredTime: toReceiptTime(data?.created_at),
    },
    customer,
    // مسیر دسته‌بندی برند/مدل دستگاه را نمی‌پرسد؛ بخش «مشخصات محصول» حذف می‌شود.
    product: null,
    items: [],
    services,
    delivery: {
      receiverName: addressName || null,
      date: toReceiptDate(data?.finished_at || data?.arrived_at || data?.date),
      status: data?.finished_at ? DELIVERY_STATUS.BY_LOOP : DELIVERY_STATUS.UNKNOWN,
    },
    payment: {
      discountAmount: discount,
      status: data?.payment_status,
      method: data?.payment_status,
    },
  });
};

export default receiptFromOrderApi;
