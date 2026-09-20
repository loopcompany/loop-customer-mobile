// services/PromoApi.js — admin-generated promo codes, one use per user.
//
// Contract: FRONTEND_PROMO_CODES.md.
//
// **This is the third code system in the app, and the one the order screen's
// «کد تخفیف» field now uses.** The other two are still live on the backend and
// must not be confused with it:
//
//   - `discount_code` — club/gem codes claimed with points (`DiscountApi`,
//     validated by `/orders/check-discount`). Still redeemable in the club
//     screens; no longer checked at checkout.
//   - `referral_code` — admin-assigned `LOOP-XXXXXX` (`ReferralApi`).
//
// The contract is explicit that a promo code travels in `promo_code` and
// nowhere else, so a code accepted here is never also sent as `discount_code`.
//
// Two properties shape the rest of this file:
//
// 1. **Checking does not consume the code.** Unlike `/referral-codes/check`,
//    this endpoint is a pure validator — it is safe to press repeatedly. The
//    usage is only recorded when the order is actually submitted, which is why
//    a successful check is never treated as "spent".
// 2. **The final amount is the server's, not ours.** `discount_percent` is for
//    display while the user is on the order screen. The order response and the
//    payment calculation are the authority; the app must not compute the
//    payable amount from this percentage and present it as final.
//
// Errors arrive as 404/409 with an `error_code` (so axios rejects and
// `normalizeError` picks them up), but the success body also carries its own
// `valid` flag — a 200 with `valid:false` is a rejection, not a discount.
import axios from './axiosConfig';
import i18next from 'i18next';
import { uri } from './URL';
import { API_ENDPOINTS } from './ApiEndpoints';
import { isOk, normalizeError } from './apiResponse';

const headers = (token) => ({
  'Accept-Language': i18next.language || 'en',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/**
 * یکدست کردن کد واردشده توسط کاربر
 *
 * Codes are issued uppercase (`SUMMER20`) and compared literally by the
 * backend; users paste them with stray spaces and in mixed case.
 *
 * @param {string} code
 * @returns {string}
 */
export const normalizePromoCode = (code) => (code || '').trim().replace(/\s+/g, '').toUpperCase();

/**
 * اعتبارسنجی کد تخفیف — کد را مصرف نمی‌کند
 *
 * Safe to call as often as the user presses the button. Keep the returned
 * `data.code` and send exactly that as `promo_code` on submit, so the order
 * carries the string the server recognised rather than the raw input.
 *
 * Not routed through `apiResponse.request` because that helper only keeps
 * `data`, and the top-level `valid` flag has to be inspected: a body of
 * `{ success: true, valid: false }` is a rejection that would otherwise read as
 * an applied discount.
 *
 * @param {string} [token] - توکن Sanctum
 * @param {string} code - کد تخفیف
 * @returns {Promise<{ok: boolean, data: {code: string, discount_percent: number, expires_at: string|null}, message?: string, code?: string, status?: number}>}
 */
export const checkPromoCode = async (token, code) => {
  try {
    const response = await axios.post(
      `${uri}${API_ENDPOINTS.PROMO.CHECK}`,
      { code: normalizePromoCode(code) },
      { headers: headers(token) }
    );

    const body = response?.data;

    return {
      ok: isOk(body) && body?.valid !== false,
      data: body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body,
      message: body?.message,
      code: body?.error_code,
      status: response?.status,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

/**
 * پیام خطای کد تخفیف
 *
 * `PROMO_CODE_ALREADY_USED` is the one a user hits by accident — each code is
 * single-use *per account*, so a code that worked for a friend is spent for
 * them and not for this user. The message has to say which of the two it is.
 *
 * @param {{code?: string, message?: string}} result
 * @param {Function} t - i18next translate
 * @returns {string}
 */
export const describePromoError = (result, t) => {
  if (result?.message) return result.message;

  switch (result?.code) {
    case 'PROMO_CODE_NOT_FOUND':
      return t('This discount code does not exist.');
    case 'PROMO_CODE_INACTIVE':
      return t('This discount code is no longer active.');
    case 'PROMO_CODE_EXPIRED':
      return t('This discount code has expired.');
    case 'PROMO_CODE_ALREADY_USED':
      return t('You have already used this discount code.');
    case 'INVALID_PROMO_CODE':
    default:
      return t('Invalid discount code.');
  }
};

export default {
  normalizePromoCode,
  checkPromoCode,
  describePromoError,
};
