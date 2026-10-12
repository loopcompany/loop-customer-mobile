// فیلدهای اجباریِ «انتخاب جامع» پیش از ثبت سفارش (بند ۱۱ سند کارفرما).
//
// کاربر ممکن است فقط «تامین تجهیزات / کالا» بخواهد؛ پس بخش‌های خدماتی
// (نرم‌افزاری، سخت‌افزاری، وضعیت تجهیزات، زیرساخت، سطح خدمات) اجباری نیستند.
// اجباری‌ها طبق سند: تامین تجهیزات (یا هر قلم خدمتی دیگر)، نحوه ارائه
// «کوتاه مدت / یکبار»، بازه زمانی، آدرس، اطلاعات اپراتور و انتخاب تکنسین.
//
// تابع خالص است تا بدون رندر صفحه تست شود. اولین مرحله‌ی ناقص را به ترتیبِ
// نمایش در صفحه برمی‌گرداند تا صفحه همان بخش را باز کند.

export const ONCE_SHORT = 'once_short';

const hasPositive = (map, read = (value) => value) =>
  Object.values(map || {}).some((entry) => Number(read(entry)) > 0);

/** آیا حداقل یک قلم «تامین تجهیزات / کالا» انتخاب شده؟ */
export const hasProcurement = (procurementItems) =>
  Object.values(procurementItems || {}).some(
    (entry) => Number(entry?.new) > 0 || Number(entry?.used) > 0
  );

/** آیا حداقل یک قلم خدمت نرم‌افزاری یا سخت‌افزاری انتخاب شده؟ */
export const hasServiceItems = ({
  deviceCounts,
  osCounts,
  softwareDeviceCounts,
  softwareItems,
  hardwareItems,
}) =>
  hasPositive(deviceCounts) ||
  hasPositive(osCounts) ||
  hasPositive(softwareDeviceCounts) ||
  hasPositive(softwareItems, (entry) => entry?.count) ||
  hasPositive(hardwareItems, (entry) => entry?.count);

/**
 * @returns {{ section: string, message: string } | null} اولین مرحله‌ی ناقص،
 *   یا null وقتی سفارش قابل ثبت است. `message` متن فارسی است و صفحه آن را از
 *   مسیر L() ترجمه می‌کند.
 */
export const getMissingComprehensiveStep = (state) => {
  const {
    procurementItems,
    deliveryMode = [],
    onceDate,
    startDate,
    timeSlot,
    addressId,
    technicianGender,
  } = state;

  const procurement = hasProcurement(procurementItems);
  const services = hasServiceItems(state);

  if (!procurement && !services) {
    return {
      section: 'procurement',
      message:
        'حداقل یک قلم «تامین تجهیزات / کالا» یا یک خدمت نرم‌افزاری / سخت‌افزاری انتخاب کنید.',
    };
  }

  if (!deliveryMode.length) {
    return { section: 'delivery_mode', message: 'نحوه ارائه خدمات را انتخاب کنید.' };
  }
  // سفارشی که فقط تامین کالاست یک‌بار تحویل می‌شود.
  if (procurement && !services && !deliveryMode.includes(ONCE_SHORT)) {
    return {
      section: 'delivery_mode',
      message: 'برای تامین کالا «کوتاه مدت / یکبار» را انتخاب کنید.',
    };
  }

  const isOnceShort = deliveryMode.includes(ONCE_SHORT);
  if (!(isOnceShort ? onceDate : startDate)) {
    return {
      section: 'time_range',
      message: 'تاریخ مراجعه را در «بازه زمانی / رزرو» انتخاب کنید.',
    };
  }
  if (!timeSlot) {
    return { section: 'time_range', message: 'بازه ساعتی را در «بازه زمانی / رزرو» انتخاب کنید.' };
  }

  if (addressId == null) {
    return { section: 'address', message: 'یکی از «آدرس‌های منتخب» را انتخاب کنید.' };
  }

  // «اطلاعات اپراتور» جزئیات بیشتری دارد و صفحه خودش پیام دقیق آن را می‌سازد.
  if (state.operatorError) {
    return { section: 'operator_info', message: state.operatorError };
  }

  if (!technicianGender) {
    return { section: 'technician', message: 'در «انتخاب تکنسین» یکی از گزینه‌ها را انتخاب کنید.' };
  }

  return null;
};
