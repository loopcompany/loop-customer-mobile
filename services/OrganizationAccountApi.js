// services/OrganizationAccountApi.js — بخش‌های تازه‌ی «حساب کاربری سازمانی / شرکتی / نیمه‌دولتی».
//
// مدارک سازمان و کاربران مجاز هنوز endpoint ندارند (قرارداد پیشنهادی در
// docs/BACKEND_REQUIREMENTS_USER_ORG_APP.md). مثل AccountSecurityApi، همه‌چیز
// شکل یکدست `{ ok, data, message, code, status }` برمی‌گرداند و throw نمی‌کند.
import axios from './axiosConfig';
import { uri } from './URL';
import { API_ENDPOINTS, buildEndpointWithParams } from './ApiEndpoints';
import { request, unwrapList } from './apiResponse';

const O = API_ENDPOINTS.ORGANIZATION;
const url = (path, params) => `${uri}${params ? buildEndpointWithParams(path, params) : path}`;
const QUIET = { skipGlobalErrorAlert: true };

// ---------------------------------------------------------------------------
// وضعیت احراز هویت سازمان
// ---------------------------------------------------------------------------
// «در حال بررسی توسط پنل مدیریت / حذف / معلق / تایید» - به‌علاوه‌ی «رد شده» که
// سیستم دسترسی سازمانی (profile_status) از قبل دارد.
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
  REJECTED: 'rejected',
};

const STATUS_ALIASES = {
  pending: VERIFICATION_STATUS.PENDING,
  in_review: VERIFICATION_STATUS.PENDING,
  reviewing: VERIFICATION_STATUS.PENDING,
  0: VERIFICATION_STATUS.PENDING,
  approved: VERIFICATION_STATUS.APPROVED,
  verified: VERIFICATION_STATUS.APPROVED,
  active: VERIFICATION_STATUS.APPROVED,
  1: VERIFICATION_STATUS.APPROVED,
  suspended: VERIFICATION_STATUS.SUSPENDED,
  blocked: VERIFICATION_STATUS.SUSPENDED,
  deleted: VERIFICATION_STATUS.DELETED,
  removed: VERIFICATION_STATUS.DELETED,
  rejected: VERIFICATION_STATUS.REJECTED,
  2: VERIFICATION_STATUS.REJECTED,
};

/**
 * وضعیت احراز هویت سازمان. منبع اصلی `verification_status` پاسخ
 * `/organization/profile` است (پیشنهادی)؛ تا وقتی بک‌اند آن را نفرستد، همان
 * `profile_status` سیستم دسترسی (`/organization/profile/status`) استفاده می‌شود.
 *
 * @param {object} profileData بدنه‌ی `/organization/profile`.
 * @param {string} accessProfileStatus `state.organization.profileStatus`.
 * @returns {string|null} یکی از VERIFICATION_STATUS یا null اگر نامعلوم است.
 */
export const resolveVerificationStatus = (profileData, accessProfileStatus) => {
  const raw = profileData?.verification_status ?? profileData?.status_label ?? accessProfileStatus;
  if (raw == null || raw === '') return null;
  return STATUS_ALIASES[String(raw).trim().toLowerCase()] ?? null;
};

// ---------------------------------------------------------------------------
// مدارک سازمان (اختیاری)
// ---------------------------------------------------------------------------
export const listDocuments = async () => {
  const result = await request(() => axios.get(url(O.DOCUMENTS), QUIET));
  return result.ok ? { ...result, data: unwrapList(result.data, 'documents') } : result;
};

/**
 * @param {{ uri: string, name: string, mimeType?: string, file?: File }} asset خروجی expo-document-picker.
 * @param {string} [title]
 */
