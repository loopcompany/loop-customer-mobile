// مراحل و نرخ خدماتِ یک دسته — قرارداد: FRONTEND_SERVICE_RATES.md
//
// `slices/stepSlice.js` هم همین endpoint را صدا می‌زند، ولی آنجا پاسخ داخل
// Redux می‌نشیند و کلِ ویزارد سفارشِ مسیرِ عادی روی همان state سوار است. مسیر
// سازمانی فقط نرخ‌ها را می‌خواهد و نباید آن state را بکوبد (کاربر ممکن است یک
// سفارشِ نیمه‌کاره‌ی دیگر داشته باشد)، پس این ماژول پاسخ را برمی‌گرداند و
// هیچ‌جا ذخیره نمی‌کند.
//
// درخواست از نمونه‌ی مشترک axios رد می‌شود تا هدر Authorization در زمانِ
// درخواست از AsyncStorage خوانده شود — همان دلیلی که در CategoriesApi.js
// توضیح داده شده (توکنِ props ممکن است هنوز restore نشده باشد).
import axios from './axiosConfig';
import i18next from 'i18next';
import { uri } from './URL';
import { API_ENDPOINTS } from './ApiEndpoints';

// عنوان مراحل و گزینه‌ها ترجمه‌شده می‌آیند و نگاشتِ عنوان‌محورِ
// `services/orderPricing.js` به همین عنوان‌ها تکیه دارد، پس زبانِ جاری باید
// per-request فرستاده شود (نمونه‌ی مشترک آن را موقع ساخت ماژول ثابت می‌کند).
const localeHeaders = () => ({ 'Accept-Language': i18next.language || 'en' });

/**
 * مراحلِ یک دسته با نرخ هر گزینه.
 *
 * @param {number|string} categoryId شناسه‌ی عددی دسته در بک‌اند.
 * @returns {Promise<Array<Array<object>>>} همان آرایه‌ی گروه‌های مرحله‌ای؛
 *   اگر دسته مرحله‌ای نداشته باشد آرایه‌ی خالی.
 * @throws خطای axios را بالا می‌دهد تا فراخوان تصمیم بگیرد (اینجا پیام کاربری
 *   ساخته نمی‌شود؛ `utils/apiErrorHandler` کار همان‌جاست).
 */
export const fetchCategorySteps = async (categoryId) => {
  const response = await axios.post(
    `${uri}${API_ENDPOINTS.STEPS.FETCH}`,
    { categoryId: Number(categoryId) },
    { headers: { Accept: 'application/json', ...localeHeaders() } }
  );
  return Array.isArray(response?.data) ? response.data : [];
};

export default { fetchCategorySteps };
