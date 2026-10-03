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
