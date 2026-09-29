// مبلغ پرداختیِ یک سفارش برای پرکردن خودکار فرم «خرابی خدمات / محصول».
//
// فرم فقط `final_paid_amount` از `/orders/summary` را می‌خواند؛ برای سفارش‌هایی
// که این فیلد در آن‌ها خالی/صفر است (مثل سفارش «انتخاب جامع» در گزارش
// ۱۴۰۵/۰۷/۰۳) بقیه‌ی فیلدها پر می‌شدند ولی «مبلغ پرداختی» خالی می‌ماند. به
// ترتیب اولویت، اولین مبلغ مثبتی که سفارش دارد برگردانده می‌شود.
const AMOUNT_FIELDS = ['final_paid_amount', 'paid_amount', 'total_price', 'pakar_price'];

const PERSIAN_DIGITS = /[۰-۹]/g;

const toNumber = (value) => {
  if (value == null) return NaN;
  if (typeof value === 'number') return value;
  const normalized = String(value)
    .replace(PERSIAN_DIGITS, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[,٬\s]/g, '');
  return normalized === '' ? NaN : Number(normalized);
};

/**
 * @param {object} order یک ردیف از `/orders/summary`.
 * @returns {string} مبلغ به‌صورت رشته‌ی رقم لاتین، یا '' اگر هیچ مبلغی نبود.
 */
export const orderPaidAmount = (order) => {
  if (!order) return '';
  for (const field of AMOUNT_FIELDS) {
    const amount = toNumber(order[field]);
    if (Number.isFinite(amount) && amount > 0) return String(Math.round(amount));
  }
  return '';
};

export default orderPaidAmount;
