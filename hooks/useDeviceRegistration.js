/**
 * پس از هر ورود (یا تعویض توکن) مشخصات همین دستگاه را برای فهرست «دستگاه‌های
 * واردشده» در «امنیت حساب» به سرور می‌فرستد (POST /account/devices/register).
 *
 * بهترین-تلاش است: endpoint هنوز در بک‌اند نیست و در isSilentAPI قرار دارد،
 * پس شکستش هیچ پیام یا navigation‌ای ایجاد نمی‌کند. برای هر توکن یک بار.
 */
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { registerCurrentDevice } from '@services/AccountSecurityApi';

export default function useDeviceRegistration() {
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const registeredFor = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      registeredFor.current = null;
      return;
    }
    if (registeredFor.current === token) return;
    registeredFor.current = token;
    registerCurrentDevice().catch(() => {});
  }, [isAuthenticated, token]);
}
