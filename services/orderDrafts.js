// پیش‌نویس سفارش‌های نیمه‌کاره‌ی مسیرهای سازمانی (سیستماتیک و جامع).
//
// کاربری که تا «نمایش / استعلام / ثبت سفارش» پیش رفته نباید به‌خاطر یک خطا یا
// یک مرحله‌ی ناقص (مثلاً نداشتن آدرس) همه‌ی انتخاب‌هایش را از دست بدهد. هر
// تغییری در مراحل، در یک پیش‌نویس روی همین دستگاه ذخیره می‌شود و در «سفارشات»
// با دکمه‌ی «ادامه» نمایش داده می‌شود. پیش‌نویس فقط وقتی پاک می‌شود که سفارش
// واقعاً روی سرور ثبت شود یا کاربر خودش آن را حذف کند.
//
// ذخیره محلی است (AsyncStorage)، نه روی سرور؛ پس بین دو دستگاه همگام نمی‌شود.
// هر حساب کلید جدای خودش را دارد تا پیش‌نویس یک حساب به حساب دیگری که روی همین
// دستگاه وارد می‌شود نشان داده نشود.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@loop/orderDrafts/';
// سقف تعداد پیش‌نویس‌ها؛ قدیمی‌ترین‌ها کنار گذاشته می‌شوند.
export const MAX_DRAFTS = 20;

export const DRAFT_SOURCE = {
  SYSTEMATIC: 'systematic',
  COMPREHENSIVE: 'comprehensive',
};

/**
 * کلید پیش‌نویس‌های یک حساب، یا null اگر هویت کاربر هنوز معلوم نیست (در آن
 * حالت چیزی ذخیره نمی‌شود، نه زیر یک کلید مشترک).
 *
 * @param {object} user `state.user.data`
 * @param {string} userType `state.auth.userType`
 */
export const draftOwnerKey = (user, userType) => {
  const id = user?.id;
  if (id == null || String(id).trim() === '') return null;
  return `${userType || 'user'}:${id}`;
};

export const createDraftId = () =>
  `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// آدرس‌های blob:/data: (عکس‌های انتخاب‌شده در وب) بعد از بستن صفحه معتبر نیستند و
// data: می‌تواند چند مگابایت باشد؛ در پیش‌نویس نگه داشته نمی‌شوند.
const isTransientUri = (value) =>
  typeof value === 'string' && /^(blob|data):/i.test(value);

/**
 * کپی قابل‌ذخیره از پاسخ‌ها: رشته‌های blob:/data: داخل آرایه‌ها حذف می‌شوند.
 *
 * @param {*} value
 */
export const sanitizeDraftData = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => !isTransientUri(item)).map(sanitizeDraftData);
  }
  if (value && typeof value === 'object') {
    const out = {};
    Object.entries(value).forEach(([key, item]) => {
      if (isTransientUri(item)) return;
      out[key] = sanitizeDraftData(item);
    });
    return out;
  }
  return value;
};

const storageKey = (ownerKey) => `${KEY_PREFIX}${ownerKey}`;

const readAll = async (ownerKey) => {
  try {
    const raw = await AsyncStorage.getItem(storageKey(ownerKey));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((draft) => draft && draft.id) : [];
  } catch (error) {
    // پیش‌نویس خراب نباید صفحه‌ی سفارشات را از کار بیندازد.
    console.warn('[orderDrafts] read failed', error);
    return [];
  }
};

const writeAll = async (ownerKey, drafts) => {
  try {
    await AsyncStorage.setItem(storageKey(ownerKey), JSON.stringify(drafts));
    return true;
  } catch (error) {
    console.warn('[orderDrafts] write failed', error);
    return false;
  }
};

/**
 * @param {string|null} ownerKey خروجی draftOwnerKey.
 * @returns {Promise<object[]>} جدیدترین اول.
 */
export const listDrafts = async (ownerKey) => {
  if (!ownerKey) return [];
  const drafts = await readAll(ownerKey);
  return drafts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};

/**
 * @param {string|null} ownerKey
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const getDraft = async (ownerKey, id) => {
  if (!ownerKey || !id) return null;
  const drafts = await readAll(ownerKey);
  return drafts.find((draft) => draft.id === id) || null;
};

/**
 * درج یا به‌روزرسانی یک پیش‌نویس.
 *
 * @param {string|null} ownerKey
 * @param {object} draft باید `id` و `source` داشته باشد؛ `data` همان state مراحل است.
 */
export const saveDraft = async (ownerKey, draft) => {
  if (!ownerKey || !draft?.id) return false;
  const drafts = await readAll(ownerKey);
  const next = {
    ...draft,
    data: sanitizeDraftData(draft.data),
    updatedAt: Date.now(),
  };
  const others = drafts.filter((item) => item.id !== draft.id);
  const merged = [next, ...others]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, MAX_DRAFTS);
  return writeAll(ownerKey, merged);
};

/**
 * @param {string|null} ownerKey
 * @param {string} id
 */
export const deleteDraft = async (ownerKey, id) => {
  if (!ownerKey || !id) return false;
  const drafts = await readAll(ownerKey);
  const remaining = drafts.filter((draft) => draft.id !== id);
  if (remaining.length === drafts.length) return true;
  return writeAll(ownerKey, remaining);
};