export const uploadDocument = (asset, title) => {
  const formData = new FormData();
  // روی وب expo-document-picker خودِ File را هم می‌دهد؛ روی موبایل شیء {uri,name,type}.
  formData.append('file', asset.file ?? { uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' });
  if (title) formData.append('title', title);
  return request(() =>
    axios.post(url(O.DOCUMENTS), formData, {
      ...QUIET,
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
  );
};

export const deleteDocument = (id) => request(() => axios.delete(url(O.DOCUMENT, { id }), QUIET));

// ---------------------------------------------------------------------------
// کاربران مجاز سازمان
// ---------------------------------------------------------------------------
export const listAuthorizedUsers = async () => {
  const result = await request(() => axios.get(url(O.USERS), QUIET));
  return result.ok ? { ...result, data: unwrapList(result.data, 'users') } : result;
};

/** @param {{ full_name: string, mobile: string, role?: string }} user */
export const addAuthorizedUser = (user) => request(() => axios.post(url(O.USERS), user, QUIET));

export const removeAuthorizedUser = (id) => request(() => axios.delete(url(O.USER, { id }), QUIET));

// ---------------------------------------------------------------------------
// ویرایش پروفایل: فیلدهای آزاد و قفل‌شده (بند ۱۰ سند «توضیحات اپ کاربر»)
// ---------------------------------------------------------------------------
// «ویرایش»: کاربر سازمانی/شرکتی خودش این‌ها را تغییر می‌دهد (پروفایل، نام و
// شماره‌ی نماینده‌ی مدیرعامل، سابقه‌ی فعالیت نماینده، ایمیل، تلفن ثابت، منطقه،
// آدرس و کد پستی سازمان). شهر هم جزو آدرس است.
export const FREE_PROFILE_FIELDS = [
  'profile_image',
  'agent_name',
  'agent_phone',
  'history',
  'organization_email',
  'organization_phone',
  'city',
  'region',
  'organization_address',
  'postal_code',
];

// «درخواست ویرایش»: قفل‌اند و فقط پس از تأیید پنل (با نامه‌ی مهر و امضادار) یک
// بار قابل ویرایش‌اند؛ پس از ذخیره دوباره قفل می‌شوند. پنج مورد اول را سند نام
// برده (manager_mobile همان موبایل ثبت‌شده‌ی حساب است)؛ بقیه اطلاعات هویتی/ثبتی
// سازمان‌اند که سند تکلیفشان را نگفته و به‌طور پیش‌فرض قفل نگه داشته شده‌اند.
export const LOCKED_PROFILE_FIELDS = [
  'organization_name',
  'manager_mobile',
  'manager_national_code',
  'manager_full_name',
  'business_name',
  'melicode',
  'registration_number',
  'economic_code',
  'manager_birthdate',
];

export const EDIT_REQUEST_STATUS = {
  PENDING: 'pending', // در انتظار بررسی پنل
  APPROVED: 'approved', // تأیید شده؛ فیلدهای قفل باز هستند
  REJECTED: 'rejected',
  USED: 'used', // ویرایش انجام شد و دوباره قفل شد
};

const EDIT_REQUEST_ALIASES = {
  0: EDIT_REQUEST_STATUS.PENDING,
  pending: EDIT_REQUEST_STATUS.PENDING,
  1: EDIT_REQUEST_STATUS.APPROVED,
  approved: EDIT_REQUEST_STATUS.APPROVED,
  2: EDIT_REQUEST_STATUS.REJECTED,
  rejected: EDIT_REQUEST_STATUS.REJECTED,
  3: EDIT_REQUEST_STATUS.USED,
  used: EDIT_REQUEST_STATUS.USED,
  completed: EDIT_REQUEST_STATUS.USED,
};

/**
 * وضعیت «درخواست ویرایش» از پاسخ `/organization/profile`.
 *
 * فیلدهای قفل فقط وقتی باز می‌شوند که سرور صریحاً بگوید (`locked_fields_unlocked`)
 * یا درخواست «تأیید شده» باشد - پیش‌فرض همیشه قفل است (fail secure).
 *
 * @param {object} profile بدنه‌ی `data` پاسخ پروفایل
 */
export const readEditRequestState = (profile) => {
  const raw = profile?.edit_request && typeof profile.edit_request === 'object' ? profile.edit_request : null;
  const status = raw ? EDIT_REQUEST_ALIASES[String(raw.status ?? '').trim().toLowerCase()] ?? null : null;

  const unlocked =
    profile?.locked_fields_unlocked === true ||
    (status === EDIT_REQUEST_STATUS.APPROVED && profile?.locked_fields_unlocked !== false);

  const serverFields = Array.isArray(profile?.unlocked_fields)
    ? profile.unlocked_fields.filter((field) => LOCKED_PROFILE_FIELDS.includes(field))
    : [];
  const unlockedFields = unlocked ? (serverFields.length ? serverFields : LOCKED_PROFILE_FIELDS) : [];

  return {
    request: raw
      ? {
          id: raw.id ?? null,
          status,
          description: raw.description || null,
          letterUrl: raw.letter_url || null,
          fields: Array.isArray(raw.fields) ? raw.fields : [],
          adminNote: raw.admin_note || null,
          createdAt: raw.created_at || null,
          reviewedAt: raw.reviewed_at || null,
        }
      : null,
    status,
    unlocked,
    unlockedFields,
    // درخواست تازه فقط وقتی معنا دارد که چیزی در انتظار یا باز نباشد.
    canRequest: !unlocked && status !== EDIT_REQUEST_STATUS.PENDING,
  };
};

/**
 * آیا این فیلد در حالت فعلی قابل ویرایش است؟
 * @param {string} field
 * @param {{ editing: boolean, unlockedFields: string[] }} state
 */
export const isProfileFieldEditable = (field, { editing, unlockedFields = [] }) =>
  Boolean(editing) && (FREE_PROFILE_FIELDS.includes(field) || unlockedFields.includes(field));

/**
 * فقط فیلدهای مجاز را برای `POST /organization/update-profile` برمی‌دارد، تا
 * فیلد قفل‌شده هرگز بدون تأیید پنل فرستاده نشود.
 *
 * @param {Record<string, any>} values
 * @param {string[]} unlockedFields
 */
export const pickEditableProfileValues = (values, unlockedFields = []) =>
  Object.keys(values || {}).reduce((acc, key) => {
    if (key === 'profile_image') return acc; // عکس جدا (multipart) فرستاده می‌شود
    if (FREE_PROFILE_FIELDS.includes(key) || unlockedFields.includes(key)) acc[key] = values[key];
    return acc;
  }, {});

/**
 * ثبت «درخواست تغییر اطلاعات حساب کاربری» با نامه‌ی مهر و امضادار (اجباری).
 *
 * @param {{ description: string, letter: { uri: string, name: string, mimeType?: string, file?: File }, fields?: string[] }} input
 */
export const submitEditRequest = ({ description, letter, fields = [] }) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append(
    'letter',
    letter.file ?? { uri: letter.uri, name: letter.name, type: letter.mimeType || 'application/octet-stream' }
  );
  fields.forEach((field) => formData.append('fields[]', field));
  return request(() =>
    axios.post(url(O.EDIT_REQUESTS), formData, {
      ...QUIET,
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
  );
};
