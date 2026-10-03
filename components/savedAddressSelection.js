// منطق خالص انتخاب آدرس در SavedAddressPicker - جدا شده تا بدون رندر تست شود.

const idsOf = (addresses) =>
  (Array.isArray(addresses) ? addresses : []).map((item) => String(item?.id));

/**
 * آیا آدرس انتخاب‌شده هنوز در فهرست آدرس‌های کاربر هست؟
 *
 * @param {object[]} addresses `state.address.data`
 * @param {string|number} addressId
 */
export const isAddressAvailable = (addresses, addressId) =>
  addressId != null && idsOf(addresses).includes(String(addressId));

/**
 * آدرسی که بعد از «افزودن آدرس جدید» به فهرست اضافه شده است.
 *
 * @param {string[]} idsBefore شناسه‌ها پیش از رفتن به فرم افزودن آدرس.
 * @param {object[]} addresses فهرست تازه.
 * @returns {string|number|null} شناسه‌ی آدرس تازه (همان نوعی که سرور داده)، یا null.
 */
export const findNewAddressId = (idsBefore, addresses) => {
  if (!Array.isArray(idsBefore) || !Array.isArray(addresses)) return null;
  const before = new Set(idsBefore.map(String));
  const added = addresses.filter((item) => item?.id != null && !before.has(String(item.id)));
  if (added.length === 0) return null;
  // اگر بیش از یکی اضافه شده بود (مثلاً از دستگاه دیگر)، جدیدترین = بزرگ‌ترین شناسه.
  const newest = added.reduce((best, item) => (Number(item.id) > Number(best.id) ? item : best));
  return newest.id;
};
