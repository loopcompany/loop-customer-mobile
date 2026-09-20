// Adapter مسیر «انتخاب جامع» → مدل رسید.
//
// برخلاف «انتخاب سیستماتیک»، این مسیر هویت دستگاه (برند/مدل) را اصلاً نمی‌پرسد؛
// فقط *تعداد* هر دسته را می‌گیرد. بنابراین رسیدِ جامع بخش «مشخصات محصول» ندارد
// و کامپوننت آن کادر را کلاً حذف می‌کند - به‌جای چاپ کادری با سه خط خالی.
// این مسیر هم روی سرور ثبت نمی‌شود، پس همه‌چیز از state محلی ساخته می‌شود.

import {
  DEVICE_TYPES,
  SOFTWARE_DEVICE_TYPES,
  SOFTWARE_ITEMS,
  HARDWARE_ITEMS,
  PROCUREMENT_ITEMS,
  OS_ITEMS,
  TIME_SLOT_OPTIONS,
} from '@org/deviceCatalog';
import { L, LO } from '@org/orgI18n';
import {
  RECEIPT_STATE,
  DELIVERY_STATUS,
  buildReceipt,
  accountTypeLabel,
  isOrganizationAccount,
} from './receiptModel';
import { resolveCustomer, resolveUserCode } from './receiptCustomer';
import { toReceiptDate, toReceiptTime, todayReceiptDate } from './receiptDates';

const titleOf = (options, id) => options.find((opt) => opt.id === id)?.title || id;

/** ردیف خدمت از یک نقشه‌ی «شناسه → تعداد». */
const countedRows = (catalog, counts, description) =>
  LO(catalog)
    .filter((item) => Number(counts?.[item.id]) > 0)
    .map((item) => ({
      title: item.title,
      description: L(description),
      qty: Number(counts[item.id]),
    }));

/** ردیف خدمت از یک نقشه‌ی «شناسه → {count, desc}». */
const entryRows = (catalog, entries, description) =>
  LO(catalog)
    .filter((item) => Number(entries?.[item.id]?.count) > 0)
    .map((item) => {
      const note = (entries[item.id].desc || '').trim();
      return {
        title: item.title,
        description: note ? `${L(description)} - ${note}` : L(description),
        qty: Number(entries[item.id].count),
      };
    });

/**
 * @param {object} input state صفحه‌ی «انتخاب جامع».
 * @returns {object} رسید نرمال‌شده.
 */
export const receiptFromComprehensive = ({
  deviceCounts = {},
  osCounts = {},
  softwareDeviceCounts = {},
  softwareItems = {},
  hardwareItems = {},
  procurementItems = {},
  operatorInfo = {},
  startDate = '',
  onceDate = '',
  timeSlot = null,
  user = null,
  orgProfile = null,
  profile = null,
  addresses = null,
  selectedAddressId = null,
  state = RECEIPT_STATE.PENDING,
  orderNumber = null,
}) => {
  // --- خدمات ------------------------------------------------------------
  const services = [
    ...countedRows(DEVICE_TYPES, deviceCounts, 'نصب سیستم عامل'),
    ...countedRows(OS_ITEMS, osCounts, 'نصب سیستم عامل'),
    ...countedRows(SOFTWARE_DEVICE_TYPES, softwareDeviceCounts, 'خدمات نرم‌افزاری'),
    ...entryRows(SOFTWARE_ITEMS, softwareItems, 'نصب نرم‌افزار'),
    ...entryRows(HARDWARE_ITEMS, hardwareItems, 'خدمات سخت‌افزاری'),
  ];

  // --- اقلام ------------------------------------------------------------
  const items = [];
  LO(PROCUREMENT_ITEMS).forEach((item) => {
    const entry = procurementItems?.[item.id];
    if (entry?.new > 0) items.push({ title: item.title, condition: L('آکبند'), qty: entry.new });
    if (entry?.used > 0)
      items.push({ title: item.title, condition: L('کارکرده'), qty: entry.used });
  });

  // --- زمان مراجعه ------------------------------------------------------
  // «کوتاه مدت / یکبار» تاریخِ onceDate دارد، بقیه‌ی حالت‌ها startDate.
  const visitDate = onceDate || startDate || null;
  const slotTitle = timeSlot ? titleOf(LO(TIME_SLOT_OPTIONS), timeSlot) : null;

  const isOrg = isOrganizationAccount(user?.account_type);

  // اپراتور، رابطِ سازمان با تکنسین است؛ اگر وارد شده باشد شماره‌ی تماس رسید
  // باید همان باشد، نه موبایلِ حسابِ سازمان.
  const contactPhone = (operatorInfo.mobile || '').trim() || user?.mobile || user?.phone || null;

  return buildReceipt({
    state,
    issuedAt: todayReceiptDate(),
    order: {
      number: orderNumber,
      userCode: resolveUserCode(user),
      userName:
        (operatorInfo.fullName || '').trim() ||
        [user?.fname, user?.lname].filter(Boolean).join(' ') ||
        user?.name ||
        null,
      userStatus: accountTypeLabel(user?.account_type),
      registeredDate: todayReceiptDate(),
      registeredTime: toReceiptTime(new Date()),
    },
    customer: resolveCustomer({
      isOrganization: isOrg,
      // اپراتور، نام و کد ملیِ واردشده در همین فرم را دارد - بر پروفایل مقدم است.
      name: isOrg ? null : (operatorInfo.fullName || '').trim() || null,
      nationalId: isOrg ? null : (operatorInfo.nationalId || '').trim() || null,
      phone: contactPhone,
      addresses,
      selectedAddressId,
      profile,
      orgProfile,
      user,
    }),
    // جامع برند/مدل ندارد - بخش «مشخصات محصول» حذف می‌شود.
    product: null,
    items,
    services,
    delivery: {
      date: visitDate ? toReceiptDate(visitDate) : null,
      // سفارش هنوز ثبت نشده، پس تحویلی هم رخ نداده: «در انتظار تحویل»، نه
      // «نامشخص». بازه‌ی ساعتِ انتخابی کاربر داخل پرانتز می‌آید.
      status: slotTitle ? `${DELIVERY_STATUS.PENDING} (${slotTitle})` : DELIVERY_STATUS.PENDING,
    },
    payment: {
      // مسیر سازمانی قیمت ندارد: «پس از بررسی کارشناس اعلام می‌شود».
      status: state === RECEIPT_STATE.PENDING ? L('در انتظار تایید و پرداخت') : null,
      method: state === RECEIPT_STATE.PENDING ? L('در انتظار تایید و پرداخت') : null,
    },
  });
};

export default receiptFromComprehensive;
