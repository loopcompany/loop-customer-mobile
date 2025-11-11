# مراحل Debug برای مشکل آپلود قرارداد

## مشکل گزارش شده:
**قراردادم چرا اپلود نمیشه؟**

## مراحل بررسی:

### 1. بررسی فرآیند انتخاب فایل:
- وقتی دکمه "انتخاب فایل" را می‌زنید، آیا DocumentPicker باز می‌شود؟
- آیا پیام "فایل X انتخاب شد" نمایش داده می‌شود؟
- آیا دکمه "آپلود قرارداد" فعال می‌شود؟

### 2. بررسی فرآیند آپلود:
- وقتی دکمه "آپلود قرارداد" را می‌زنید، آیا loading spinner نمایش داده می‌شود؟
- آیا پیام خطا نمایش داده می‌شود؟

### 3. Console Logs اضافه شده:

#### در handlePickDocument:
```
🔵 handlePickDocument called!
🔍 Current state: {...}
🟢 Opening DocumentPicker...
📁 DocumentPicker result: {...}
📄 File selected: {...}
✅ Validation passed, setting selectedFile
```

#### در handleUploadContract:
```
🔵 handleUploadContract called!
🔍 Upload state check: {...}
🔑 Token found, preparing FormData...
📁 File data for upload: {...}
🌐 Upload URL: {...}
🔄 Starting upload...
✅ Upload request completed!
📤 Upload API Response: {...}
```

#### در صورت خطا:
```
❌ Upload Error Details: {
  message, status, statusText, data, config
}
```

## گام‌های عیب‌یابی:

### مرحله 1: بررسی انتخاب فایل
1. روی دکمه "انتخاب فایل" کلیک کنید
2. Console logs را بررسی کنید:
   - آیا `🔵 handlePickDocument called!` نمایش داده می‌شود؟
   - آیا DocumentPicker باز می‌شود؟
   - آیا فایل انتخاب می‌شود؟

### مرحله 2: بررسی آپلود
1. روی دکمه "آپلود قرارداد" کلیک کنید
2. Console logs را بررسی کنید:
   - آیا `🔵 handleUploadContract called!` نمایش داده می‌شود؟
   - آیا token موجود است؟
   - آیا URL درست است؟
   - آیا خطایی رخ می‌دهد؟

### مرحله 3: بررسی خطاهای احتمالی
- **401 Unauthorized**: مشکل token یا authentication
- **422 Validation Error**: مشکل در اعتبارسنجی فایل
- **413 File Too Large**: فایل بزرگ‌تر از حد مجاز
- **Network Error**: مشکل اتصال به سرور
- **Timeout**: درخواست طولانی‌تر از 30 ثانیه

## راه‌حل‌های احتمالی:

### اگر DocumentPicker باز نمی‌شود:
```javascript
// بررسی permissions در android
// Check expo-document-picker installation
```

### اگر آپلود شروع نمی‌شود:
- بررسی اینکه selectedFile set شده باشد
- بررسی اینکه دکمه disabled نباشد
- بررسی uploadingContract state

### اگر خطای network رخ می‌دهد:
- بررسی اتصال اینترنت
- بررسی URL صحیح (`${uri}/organization/contracts/upload`)
- بررسی token validity

## برای بررسی بیشتر:
1. در Developer Console بروید
2. فیلتر "console" را انتخاب کنید  
3. مراحل آپلود را دنبال کنید
4. خطاهای مربوطه را گزارش دهید