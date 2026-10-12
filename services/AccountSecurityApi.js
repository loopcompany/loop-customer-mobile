// services/AccountSecurityApi.js — «امنیت حساب»، حذف حساب و نسخه‌ی اپ.
//
// قرارداد کامل این endpointها در docs/BACKEND_REQUIREMENTS_USER_ORG_APP.md است؛
// در زمان نوشتن این فایل هیچ‌کدام در بک‌اند پیاده نشده‌اند. همه‌ی فراخوانی‌ها
// از نمونه‌ی مشترک axiosConfig رد می‌شوند و خروجی‌شان شکل یکدست
// `{ ok, data, message, code, status }` (apiResponse.js) است و throw نمی‌کنند.
//
// isNotImplemented(result) حالتی را تشخیص می‌دهد که endpoint هنوز روی سرور
// نیست؛ صفحه‌ها در آن حالت به‌جای خطا «به‌زودی فعال می‌شود» نشان می‌دهند.
import axios from './axiosConfig';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { uri } from './URL';
import { API_ENDPOINTS, buildEndpointWithParams } from './ApiEndpoints';
import { request, unwrapList } from './apiResponse';
import { getAppVersion, getInstallationId } from './notifications/deviceInfo';

const A = API_ENDPOINTS.ACCOUNT;
const url = (path, params) => `${uri}${params ? buildEndpointWithParams(path, params) : path}`;
// هر صفحه پیام خطای خودش را نشان می‌دهد؛ alert سراسری interceptor نباید دوباره
// (یا برای endpointی که هنوز پیاده نشده) نمایش داده شود. ۴۰۱ همچنان کشوی نشست را باز می‌کند.
const QUIET = { skipGlobalErrorAlert: true };

/** endpoint هنوز روی سرور وجود ندارد (یا این متد را نمی‌پذیرد). */
export const isNotImplemented = (result) =>
  !result?.ok && [404, 405, 501].includes(Number(result?.status));

// ---------------------------------------------------------------------------
// خلاصه‌ی وضعیت امنیت حساب
// ---------------------------------------------------------------------------
export const getSecuritySummary = () => request(() => axios.get(url(A.SECURITY), QUIET));

// ---------------------------------------------------------------------------
// تأیید دومرحله‌ای
// ---------------------------------------------------------------------------
/** @param {'enable'|'disable'|'recovery_codes'} purpose */
export const sendTwoFactorCode = (purpose, method = 'sms') =>
  request(() => axios.post(url(A.TWO_FACTOR_SEND_CODE), { purpose, method }, QUIET));

export const enableTwoFactor = ({ method = 'sms', code }) =>
  request(() => axios.post(url(A.TWO_FACTOR_ENABLE), { method, code }, QUIET));

export const disableTwoFactor = ({ code }) =>
  request(() => axios.post(url(A.TWO_FACTOR_DISABLE), { code }, QUIET));

export const regenerateRecoveryCodes = ({ code }) =>
  request(() => axios.post(url(A.TWO_FACTOR_RECOVERY_CODES), { code }, QUIET));

// ---------------------------------------------------------------------------
// مرحله‌ی دوم ورود
// ---------------------------------------------------------------------------
// وقتی 2FA فعال است، `/auth/login` و `/organization/login` به‌جای توکن
// `{ requires_two_factor: true, two_factor_token, method }` برمی‌گردانند. پاسخ verify
// دقیقاً همان شکل پاسخ موفق همان ورود را دارد (توکن و کاربر و برای سازمان،
// organization) تا صفحه‌ی ورود همان مسیر تکمیل ورود را طی کند.

/** پاسخ ورود مرحله‌ی دوم می‌خواهد؟ (بدنه‌ی پاسخ `/auth/login` یا `/organization/login`) */
export const readTwoFactorChallenge = (body) =>
  body?.requires_two_factor && body?.two_factor_token
    ? { token: body.two_factor_token, method: body.method === 'app' ? 'app' : 'sms' }
    : null;

/** @param {'individual'|'organization'} accountType */
export const verifyLoginTwoFactor = (accountType, { twoFactorToken, code }) =>
  request(() =>
    axios.post(
      url(accountType === 'organization' ? A.ORG_LOGIN_TWO_FACTOR_VERIFY : A.LOGIN_TWO_FACTOR_VERIFY),
      { two_factor_token: twoFactorToken, code },
      QUIET
    )
  );

export const resendLoginTwoFactor = (accountType, twoFactorToken) =>
  request(() =>
    axios.post(
      url(accountType === 'organization' ? A.ORG_LOGIN_TWO_FACTOR_RESEND : A.LOGIN_TWO_FACTOR_RESEND),
      { two_factor_token: twoFactorToken },
      QUIET
    )
  );

