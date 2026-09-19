// Adapter مسیر «انتخاب سیستماتیک» → مدل رسید.
//
// این مسیر هیچ‌وقت سفارش را روی سرور ثبت نمی‌کند (OrderSummaryScreen شماره‌ی
// سفارش را محلی می‌سازد)، پس رسید باید کاملاً از همان `answers`ی ساخته شود که
// SystematicDeviceScreen نگه می‌دارد. شکل هر پاسخ به `type` مرحله بستگی دارد -
// همان قرارداد سطح‌به‌سطحی که summaryLines در آن صفحه هم از آن می‌خواند.

import { PROCUREMENT_ITEMS, HARDWARE_ITEMS, OS_ITEMS, TIME_SLOT_OPTIONS } from '@org/deviceCatalog';
import { getFlow, getCategory } from '@org/systematicFlows';
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

/** مراحلی که خودشان ردیف رسید نمی‌سازند - جای دیگری از رسید نمایش داده می‌شوند. */
const NON_SERVICE_STEPS = new Set([
  'brand', // → مشخصات محصول
  'model', // → مشخصات محصول
  'procurement', // → جدول اقلام
  'technician', // → جزئی از سفارش، نه ردیف خدمت
  'time_range', // → مشخصات تحویل
  'order_actions', // → دکمه‌ها، نه داده
]);

/**
 * پاسخ یک مرحله را به متن خوانا تبدیل می‌کند - همان متنی که در ستون
 * «شرح خدمات درخواستی» رسید می‌نشیند.
 *
 * @returns {string[]} صفر یا چند عبارت؛ خالی یعنی این مرحله چیزی برای گفتن ندارد.
 */
const describeStep = (step, value) => {
  if (value == null) return [];

  switch (step.type) {
    case 'osGrid':
      return value ? [titleOf(LO(OS_ITEMS), value)] : [];

    case 'options': {
      const selected = value.selected;
      if (selected == null || (Array.isArray(selected) && selected.length === 0)) return [];
      const options = LO(step.options || []);
      const titles = Array.isArray(selected)
        ? selected.map((id) => titleOf(options, id))
        : [titleOf(options, selected)];
      // گزینه‌های وضعیتی (مثل «وضعیت دستگاه») بدون عنوانِ مرحله بی‌معنا می‌شوند.
      return titles.map((title) => `${L(step.title)}: ${title}`);
    }

    case 'checklist': {
      const titles = (value.selected || []).map((id) => titleOf(LO(step.options || []), id));
      const note = (value.note || '').trim();
      return note ? [...titles, note] : titles;
    }

    case 'note': {
      const note = (value.note || '').trim();
      return note ? [`${L(step.title)}: ${note}`] : [];
    }

    case 'photo': {
      const parts = [];
      const note = (value.note || '').trim();
      if (note) parts.push(`${L(step.title)}: ${note}`);
      if (value.photos?.length)
        parts.push(`${L(step.title)} - ${L('عکس')}: ${value.photos.length}`);
      return parts;
    }

    case 'hardwareCounters':
      return Object.entries(value)
        .filter(([, entry]) => entry?.count > 0)
        .map(([itemId, entry]) => `${titleOf(LO(HARDWARE_ITEMS), itemId)} × ${entry.count}`);

    case 'fields':
      return (step.fields || [])
        .map((field) => (value[field.id] || '').trim())
        .filter(Boolean)
        .map((text) => `${L(step.title)}: ${text}`);

    default:
      return [];
  }
};

/** ردیف‌های «اقلام» از مرحله‌ی «تامین تجهیزات / کالا». */
const buildItems = (procurementAnswer) => {
  if (!procurementAnswer) return [];
  const rows = [];
  Object.entries(procurementAnswer).forEach(([itemId, entry]) => {
    const title = titleOf(LO(PROCUREMENT_ITEMS), itemId);
    // آکبند و کارکرده دو ردیف جدا هستند - قیمتشان یکی نیست و کاربر هم
    // جداگانه شمرده‌شان.
    if (entry?.new > 0) {
      rows.push({ title, condition: L('آکبند'), qty: entry.new });
    }
    if (entry?.used > 0) {
      rows.push({ title, condition: L('کارکرده'), qty: entry.used });
    }
  });
  return rows;
};

/**
 * @param {object} input
 * @param {string} input.categoryId شناسه‌ی دسته‌ی سیستماتیک (laptop / monitor / ...).
 * @param {object} input.answers پاسخ‌های مراحل، کلید = شناسه‌ی مرحله.
 * @param {object} [input.user] state.user.data
 * @param {object} [input.orgProfile] state.organization.profileData
 * @param {object[]} [input.addresses] state.address.data - منبع آدرس و تلفن ثابت.
 * @param {string|number} [input.selectedAddressId] state.step.addressId
 * @param {string} [input.state] حالت رسید؛ پیش‌فرض «جزئیات سفارش».
 * @param {string|number} [input.orderNumber]
 * @returns {object} رسید نرمال‌شده.
 */
