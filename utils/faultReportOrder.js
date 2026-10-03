// کمک‌تابع‌های فرم «عیوب سرویس / محصول».
//
// کاربر می‌تواند شماره‌ی سفارش را تایپ کند (به‌جای انتخاب از لیست) و بقیه‌ی
// فیلدها - جز «توضیحات» - از همان سفارش پر می‌شوند. شماره ممکن است با ارقام
// فارسی/عربی، با «#» یا فاصله تایپ شود.

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * @param {string|number} input چیزی که کاربر تایپ کرده.
 * @returns {string} فقط رقم‌های لاتین؛ '' اگر هیچ رقمی نبود.
 */
export const normalizeOrderNumber = (input) => {
  if (input == null) return '';
  return String(input)
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/\D/g, '');
};

/**
 * @param {Array<object>} orders ردیف‌های `/orders/summary`.
 * @param {string|number} input شماره‌ی تایپ‌شده.
 * @returns {object|null}
 */
export const findOrderByNumber = (orders, input) => {
  const wanted = normalizeOrderNumber(input);
  if (!wanted || !Array.isArray(orders)) return null;
  return orders.find((order) => normalizeOrderNumber(order?.order_id) === wanted) || null;
};

// فیلد «نام محصول / خدمت» قفل است ولی اجباری؛ اگر سرور `product_name` نفرستد،
// کاربر نباید پشت یک فیلد خالیِ غیرقابل‌ویرایش گیر کند. پس به‌ترتیب از عنوان
// دسته‌ی سفارش استفاده می‌شود.
const NAME_PATHS = [
  (o) => o?.product_name,
  (o) => o?.category_title,
  (o) => o?.category_name,
  (o) => o?.category?.title,
  (o) => o?.category?.name,
  (o) => o?.title,
];

/**
 * @param {object} order
 * @returns {string} '' اگر سفارش هیچ نامی نداشت.
 */
export const orderProductName = (order) => {
  for (const pick of NAME_PATHS) {
    const value = pick(order);
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};
