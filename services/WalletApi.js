// services/WalletApi.js — Wallet & transactions.
//
// Contract: FRONTEND_WALLET.md. Amounts are integer tomans everywhere; the
// backend returns `price` as a decimal *string* ("500000.00"), so anything
// numeric must go through `Number()` before it is formatted or compared.
//
// Every call goes through the shared `axiosConfig` instance rather than a bare
// `axios`, so 401s raise the session-expiry sheet once instead of each screen
// inventing its own handling. Results come back in the normalised
// `{ ok, data, message, code }` shape from `apiResponse.js` — these endpoints
// can report failure with a 2xx body, so callers must branch on `ok`.
import axios from './axiosConfig';
import i18next from 'i18next';
import { uri } from './URL';
import { API_ENDPOINTS } from './ApiEndpoints';
import { request, unwrapList } from './apiResponse';

// حداقل و حداکثر مبلغ شارژ (تومان) — اعتبارسنجی بک‌اند هم همین است.
export const MIN_CHARGE_AMOUNT = 10000;
export const MAX_CHARGE_AMOUNT = 50000000;

// نوع تراکنش
export const TRANSACTION_TYPE = {
  CHARGE: 1, // شارژ کیف پول
  ORDER_GATEWAY: 2, // پرداخت سفارش از درگاه
  ORDER_WALLET: 3, // پرداخت سفارش از کیف پول
};

// وضعیت تراکنش. `-200` است، نه `-1` — نسخه‌های قدیمی این صفحه اشتباه داشتند.
export const TRANSACTION_STATUS = {
  PENDING: 0,
  SUCCESS: 100,
  FAILED: -200,
};

// The shared instance fixes Accept-Language at module init; wallet messages are
// localized, so send the *current* language per request. A token is passed
// explicitly when the caller has one, because the request interceptor reads
// AsyncStorage and a "remember me"-less session lives under a different key.
const headers = (token) => ({
  'Accept-Language': i18next.language || 'en',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/**
 * دریافت موجودی کیف پول
 *
 * This is the only trustworthy balance. `state.user.data.wallet` is a snapshot
 * taken at token-validation time and goes stale the moment an order is paid.
 *
 * @param {string} [token] - توکن احراز هویت
 * @returns {Promise<{ok: boolean, data: {wallet_balance: number}, message?: string, code?: string}>}
 */
export const getWalletBalance = (token) =>
  request(() => axios.get(`${uri}${API_ENDPOINTS.WALLET.BALANCE}`, { headers: headers(token) }));

/**
 * دریافت لیست تراکنش‌های کاربر
 *
 * @param {string} [token] - توکن احراز هویت
 * @param {Object} [params] - from_date, to_date, per_page, page
 * @returns {Promise<{ok: boolean, data: any, message?: string, code?: string}>}
 */
export const getTransactions = (token, params = {}) => {
  // Only send the filters that are actually set — an empty `from_date=` is a
  // validation error on the backend, not an absent filter.
  const query = {};
  if (params.from_date) query.from_date = params.from_date;
  if (params.to_date) query.to_date = params.to_date;
  if (params.per_page) query.per_page = params.per_page;
  if (params.page) query.page = params.page;

  return request(() =>
    axios.get(`${uri}${API_ENDPOINTS.WALLET.TRANSACTIONS}`, { headers: headers(token), params: query })
  );
};

/**
 * بیرون کشیدن لیست تراکنش‌ها از پاسخ
 *
 * The backend documents `data.transactions` but currently also answers with the
 * bare collection and an empty `pagination`, so both shapes must work.
 *
 * @param {any} data - the `data` field of a getTransactions result
 * @returns {Array}
 */
export const selectTransactions = (data) => unwrapList(data, 'transactions');

/**
 * شارژ کیف پول — یک لینک پرداخت می‌سازد، موجودی را تغییر نمی‌دهد
 *
 * The balance rises only after the backend verifies the gateway callback. Never
 * add the amount locally just because the payment page opened.
 *
 * @param {string} [token] - توکن احراز هویت
 * @param {{amount: number, linking_url: string}} chargeData
 * @returns {Promise<{ok: boolean, data: {payment_url: string, transaction_id: number, amount: number}, message?: string, code?: string}>}
 */
export const chargeWallet = (token, chargeData) =>
  request(() =>
    axios.post(
      `${uri}${API_ENDPOINTS.WALLET.CHARGE}`,
      { amount: Number(chargeData?.amount), linking_url: chargeData?.linking_url },
      { headers: headers(token) }
    )
  );

/**
 * پرداخت سفارش از کیف پول
 *
 * The payable amount is recalculated server-side, discounts and referral
 * discounts included — the client must not compute or send it.
 *
 * Body key is `orderId` (camelCase). `/orders/gateway-payment` takes
 * `order_id`; that inconsistency is the backend's.
 *
 * @param {string} [token] - توکن احراز هویت
 * @param {number} orderId - شناسه سفارش
 * @returns {Promise<{ok: boolean, data: {order_id: number, paid_amount: number, remaining_balance: number, transaction_id: number}, message?: string, code?: string}>}
 */
export const payOrderFromWallet = (token, orderId) =>
  request(() =>
    axios.post(`${uri}${API_ENDPOINTS.WALLET.PAY_ORDER}`, { orderId }, { headers: headers(token) })
  );

/**
 * پرداخت سفارش از درگاه — جدا از شارژ کیف پول
 *
 * @param {string} [token] - توکن احراز هویت
 * @param {{orderId: number, linkingUrl: string}} params
 * @returns {Promise<{ok: boolean, data: {payment_url: string}, message?: string, code?: string}>}
 */
export const payOrderViaGateway = (token, { orderId, linkingUrl }) =>
  request(() =>
    axios.post(
      `${uri}${API_ENDPOINTS.ORDERS.GATEWAY_PAYMENT}`,
      { order_id: orderId, linking_url: linkingUrl },
      { headers: headers(token) }
    )
  );

/**
 * پیام فارسی/انگلیسی برای خطاهای شناخته‌شده‌ی پرداخت
 *
 * The backend's own `message` is preferred when present; this only covers the
 * documented `error_code`s so a bare code never reaches the user.
 *
 * @param {{code?: string, message?: string}} result
 * @param {Function} t - i18next translate
 * @returns {string}
 */
export const describeWalletError = (result, t) => {
  if (result?.message) return result.message;

  switch (result?.code) {
    case 'INSUFFICIENT_BALANCE':
      return t('Your wallet balance is not enough. Please charge your wallet first.');
    case 'ALREADY_PAID':
      return t('This order has already been paid.');
    case 'ORDER_NOT_FOUND':
      return t('Order not found.');
    case 'INVALID_PRICE':
      return t('The order amount is not valid yet.');
    case 'PAYMENT_ERROR':
      return t('The payment could not be completed.');
    default:
      return t('An unexpected error occurred!');
  }
};

export default {
  getTransactions,
  selectTransactions,
  chargeWallet,
  payOrderFromWallet,
  payOrderViaGateway,
  getWalletBalance,
  describeWalletError,
  MIN_CHARGE_AMOUNT,
  MAX_CHARGE_AMOUNT,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
};
