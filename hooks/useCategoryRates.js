// نرخِ واقعیِ یک دسته برای فرم‌هایی که ساختارشان محلی است.
//
// مسیرهای سازمانی («انتخاب سیستماتیک» و «انتخاب جامع») فرمشان از
// `org/systematicFlows.js` می‌آید، نه از API — پس هیچ قیمتی در دستشان نیست و
// تا امروز `total_price: 0` و `steps: []` به `/orders/submit` می‌فرستادند؛
// یعنی سفارش بدون مبلغ و بدون `order_details` ثبت می‌شد.
//
// این هوک همان مراحلِ قیمت‌دارِ دسته را از `/steps/fetch` می‌گیرد و
// انتخاب‌های کاربر را (بر اساس عنوان) رویش می‌نشاند. نگاشت محافظه‌کارانه است:
// چیزی که مطمئن نباشد را نمی‌شمارد، و اگر هیچ گزینه‌ای نخورد همان رفتارِ
// «استعلامی» قبلی برمی‌گردد به‌جای اینکه عددی از خودمان بسازیم.
//
// قرارداد: FRONTEND_SERVICE_RATES.md

import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchCategorySteps } from '@services/StepsApi';
import { priceSelections } from '@services/orderPricing';

const EMPTY_LINES = [];
const EMPTY_RESULT = {
  steps: [],
  total: 0,
  showPrice: true,
  matched: [],
  unmatched: [],
  ambiguous: [],
};

/**
 * @param {object} input
 * @param {number|string|null} input.categoryId شناسه‌ی عددیِ دسته در بک‌اند.
 * @param {Array<{label: string, value: any}>} input.selections همان summaryLines
 *   صفحه‌ی مبدا — تنها چیزی که از انتخاب‌های کاربر در دست داریم.
 * @param {boolean} [input.enabled] با false هیچ درخواستی نمی‌رود.
 * @returns {{loading: boolean, priced: boolean, total: number, showPrice: boolean,
 *   steps: Array, matched: object[], unmatched: string[], ambiguous: string[]}}
 *   `priced=false` یعنی نرخی پیدا نشد و سفارش باید استعلامی برود.
 */
export default function useCategoryRates({ categoryId, selections, enabled = true }) {
  // پاسخ همراهِ شناسه‌ی دسته‌اش نگه داشته می‌شود: هم «آمد یا نیامد» از همین
  // فهمیده می‌شود (بدون یک stateِ loadingِ جداگانه که باید همگام داخل effect
  // ست شود) و هم نرخِ دسته‌ی قبلی لحظه‌ای روی فرمِ جدید نمی‌نشیند.
  const [fetched, setFetched] = useState({ id: null, steps: null });
  const warnedFor = useRef(null);

  const numericCategoryId = Number(categoryId);
  const canFetch = enabled && categoryId != null && Number.isInteger(numericCategoryId);

  useEffect(() => {
    if (!canFetch) return undefined;

    // صفحه ممکن است قبل از رسیدنِ پاسخ بسته شود (یا دسته عوض شود)؛ بدون این
    // نگهبان، setState روی کامپوننتِ unmount شده صدا می‌خورد.
    let cancelled = false;
    (async () => {
      let steps = null;
      try {
        steps = await fetchCategorySteps(numericCategoryId);
      } catch (error) {
        // نبودِ نرخ نباید جلوی ثبت سفارش را بگیرد: سفارش استعلامی ثبت می‌شود،
        // دقیقاً مثل قبل از این تغییر.
        console.warn('[useCategoryRates] نرخ دسته دریافت نشد:', error?.message);
      }
      if (!cancelled) setFetched({ id: numericCategoryId, steps });
    })();

    return () => {
      cancelled = true;
    };
  }, [canFetch, numericCategoryId]);

  // پاسخ فقط وقتی معتبر است که مالِ همین دسته باشد.
  const settled = fetched.id === numericCategoryId;
  const apiSteps = canFetch && settled ? fetched.steps : null;
  const loading = canFetch && !settled;

  const result = useMemo(() => {
    const lines = Array.isArray(selections) ? selections : EMPTY_LINES;
    if (!apiSteps?.length || !lines.length) return EMPTY_RESULT;
    return priceSelections(apiSteps, lines);
  }, [apiSteps, selections]);

  const priced = result.matched.length > 0;

  useEffect(() => {
    // یک‌بار برای هر دسته: عنوان‌هایی که در مراحلِ سرور معادلی نداشتند. اینها
    // همان جاهایی‌اند که فرمِ محلی و کاتالوگِ بک‌اند از هم دور افتاده‌اند و
    // بدونِ این لاگ، بی‌صدا از مبلغ جا می‌مانند. `warn` در بیلد production هم
    // باقی می‌ماند (فقط log/debug/info حذف می‌شوند).
    if (!apiSteps?.length || warnedFor.current === numericCategoryId) return;
    warnedFor.current = numericCategoryId;
    if (result.unmatched.length || result.ambiguous.length) {
      console.warn(
        `[useCategoryRates] دسته ${numericCategoryId}: بدون نرخ →`,
        result.unmatched.join('، ') || '-',
        '| مبهم →',
        result.ambiguous.join('، ') || '-'
      );
    }
  }, [apiSteps, numericCategoryId, result.unmatched, result.ambiguous]);

  return {
    loading,
    priced,
    total: result.total,
    showPrice: result.showPrice,
    // وقتی هیچ گزینه‌ای نخورده، `steps` پرنشده ارزشی ندارد و فرستادنش فقط
    // `order_details`ِ خالی می‌سازد.
    steps: priced ? result.steps : [],
    matched: result.matched,
    unmatched: result.unmatched,
    ambiguous: result.ambiguous,
  };
}
