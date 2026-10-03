// اتصال صفحه‌های مراحل سفارش سازمانی به پیش‌نویس‌ها (services/orderDrafts.js).
//
// - اگر صفحه با `draftId` باز شده باشد (دکمه‌ی «ادامه» در سفارشات)، داده‌ی همان
//   پیش‌نویس یک بار با onRestore به صفحه داده می‌شود.
// - هر تغییر بعدی در `data` (با کمی تأخیر) در همان پیش‌نویس ذخیره می‌شود؛ تا وقتی
//   کاربر هنوز چیزی انتخاب نکرده (`hasContent` نادرست) پیش‌نویسی ساخته نمی‌شود.
// - discardDraft پیش‌نویس را پاک می‌کند (لغو سفارش توسط خود کاربر).
//
// شناسه‌ی پیش‌نویس به OrderSummaryScreen پاس داده می‌شود تا بعد از ثبت موفق
// سفارش روی سرور، همان پیش‌نویس پاک شود.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { createDraftId, deleteDraft, draftOwnerKey, getDraft, saveDraft } from '@services/orderDrafts';

const SAVE_DELAY_MS = 600;

export default function useOrderDraft({ source, initialDraftId, meta, data, hasContent, onRestore }) {
  const user = useSelector((state) => state?.user?.data);
  const userType = useSelector((state) => state?.auth?.userType);
  const ownerKey = draftOwnerKey(user, userType);

  const [draftId] = useState(() => initialDraftId || createDraftId());
  // تا وقتی پیش‌نویسِ درخواستی خوانده نشده، ذخیره نمی‌کنیم؛ وگرنه state خالیِ
  // اولیه‌ی صفحه روی پیش‌نویس کاربر نوشته می‌شد.
  const [restored, setRestored] = useState(!initialDraftId);
  const discarded = useRef(false);
  // آخرین onRestore/meta بدون اینکه effectها با هر رندر دوباره اجرا شوند.
  const onRestoreRef = useRef(onRestore);
  const metaRef = useRef(meta);
  useLayoutEffect(() => {
    onRestoreRef.current = onRestore;
    metaRef.current = meta;
  });

  useEffect(() => {
    if (restored || !ownerKey) return undefined;
    let cancelled = false;
    (async () => {
      const draft = await getDraft(ownerKey, initialDraftId);
      if (cancelled) return;
      if (draft?.data && draft.source === source) onRestoreRef.current?.(draft.data);
      setRestored(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerKey, initialDraftId, restored, source]);

  // آخرین داده‌ای که هنوز نوشته نشده؛ اگر کاربر در فاصله‌ی تأخیر از صفحه خارج
  // شود، همین هنگام unmount نوشته می‌شود تا آخرین انتخابش گم نشود.
  const pendingRef = useRef(null);

  useEffect(() => {
    if (!restored || !ownerKey || !hasContent || discarded.current) return undefined;
    const payload = { ownerKey, draft: { id: draftId, source, ...metaRef.current, data } };
    pendingRef.current = payload;
    const timer = setTimeout(() => {
      pendingRef.current = null;
      if (!discarded.current) saveDraft(payload.ownerKey, payload.draft);
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [data, hasContent, ownerKey, restored, source, draftId]);

  useEffect(() => () => {
    const pending = pendingRef.current;
    if (pending && !discarded.current) saveDraft(pending.ownerKey, pending.draft);
  }, []);

  const discardDraft = useCallback(async () => {
    discarded.current = true;
    pendingRef.current = null;
    if (ownerKey) await deleteDraft(ownerKey, draftId);
  }, [ownerKey, draftId]);

  return { draftId, ownerKey, restored, discardDraft };
}
