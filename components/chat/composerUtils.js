// منطق خالص نوار نوشتن پیام: درج ایموجی در محل نشانگر و بررسی پیوست‌ها.
// (بند ۸ سند «توضیحات نسخه دسکتاپ ۲»: ایموجی و سنجاق در بخش پیام)

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // ۱۰ مگابایت
export const ALLOWED_DOCUMENT_TYPES = ['image/*', 'application/pdf'];

/**
 * متن را در محل انتخاب فعلی درج می‌کند (اگر چیزی انتخاب شده، جایگزینش می‌شود).
 * @returns {{ text: string, caret: number }}
 */
export const insertAtSelection = (text, selection, insert) => {
  const value = String(text || '');
  const start = Math.max(0, Math.min(selection?.start ?? value.length, value.length));
  const end = Math.max(start, Math.min(selection?.end ?? start, value.length));
  return { text: value.slice(0, start) + insert + value.slice(end), caret: start + insert.length };
};

export const isImageAttachment = (asset) =>
  String(asset?.mimeType || asset?.mime_type || asset?.type || '').startsWith('image') ||
  /\.(jpe?g|png|webp|heic|gif)$/i.test(
    String(asset?.name || asset?.uri || asset?.url || '').split('?')[0]
  );

/**
 * @param {{ name?: string, size?: number, mimeType?: string }} asset
 * @param {number} currentCount تعداد پیوست‌های فعلی
 * @returns {string|null} کلید i18n پیام خطا یا null
 */
export const validateAttachment = (asset, currentCount) => {
  if (currentCount >= MAX_ATTACHMENTS) return 'You can attach up to 5 files.';
  const size = Number(asset?.size ?? asset?.fileSize);
  if (Number.isFinite(size) && size > MAX_ATTACHMENT_BYTES)
    return 'Each file must be smaller than 10 MB.';
  const type = String(asset?.mimeType || '');
  const isPdf = type === 'application/pdf' || /\.pdf$/i.test(String(asset?.name || ''));
  if (!isImageAttachment(asset) && !isPdf) return 'Only images and PDF files can be attached.';
  return null;
};

/** نمایش حجم فایل («۲٫۴ مگابایت»). */
export const formatFileSize = (bytes) => {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return '';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
