// services/AgentWalletApi.js — کیف پول مأمور خرید (بند ۹ سند «توضیحات اپ کاربر»).
//
// مأمور خرید شرکتی/سازمانی صاحب یک کد معرف است و از هر سفارشِ ثبت و تسویه‌شده با
// آن کد درصدی پورسانت می‌گیرد (درصد هر کد جداگانه در پنل - بند ۳). پورسانت در
// این کیف پول جمع می‌شود و مأمور می‌تواند:
//   - همان لحظه یا پس از جمع شدن چند پورسانت، به حساب (شبا) برداشت کند؛
//   - یا به‌جای واریز، آن را «تهاتر» کند: مبلغ به کیف پول لوپ منتقل می‌شود و
//     برای خرید کالا / محصول از لوپ مصرف می‌شود.
//
// قرارداد سرور: docs/BACKEND_REQUIREMENTS_USER_ORG_APP.md بخش ۱۳. مثل بقیه‌ی
// سرویس‌های تازه، throw نمی‌کند و شکل `{ ok, data, message, code, status }` دارد.
import i18next from 'i18next';
import axios from './axiosConfig';
import { uri } from './URL';
import { API_ENDPOINTS } from './ApiEndpoints';
import { request, unwrapList } from './apiResponse';

const A = API_ENDPOINTS.REFERRAL_AGENT;

const config = (token, extra = {}) => ({
  skipGlobalErrorAlert: true,
  ...extra,
  headers: {
    'Accept-Language': i18next.language || 'fa',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

export const WITHDRAW_METHOD = {
  SHEBA: 'sheba', // واریز به حساب بانکی
  OFFSET: 'offset', // تهاتر: انتقال به کیف پول لوپ برای خرید کالا / محصول
};

export const COMMISSION_STATUS_KEYS = {
  pending: 'Pending settlement',
  available: 'Available',
  withdrawn: 'Withdrawn',
  offset: 'Offset against purchase',
  canceled: 'Canceled',
};

export const WITHDRAWAL_STATUS_KEYS = {
  pending: 'Awaiting review',
  approved: 'Approved',
  paid: 'Paid to account',
  done: 'Done',
  rejected: 'Rejected',
};

// ---------------------------------------------------------------------------
// خواندن پاسخ
// ---------------------------------------------------------------------------
const toAmount = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

/**
 * خلاصه‌ی کیف پول. null یعنی کاربر مأمور خرید نیست (یا سرور هنوز این بخش را ندارد).
 * @param {object} data
 */
export const readAgentSummary = (data) => {
  if (!data || data.is_agent === false) return null;
  return {
    referralCode: data.referral_code || null,
    commissionPercent: data.commission_percent != null ? Number(data.commission_percent) : null,
    availableBalance: toAmount(data.available_balance),
    pendingBalance: toAmount(data.pending_balance),
    totalEarned: toAmount(data.total_earned),
    totalWithdrawn: toAmount(data.total_withdrawn),
    totalOffset: toAmount(data.total_offset),
    minWithdrawAmount: toAmount(data.min_withdraw_amount),
    shebaNumber: data.sheba_number || '',
  };
};

// ---------------------------------------------------------------------------
// شبا
// ---------------------------------------------------------------------------
const toLatinDigits = (text) =>
  String(text ?? '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

/** «IR» + ۲۴ رقم، بدون فاصله و با حروف بزرگ. */
export const normalizeSheba = (value) => {
  const compact = toLatinDigits(value).replace(/[\s-]/g, '').toUpperCase();
  if (/^\d{24}$/.test(compact)) return `IR${compact}`;
  return compact;
};

/** اعتبارسنجی شبا با الگوریتم mod-97 استاندارد IBAN. */
export const isValidSheba = (value) => {
  const sheba = normalizeSheba(value);
  if (!/^IR\d{24}$/.test(sheba)) return false;
  // چهار کاراکتر اول به انتها، حروف به عدد (I=18, R=27)
  const rearranged = `${sheba.slice(4)}1827${sheba.slice(2, 4)}`;
  let remainder = 0;
  for (const char of rearranged) remainder = (remainder * 10 + Number(char)) % 97;
  return remainder === 1;
};

/**
 * درخواست برداشت/تهاتر را پیش از ارسال بررسی می‌کند.
 * @returns {string|null} کلید i18n پیام خطا، یا null
 */
export const validateWithdrawal = ({ amount, method, sheba, available, minAmount }) => {
  const value = Number(toLatinDigits(amount).replace(/[^\d]/g, ''));
  if (!value) return 'Enter the amount.';
  if (value > available) return 'The amount is more than your available balance.';
  if (minAmount && value < minAmount && method === WITHDRAW_METHOD.SHEBA) {
    return 'The amount is less than the minimum withdrawal.';
  }
  if (method === WITHDRAW_METHOD.SHEBA && !isValidSheba(sheba))
    return 'Enter a valid Sheba number (IR + 24 digits).';
  if (!Object.values(WITHDRAW_METHOD).includes(method)) return 'Choose how to receive the amount.';
  return null;
};

/** مبلغ عددی از ورودی کاربر (ارقام فارسی و جداکننده‌ها پذیرفته می‌شوند). */
export const parseAmount = (text) => Number(toLatinDigits(text).replace(/[^\d]/g, '')) || 0;

// ---------------------------------------------------------------------------
// فراخوانی‌ها
// ---------------------------------------------------------------------------
export const getAgentSummary = (token) =>
  request(() => axios.get(`${uri}${A.SUMMARY}`, config(token)));

export const listCommissions = async (token, page = 1) => {
  const result = await request(() =>
    axios.get(`${uri}${A.COMMISSIONS}`, config(token, { params: { page } }))
  );
  return result.ok ? { ...result, data: unwrapList(result.data, 'commissions') } : result;
};

export const listWithdrawals = async (token) => {
  const result = await request(() => axios.get(`${uri}${A.WITHDRAWALS}`, config(token)));
  return result.ok ? { ...result, data: unwrapList(result.data, 'withdrawals') } : result;
};

/**
 * @param {string} token
 * @param {{ amount: number, method: 'sheba'|'offset', sheba?: string }} input
 */
export const requestWithdrawal = (token, { amount, method, sheba }) =>
  request(() =>
    axios.post(
      `${uri}${A.WITHDRAWALS}`,
      {
        amount,
        method,
        ...(method === WITHDRAW_METHOD.SHEBA ? { sheba_number: normalizeSheba(sheba) } : {}),
      },
      config(token)
    )
  );

export default {
  getAgentSummary,
  listCommissions,
  listWithdrawals,
  requestWithdrawal,
  readAgentSummary,
  validateWithdrawal,
  isValidSheba,
  normalizeSheba,
};