// ---------------------------------------------------------------------------
// دستگاه‌ها
// ---------------------------------------------------------------------------
/** مشخصات همین دستگاه - هم برای ثبت و هم برای تشخیص «دستگاه فعلی». */
export const currentDeviceInfo = async () => ({
  device_id: await getInstallationId(),
  platform: Platform.OS,
  device_type: Platform.OS === 'web' ? 'browser' : Device.deviceType === Device.DeviceType.TABLET ? 'tablet' : 'phone',
  device_model: [Device.manufacturer, Device.modelName].filter(Boolean).join(' ') || null,
  os_name: Device.osName || Platform.OS,
  os_version: Device.osVersion || String(Platform.Version ?? ''),
  app_version: getAppVersion() || null,
});

/**
 * ثبت/به‌روزرسانی همین دستگاه پس از ورود. بهترین-تلاش و بی‌صدا است
 * (در isSilentAPI)؛ شکستش هیچ اثری روی کاربر ندارد.
 */
export const registerCurrentDevice = async () => {
  const info = await currentDeviceInfo();
  return request(() => axios.post(url(A.DEVICES_REGISTER), info, QUIET));
};

export const listDevices = async () => {
  const result = await request(() => axios.get(url(A.DEVICES), QUIET));
  return result.ok ? { ...result, data: unwrapList(result.data, 'devices') } : result;
};

export const logoutDevice = (id) => request(() => axios.delete(url(A.DEVICE, { id }), QUIET));

/** خروج از همه‌ی دستگاه‌ها *جز* همین دستگاه. */
export const logoutOtherDevices = async () => {
  const deviceId = await getInstallationId();
  return request(() => axios.post(url(A.DEVICES_LOGOUT_OTHERS), { current_device_id: deviceId }, QUIET));
};

// ---------------------------------------------------------------------------
// فعالیت‌های اخیر و نشست‌ها
// ---------------------------------------------------------------------------
export const listActivities = async (page = 1) => {
  const result = await request(() => axios.get(url(A.ACTIVITIES), { ...QUIET, params: { page } }));
  return result.ok ? { ...result, data: unwrapList(result.data, 'activities') } : result;
};

export const listSessions = async () => {
  const result = await request(() => axios.get(url(A.SESSIONS), QUIET));
  return result.ok ? { ...result, data: unwrapList(result.data, 'sessions') } : result;
};

export const endSession = (id) => request(() => axios.delete(url(A.SESSION, { id }), QUIET));

// ---------------------------------------------------------------------------
// تأیید / تغییر شماره موبایل
// ---------------------------------------------------------------------------
/** بدون `mobile`: تأیید شماره‌ی فعلی؛ با `mobile`: شروع تغییر شماره. */
export const sendMobileCode = (mobile) =>
  request(() => axios.post(url(A.MOBILE_SEND_CODE), mobile ? { mobile } : {}, QUIET));

export const verifyMobile = ({ code, mobile }) =>
  request(() => axios.post(url(A.MOBILE_VERIFY), mobile ? { code, mobile } : { code }, QUIET));

// ---------------------------------------------------------------------------
// هشدارهای امنیتی
// ---------------------------------------------------------------------------
export const listSecurityAlerts = async () => {
  const result = await request(() => axios.get(url(A.ALERTS), QUIET));
  return result.ok ? { ...result, data: unwrapList(result.data, 'alerts') } : result;
};

export const markAlertRead = (id) => request(() => axios.post(url(A.ALERT_READ, { id }), {}, QUIET));

export const markAllAlertsRead = () => request(() => axios.post(url(A.ALERTS_READ_ALL), {}, QUIET));

export const getAlertSettings = () => request(() => axios.get(url(A.ALERTS_SETTINGS), QUIET));

export const updateAlertSettings = (settings) =>
  request(() => axios.put(url(A.ALERTS_SETTINGS), settings, QUIET));

// ---------------------------------------------------------------------------
// حذف حساب
// ---------------------------------------------------------------------------
export const getDeletionRequest = () => request(() => axios.get(url(A.DELETION_REQUEST), QUIET));

export const sendDeletionCode = () => request(() => axios.post(url(A.DELETION_SEND_CODE), {}, QUIET));

export const createDeletionRequest = ({ code, reason }) =>
  request(() => axios.post(url(A.DELETION_REQUEST), reason ? { code, reason } : { code }, QUIET));

export const cancelDeletionRequest = () => request(() => axios.post(url(A.DELETION_CANCEL), {}, QUIET));

// ---------------------------------------------------------------------------
// نسخه‌ی اپ
// ---------------------------------------------------------------------------
export const checkAppVersion = () =>
  request(() =>
    axios.get(url(API_ENDPOINTS.APP.VERSION), {
      ...QUIET,
      params: { platform: Platform.OS, current_version: getAppVersion() || '' },
    })
  );
