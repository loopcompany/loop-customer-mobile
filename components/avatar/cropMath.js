// حساب برش دایره‌ای عکس پروفایل (بند ۱۲). خالص است تا بدون رندر تست شود.
//
// مدل: یک کادر مربعی به ضلع `viewport` که دایره‌ی برش دقیقاً داخل آن است. عکس
// به اندازه‌ی «cover» (کوچک‌ترین مقیاسی که کادر را کامل بپوشاند) ضربدر zoom کاربر
// نمایش داده می‌شود و (tx, ty) جابه‌جایی مرکز عکس از مرکز کادر است.

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** مقیاس پایه‌ای که عکس را کامل روی کادر می‌نشاند. */
export const coverScale = (imageWidth, imageHeight, viewport) =>
  Math.max(viewport / imageWidth, viewport / imageHeight);

/** اندازه‌ی نمایشی عکس برای zoom داده‌شده. */
export const displaySize = ({ imageWidth, imageHeight, viewport, zoom }) => {
  const scale = coverScale(imageWidth, imageHeight, viewport) * zoom;
  return { width: imageWidth * scale, height: imageHeight * scale, scale };
};

/**
 * جابه‌جایی را طوری محدود می‌کند که عکس هیچ‌وقت از لبه‌ی کادر کنار نرود (دایره
 * همیشه پر بماند).
 */
export const clampOffset = ({ imageWidth, imageHeight, viewport, zoom, tx, ty }) => {
  const { width, height } = displaySize({ imageWidth, imageHeight, viewport, zoom });
  const maxX = Math.max(0, (width - viewport) / 2);
  const maxY = Math.max(0, (height - viewport) / 2);
  return { tx: clamp(tx, -maxX, maxX), ty: clamp(ty, -maxY, maxY) };
};

/**
 * مستطیل برش بر حسب پیکسل‌های خود عکس (ورودی ImageManipulator.crop).
 * همیشه مربع و داخل مرزهای عکس است.
 */
export const cropRect = ({ imageWidth, imageHeight, viewport, zoom, tx, ty }) => {
  const { width, height, scale } = displaySize({ imageWidth, imageHeight, viewport, zoom });
  // گوشه‌ی بالا-چپ عکس در مختصات کادر
  const left = viewport / 2 + tx - width / 2;
  const top = viewport / 2 + ty - height / 2;

  const side = Math.min(Math.round(viewport / scale), imageWidth, imageHeight);
  const originX = clamp(Math.round(-left / scale), 0, imageWidth - side);
  const originY = clamp(Math.round(-top / scale), 0, imageHeight - side);
  return { originX, originY, width: side, height: side };
};

/** فاصله‌ی دو انگشت (برای pinch). */
export const touchDistance = (touches) => {
  if (!touches || touches.length < 2) return 0;
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
};
