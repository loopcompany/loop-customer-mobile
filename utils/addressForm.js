/**
 * قواعدِ فرمِ «افزودن آدرس» — نرمال‌سازی، اعتبارسنجی و ساختِ payload.
 *
 * چرا بیرون از صفحه: همین قواعد چند مصرف‌کننده دارند (فرمِ آدرس و صفحه‌های
 * نقشه) و قبلاً فقط داخلِ `onPress` فرم زندگی می‌کردند — به‌شکلِ یک `if` بلندِ
 * تک‌پیامی. نتیجه‌اش این بود که کاربر «لطفا همه‌ی فیلدهای الزامی را پر کنید»
 * می‌گرفت بدون اینکه بداند کدام فیلد ایراد دارد، و صفحه‌ی نقشه هرچه در Redux
 * بود را بدون هیچ بررسی‌ای به سرور می‌فرستاد.
 *
 * این ماژول عمداً هیچ وابستگیِ UI ندارد تا بشود مستقیم تستش کرد.
 */
import { convertToEnglish } from '@helpers/Common';

/** پیش‌شماره‌ی ثابتِ تهران؛ فرم فقط ۸ رقمِ بعدش را از کاربر می‌گیرد. */
export const LANDLINE_PREFIX = '021';

/** تهران ۲۲ منطقه‌ی شهرداری دارد. */
export const MAX_REGION = 22;

/** حداقلِ طولِ «آدرس با جزئیات» — کمتر از این عملاً آدرس نیست. */
export const MIN_ADDRESS_LENGTH = 10;

/** فقط فیلدهای واقعیِ آدرس به سرور می‌روند (اسلایس `data`/`loading`/`error` هم دارد). */
export const ADDRESS_FIELDS = [
  'title',
  'fname',
  'lname',
  'telephone',
  'mobile',
  'city',
  'region',
  'address',
  'unit',
  'number',
  'floor',
  'latitude',
  'longitude',
];

/** ترتیبِ فیلدها روی فرم — برای پیدا کردنِ «اولین خطا» و اسکرول به آن. */
export const FIELD_ORDER = [
  'location',
  'title',
  'fname',
  'lname',
  'mobile',
  'telephone',
  'region',
  'number',
  'unit',
  'floor',
  'address',
];

const text = (value) => String(value ?? '').trim();

/** ارقامِ فارسی/عربی را لاتین می‌کند و هرچه رقم نیست را دور می‌ریزد. */
export const digitsOnly = (value) => convertToEnglish(String(value ?? '')).replace(/[^0-9]/g, '');

/**
 * «۰۹۱۲…»، «+98912…»، «98912…» و «912…» همگی یک شماره‌اند.
 *
 * باگی که این تابع می‌بندد: فرم مقدار را `'0' + text` ذخیره می‌کرد در حالی که
 * برای نمایش یک صفرِ ابتدایی را برمی‌داشت، پس با هر حرفِ تایپ‌شده یک صفرِ
 * اضافه ته‌نشین می‌شد و شماره‌ی ذخیره‌شده «۰۰۹۱۲…» از آب درمی‌آمد.
 */
export const normalizeMobile = (raw) => {
  let value = digitsOnly(raw);
  if (!value) return '';
  if (value.startsWith('0098')) value = value.slice(4);
  else if (value.startsWith('98') && value.length > 10) value = value.slice(2);
  if (value.startsWith('9')) value = `0${value}`;
  return value.slice(0, 11);
};

/** بخشِ محلیِ تلفن ثابت (بدون پیش‌شماره) — همان چیزی که در فرم تایپ می‌شود. */
export const localLandline = (stored) => {
  const value = digitsOnly(stored);
  return value.startsWith(LANDLINE_PREFIX) ? value.slice(LANDLINE_PREFIX.length) : value;
};

/**
 * ۸ رقمِ محلی → مقدارِ ذخیره‌شده.
 *
 * ورودیِ خالی رشته‌ی خالی می‌دهد، نه «۰۲۱»ِ تنها: آن «شماره»ی بی‌معنا قبلاً
 * ذخیره می‌شد و بعداً روی رسید به‌جای تلفن ثابت چاپ می‌شد.
 */
