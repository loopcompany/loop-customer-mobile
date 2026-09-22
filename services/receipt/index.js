// تنها نقطه‌ی ورود لایه‌ی رسید - مثل services/notifications/index.js.
//
// مصرف‌کننده‌ها همیشه از '@services/receipt' import می‌کنند، نه از فایل‌های
// داخلی؛ اینطور اگر adapterها جابه‌جا شدند فقط همین فایل عوض می‌شود.

export {
  RECEIPT_STATE,
  ORDER_KIND,
  DELIVERY_STATUS,
  ISSUER,
  PRICE_ON_REQUEST,
  NOT_SET,
  NOT_APPLICABLE,
  ORDER_NUMBER_PENDING,
  buildReceipt,
  asReceipt,
  deriveOrderKind,
  accountTypeLabel,
  isOrganizationAccount,
  sumPrices,
  withReceiptTotal,
  BASE_PRICE_ROW,
} from './receiptModel';

export { toReceiptDate, toReceiptTime, todayReceiptDate } from './receiptDates';

export {
  fetchAccountProfile,
  normalizeUserProfile,
  normalizeOrganizationProfile,
} from './receiptProfile';

export {
  formatAddressEntry,
  pickSavedAddress,
  resolveAddressInfo,
  resolveCustomer,
  resolveUserCode,
} from './receiptCustomer';

export { receiptFromSystematic } from './fromSystematic';
export { receiptFromComprehensive } from './fromComprehensive';
export { receiptFromOrderApi, receiptStateForStatus } from './fromOrderApi';
