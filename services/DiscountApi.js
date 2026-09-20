// services/DiscountApi.js — club discount plans and personal discount codes.
//
// Contract: FRONTEND_DISCOUNT_CODES.md. Two entities, easy to confuse:
//
//   - a **plan** (club/offer) is configured by an administrator and costs gems;
//   - a **code** is personal, generated for the current user by claiming a plan.
//
// `discountId` in /detail and /claim is the *plan* id, not the code id.
//
// A note on validation: the backend exposes two endpoints for this.
// `/discounts/check` takes `discountCode`/`categoryId` and answers with a flat
// `discount_code_percent`; `/orders/check-discount` takes `discount_code`/
// `category_id` and answers `{ success, data: { discount_percent } }`. The app
// standardises on the second one — see ApiEndpoints.js — so the field names
// match what `/orders/submit` itself expects and there is one shape to parse.
import axios from './axiosConfig';
import i18next from 'i18next';
import { uri } from './URL';
import { API_ENDPOINTS } from './ApiEndpoints';
import { request, unwrapList } from './apiResponse';

const headers = (token) => ({
  'Accept-Language': i18next.language || 'en',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/**
 * پیشنهادهای هفتگی باشگاه
 *
 * @param {string} [token]
 * @returns {Promise<{ok: boolean, data: any, message?: string, code?: string}>}
 */
export const getOffers = (token) =>
  request(() => axios.get(`${uri}${API_ENDPOINTS.DISCOUNT.OFFERS}`, { headers: headers(token) }));

/**
 * دسته‌بندی‌هایی که طرح تخفیف دارند
 *
 * @param {string} [token]
 * @returns {Promise<{ok: boolean, data: any, message?: string, code?: string}>}
 */
export const getCategories = (token) =>
  request(() =>
    axios.get(`${uri}${API_ENDPOINTS.DISCOUNT.CATEGORIES}`, { headers: headers(token) })
  );

/**
 * لیست طرح‌های تخفیف
 *
 * @param {string} [token]
 * @returns {Promise<{ok: boolean, data: any, message?: string, code?: string}>}
 */
export const getPlans = (token) =>
  request(() => axios.get(`${uri}${API_ENDPOINTS.DISCOUNT.LIST}`, { headers: headers(token) }));

/**
 * جزئیات یک طرح تخفیف
 *
 * @param {string} [token]
 * @param {number} discountId - شناسه‌ی طرح (نه شناسه‌ی کد)
 * @returns {Promise<{ok: boolean, data: any, message?: string, code?: string}>}
 */
export const getPlanDetail = (token, discountId) =>
  request(() =>
    axios.post(
      `${uri}${API_ENDPOINTS.DISCOUNT.DETAIL}`,
      { discountId },
      { headers: headers(token) }
    )
  );

/**
 * دریافت کد تخفیف با خرج کردن جم
 *
 * Errors are documented as INVALID_DISCOUNT_ID (404), ALREADY_CLAIMED (409)
 * and INSUFFICIENT_GEMS (403) — `describeDiscountError` maps them.
 *
 * @param {string} [token]
 * @param {number} discountId - شناسه‌ی طرح
 * @returns {Promise<{ok: boolean, data: {code: string, discount_percent: number, expiry_date: string, remaining_gems: number}, message?: string, code?: string}>}
 */
export const claimPlan = (token, discountId) =>
  request(() =>
    axios.post(`${uri}${API_ENDPOINTS.DISCOUNT.CLAIM}`, { discountId }, { headers: headers(token) })
  );

/**
 * کدهای تخفیف خود کاربر
 *
 * Returns the collection directly rather than a `{success, data}` envelope.
 *
 * @param {string} [token]
 * @returns {Promise<{ok: boolean, data: any, message?: string, code?: string}>}
 */
export const getUserCodes = (token) =>
  request(() =>
    axios.get(`${uri}${API_ENDPOINTS.DISCOUNT.USER_CODES}`, { headers: headers(token) })
  );

/**
 * اعتبارسنجی کد تخفیفِ باشگاه پیش از ثبت سفارش — کد را مصرف نمی‌کند
 *
 * **No longer used at checkout.** The order screen's «کد تخفیف» field moved to
 * the admin-generated promo codes of `services/PromoApi.js`, which submit as
 * `promo_code`. Kept because the backend still serves this endpoint and club
 * codes are still issued; nothing in the app calls it today.
 *
 * Unlike the referral check, this is safe to call repeatedly: the usage count
 * is only decremented when the order is actually submitted.
 *
 * @param {string} [token]
 * @param {{code: string, categoryId: number}} params
 * @returns {Promise<{ok: boolean, data: {discount_percent: number, discount_code_id: number}, message?: string, code?: string}>}
 */
export const checkOrderDiscount = (token, { code, categoryId }) =>
  request(() =>
    axios.post(
      `${uri}${API_ENDPOINTS.ORDERS.CHECK_DISCOUNT}`,
      { discount_code: normalizeDiscountCode(code), category_id: categoryId },
      { headers: headers(token) }
    )
  );

/**
 * بیرون کشیدن لیست از پاسخ‌هایی که ممکن است پوشش‌دار باشند یا نباشند
 *
 * @param {any} data
 * @returns {Array}
 */
export const selectList = (data) => unwrapList(data);

/**
 * یکدست کردن کد واردشده توسط کاربر
 *
 * Users paste codes with stray spaces and in either case; the backend compares
 * them literally.
 *
 * @param {string} code
 * @returns {string}
 */
export const normalizeDiscountCode = (code) => (code || '').trim().toUpperCase();

/**
 * وضعیت نمایشی یک کد تخفیف کاربر
 *
 * Recommended by the contract: a code is usable only while it has uses left
 * *and* has not expired. An unparseable or absent date is treated as "no
 * expiry" rather than "expired", so a backend that omits the field does not
 * grey out every code the user owns.
 *
 * @param {{count?: number, expiry_date?: string}} item
 * @returns {'usable'|'used_up'|'expired'}
 */
export const getCodeState = (item) => {
  if (Number(item?.count ?? 0) <= 0) return 'used_up';

  if (item?.expiry_date) {
    // "2026-10-19 12:00:00" is not valid ISO on every JS engine; the space must
    // become a "T" or Safari/Hermes return NaN and every code looks expired.
    const expiry = new Date(String(item.expiry_date).replace(' ', 'T'));
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return 'expired';
    }
  }

  return 'usable';
};

/**
 * پیام خطای کد تخفیف
 *
 * @param {{code?: string, message?: string}} result
 * @param {Function} t - i18next translate
 * @returns {string}
 */
export const describeDiscountError = (result, t) => {
  if (result?.message) return result.message;

  switch (result?.code) {
    case 'INVALID_DISCOUNT_ID':
      return t('This discount plan no longer exists.');
    case 'ALREADY_CLAIMED':
      return t('You have already claimed this discount plan.');
    case 'INSUFFICIENT_GEMS':
      return t("You don't have enough points to claim this discount");
    default:
      return t('Invalid discount code.');
  }
};

export default {
  getOffers,
  getCategories,
  getPlans,
  getPlanDetail,
  claimPlan,
  getUserCodes,
  checkOrderDiscount,
  selectList,
  normalizeDiscountCode,
  getCodeState,
  describeDiscountError,
};
