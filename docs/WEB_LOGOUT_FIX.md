# رفع مشکل دکمه خروج در وب

## 🐛 مشکل

دکمه خروج در نسخه وب اپلیکیشن کار نمی‌کرد.

## 🔍 علت مشکل

`Alert.alert` از React Native **فقط برای موبایل (iOS/Android)** است و در وب پشتیبانی نمی‌شود. زمانی که کاربر در وب روی دکمه خروج کلیک می‌کرد، `Alert.alert` اجرا نمی‌شد و هیچ چیزی نمایش داده نمی‌شد.

```javascript
// ❌ این کد در وب کار نمی‌کند
Alert.alert('خروج', 'آیا مطمئن هستید؟', [...]);
```

## ✅ راه‌حل

از **Platform Detection** استفاده کردیم تا برای وب از `window.confirm` و `window.alert` و برای موبایل از `Alert.alert` استفاده شود.

### تغییرات در `hooks/useLogout.js`:

#### 1. اضافه کردن Platform به imports

```javascript
import { Alert, Platform } from 'react-native';
```

#### 2. بروزرسانی تابع `logoutWithConfirmation`

```javascript
const logoutWithConfirmation = () => {
  if (Platform.OS === 'web') {
    // Use window.confirm for web
    const confirmed = window.confirm('آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟');
    
    if (confirmed) {
      logout()
        .then((result) => {
          window.alert(result.message || 'با موفقیت خارج شدید');
        })
        .catch((error) => {
          window.alert(error.message || 'خطای غیرمنتظره در خروج');
        });
    }
  } else {
    // Use Alert.alert for mobile
    Alert.alert(
      'خروج از حساب کاربری',
      'آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟',
      [...]
    );
  }
};
```

#### 3. بروزرسانی تابع `logoutFromAllDevicesWithConfirmation`

```javascript
const logoutFromAllDevicesWithConfirmation = () => {
  if (Platform.OS === 'web') {
    // Use window.confirm for web
    const confirmed = window.confirm('آیا می‌خواهید از همه دستگاه‌هایی که با این حساب وارد شده‌اند خارج شوید؟');
    
    if (confirmed) {
      logoutFromAllDevices()
        .then((result) => {
          window.alert(result.message || 'با موفقیت از همه دستگاه‌ها خارج شدید');
        })
        .catch((error) => {
          window.alert(error.message || 'خطای غیرمنتظره در خروج از همه دستگاه‌ها');
        });
    }
  } else {
    // Use Alert.alert for mobile
    Alert.alert(
      'خروج از همه دستگاه‌ها',
      'آیا می‌خواهید از همه دستگاه‌هایی که با این حساب وارد شده‌اند خارج شوید؟',
      [...]
    );
  }
};
```

## 🎯 نتیجه

- ✅ دکمه خروج در **وب** با `window.confirm` کار می‌کند
- ✅ دکمه خروج در **موبایل** با `Alert.alert` کار می‌کند
- ✅ پیام‌های موفقیت و خطا در هر دو پلتفرم نمایش داده می‌شوند
- ✅ هیچ تغییری در UI یا رفتار کاربری ایجاد نشده

## 📱 تست

### در وب:
1. وارد پروفایل شوید
2. روی دکمه خروج کلیک کنید
3. باید یک **confirm dialog** مرورگر نمایش داده شود
4. بعد از تایید، باید یک **alert** با پیام موفقیت نمایش داده شود
5. کاربر به صفحه Welcome منتقل می‌شود

### در موبایل:
1. وارد پروفایل شوید
2. روی دکمه خروج کلیک کنید
3. باید یک **Alert native** نمایش داده شود
4. بعد از تایید، باید یک **Alert** با پیام موفقیت نمایش داده شود
5. کاربر به صفحه Welcome منتقل می‌شود

## 🔧 فایل‌های تغییر یافته

- `hooks/useLogout.js`

## 📚 مراجع

- [React Native Alert](https://reactnative.dev/docs/alert) - فقط iOS و Android
- [Window.confirm()](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) - برای وب
- [Window.alert()](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert) - برای وب

## 💡 نکات مهم

1. **همیشه از Platform Detection استفاده کنید**: وقتی از API‌های native استفاده می‌کنید که در وب پشتیبانی نمی‌شوند
2. **window.confirm بهتر از پیاده‌سازی دستی**: استفاده از dialog‌های native مرورگر ساده‌تر و سریع‌تر است
3. **Promise handling**: از `.then()` و `.catch()` برای وب استفاده کنید چون نمی‌توانیم از callback‌های Alert استفاده کنیم

## 🐛 مشکلات احتمالی

### مشکل: window.confirm خیلی ساده است
**راه‌حل**: می‌توانید از کتابخانه‌های UI مثل `react-modal` یا `sweetalert2` برای dialog‌های زیباتر استفاده کنید.

### مشکل: window.confirm مرورگر را block می‌کند
**راه‌حل**: این رفتار عادی است. برای UX بهتر، می‌توانید از modal component سفارشی استفاده کنید.

---

**تاریخ**: 2025-11-09  
**نسخه**: 1.0.0  
**وضعیت**: ✅ تکمیل شده