export const receiptFromSystematic = ({
  categoryId,
  answers = {},
  user = null,
  orgProfile = null,
  addresses = null,
  selectedAddressId = null,
  state = RECEIPT_STATE.PENDING,
  orderNumber = null,
}) => {
  const steps = getFlow(categoryId);
  const category = getCategory(categoryId);

  // --- مشخصات محصول ---------------------------------------------------
  const brandStep = steps.find((step) => step.id === 'brand');
  const brandAnswer = answers.brand;
  const brandEntry = brandAnswer?.brand
    ? (brandStep?.brands || []).find((brand) => brand.id === brandAnswer.brand)
    : null;
  const brandTitle = brandAnswer?.brand
    ? titleOf(LO(brandStep?.brands || []), brandAnswer.brand)
    : (brandAnswer?.other || '').trim() || null;
  // لوگوی برند - در طرح، «برند» به‌جای متن با لوگو نشان داده می‌شود. برندهایی
  // که لوگو ندارند (یا از کادر «برند دیگر» آمده‌اند) به متن برمی‌گردند.
  const brandLogo = brandEntry?.image ?? null;

  const modelStep = steps.find((step) => step.id === 'model');
  const modelAnswer = modelStep ? answers[modelStep.id] : null;
  const modelTitle = modelStep
    ? (modelAnswer?.[modelStep.fields?.[0]?.id] || '').trim() || null
    : null;

  const productType = category?.title ? L(category.title) : null;

  // مانیتور و ضایعات مرحله‌ی «مدل» ندارند و ضایعات برند هم ندارد؛ اگر هیچ
  // هویتی از دستگاه نداریم کل بخش «مشخصات محصول» حذف می‌شود، نه اینکه کادرِ
  // خالی چاپ شود.
  const product =
    brandTitle || modelTitle
      ? { type: productType, brand: brandTitle, brandLogo, model: modelTitle }
      : null;

  // --- خدمات ------------------------------------------------------------
  // همه‌ی مراحل توصیفی در یک ردیف جمع می‌شوند - دقیقاً مثل طرح، که یک سطرِ
  // «لپ تاپ / Acer / X555U» دارد و شرحش چند خدمت جداشده با «/» است.
  const descriptions = steps
    .filter((step) => !NON_SERVICE_STEPS.has(step.id))
    .flatMap((step) => describeStep(step, answers[step.id]));

  const services = descriptions.length
    ? [
        {
          title: productType,
          brand: brandTitle,
          model: modelTitle,
          description: descriptions.join(' / '),
          qty: 1,
        },
      ]
    : [];

  // --- اقلام ------------------------------------------------------------
  const items = buildItems(answers.procurement);

  // --- زمان مراجعه ------------------------------------------------------
  const schedule = answers.time_range;
  const slotTitle = schedule?.slot ? titleOf(LO(TIME_SLOT_OPTIONS), schedule.slot) : null;

  const isOrg = isOrganizationAccount(user?.account_type);

  return buildReceipt({
    state,
    issuedAt: todayReceiptDate(),
    order: {
      number: orderNumber,
      userCode: resolveUserCode(user),
      userName: [user?.fname, user?.lname].filter(Boolean).join(' ') || user?.name || null,
      userStatus: accountTypeLabel(user?.account_type),
      registeredDate: todayReceiptDate(),
      registeredTime: toReceiptTime(new Date()),
    },
    customer: resolveCustomer({
      isOrganization: isOrg,
      addresses,
      selectedAddressId,
      orgProfile,
      user,
    }),
    product,
    items,
    services,
    delivery: {
      // تاریخ مراجعه‌ی انتخابی کاربر، نه تاریخ تحویل واقعی - تا وقتی سفارش
      // روی سرور ثبت نشده تحویلی هم رخ نداده است.
      date: schedule?.date ? toReceiptDate(schedule.date) : null,
      status: slotTitle ? `${DELIVERY_STATUS.UNKNOWN} (${slotTitle})` : DELIVERY_STATUS.UNKNOWN,
    },
    payment: {
      // مسیر سازمانی قیمت ندارد: «پس از بررسی کارشناس اعلام می‌شود».
      status: state === RECEIPT_STATE.PENDING ? L('در انتظار تایید و پرداخت') : null,
      method: state === RECEIPT_STATE.PENDING ? L('در انتظار تایید و پرداخت') : null,
    },
  });
};

export default receiptFromSystematic;
