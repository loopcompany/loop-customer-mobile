// فایل عکس پروفایل: تبدیل آواتار آماده به URI محلی و افزودن عکس به FormData.
//
// هر دو صفحه‌ی پروفایل (کاربر عادی و سازمانی) عکس را multipart می‌فرستند. روی
// وب FormData فقط File/Blob می‌پذیرد و شیء {uri,name,type} را رشته‌ی
// «[object Object]» می‌فرستد؛ روی موبایل برعکس. این تفاوت فقط اینجا مدیریت می‌شود.
import { Platform } from 'react-native';
import { Asset } from 'expo-asset';

const MIME = { png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

/**
 * آواتار آماده (require(...)) را به URI محلی تبدیل می‌کند تا مثل عکس گالری
 * آپلود شود: موبایل → file://، وب → blob:.
 *
 * @param {number} moduleId خروجی require
 * @returns {Promise<string>}
 */
export const resolvePresetUri = async (moduleId) => {
  const asset = Asset.fromModule(moduleId);
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  await asset.downloadAsync();
  return asset.localUri || asset.uri;
};

/**
 * عکس را با نام فیلد داده‌شده به FormData اضافه می‌کند.
 *
 * @param {FormData} formData
 * @param {string} field مثل `profile_photo_path` یا `profile_image`
 * @param {string} uri file:// / content:// / blob: / data:
 * @param {string} [baseName]
 */
export const appendImageFile = async (formData, field, uri, baseName = 'profile') => {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const type = blob.type || 'image/jpeg';
    const ext = (type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    formData.append(field, new File([blob], `${baseName}_${Date.now()}.${ext}`, { type }));
    return;
  }

  let finalUri = uri;
  if (Platform.OS === 'android' && !/^(file|content):\/\//.test(finalUri)) {
    finalUri = `file://${finalUri}`;
  }
  const ext = (finalUri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
  const safeExt = MIME[ext] ? ext.replace('jpeg', 'jpg') : 'jpg';
  formData.append(field, {
    uri: finalUri,
    name: `${baseName}_${Date.now()}.${safeExt}`,
    type: MIME[safeExt] || 'image/jpeg',
  });
};
