// پخش لوگوموشن اسپلش «با صدا» روی وب.
//
// مرورگرها (Chrome، Safari، Firefox) پخش خودکارِ ویدیوی صدادار را تا وقتی کاربر
// روی همان صفحه کاری نکرده (کلیک، لمس، کلید) مسدود می‌کنند — مثلاً وقتی کاربر از
// سایت روی «اپ کاربر» زده و اپ در صفحه‌ی تازه باز شده. هیچ کدی نمی‌تواند این
// قانون مرورگر را دور بزند. پس:
//   ۱. اول با صدا امتحان می‌کنیم؛ اگر مرورگر اجازه داد (کاربر قبلاً با دامنه
//      تعامل داشته)، از همان ابتدا صدا پخش می‌شود.
//   ۲. اگر مسدود شد، ویدیو بی‌صدا ادامه می‌دهد (تا اسپلش گیر نکند) و به‌محض
//      اولین لمس/کلیک/کلید کاربر، صدا روشن می‌شود.
// روی اندروید و iOS این محدودیت نیست و ویدیو مستقیم با صدا پخش می‌شود.

/**
 * @param {HTMLVideoElement} video
 * @returns {Promise<'sound'|'muted'|'failed'>}
 */
export const playWithSoundOrMuted = async (video) => {
  video.muted = false;
  video.volume = 1;
  try {
    await video.play();
    return 'sound';
  } catch (error) {
    // خطای غیر از «اجازه‌ی پخش صدادار نیست» (مثلاً شبکه) را تایمر اسپلش مدیریت می‌کند.
    if (error?.name !== 'NotAllowedError') return 'failed';
    video.muted = true;
    try {
      await video.play();
      return 'muted';
    } catch {
      return 'failed';
    }
  }
};

export const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'keydown', 'click'];

/**
 * با اولین تعامل کاربر، صدای ویدیو را روشن می‌کند (داخل همان رویداد، که مرورگر
 * آن را «اجازه‌ی کاربر» حساب می‌کند).
 *
 * @param {EventTarget} target معمولاً window
 * @param {HTMLVideoElement} video
 * @param {() => void} [onUnmuted]
 * @returns {() => void} حذف شنونده‌ها
 */
export const unmuteOnFirstGesture = (target, video, onUnmuted) => {
  const remove = () =>
    UNLOCK_EVENTS.forEach((name) => target.removeEventListener(name, handler, true));
  function handler() {
    remove();
    video.muted = false;
    video.volume = 1;
    if (video.paused && !video.ended) video.play().catch(() => {});
    onUnmuted?.();
  }
  UNLOCK_EVENTS.forEach((name) => target.addEventListener(name, handler, true));
  return remove;
};
