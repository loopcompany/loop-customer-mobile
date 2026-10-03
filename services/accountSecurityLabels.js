// برچسب‌های فارسی مقادیر «امنیت حساب» - جدا از UI تا قابل تست باشند.
// مقادیر کلیدها همان‌هایی است که docs/BACKEND_REQUIREMENTS_USER_ORG_APP.md از
// بک‌اند می‌خواهد؛ مقدار ناشناخته با `title` خودِ سرور (اگر بود) نمایش داده می‌شود.

export const ACTIVITY_TYPE_LABELS = {
  login_success: 'ورود موفق',
  login_failed: 'ورود ناموفق',
  two_factor_enabled: 'فعال شدن تأیید دومرحله‌ای',
  two_factor_disabled: 'غیرفعال شدن تأیید دومرحله‌ای',
  mobile_changed: 'تغییر شماره موبایل',
  device_logout: 'خروج از دستگاه',
  logout_other_devices: 'خروج از سایر دستگاه‌ها',
  password_changed: 'تغییر رمز عبور',
  security_info_changed: 'تغییر اطلاعات امنیتی',
  session_ended: 'پایان نشست',
  deletion_requested: 'درخواست حذف حساب',
};

export const ALERT_TYPE_LABELS = {
  new_device_login: 'ورود از دستگاه جدید',
  multiple_failed_logins: 'چند ورود ناموفق',
  password_changed: 'تغییر رمز عبور',
  mobile_changed: 'تغییر شماره موبایل',
  two_factor_changed: 'فعال/غیرفعال شدن تأیید دومرحله‌ای',
  unusual_activity: 'شناسایی فعالیت غیرعادی',
};

// سطح اهمیت → برچسب و رنگ (tone در AccountUI.StatusPill).
export const SEVERITY = {
  low: { label: 'کم', tone: 'info' },
  medium: { label: 'متوسط', tone: 'warning' },
  high: { label: 'زیاد', tone: 'error' },
  critical: { label: 'بحرانی', tone: 'error' },
};

export const DELETION_STATUS = {
  pending: { label: 'در انتظار بررسی', tone: 'warning' },
  approved: { label: 'تأیید شده', tone: 'info' },
  done: { label: 'انجام شده', tone: 'success' },
  canceled: { label: 'لغو شده', tone: 'muted' },
  rejected: { label: 'رد شده', tone: 'error' },
};

export const TWO_FACTOR_METHODS = {
  sms: 'پیامک',
  app: 'اپ احراز هویت',
};

export const DEVICE_TYPE_ICONS = {
  phone: 'phone-portrait-outline',
  tablet: 'tablet-portrait-outline',
  browser: 'globe-outline',
  desktop: 'desktop-outline',
};

const pick = (map, key) => (key == null ? undefined : map[String(key).toLowerCase()]);

export const activityLabel = (item) =>
  pick(ACTIVITY_TYPE_LABELS, item?.type) || item?.title || item?.type || 'رویداد';

export const alertTypeLabel = (item) =>
  pick(ALERT_TYPE_LABELS, item?.type) || item?.type || 'هشدار';

export const severityOf = (value) => pick(SEVERITY, value) || SEVERITY.low;

export const deletionStatusOf = (value) => pick(DELETION_STATUS, value) || null;

/** هشدارهای «بحرانی» قابل خاموش کردن نیستند (طبق سند امنیت حساب). */
export const isMutableAlertSeverity = (value) => String(value || '').toLowerCase() !== 'critical';

/** شناسه‌ی طولانی دستگاه را برای نمایش کوتاه می‌کند: «a1b2…f9e8». */
export const shortId = (id) => {
  const text = id == null ? '' : String(id);
  return text.length > 12 ? `${text.slice(0, 4)}…${text.slice(-4)}` : text;
};

/** «۵ دستگاه دیگر» - تعداد دستگاه‌های فعال به‌جز دستگاه فعلی. */
export const otherDevicesCount = (devices) =>
  (Array.isArray(devices) ? devices : []).filter((device) => !device?.is_current).length;
