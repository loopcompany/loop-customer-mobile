// روش و کانال پرداخت سفارش (بند ۷ «توضیحات اپ کاربر»).
//
// پرداخت‌ها از سوی همه‌ی کاربران از سه کانال (اپ / سایت / حضوری) و با یکی از
// روش‌های «نقدی، کارت به کارت، شبا، پرداخت درون‌بانکی، پرداخت درون برنامه لوپ،
// پرداخت نشده و مانده» انجام می‌شود. سرور امروز این دو فیلد را برنمی‌گرداند؛
// قرارداد پیشنهادی (`payment_method`, `payment_channel`, `remaining_amount`) در
// docs/BACKEND_REQUIREMENTS_USER_ORG_APP.md است. تا آن موقع describePayment
// مقدار null برمی‌گرداند و هر صفحه رفتار قبلی خودش را نگه می‌دارد.

export const PAYMENT_METHODS = {
  cash: 'نقدی',
  card_to_card: 'کارت به کارت',
  sheba: 'شبا',
  bank_transfer: 'پرداخت درون‌بانکی',
  in_app: 'پرداخت درون برنامه لوپ',
  unpaid: 'پرداخت نشده',
  remaining: 'مانده',
};

// نام‌های دیگری که ممکن است بک‌اند برای همان روش‌ها بفرستد.
const METHOD_ALIASES = {
  card: 'card_to_card',
  card2card: 'card_to_card',
  'card-to-card': 'card_to_card',
  iban: 'sheba',
  shaba: 'sheba',
  bank: 'bank_transfer',
  inter_bank: 'bank_transfer',
  interbank: 'bank_transfer',
  online: 'in_app',
  gateway: 'in_app',
  wallet: 'in_app',
  app: 'in_app',
  not_paid: 'unpaid',
  partial: 'remaining',
};

export const PAYMENT_CHANNELS = {
  app: 'اپ',
  site: 'سایت',
  in_person: 'حضوری',
};

const CHANNEL_ALIASES = {
  application: 'app',
  mobile: 'app',
  android: 'app',
  ios: 'app',
  web: 'site',
  website: 'site',
  office: 'in_person',
  inperson: 'in_person',
  'in-person': 'in_person',
};

const normalizeKey = (value, aliases, table) => {
  if (value == null) return null;
  const key = String(value).trim().toLowerCase();
  if (!key) return null;
  if (table[key]) return key;
  return aliases[key] && table[aliases[key]] ? aliases[key] : null;
};

/**
 * @param {object} order پاسخ سفارش یا تراکنش.
 * @returns {{ method: string, channel: string|null, remainingAmount: number|null, label: string }|null}
 *   null وقتی سرور روش پرداخت را نفرستاده است.
 */
export const describePayment = (order) => {
  const methodKey = normalizeKey(order?.payment_method, METHOD_ALIASES, PAYMENT_METHODS);
  if (!methodKey) return null;
  const channelKey = normalizeKey(order?.payment_channel, CHANNEL_ALIASES, PAYMENT_CHANNELS);
  const method = PAYMENT_METHODS[methodKey];
  const channel = channelKey ? PAYMENT_CHANNELS[channelKey] : null;
  const remaining = Number(order?.remaining_amount);
  const remainingAmount = Number.isFinite(remaining) && remaining > 0 ? remaining : null;
  return {
    method,
    channel,
    remainingAmount,
    label: channel ? `${method} (${channel})` : method,
  };
};
