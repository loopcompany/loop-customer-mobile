// منبع واحدِ «مشخصات کاربر» روی رسید.
//
// هر سه adapter قبلاً بلوکِ customer را خودشان می‌ساختند و هر کدام فقط یک منبع
// می‌شناختند - به‌همین دلیل آدرس و تلفن ثابت روی رسیدهای سازمانی همیشه
// «نامشخص» می‌شد: تنها منبعشان `state.organization.profileData` بود و آن state
// هیچ‌جای اپ پر نمی‌شود (`setProfileData` هیچ dispatch نمی‌شود). آدرسِ واقعیِ
// کاربر در `state.address` است - همان آدرسی که سفارش با `address_id` آن ثبت
// می‌شود - و شماره‌ی ثابت و کد ملی هم روی پروفایل کاربر (`/user/profile`)
// نام‌های دیگری دارند (`phone_number` / `melicode`).
//
// این فایل همه‌ی آن منابع را پشت یک زنجیره‌ی fallback جمع می‌کند تا رسید هر سه
// مسیر یک رفتار داشته باشد.

const text = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
};

/** اولین مقدار غیرخالی از یک زنجیره‌ی fallback. */
const firstOf = (...values) => {
  for (const value of values) {
    const found = text(value);
    if (found) return found;
  }
  return null;
};

/**
 * شماره‌ی ثابت، بدون باقی‌مانده‌های فرمِ آدرس.
 *
 * AddNewAddress پیش‌شماره‌ی «۰۲۱» را جدا نگه می‌دارد و با `'021' + text` ذخیره
 * می‌کند؛ اگر کاربر چیزی تایپ نکرده باشد، در state رشته‌ی «۰۲۱» می‌ماند که
 * شماره نیست. آن حالت باید مثل خالی رفتار کند، نه اینکه روی رسید چاپ شود.
 */
const toLandline = (value) => {
  const found = text(value);
  if (!found) return null;
  const digits = found.replace(/\D/g, '');
  if (digits.length <= 3) return null;
  return found;
};

/** یک رکورد آدرس (ذخیره‌شده یا در حال ویرایش) را به یک خط خوانا تبدیل می‌کند. */
export const formatAddressEntry = (entry) => {
  if (!entry) return null;
  const parts = [
    entry.city,
    entry.region,
    entry.address,
    entry.number ? `پلاک ${entry.number}` : '',
    entry.unit ? `واحد ${entry.unit}` : '',
    entry.floor ? `طبقه ${entry.floor}` : '',
  ];
  return firstOf(parts.filter((part) => text(part)).join('، '));
};

/**
 * آدرسی که سفارش با آن ثبت می‌شود: آدرسِ انتخاب‌شده، وگرنه اولین آدرسِ
 * ذخیره‌شده - دقیقاً همان ترتیبی که OrderSummaryScreen هنگام ساختن
 * `address_id` دنبال می‌کند، تا رسید همان آدرسی را نشان دهد که واقعاً ثبت شد.
 *
 * @param {object[]} addresses آدرس‌های ذخیره‌شده (`state.address.data`).
 * @param {string|number} selectedAddressId آدرس انتخاب‌شده (`state.step.addressId`).
 */
export const pickSavedAddress = (addresses, selectedAddressId) => {
  if (!Array.isArray(addresses) || addresses.length === 0) return null;
  const picked = addresses.find((item) => String(item?.id) === String(selectedAddressId));
  return picked ?? addresses[0];
};

/**
 * مشخصات آدرس‌محورِ کاربر: آدرس، تلفن ثابت و نامِ تحویل‌گیرنده.
 *
 * @param {object} input
 * @param {object} [input.addressEntry] رکورد آدرسِ خودِ سفارش (`user_address` پاسخ سرور).
 * @param {object[]} [input.addresses] `state.address.data`
 * @param {string|number} [input.selectedAddressId] `state.step.addressId`
 * @param {object} [input.addressDraft] `state.address` - فرمِ در حال پر شدن.
 * @param {object} [input.orgProfile] `state.organization.profileData`
 * @param {object} [input.user] `state.user.data`
 */
export const resolveAddressInfo = ({
  addressEntry = null,
  addresses = null,
  selectedAddressId = null,
  addressDraft = null,
  orgProfile = null,
  user = null,
} = {}) => {
  const saved = pickSavedAddress(addresses, selectedAddressId);

  return {
    address: firstOf(
      formatAddressEntry(addressEntry),
      formatAddressEntry(saved),
      formatAddressEntry(addressDraft),
      orgProfile?.address,
      // پروفایل کاربر (`/user/profile`) آدرس را در این دو فیلد نگه می‌دارد.
      user?.home_address,
      user?.work_address,
      user?.address
    ),
    landline:
      toLandline(addressEntry?.telephone) ||
      toLandline(saved?.telephone) ||
      toLandline(addressDraft?.telephone) ||
      toLandline(orgProfile?.phone) ||
      toLandline(user?.phone_number) ||
      toLandline(user?.telephone) ||
      toLandline(user?.landline),
    receiverName: firstOf(
      [addressEntry?.fname, addressEntry?.lname].filter(Boolean).join(' '),
      [saved?.fname, saved?.lname].filter(Boolean).join(' ')
    ),
    mobile: firstOf(addressEntry?.mobile, saved?.mobile, addressDraft?.mobile),
  };
};

/**
 * بلوکِ کامل `customer` رسید. همه‌ی adapterها از همین می‌گذرند تا زنجیره‌ی
 * fallback یک‌جا نگهداری شود.
 *
 * @param {object} input همان ورودی‌های resolveAddressInfo، به‌علاوه:
 * @param {boolean} input.isOrganization خروجی isOrganizationAccount.
 * @param {string} [input.name] نامی که خودِ مسیر می‌داند (مثلاً نامِ اپراتور).
 * @param {string} [input.phone] شماره‌ی تماسی که خودِ مسیر می‌داند.
 * @param {string} [input.nationalId] کد/شناسه‌ی ملی‌ای که خودِ مسیر می‌داند.
 * @returns {object} بخش `customer` مدل رسید.
 */
export const resolveCustomer = ({
  isOrganization,
  name = null,
  phone = null,
  nationalId = null,
  ...addressInput
}) => {
  const { user = null, orgProfile = null } = addressInput;
  const info = resolveAddressInfo(addressInput);

  return {
    isOrganization,
    name: isOrganization
      ? firstOf(name, orgProfile?.organization_name, user?.organization_name, user?.name)
      : firstOf(
          name,
          info.receiverName,
          [user?.fname, user?.lname].filter(Boolean).join(' '),
          [user?.name, user?.last_name].filter(Boolean).join(' '),
          user?.name
        ),
    nationalId: isOrganization
      ? firstOf(nationalId, orgProfile?.national_id, user?.national_id, user?.melicode)
      : firstOf(nationalId, user?.national_code, user?.melicode, user?.national_id),
    phone: firstOf(phone, user?.mobile, user?.mobile_number, user?.phone, info.mobile),
    landline: info.landline,
    address: info.address,
  };
};

/**
 * کد کاربری‌ای که روی رسید چاپ می‌شود.
 *
 * همان کدی که داکِ پایینِ اپ نشان می‌دهد (`contexts/MenuContext.js` → `user.code`)
 * - نه `user.id` که یک عدد کوتاهِ داخلیِ دیتابیس است و کاربر هیچ‌جای دیگری
 * نمی‌بیندش.
 *
 * @param {object} user `state.user.data`
 */
export const resolveUserCode = (user) => firstOf(user?.code) ?? user?.id ?? null;
