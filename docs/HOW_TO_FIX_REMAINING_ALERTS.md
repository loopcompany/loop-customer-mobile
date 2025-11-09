# راهنمای سریع: رفع مشکل Alert در وب

## ✅ کارهای انجام شده

### 1. تابع Helper سراسری
✅ تابع `showAlert` در `helpers/Common.js` ایجاد شد که:
- برای **وب**: از `window.confirm` و `window.alert` استفاده می‌کند
- برای **موبایل**: از `Alert.alert` استفاده می‌کند
- پشتیبانی کامل از buttons (confirmation dialogs)

### 2. فایل‌های رفع شده
✅ `hooks/useLogout.js` - دکمه خروج  
✅ `org/logreg/Login.js` - صفحه ورود  
✅ `org/logreg/Register.js` - ثبت نام سازمان (9 Alert)

## 📝 راهنمای رفع باقی فایل‌ها

### مرحله 1: Import کردن
در ابتدای فایل، Alert رو حذف کنید و showAlert اضافه کنید:

```javascript
// قبل:
import { View, Text, Alert } from 'react-native';

// بعد:
import { View, Text } from 'react-native';
import { showAlert } from '../../helpers/Common';  // مسیر رو بسته به محل فایل تنظیم کنید
```

### مرحله 2: جایگزینی Alert.alert

**نوع 1: Alert ساده**
```javascript
// قبل:
Alert.alert('خطا', 'لطفا فیلدها را پر کنید');

// بعد:
showAlert('خطا', 'لطفا فیلدها را پر کنید');
```

**نوع 2: Alert با دکمه‌ها (Confirmation)**
```javascript
// قبل:
Alert.alert(
  'حذف یادداشت',
  'آیا مطمئن هستید؟',
  [
    { text: 'انصراف', style: 'cancel' },
    { text: 'حذف', style: 'destructive', onPress: () => deleteNote() }
  ]
);

// بعد:
showAlert(
  'حذف یادداشت',
  'آیا مطمئن هستید؟',
  [
    { text: 'انصراف', style: 'cancel' },
    { text: 'حذف', style: 'destructive', onPress: () => deleteNote() }
  ]
);
```

## 📊 لیست فایل‌های باقیمانده (با اولویت)

### 🔴 اولویت بالا (مهم برای وب)

#### 1. `org/logreg/OTPVerification.js` - 8 Alert
```javascript
// خطوط: 57, 94, 113, 119, 122, 131, 143, 149
import { showAlert } from '../../helpers/Common';
// جایگزینی تمام Alert.alert با showAlert
```

#### 2. `screens/account/OrganizationProfile.js` - 16 Alert
```javascript
// خطوط: 77, 194, 198, 212, 228, 241, 344, 350, 370, 379, 381, 383, 386, 424, 452, 461
import { showAlert } from '../../helpers/Common';
// جایگزینی تمام Alert.alert با showAlert
```

#### 3. `screens/organization/OrganizationContract.js` - 15 Alert
```javascript
// خطوط: 47, 100, 106, 117, 126, 130, 139, 153, 159, 164, 168, 176, 184, 209, 228-237
import { showAlert } from '../../helpers/Common';
// جایگزینی تمام Alert.alert با showAlert
```

### 🟡 اولویت متوسط

#### 4. `org/logreg/OrganizationResetPassword.js` - 5 Alert
```javascript
// خطوط: 144, 177, 185, 208, 215
import { showAlert } from '../../helpers/Common';
```

#### 5. `org/logreg/OrganizationForgotPassword.js` - 2 Alert
```javascript
// خطوط: 75, 112
import { showAlert } from '../../helpers/Common';
```

#### 6. `screens/notes/AddEditNoteScreen.js` - 4 Alert
```javascript
// خطوط: 36, 41, 69, 71
import { showAlert } from '../helpers/Common';
```

### 🟢 اولویت پایین (کمتر استفاده می‌شوند)

7. `screens/NotesScreen.js` - 1 Alert (خط 62)
8. `screens/account/AddressScreen.js` - 1 Alert (خط 65)
9. `screens/auth/RegistrationVerificationScreen.js` - 1 Alert (خط 173)
10. `screens/auth/ResetPasswordScreen.js` - 1 Alert (خط 139)
11. `components/LocationPicker.js` - 1 Alert (خط 83)
12. `org/logreg/TestConnection.js` - 1 Alert (خط 208) - فقط برای تست

## 🚀 روش سریع: Find & Replace

می‌توانید از قابلیت Find & Replace ویرایشگر استفاده کنید:

### مرحله 1: پیدا کردن تمام Alert.alert
در VS Code:
1. `Ctrl+Shift+F` برای جستجو در تمام فایل‌ها
2. جستجو کنید: `Alert.alert(`
3. لیست فایل‌ها نمایش داده می‌شود

### مرحله 2: جایگزینی در هر فایل
1. فایل را باز کنید
2. `Ctrl+H` برای Find & Replace
3. Find: `Alert.alert(`
4. Replace: `showAlert(`
5. Replace All

### مرحله 3: حذف/اضافه Import
1. Alert رو از import حذف کنید
2. showAlert رو اضافه کنید:
```javascript
import { showAlert } from '../../helpers/Common';
```

## ⚠️ نکات مهم

### مسیر Import
مسیر `../../helpers/Common` بسته به محل فایل متفاوت است:

```javascript
// فایل‌های در org/logreg/
import { showAlert } from '../../helpers/Common';

// فایل‌های در screens/
import { showAlert } from '../helpers/Common';

// فایل‌های در screens/account/
import { showAlert } from '../../helpers/Common';

// فایل‌های در components/
import { showAlert } from '../helpers/Common';
```

### تست کردن
بعد از تغییرات:
1. App رو reload کنید (`r` در Expo)
2. هر Alert رو در **وب** و **موبایل** تست کنید
3. Confirmation dialogs رو حتماً تست کنید

## 📈 پیشرفت

**وضعیت فعلی**: 3/15 فایل (20%)

برای کامل کردن:
- ✅ helpers/Common.js - تابع showAlert
- ✅ hooks/useLogout.js
- ✅ org/logreg/Login.js
- ✅ org/logreg/Register.js
- ⏳ 11 فایل باقیمانده

## 🎯 هدف نهایی

پس از اتمام این کار:
- ✅ همه Alert‌ها در وب با `window.confirm/alert` کار می‌کنند
- ✅ همه Alert‌ها در موبایل با `Alert.alert` کار می‌کنند
- ✅ تجربه کاربری یکسان در همه پلتفرم‌ها
- ✅ هیچ صفحه سفیدی در وب دیده نمی‌شود

---

**نکته**: اگر وقت ندارید همه رو یکجا رفع کنید، اول فایل‌های **اولویت بالا** رو رفع کنید. اون‌ها بیشترین استفاده رو دارند.

**تاریخ**: 2025-11-09  
**آخرین بروزرسانی**: 2025-11-09  
**وضعیت**: 🔨 در حال انجام (20% تکمیل)
