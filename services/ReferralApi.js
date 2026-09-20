// services/ReferralApi.js — admin-assigned referral codes (`LOOP-XXXXXX`).
//
// Contract: FRONTEND_REFERRAL_CODES.md + REFERRAL_CODES.md.
//
// **This is not the registration field.** `other_referral_code`, collected by
// `components/InviteCodeInput.js` on the sign-up form, is a separate legacy
// field that is merely stored on the user and carries no discount. The two
// systems share a name and nothing else — do not merge them.
//
// Two things make this endpoint unusual and both are load-bearing:
//
// 1. **`/referral-codes/check` consumes the code.** It is not a dry-run
//    validator. Calling it flips the code's status to `used` and binds it to
//    the authenticated caller. So it must only ever run from an explicit user
//    action — never on change, on blur, or on mount. Re-calling it as the same
//    user is idempotent; another user gets REFERRAL_CODE_USED.
//
// 2. **Business errors come back as HTTP 200.** `success:false` with an
//    `error_code`, which axios happily resolves. `apiResponse.request` is what
//    turns that into `ok:false`; a caller that branches on the HTTP status
//    alone would read "code not found" as a successful check.
import axios from './axiosConfig';
import i18next from 'i18next';
import { uri } from './URL';
import { API_ENDPOINTS } from './ApiEndpoints';
import { request } from './apiResponse';

const headers = (token) => ({
  'Accept-Language': i18next.language || 'en',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/**
 * یکدست کردن کد واردشده
 *
 * Codes are issued uppercase as `LOOP-XXXXXX`. Users paste them with trailing
 * spaces and in mixed case; no prefix is added automatically, because the app
 * must not invent a code the admin panel did not issue.
 *
 * @param {string} code
 * @returns {string}
 */
export const normalizeReferralCode = (code) =>
  (code || '').trim().replace(/\s+/g, '').toUpperCase();

/**
 * ثبت و مصرف کد معرف
 *
 * Requires the user's Sanctum token: the token is what identifies the
 * *consumer*, and the code's assigned user is returned as `data.referrer`.
 * This is why the code cannot be registered during sign-up — there is no token
 * yet at that point.
 *
 * Keep `result.data.code` (the normalized code the backend echoes back) in the
 * order form and send exactly that as `referral_code` on submit. A successful
 * check is not a completed order: the discount only attaches when the order
 * request carries the code.
 *
 * @param {string} token - توکن احراز هویت (اجباری)
 * @param {string} code - کد معرف
 * @returns {Promise<{ok: boolean, data: {code: string, status: string, status_label: string, discount_percent: number, referrer: object}, message?: string, code?: string}>}
 */
export const checkReferralCode = (token, code) =>
  request(() =>
    axios.post(
      `${uri}${API_ENDPOINTS.REFERRAL.CHECK}`,
      { code: normalizeReferralCode(code) },
      { headers: headers(token) }
    )
  );

/**
 * نام کامل معرف برای نمایش
 *
 * @param {{name?: string, last_name?: string}} referrer
 * @returns {string}
 */
export const formatReferrerName = (referrer) =>
  [referrer?.name, referrer?.last_name].filter(Boolean).join(' ').trim();

/**
 * پیام خطای کد معرف
 *
 * `REFERRAL_CODE_USED` deliberately gets a message that explains *why* — it is
 * the one error a user is likely to hit by accident, by sharing a code that
 * someone else already redeemed.
 *
 * @param {{code?: string, message?: string}} result
 * @param {Function} t - i18next translate
 * @returns {string}
 */
export const describeReferralError = (result, t) => {
  if (result?.message) return result.message;

  switch (result?.code) {
    case 'REFERRAL_CODE_NOT_FOUND':
      return t('This referral code does not exist.');
    case 'REFERRAL_CODE_OWNER_NOT_FOUND':
      return t('This referral code is not linked to a valid referrer.');
    case 'REFERRAL_CODE_USED':
      return t('This referral code has already been used by another account.');
    case 'INVALID_REFERRAL_CODE':
      return t('Referral code is invalid.');
    default:
      return t('Referral code is invalid.');
  }
};

export default {
  checkReferralCode,
  normalizeReferralCode,
  formatReferrerName,
  describeReferralError,
};
