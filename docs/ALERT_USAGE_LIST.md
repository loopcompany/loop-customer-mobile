# لیست فایل‌هایی که از Alert.alert استفاده می‌کنند

## 📋 خلاصه

تعداد کل: **15 فایل اصلی** (بدون فایل‌های مستندات)

وضعیت: ❌ **نیاز به رفع مشکل برای وب دارند**

---

## 🔴 فایل‌های اصلی که نیاز به رفع مشکل دارند

### 1. **Login Screens**

#### `org/logreg/Login.js`
- ✅ **قبلاً رفع شده** (دارای Platform detection)
- خط 37-38: تابع showAlert با Platform detection
- خط 183: Alert برای کد امنیتی

#### `org/logreg/Register.js`
- ❌ **نیاز به رفع**: 9 استفاده از Alert
- خط 164: دسترسی به گالری
- خط 180: خطا در انتخاب تصویر
- خط 191: تمام فیلدها را پر کنید
- خط 198: کد امنیتی را وارد کنید
- خط 202: کد امنیتی صحیح نیست
- خط 280: پیام موفقیت ثبت نام
- خط 325: خطا در اعتبارسنجی
- خط 327: خطا در ثبت نام
- خط 332: خطای سرور
- خط 349: خطای نامشخص

#### `org/logreg/OTPVerification.js`
- ❌ **نیاز به رفع**: 8 استفاده از Alert
- خط 57: لطفا کد 6 رقمی را وارد کنید
- خط 94: پیام موفقیت تایید
- خط 113: خطای سرور
- خط 119: سرور پاسخگو نیست
- خط 122: خطای نامشخص
- خط 131: لطفا صبر کنید (timer)
- خط 143: کد مجددا ارسال شد
- خط 149: خطا در ارسال مجدد

#### `org/logreg/OrganizationForgotPassword.js`
- ❌ **نیاز به رفع**: 2 استفاده از Alert
- خط 75: پیام موفقیت
- خط 112: خطا

#### `org/logreg/OrganizationResetPassword.js`
- ❌ **نیاز به رفع**: 5 استفاده از Alert
- خط 144: پیام موفقیت
- خط 177: خطا
- خط 185: لطفا صبر کنید (timer)
- خط 208: کد مجددا ارسال شد
- خط 215: خطا در ارسال مجدد

---

### 2. **Profile & Account Screens**

#### `screens/account/OrganizationProfile.js`
- ❌ **نیاز به رفع**: 16 استفاده از Alert
- خط 77: لطفا ابتدا وارد شوید
- خط 194: خطا در بارگذاری اطلاعات
- خط 198: خطا در بارگذاری
- خط 212: دسترسی به گالری مورد نیاز
- خط 228: خطا در انتخاب تصویر
- خط 241: لطفا وارد شوید
- خط 344: پیام موفقیت بروزرسانی
- خط 350: پروفایل بروزرسانی شد
- خط 370: خطای سرور
- خط 379: خطای اعتبارسنجی
- خط 381: اطلاعات سازمان یافت نشد
- خط 383: دسترسی غیرمجاز
- خط 386: خطا
- خط 424: لطفا وارد شوید
- خط 452: رمز عبور تغییر یافت
- خط 461: خطا

#### `screens/account/AddressScreen.js`
- ❌ **نیاز به رفع**: 1 استفاده از Alert
- خط 65: confirm delete

---

### 3. **Other Screens**

#### `screens/notes/AddEditNoteScreen.js`
- ❌ **نیاز به رفع**: 4 استفاده از Alert
- خط 36: لطفاً متن یادداشت را وارد کنید
- خط 41: یادداشت نباید بیش از حد مجاز باشد
- خط 69: خطا در ثبت
- خط 71: خطا

#### `screens/NotesScreen.js`
- ❌ **نیاز به رفع**: 1 استفاده از Alert
- خط 62: confirm delete

#### `screens/organization/OrganizationContract.js`
- ❌ **نیاز به رفع**: 15 استفاده از Alert
- خط 47: لطفا وارد شوید
- خط 100: فقط کاربران سازمانی
- خط 106: خطا در بارگذاری
- خط 117: فایل موجود نیست
- خط 126: امکان باز کردن لینک
- خط 130: خطا در دانلود
- خط 139: قرارداد تایید شده دارید
- خط 153: حجم فایل زیاد
- خط 159: فقط PDF
- خط 164: فایل انتخاب شد
- خط 168: خطا در انتخاب
- خط 176: فایل را انتخاب کنید
- خط 184: وارد شوید
- خط 209: موفق
- خط 228-237: خطاها

