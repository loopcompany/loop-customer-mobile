// افزودن یک فایل (تصویر، PDF، ...) به FormData — روی وب و موبایل.
//
// روی وب FormData فقط File/Blob می‌پذیرد و شیء {uri,name,type} را به‌صورت رشته‌ی
// «[object Object]» می‌فرستد؛ روی موبایل برعکس، فقط همان شیء را می‌فهمد.
import { Platform } from 'react-native';

const EXTENSION_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  pdf: 'application/pdf',
};

/** نوع MIME از روی پسوند نام فایل (یا مقدار پیش‌فرض). */
export const guessMimeType = (name, fallback = 'application/octet-stream') => {
  const ext = String(name || '')
    .split('?')[0]
    .split('.')
    .pop()
    .toLowerCase();
  return EXTENSION_TYPES[ext] || fallback;
};

/**
 * @param {FormData} formData
 * @param {string} field نام فیلد، مثلاً `attachments[]`
 * @param {{ uri: string, name?: string, mimeType?: string, file?: File }} asset
 *   خروجی expo-document-picker یا expo-image-picker
 */
export const appendUploadFile = async (formData, field, asset) => {
  const name = asset.name || asset.fileName || asset.uri.split('/').pop() || 'file';
  const type = asset.mimeType || guessMimeType(name);

  if (Platform.OS === 'web') {
    if (asset.file) {
      formData.append(field, asset.file, name);
      return;
    }
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    formData.append(field, new File([blob], name, { type: blob.type || type }));
    return;
  }

  let uri = asset.uri;
  if (Platform.OS === 'android' && !/^(file|content):\/\//.test(uri)) uri = `file://${uri}`;
  formData.append(field, { uri, name, type });
};
