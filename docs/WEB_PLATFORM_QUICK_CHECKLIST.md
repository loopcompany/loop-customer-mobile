# چک‌لیست سریع: پیاده‌سازی پشتیبانی وب

این چک‌لیست خلاصه‌ای از تمام کارهای لازم برای پشتیبانی کامل از پلتفرم وب است.

برای جزئیات بیشتر به [`WEB_PLATFORM_COMPREHENSIVE_GUIDE.md`](./WEB_PLATFORM_COMPREHENSIVE_GUIDE.md) مراجعه کنید.

---

## 🚀 Quick Start

### مرحله 1: مدیریت Browser Back Button (30 دقیقه)

**در `App.js`:**

1. **قبل از تابع App:**
   ```javascript
   const ROUTE_MAP = { '/': 'Welcome', '/login': 'Login', ... };
   const PATH_MAP = Object.entries(ROUTE_MAP).reduce(...);
   const MAIN_APP_SCREENS = ['Home', 'Profile', ...];
   ```

2. **در داخل تابع App:**
   ```javascript
   const navigationRef = useRef(null);
   const currentPath = useRef('/');
   const isNavigatingFromBrowser = useRef(false);
   const navigationTimeout = useRef(null);
   ```

3. **useEffect برای popstate:**
   ```javascript
   useEffect(() => {
     if (Platform.OS === 'web') {
       const handlePopState = (event) => { ... };
       window.addEventListener('popstate', handlePopState);
       return () => window.removeEventListener('popstate', handlePopState);
     }
   }, [isReady]);
   ```

4. **onStateChange در NavigationContainer:**
   ```javascript
   onStateChange={(state) => {
     if (Platform.OS === 'web' && !isNavigatingFromBrowser.current) {
       // Update URL with replaceState
     }
   }}
   ```

✅ **تست:** Browser back/forward button باید کار کند

---

### مرحله 2: مدیریت Page Reload (20 دقیقه)

**در `App.js`:**

1. **Linking config:**
   ```javascript
   const linking = Platform.OS === 'web' ? {
     enabled: true,
     prefixes: [...],
     getStateFromPath: (path, config) => { ... },
     config: { screens: { ... } }
   } : undefined;
   ```

2. **اضافه به NavigationContainer:**
   ```javascript
   <NavigationContainer linking={linking}>
   ```

3. **State restoration:**
   ```javascript
   useEffect(() => {
     if (Platform.OS === 'web') {
       setIsReady(true);
       return;
     }
     // AsyncStorage برای native
   }, [isReady]);
   ```

✅ **تست:** F5 و Ctrl+R باید صفحه را reload کند و به همان صفحه برگردد

---

### مرحله 3: مدیریت Alert ها (60 دقیقه)

**در `helpers/Common.js`:**

1. **اضافه کردن تابع:**
   ```javascript
   export const showAlert = (title, message, buttons) => {
     if (Platform.OS === 'web') {
       // window.confirm / window.alert
     } else {
       Alert.alert(title, message, buttons);
     }
   };
   ```

**در هر فایل:**

2. **Update imports:**
   ```javascript
   // حذف Alert از imports
   import { View, Text } from 'react-native';
   import { showAlert } from '../../helpers/Common';
   ```

3. **جایگزینی:**
   - `Ctrl+H` → Find: `Alert.alert(` → Replace: `showAlert(`

4. **لیست فایل‌ها (11 فایل):**
   - [ ] `org/logreg/OTPVerification.js` (8)
   - [ ] `screens/account/OrganizationProfile.js` (16)
   - [ ] `screens/organization/OrganizationContract.js` (15)
   - [ ] `org/logreg/OrganizationResetPassword.js` (5)
   - [ ] `org/logreg/OrganizationForgotPassword.js` (2)
   - [ ] `screens/notes/AddEditNoteScreen.js` (4)
   - [ ] `screens/NotesScreen.js` (1)
   - [ ] `screens/account/AddressScreen.js` (1)
   - [ ] `screens/auth/RegistrationVerificationScreen.js` (1)
   - [ ] `screens/auth/ResetPasswordScreen.js` (1)
   - [ ] `components/LocationPicker.js` (1)