export const composeLandline = (local) => {
  const value = digitsOnly(local).slice(0, 8);
  return value ? `${LANDLINE_PREFIX}${value}` : '';
};

/** مختصاتِ معتبر یعنی دو عددِ متناهی — `null`ِ حالتِ اولیه را رد می‌کند. */
export const hasCoordinates = (address) =>
  Number.isFinite(address?.latitude) && Number.isFinite(address?.longitude);

/**
 * «موقعیت انتخاب شده» یعنی کاربر *عمداً* نقطه‌ای را مشخص کرده.
 *
 * نقشه‌ی داخلِ فرم همیشه یک مرکز دارد، پس مختصات به‌تنهایی معیار نیست: بدونِ
 * این پرچم، کاربری که اصلاً به نقشه دست نزده هم «موقعیت دارد» و مرکزِ پیش‌فرضِ
 * شهر به‌عنوان آدرسِ خانه‌اش ثبت می‌شود.
 */
export const hasLocation = (address) =>
  hasCoordinates(address) && Boolean(address?.locationPicked);

/**
 * چیزی که از ژئوکدینگِ نقشه باید در فرم بنشیند.
 *
 * فقط جاهای خالی پر می‌شوند. «آدرس» استثناست و جای متنِ قبلی می‌نشیند — ولی
 * فقط وقتی آن متن خودش از نقشه آمده باشد؛ چیزی که کاربر با دست نوشته (مثلاً
 * «واحد ۳، زنگ دوم») با جابه‌جاییِ پین پاک نمی‌شود.
 *
 * @param {object} address اسلایسِ آدرس.
 * @param {object|null} resolved خروجیِ services/geocoding.
 * @returns {object} پچِ آماده برای `setAddressFields` (ممکن است خالی باشد).
 */
export const mapFillPatch = (address, resolved) => {
  if (!resolved) return {};

  const patch = {};
  const typedByUser = !!address?.address && address.address !== (address?.addressFromMap || '');

  if (resolved.formatted && !typedByUser) {
    patch.address = resolved.formatted;
    patch.addressFromMap = resolved.formatted;
  }
  if (resolved.city && !text(address?.city)) patch.city = resolved.city;
  if (resolved.region && !text(address?.region)) patch.region = resolved.region;
  if (resolved.number && !text(address?.number)) patch.number = resolved.number;

  return patch;
};

/**
 * کلِ فرم را اعتبارسنجی می‌کند.
 *
 * @param {object} address اسلایسِ آدرس (یا هر آبجکتِ هم‌شکل).
 * @param {(key: string) => string} t مترجمِ i18next.
 * @returns {Record<string, string>} نگاشتِ نامِ فیلد به پیامِ خطا؛ خالی یعنی معتبر.
 */
export const validateAddressForm = (address, t) => {
  const errors = {};

  if (!hasLocation(address)) {
    errors.location = t('Please choose the location on the map.');
  }

  const title = text(address?.title);
  if (!title) errors.title = t('Address title is required.');
  else if (title.length < 2) errors.title = t('Address title is too short.');

  const fname = text(address?.fname);
  if (!fname) errors.fname = t('First name is required.');
  else if (fname.length < 2) errors.fname = t('Name is too short.');

  const lname = text(address?.lname);
  if (!lname) errors.lname = t('Last name is required.');
  else if (lname.length < 2) errors.lname = t('Name is too short.');

  // همان قواعدِ `validatePhone` در helpers/Common، با همان کلیدهای ترجمه — ولی
  // پیام از `t`ی که به این تابع داده شده می‌آید، نه از نمونه‌ی ماژولیِ i18n.
  // هر پیامِ این ماژول از یک راه می‌آید، و تستْ بدونِ بالا آوردنِ i18n کار می‌کند.
  const mobile = normalizeMobile(address?.mobile);
  if (!mobile) errors.mobile = t('Mobile number is required');
  else if (mobile.length !== 11) errors.mobile = t('Phone number must be 11 digits');
  else if (!mobile.startsWith('09')) errors.mobile = t('Phone number must start with 09');

  const landline = localLandline(address?.telephone);
  if (!landline) errors.telephone = t('Landline is required.');
  else if (landline.length !== 8) errors.telephone = t('Landline must be 8 digits.');

  const region = digitsOnly(address?.region);
  const regionNumber = Number(region);
  if (!text(address?.region)) errors.region = t('Region is required.');
  else if (!region || regionNumber < 1 || regionNumber > MAX_REGION) {
    errors.region = t('Region must be a number between 1 and 22.');
  }

  if (!text(address?.number)) errors.number = t('Plate number is required.');
  if (!text(address?.unit)) errors.unit = t('Unit is required.');
  if (!text(address?.floor)) errors.floor = t('Floor is required.');

  const full = text(address?.address);
  if (!full) errors.address = t('Full address is required.');
  else if (full.length < MIN_ADDRESS_LENGTH) errors.address = t('Full address is too short.');

  return errors;
};

