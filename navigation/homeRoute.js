// «صفحه‌ی اصلی» هر نوع حساب - هر جا اپ کاربر را «به خانه» می‌برد از اینجا بخواند.
//
// - مشتری (کاربر عادی) از دکمه‌ی «سفارش سیستماتیک» در OrderMenuScreen وارد
//   می‌شود؛ صفحه‌ی اصلی او «انتخاب سیستماتیک» (/systematic-selection) است و
//   نباید صفحه‌ی List (/list) را ببیند.
// - کاربر سازمانی / شرکتی از «سازمان / شرکت» وارد می‌شود و صفحه‌ی اصلی‌اش List
//   است: انتخاب بین «انتخاب جامع» و «انتخاب سیستماتیک».
//
// نوع حساب نامعلوم (null) همان رفتار قبلی، یعنی List را می‌گیرد؛ خودِ List اگر
// بعداً معلوم شود کاربر مشتری است، او را به صفحه‌ی اصلی خودش می‌فرستد.
import { useSelector } from 'react-redux';

export const ORGANIZATION_HOME_ROUTE = 'List';
export const CUSTOMER_HOME_ROUTE = 'SystematicCategoryScreen';

/** @param {string|null} userType `state.auth.userType` */
export const homeRouteFor = (userType) =>
  userType === 'individual' ? CUSTOMER_HOME_ROUTE : ORGANIZATION_HOME_ROUTE;

/**
 * پشته را با صفحه‌ی اصلی همان نوع حساب جایگزین می‌کند (برگشت به صفحه‌ی ورود یا
 * List ممکن نیست).
 */
export const resetToHome = (navigation, userType) =>
  navigation.reset({ index: 0, routes: [{ name: homeRouteFor(userType) }] });

/** نام route صفحه‌ی اصلی کاربرِ فعلی. */
export const useHomeRoute = () => homeRouteFor(useSelector((state) => state?.auth?.userType));
