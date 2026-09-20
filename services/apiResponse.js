// Shared response/error helpers for the wallet, discount and referral APIs.
//
// These three backends share two habits that a plain `try/catch` gets wrong:
//
// 1. **Business errors can arrive with a 2xx status.** `/referral-codes/check`
//    returns `REFERRAL_CODE_NOT_FOUND` / `REFERRAL_CODE_USED` as HTTP 200 with
//    `success:false` (documented in FRONTEND_REFERRAL_CODES.md), and
//    `/orders/check-discount` can do the same. axios only rejects on a non-2xx
//    status, so a caller that relies on `catch` silently treats those as
//    success. Every call here is normalised to `{ ok, data, message, code }`
//    so callers branch on `ok`, never on the HTTP status.
//
// 2. **The envelope is inconsistent.** Some endpoints answer
//    `{ success, data: {...} }` and others return the collection directly
//    (`/user/discounts`, `/discounts/list`, and `/wallet/transactions` when the
//    backend skips its pagination wrapper). `unwrapList` accepts both.

/**
 * وضعیت موفق بودن پاسخ
 *
 * A body is a failure only when it *says* so. An endpoint that returns a bare
 * collection has no `success` field at all, and that is not an error.
 *
 * @param {any} body - response.data
 * @returns {boolean}
 */
export const isOk = (body) => body?.success !== false;

/**
 * تبدیل پاسخ axios به شکل یکدست `{ ok, data, message, code }`
 *
 * @param {object} response - axios response
 * @returns {{ ok: boolean, data: any, message: string|undefined, code: string|undefined, status: number|undefined }}
 */
export const normalize = (response) => {
  const body = response?.data;
  return {
    ok: isOk(body),
    // `data` may be absent on endpoints that return the payload at the top level.
    data: body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body,
    message: body?.message,
    code: body?.error_code,
    status: response?.status,
  };
};

/**
 * تبدیل خطای axios به همان شکل یکدست
 *
 * Network failures have no response at all, so `code` stays undefined and the
 * caller falls back to its own generic message.
 *
 * @param {Error} error - axios error
 * @returns {{ ok: false, data: undefined, message: string|undefined, code: string|undefined, status: number|undefined }}
 */
export const normalizeError = (error) => ({
  ok: false,
  data: undefined,
  message: error?.response?.data?.message,
  code: error?.response?.data?.error_code,
  status: error?.response?.status,
});

/**
 * اجرای یک درخواست و برگرداندن نتیجه‌ی یکدست — بدون throw
 *
 * Callers get one shape for every outcome: transport failure, business error
 * and success. Nothing here throws, so a screen never needs its own try/catch
 * just to tell "invalid code" apart from "no internet".
 *
 * @param {Function} request - a function returning an axios promise
 * @returns {Promise<{ ok: boolean, data: any, message: string|undefined, code: string|undefined, status: number|undefined }>}
 */
export const request = async (request_) => {
  try {
    return normalize(await request_());
  } catch (error) {
    return normalizeError(error);
  }
};

/**
 * بیرون کشیدن آرایه از پاسخی که ممکن است پوشش‌دار باشد یا نباشد
 *
 * Accepts `[...]`, `{ data: [...] }`, `{ data: { <key>: [...] } }` and returns
 * `[]` for anything else, so a screen's FlatList never receives a non-array.
 *
 * @param {any} payload - the already-unwrapped `data`
 * @param {string} [key] - optional nested key, e.g. 'transactions'
 * @returns {Array}
 */
export const unwrapList = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default { isOk, normalize, normalizeError, request, unwrapList };