#### `screens/auth/RegistrationVerificationScreen.js`
- ❌ **نیاز به رفع**: 1 استفاده از Alert
- خط 173: confirm/error

#### `screens/auth/ResetPasswordScreen.js`
- ❌ **نیاز به رفع**: 1 استفاده از Alert
- خط 139: success/error

---

### 4. **Components**

#### `components/LocationPicker.js`
- ❌ **نیاز به رفع**: 1 استفاده از Alert
- خط 83: خطا در دریافت لیست استان‌ها

---

### 5. **Hooks**

#### `hooks/useLogout.js`
- ✅ **قبلاً رفع شده** (دارای Platform detection)
- دارای پشتیبانی کامل از وب و موبایل

---

## 📊 آمار

| وضعیت | تعداد فایل | تعداد Alert |
|-------|-----------|-------------|
| ✅ رفع شده | 2 | ~15 |
| ❌ نیاز به رفع | 13 | ~70 |
| **جمع** | **15** | **~85** |

---

## 🔧 راه‌حل پیشنهادی

### گزینه 1: تابع Helper سراسری (توصیه می‌شود)

ایجاد یک تابع helper در `helpers/Common.js`:

```javascript
import { Alert, Platform } from 'react-native';

export const showAlert = (title, message, buttons = []) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 0) {
      // For confirmation dialogs
      const confirmed = window.confirm(`${title}\n\n${message}`);
      
      if (confirmed) {
        // Find and execute the onPress of the positive button
        const positiveButton = buttons.find(btn => 
          btn.style === 'destructive' || btn.text === 'بله' || btn.text === 'تایید' || btn.text === 'خروج'
        );
        if (positiveButton && positiveButton.onPress) {
          positiveButton.onPress();
        }
      } else {
        // Find and execute the onPress of the cancel button
        const cancelButton = buttons.find(btn => 
          btn.style === 'cancel' || btn.text === 'انصراف' || btn.text === 'خیر'
        );
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      }
    } else {
      // Simple alert
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    // Native platform
    Alert.alert(title, message, buttons);
  }
};
```

### گزینه 2: Custom Modal Component

ایجاد یک Modal component سفارشی برای وب که شبیه Alert native باشه.

---

## 📝 مثال استفاده

### قبل:
```javascript
Alert.alert('خطا', 'لطفا فیلدها را پر کنید');
```

### بعد:
```javascript
import { showAlert } from '../helpers/Common';

showAlert('خطا', 'لطفا فیلدها را پر کنید');
```

### برای Confirmation:
```javascript
showAlert(
  'حذف یادداشت',
  'آیا مطمئن هستید؟',
  [
    { text: 'انصراف', style: 'cancel' },
    { 
      text: 'حذف', 
      style: 'destructive',
      onPress: () => deleteNote()
    }
  ]
);
```

---

## ✅ اولویت‌بندی رفع مشکلات

### اولویت بالا (مهم):
1. ✅ `hooks/useLogout.js` - **انجام شده**
2. ✅ `org/logreg/Login.js` - **انجام شده**
3. ❌ `org/logreg/Register.js` - ثبت نام سازمان
4. ❌ `org/logreg/OTPVerification.js` - تایید OTP
5. ❌ `screens/account/OrganizationProfile.js` - پروفایل سازمان

### اولویت متوسط:
6. ❌ `org/logreg/OrganizationForgotPassword.js`
7. ❌ `org/logreg/OrganizationResetPassword.js`
8. ❌ `screens/organization/OrganizationContract.js`
9. ❌ `screens/notes/AddEditNoteScreen.js`

### اولویت پایین:
10. ❌ `screens/NotesScreen.js`
11. ❌ `screens/account/AddressScreen.js`
12. ❌ `screens/auth/RegistrationVerificationScreen.js`
13. ❌ `screens/auth/ResetPasswordScreen.js`
14. ❌ `components/LocationPicker.js`

---

## 🚀 برای شروع رفع مشکلات

1. **ایجاد تابع `showAlert` در `helpers/Common.js`**
2. **Import کردن در فایل‌های مورد نظر**
3. **جایگزینی تک‌به‌تک `Alert.alert` با `showAlert`**
4. **تست در وب و موبایل**

---

**تاریخ**: 2025-11-09  
**آخرین بروزرسانی**: 2025-11-09  
**وضعیت**: 📊 2/15 فایل رفع شده (13%)