/** اولین فیلدِ خراب به ترتیبِ چیدمانِ فرم. */
export const firstErrorField = (errors) =>
  FIELD_ORDER.find((field) => errors?.[field]) || Object.keys(errors || {})[0] || null;

/**
 * بدنه‌ی درخواستِ ثبت آدرس.
 *
 * فقط فیلدهای واقعی، بدونِ مقادیرِ خالی، با ارقامِ لاتین در فیلدهای عددی —
 * سرور «۱۲» فارسی را عدد نمی‌داند.
 */
export const buildAddressPayload = (address) => {
  const normalized = {
    ...address,
    mobile: normalizeMobile(address?.mobile),
    telephone: composeLandline(localLandline(address?.telephone)),
    region: digitsOnly(address?.region),
    unit: digitsOnly(address?.unit),
    number: convertToEnglish(text(address?.number)),
    floor: digitsOnly(address?.floor),
    title: text(address?.title),
    fname: text(address?.fname),
    lname: text(address?.lname),
    city: text(address?.city),
    address: text(address?.address),
  };

  return ADDRESS_FIELDS.reduce((payload, key) => {
    const value = normalized[key];
    if (value !== undefined && value !== null && value !== '') payload[key] = value;
    return payload;
  }, {});
};

/**
 * خطاهای اعتبارسنجیِ سرور (۴۲۲ لاراول: `{errors: {field: [msg]}}`) را به همان
 * شکلی درمی‌آورد که فرم برای نمایشِ زیرِ فیلد لازم دارد.
 */
export const serverFieldErrors = (error) => {
  const raw = error?.response?.data?.errors;
  if (!raw || typeof raw !== 'object') return {};
  return Object.keys(raw).reduce((acc, key) => {
    const value = raw[key];
    const message = Array.isArray(value) ? value[0] : value;
    if (message) acc[key] = String(message);
    return acc;
  }, {});
};

/**
 * یک پیامِ قابلِ نمایش برای هر شکستِ ثبت آدرس.
 *
 * تفاوتِ «سرور جواب داد ولی رد کرد» با «اصلاً به سرور نرسیدیم» مهم است:
 * نسخه‌ی قبلی هر دو را یکسان نشان می‌داد و کاربرِ آفلاین پیامِ «خطای
 * ناشناخته» می‌گرفت.
 */
export const submitErrorMessage = (error, t) => {
  if (!error?.response) {
    return error?.code === 'ECONNABORTED' ? t('Request timed out.') : t('Network error!');
  }

  const { status, data } = error.response;

  if (status === 401) return t('Unauthorized access!');
  if (status === 403) return data?.message || t('Unauthorized access!');
  if (status === 422) {
    const first = Object.values(serverFieldErrors(error))[0];
    return first || data?.message || t('Please fix the highlighted fields.');
  }
  if (status >= 500) return t('Server error, please try again later.');

  return data?.message || t('An unexpected error occurred!');
};
