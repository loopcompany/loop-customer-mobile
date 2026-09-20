// پروفایلِ حساب - منبعِ نهاییِ «مشخصات کاربر» روی رسید.
//
// چرا لازم است: تنها چیزی که رسید از کاربر در اختیار داشت `state.user.data`
// بود، و آن از `POST /auth/validate-token` پر می‌شود - پاسخی که فقط شناسه،
// موبایل، ایمیل و نوع حساب دارد (docs/ORGANIZATION_API_DOCS.md بخش ۵). نه
// آدرس دارد، نه تلفن ثابت، نه کد/شناسه‌ی ملی. منبع دومِ رسید هم
// `state.organization.profileData` بود که `setProfileData` هیچ‌جای اپ dispatch
// نمی‌شود، پس همیشه null است. نتیجه: زنجیره‌های fallback در receiptCustomer.js
// ته‌شان به undefined می‌رسید و ردیف‌های «آدرس»، «تلفن ثابت» و «شماره/شناسه
// ملی» روی رسید «نامشخص» چاپ می‌شدند - حتی وقتی کاربر همه‌ی این‌ها را در
// صفحه‌ی پروفایل پر کرده بود.
//
// این فایل همان دو endpointی را صدا می‌زند که خودِ صفحه‌های پروفایل می‌خوانند
// (`screens/account/Profile.js` → `GET /profile`، `screens/account/
// OrganizationProfile.js` → `GET /organization/profile`) و خروجی‌شان را به یک
// شکل واحد درمی‌آورد تا رسید لازم نباشد دو ساختار متفاوت را بشناسد.

import axiosInstance from '@services/axiosConfig';
import { uri } from '@services/URL';

const text = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
};

const firstOf = (...values) => {
  for (const value of values) {
    const found = text(value);
    if (found) return found;
  }
  return null;
};

const joined = (...parts) => firstOf(parts.filter((part) => text(part)).join(' '));

/**
 * شهر را جلوی آدرس می‌گذارد، مگر اینکه خودِ آدرس قبلاً شهر را داشته باشد.
 * فرم پروفایل شهر را جدا از متن آدرس نگه می‌دارد، ولی روی رسید یک خط است.
 */
const withCity = (city, address) => {
  const cityName = text(city);
  const line = text(address);
  if (!line) return cityName;
  if (!cityName || line.includes(cityName)) return line;
  return `${cityName}، ${line}`;
};

/**
 * `GET /profile` → `data.user` (همان شکلی که screens/account/Profile.js می‌خواند).
 *
 * @param {object} user بدنه‌ی کاربر در پاسخ پروفایل.
 * @returns {object|null} پروفایل نرمال‌شده.
 */
export const normalizeUserProfile = (user) => {
  if (!user) return null;
  return {
    name: joined(user.name, user.last_name) || joined(user.fname, user.lname),
    // فرم پروفایل کد ملی را در `melicode` نگه می‌دارد؛ بقیه املاهای قدیمی‌اند.
    nationalId: firstOf(user.melicode, user.national_code, user.national_id),
    mobile: firstOf(user.mobile_number, user.mobile, user.phone),
    landline: firstOf(user.phone_number, user.telephone, user.landline),
    address: withCity(user.city, firstOf(user.home_address, user.work_address, user.address)),
  };
};

/**
 * `GET /organization/profile` → `data` (همان شکلی که
 * screens/account/OrganizationProfile.js می‌خواند).
 *
 * @param {object} data بدنه‌ی پروفایل سازمان.
 * @returns {object|null} پروفایل نرمال‌شده.
 */
export const normalizeOrganizationProfile = (data) => {
  if (!data) return null;
  return {
    name: firstOf(data.organization_name, data.business_name),
    // فرم ثبت‌نام سازمانی «شناسه ملی» را در melicode می‌فرستد و «کد ملی مدیر»
    // را در manager_national_code - روی رسید شناسه‌ی سازمان اولویت دارد.
    nationalId: firstOf(
      data.melicode,
      data.organization_national_id,
      data.national_id,
      data.manager_national_code
    ),
    mobile: firstOf(data.manager_mobile, data.agent_phone, data.mobile_number),
    landline: firstOf(data.organization_phone, data.phone_number, data.telephone),
    address: withCity(data.city, firstOf(data.organization_address, data.address)),
  };
};

// پروفایل بین رفت‌وبرگشت‌های ناوبری عوض نمی‌شود؛ بدون کش، هر بار باز کردن یک
// رسید یک درخواست شبکه‌ی تازه بود. کلید شامل توکن است تا ورود با حساب دیگر
// خودبه‌خود دوباره fetch کند.
const profileCache = new Map();

/** کلیدِ کش برای یک نشست. */
export const accountProfileCacheKey = (token, isOrganization) =>
  token ? `${token}|${isOrganization ? 'org' : 'user'}` : null;

/** پروفایلِ کش‌شده، یا undefined اگر هنوز گرفته نشده است. */
export const getCachedAccountProfile = (key) => (key ? profileCache.get(key) : undefined);

/**
 * پاک کردن کش - موقع خروج از حساب. این کش در Redux نیست، پس با
 * `emptyUser()`/`clearOrganizationData()` پاک نمی‌شود.
 */
export const clearAccountProfileCache = () => profileCache.clear();

/**
 * پروفایلِ حسابِ واردشده را می‌گیرد و نرمال می‌کند.
 *
 * خطا را بالا نمی‌دهد: رسید باید بدون پروفایل هم رندر شود - این لایه فقط
 * ردیف‌های خالی را پر می‌کند و نبودنش نباید صفحه را از کار بیندازد.
 *
 * @param {boolean} isOrganization حساب سازمانی است یا کاربر عادی.
 * @param {string} [cacheKey] خروجی accountProfileCacheKey؛ با آن نتیجه کش می‌شود.
 * @returns {Promise<object|null>} پروفایل نرمال‌شده یا null.
 */
export const fetchAccountProfile = async (isOrganization, cacheKey = null) => {
  const cached = getCachedAccountProfile(cacheKey);
  if (cached !== undefined) return cached;

  const remember = (value) => {
    if (cacheKey) profileCache.set(cacheKey, value);
    return value;
  };

  try {
    if (isOrganization) {
      const response = await axiosInstance.get(`${uri}/organization/profile`);
      const body = response?.data;
      // این endpoint با `status: 'success'` جواب می‌دهد، نه `success: true`.
      if (body?.status && body.status !== 'success') return remember(null);
      return remember(normalizeOrganizationProfile(body?.data ?? null));
    }

    const response = await axiosInstance.get(`${uri}/profile`);
    const body = response?.data;
    if (body?.success === false) return remember(null);
    return remember(normalizeUserProfile(body?.data?.user ?? body?.user ?? body?.data ?? null));
  } catch (error) {
    // 404/401/آفلاین - رسید با همان منابع محلی ساخته می‌شود.
    // خطا کش نمی‌شود تا دفعه‌ی بعد دوباره تلاش شود.
    console.warn('Receipt profile fetch failed:', error?.message);
    return null;
  }
};

export default fetchAccountProfile;
