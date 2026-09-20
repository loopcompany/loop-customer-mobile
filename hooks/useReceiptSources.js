// منابعِ «مشخصات کاربر» برای رسید، یک‌جا.
//
// چهار صفحه رسید می‌سازند (OrderReceiptScreen، OrderSummaryScreen و دو مسیر
// سازمانی) و هر چهارتا قبلاً همین چند selector را جدا جدا می‌نوشتند. مشکل این
// بود که دو تا از آن منابع عملاً همیشه خالی‌اند:
//
//   • `state.user.data` از `POST /auth/validate-token` می‌آید و آدرس، تلفن ثابت
//     و کد/شناسه‌ی ملی ندارد.
//   • `state.address.data` فقط در لاگین سازمانی و صفحه‌ی نقشه fetch می‌شود، پس
//     کاربری که مستقیم سراغ رسید می‌رود آرایه‌ی خالی دارد.
//
// این هوک هر دو را جبران می‌کند: پروفایل واقعی حساب را می‌گیرد و آدرس‌های
// ذخیره‌شده را اگر خالی بودند یک‌بار fetch می‌کند. خروجی‌اش مستقیم داخل
// adapterهای `@services/receipt` باز می‌شود.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses } from '@slices/addressSlice';
// این دو import عمداً از فایل‌های خودشان‌اند، نه از barrelِ '@services/receipt':
// barrel مسیرهای سازمانی را هم می‌کشد و آن‌ها `org/orgI18n` و کاتالوگ دستگاه‌ها
// را به هر صفحه‌ای که این هوک را دارد (از جمله useLogout → MenuContext) تحمیل
// می‌کنند.
import {
  accountProfileCacheKey,
  fetchAccountProfile,
  getCachedAccountProfile,
} from '@services/receipt/receiptProfile';
import { isOrganizationAccount } from '@services/receipt/receiptModel';

/**
 * @returns {{user: object, orgProfile: object, profile: object, addresses: object[],
 *   selectedAddressId: string|number}} ورودی‌های مشترکِ adapterهای رسید.
 */
export default function useReceiptSources() {
  const dispatch = useDispatch();

  const token = useSelector((state) => state?.auth?.token);
  const userType = useSelector((state) => state?.auth?.userType);
  const user = useSelector((state) => state?.user?.data);
  const orgProfile = useSelector((state) => state?.organization?.profileData);
  const addresses = useSelector((state) => state?.address?.data);
  const selectedAddressId = useSelector((state) => state?.step?.addressId);

  const isOrganization = userType === 'organization' || isOrganizationAccount(user?.account_type);

  const cacheKey = accountProfileCacheKey(token, isOrganization);
  // مقدار اولیه از کش خوانده می‌شود تا رسیدِ دوم به بعد بدون یک رندرِ خالی
  // (و بدون درخواست تازه) مستقیم با پروفایل بالا بیاید.
  const [profile, setProfile] = useState(() => getCachedAccountProfile(cacheKey) ?? null);

  useEffect(() => {
    if (!cacheKey) return undefined;

    // اگر کاربر پیش از رسیدن پاسخ صفحه را ترک کند، setState روی کامپوننتِ
    // unmount شده صدا زده می‌شد.
    let cancelled = false;
    (async () => {
      // fetchAccountProfile خودش کش و خطا را مدیریت می‌کند و در بدترین حالت
      // null می‌دهد؛ رسید باید بدون پروفایل هم رندر شود.
      const fetched = await fetchAccountProfile(isOrganization, cacheKey);
      if (!cancelled) setProfile(fetched);
    })();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, isOrganization]);

  // فقط یک‌بار برای هر توکن تلاش می‌کند: حسابی که هیچ آدرسی ندارد همیشه آرایه‌ی
  // خالی برمی‌گرداند و بدون این نگهبان، هر رندر یک درخواست تازه می‌شد.
  const addressFetchedFor = useRef(null);
  useEffect(() => {
    if (!token) return;
    if (Array.isArray(addresses) && addresses.length > 0) return;
    if (addressFetchedFor.current === token) return;
    addressFetchedFor.current = token;
    dispatch(fetchAddresses(token));
  }, [dispatch, token, addresses]);

  return useMemo(
    // بعد از خروج از حساب، پروفایلِ حسابِ قبلی نباید روی رسید بماند.
    () => ({ user, orgProfile, profile: cacheKey ? profile : null, addresses, selectedAddressId }),
    [user, orgProfile, profile, cacheKey, addresses, selectedAddressId]
  );
}