✅ **تست:** Alert ها باید در وب و موبایل کار کنند

---

## 📋 چک‌لیست تکمیل

### Browser Navigation
- [ ] ROUTE_MAP تعریف شده
- [ ] PATH_MAP تعریف شده
- [ ] MAIN_APP_SCREENS تعریف شده
- [ ] Refs اضافه شده (navigationRef, currentPath, etc.)
- [ ] handlePopState پیاده‌سازی شده
- [ ] onStateChange handler پیاده‌سازی شده
- [ ] تست back button
- [ ] تست forward button

### Page Reload
- [ ] linking config تعریف شده
- [ ] getStateFromPath پیاده‌سازی شده
- [ ] config.screens تنظیم شده
- [ ] linking به NavigationContainer اضافه شده
- [ ] تست F5 reload
- [ ] تست Ctrl+R reload
- [ ] تست در صفحات مختلف

### Alert Management
- [ ] showAlert در Common.js
- [ ] OTPVerification.js
- [ ] OrganizationProfile.js
- [ ] OrganizationContract.js
- [ ] OrganizationResetPassword.js
- [ ] OrganizationForgotPassword.js
- [ ] AddEditNoteScreen.js
- [ ] NotesScreen.js
- [ ] AddressScreen.js
- [ ] RegistrationVerificationScreen.js
- [ ] ResetPasswordScreen.js
- [ ] LocationPicker.js
- [ ] تست در Chrome
- [ ] تست در Firefox
- [ ] تست در Safari
- [ ] تست در Edge
- [ ] تست در iOS
- [ ] تست در Android

---

## 🎯 اولویت‌بندی

### فاز 1: ضروری (2-3 ساعت)
1. ✅ Browser back button
2. ✅ Page reload
3. ⏳ Alert management (فایل‌های پراستفاده)

### فاز 2: مهم (2-3 ساعت)
1. ⏳ باقی Alert ها
2. ⏳ تست در مرورگرهای مختلف

### فاز 3: تکمیلی (1-2 ساعت)
1. ⏳ بهینه‌سازی performance
2. ⏳ حذف console.log های اضافی
3. ⏳ مستندات

---

## ⚠️ نکات مهم

### Do's ✅
- از `replaceState` استفاده کنید
- Flag ها را برای جلوگیری از loop استفاده کنید
- Path های فعلی را track کنید
- Platform detection را check کنید

### Don'ts ❌
- بدون check URL را update نکنید
- اطلاعات حساس در URL نگذارید
- بدون flag همزمان popstate و state change handle نکنید
- مستقیم Alert.alert استفاده نکنید

---

## 🐛 مشکلات رایج

| مشکل | راه‌حل |
|------|--------|
| Back button کار نمی‌کند | ROUTE_MAP را چک کنید |
| Reload به صفحه اشتباه می‌رود | linking.config را بررسی کنید |
| Alert نمایش داده نمی‌شود | showAlert import شده؟ |
| Infinite loop | Flag ها را چک کنید |

---

## 📞 منابع

- **راهنمای جامع:** [`WEB_PLATFORM_COMPREHENSIVE_GUIDE.md`](./WEB_PLATFORM_COMPREHENSIVE_GUIDE.md)
- **Alert List:** [`ALERT_USAGE_LIST.md`](./ALERT_USAGE_LIST.md)
- **راهنمای رفع Alert:** [`HOW_TO_FIX_REMAINING_ALERTS.md`](./HOW_TO_FIX_REMAINING_ALERTS.md)

---

**تاریخ:** 2025-11-09  
**زمان تخمینی کل:** 8-12 ساعت  
**وضعیت:** 🔨 در حال انجام (Browser Navigation ✅, Page Reload ✅, Alerts 30% ✅)
