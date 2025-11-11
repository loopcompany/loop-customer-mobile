# راهنمای جامع: پیاده‌سازی قابلیت‌های وب در اپلیکیشن Loop

این داکیومنت شامل تمام تغییرات و پیاده‌سازی‌هایی است که برای پشتیبانی کامل از پلتفرم وب انجام شده است. این راهنما برای اعمال تغییرات مشابه در وب‌اپ تکنسین نیز قابل استفاده است.

## 📑 فهرست مطالب

1. [مدیریت Browser Back Button](#1-مدیریت-browser-back-button)
2. [مدیریت Page Reload](#2-مدیریت-page-reload)
3. [مدیریت Alert ها](#3-مدیریت-alert-ها)
4. [چک‌لیست پیاده‌سازی](#4-چکلیست-پیادهسازی)

---

## 1. مدیریت Browser Back Button

### 🎯 هدف
زمانی که کاربر در مرورگر روی دکمه بک یا فوروارد کلیک می‌کند، اپلیکیشن باید به درستی به صفحه مورد نظر navigate شود.

### 📋 فایل‌های مرتبط
- `App.js` (خطوط 242-310)

### 🔧 پیاده‌سازی

#### مرحله 1: تعریف Route Maps

در ابتدای `App.js` (قبل از تابع App):

```javascript
// Map paths to screen names (for browser back/forward navigation)
const ROUTE_MAP = {
  '/': 'Welcome',
  '/welcome': 'Welcome',
  '/login': 'Login',
  '/register': 'Register',
  '/otp': 'OTPVerification',
  '/forgotpassword': 'OrganizationForgotPassword',
  '/resetpassword': 'OrganizationResetPassword',
  '/home': 'Home',
  '/profile': 'OrganizationProfile',
  '/orders': 'Orders',
  '/orderdetails': 'OrderDetails',
  '/contracts': 'Contracts',
  '/contractdetails': 'ContractDetails',
  '/messages': 'Messages',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/about': 'About',
  '/support': 'Support',
  '/notes': 'NotesScreen',
  '/addeditnote': 'AddEditNoteScreen',
  '/map': 'MapScreen',
  '/address': 'AddressScreen',
  '/testconnection': 'TestConnection',
  // Add all your screens here...
};

// Reverse map (screen name to path)
const PATH_MAP = Object.entries(ROUTE_MAP).reduce((acc, [path, screen]) => {
  acc[screen] = path;
  return acc;
}, {});

// List of main app screens (no longer nested in MainApp)
const MAIN_APP_SCREENS = [
  'FolderScreen',
  'Profile',
  'OrdersScreen',
  'Details',
  'ContractScreen',
  'MessageScreen',
  'NotesScreen',
  'AddEditNoteScreen',
  'Map',
  'AddressScreen',
  'Club',
  'Steps',
  // All screens are now flat in the navigator
];
```

#### مرحله 2: تعریف Refs و State

در داخل تابع App:

```javascript
function App() {
  const navigationRef = useRef(null);
  
  // For web: track current path to avoid duplicate navigation
  const currentPath = useRef('/');
  const isNavigatingFromBrowser = useRef(false);
  const navigationTimeout = useRef(null);

  // ... rest of your code
}
```

#### مرحله 3: پیاده‌سازی Handler برای Browser Back/Forward

```javascript
// Handle browser back/forward buttons for web
useEffect(() => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const handlePopState = (event) => {
      const path = window.location.pathname;
      console.log('\n🔙 BROWSER BACK/FORWARD CLICKED');
      console.log('📍 New URL:', path);
      console.log('📍 Previous path:', currentPath.current);
      
      // Prevent handling if we're already navigating or path hasn't changed
      if (isNavigatingFromBrowser.current || currentPath.current === path) {
        console.log('⏭️  SKIPPED - already handling or same path\n');
        return;
      }
      
      isNavigatingFromBrowser.current = true;
      currentPath.current = path;
      
      // Clear any pending navigation timeout
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
      
      if (navigationRef.current && navigationRef.current.isReady()) {
        const screenName = ROUTE_MAP[path];
        
        if (screenName) {
          console.log('✅ NAVIGATING TO:', screenName);
          
          try {
            // All screens are now flat - no nested navigation needed
            navigationRef.current.navigate(screenName);
          } catch (error) {
            console.error('❌ Navigation error on popstate:', error);
          }
        } else {
          console.log('⚠️ NO SCREEN FOUND FOR PATH:', path);
        }
      }
      
      // Reset the flag after a brief delay
      navigationTimeout.current = setTimeout(() => {
        isNavigatingFromBrowser.current = false;
      }, 300);
    };

    // Store initial path
    currentPath.current = window.location.pathname;

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
    };
  }
}, [isReady]);
```

#### مرحله 4: همگام‌سازی URL با Navigation State

```javascript
<NavigationContainer
  ref={navigationRef}
  initialState={initialState}
  onStateChange={(state) => {
    if (Platform.OS === 'web') {
      console.log('\n🔄 NAVIGATION STATE CHANGED');
      console.log('📍 isNavigatingFromBrowser flag:', isNavigatingFromBrowser.current);
      
      // Don't update URL if we're navigating from browser back/forward
      if (isNavigatingFromBrowser.current) {
        console.log('🚫 SKIPPED - navigating from browser\n');
        return;
      }
      
      if (state && typeof window !== 'undefined') {
        const getCurrentRoute = (navState) => {
          if (!navState || !navState.routes) return null;
          const route = navState.routes[navState.index || 0];
          if (route && route.state) {
            return getCurrentRoute(route.state);
          }
          return route;
        };

        const currentRoute = getCurrentRoute(state);
        if (currentRoute && currentRoute.name) {
          const path = PATH_MAP[currentRoute.name] || `/${currentRoute.name.toLowerCase()}`;
          
          // Only update if path has actually changed
          if (window.location.pathname !== path && currentPath.current !== path) {
            currentPath.current = path;
            window.history.replaceState({}, '', path);
            console.log('✅ URL updated to:', path);
          }
        }
      }
    } else if (state) {
      // For native, save to AsyncStorage
      AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
    }
  }}
>
```

---

## 2. مدیریت Page Reload

### 🎯 هدف
وقتی کاربر در مرورگر صفحه را reload می‌کند (F5 یا Ctrl+R)، اپلیکیشن باید:
- به همان صفحه قبلی بازگردد
- State اپلیکیشن حفظ شود
- اطلاعات ورود کاربر از بین نرود

### 📋 فایل‌های مرتبط
- `App.js` (خطوط 329-372)

### 🔧 پیاده‌سازی

#### مرحله 1: Linking Configuration

```javascript
const linking = Platform.OS === 'web' ? {
  enabled: true,
  prefixes: ['http://localhost:8081', 'https://loop.app', '/'],
  
  // Custom getStateFromPath to control how URLs map to navigation state
  getStateFromPath: (path, config) => {
    console.log('🔍 getStateFromPath called with:', path);
    
    const screenName = ROUTE_MAP[path];
    if (!screenName) {
      return undefined;
    }
    
    // All screens are now flat - no nested navigation
    return {
      routes: [{ name: screenName }],
      index: 0
    };
  },
  
  config: {
    screens: {
      Welcome: 'welcome',
      Login: 'login',
      Register: 'register',
      OTPVerification: 'otp',
      OrganizationForgotPassword: 'forgotpassword',
      OrganizationResetPassword: 'resetpassword',
      // All screens are now flat - no nested MainApp
      FolderScreen: 'folder',
      Profile: 'profile',
      OrdersScreen: 'orders',
      Details: 'order-details',
      ContractScreen: 'contract',
      NotesScreen: 'notes',
      AddEditNoteScreen: 'note',
      Map: 'map',
      AddressScreen: 'address',
      Club: 'club',
      Steps: 'steps'
    }
  }
} : undefined;
```

#### مرحله 2: اعمال Linking به NavigationContainer

```javascript
<NavigationContainer
  ref={navigationRef}
  initialState={initialState}
  linking={linking}
  fallback={<Text>در حال بارگذاری...</Text>}
  onStateChange={(state) => {
    // ... state change handler
  }}
>
```

#### مرحله 3: State Restoration

```javascript
useEffect(() => {
  const restoreState = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we don't need to restore from AsyncStorage
        // as linking will handle the URL
        setIsReady(true);
        return;
      }
      
      const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
      const state = savedStateString ? JSON.parse(savedStateString) : undefined;

      if (state !== undefined) {
        setInitialState(state);
      }
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    restoreState();
  }
}, [isReady]);
```

#### ⚠️ نکات مهم

1. **Redux State**: این روش فقط navigation state را حفظ می‌کند. برای حفظ Redux state (مثل token، user info)، باید از Redux Persist استفاده کنید.

2. **Security**: اطلاعات حساس (مثل token) را در AsyncStorage/localStorage ذخیره کنید، نه در URL.

3. **Deep Linking**: این روش با deep linking نیز سازگار است.

---

## 3. مدیریت Alert ها

### 🎯 هدف
`Alert.alert` از React Native فقط در موبایل کار می‌کند. برای وب باید از `window.confirm` و `window.alert` استفاده کنیم.

### 📋 فایل‌های مرتبط
- `helpers/Common.js` (تابع `showAlert`)
- تمام فایل‌هایی که از Alert استفاده می‌کنند

### 🔧 پیاده‌سازی

#### مرحله 1: ایجاد Helper Function

در فایل `helpers/Common.js` (یا یک فایل جداگانه برای utilities):

```javascript
import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert function
 * Works with both web (window.confirm/alert) and native (Alert.alert)
 * 
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Optional array of button objects
 * 
 * Example usage:
 * 
 * // Simple alert
 * showAlert('خطا', 'لطفا فیلدها را پر کنید');
 * 
 * // Confirmation dialog
 * showAlert(
 *   'حذف',
 *   'آیا مطمئن هستید؟',
 *   [
 *     { text: 'انصراف', style: 'cancel' },
 *     { text: 'حذف', style: 'destructive', onPress: () => deleteItem() }
 *   ]
 * );
 */
export const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    // Web platform - use browser's native dialogs
    if (buttons && buttons.length > 0) {
      // Confirmation dialog with buttons
      const confirmMessage = title ? `${title}\n\n${message}` : message;
      const confirmed = window.confirm(confirmMessage);
      
      if (confirmed) {
        // User clicked OK/Yes
        const confirmButton = buttons.find(btn => 
          btn.style === 'destructive' || 
          btn.text?.includes('بله') || 
          btn.text?.includes('تایید') ||
          btn.text?.includes('حذف') ||
          btn.text?.includes('OK') ||
          btn.text?.includes('Yes')
        );
        
        if (confirmButton && confirmButton.onPress) {
          confirmButton.onPress();
        }
      } else {
        // User clicked Cancel/No
        const cancelButton = buttons.find(btn => 
          btn.style === 'cancel' || 
          btn.text?.includes('انصراف') || 
          btn.text?.includes('خیر') ||
          btn.text?.includes('Cancel')
        );
        
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      }
    } else {
      // Simple alert without buttons
      const alertMessage = title ? `${title}\n\n${message}` : message;
      window.alert(alertMessage);
    }
  } else {
    // Native platform (iOS/Android)
    if (!buttons || buttons.length === 0) {
      // Add default "OK" button for simple alerts
      Alert.alert(title, message, [{ text: 'باشه', style: 'default' }]);
    } else {
      Alert.alert(title, message, buttons);
    }
  }
};
```

#### مرحله 2: جایگزینی Alert.alert در تمام فایل‌ها

##### 2.1. Import کردن showAlert

```javascript
// قبل:
import { View, Text, Alert } from 'react-native';

// بعد:
import { View, Text } from 'react-native';
import { showAlert } from '../../helpers/Common';  // مسیر را متناسب تنظیم کنید
```

##### 2.2. جایگزینی استفاده‌ها

**الگوی 1: Alert ساده**

```javascript
// قبل:
Alert.alert('خطا', 'لطفا فیلدها را پر کنید');

// بعد:
showAlert('خطا', 'لطفا فیلدها را پر کنید');
```

**الگوی 2: Confirmation Dialog**

```javascript
// قبل:
Alert.alert(
  'خروج',
  'آیا مطمئن هستید؟',
  [
    { text: 'انصراف', style: 'cancel' },
    { text: 'خروج', style: 'destructive', onPress: () => handleLogout() }
  ]
);

// بعد:
showAlert(
  'خروج',
  'آیا مطمئن هستید؟',
  [
    { text: 'انصراف', style: 'cancel' },
    { text: 'خروج', style: 'destructive', onPress: () => handleLogout() }
  ]
);
```

**الگوی 3: Alert با چند گزینه**

```javascript
// قبل:
Alert.alert(
  'انتخاب عملیات',
  'چه کاری می‌خواهید انجام دهید؟',
  [
    { text: 'ویرایش', onPress: () => handleEdit() },
    { text: 'حذف', style: 'destructive', onPress: () => handleDelete() },
    { text: 'انصراف', style: 'cancel' }
  ]
);

// بعد:
showAlert(
  'انتخاب عملیات',
  'چه کاری می‌خواهید انجام دهید؟',
  [
    { text: 'ویرایش', onPress: () => handleEdit() },
    { text: 'حذف', style: 'destructive', onPress: () => handleDelete() },
    { text: 'انصراف', style: 'cancel' }
  ]
);
```

#### مرحله 3: تنظیم مسیر Import

مسیر import بسته به محل فایل متفاوت است:

```javascript
// فایل‌های در پوشه org/logreg/
import { showAlert } from '../../helpers/Common';

// فایل‌های در پوشه screens/
import { showAlert } from '../helpers/Common';

// فایل‌های در پوشه screens/account/
import { showAlert } from '../../helpers/Common';

// فایل‌های در پوشه screens/organization/
import { showAlert } from '../../helpers/Common';

// فایل‌های در پوشه components/
import { showAlert } from '../helpers/Common';
```

#### مرحله 4: پیدا کردن تمام فایل‌های دارای Alert

برای پیدا کردن تمام فایل‌هایی که از Alert.alert استفاده می‌کنند:

**در VS Code:**
1. `Ctrl+Shift+F` (یا `Cmd+Shift+F` در Mac)
2. جستجو کنید: `Alert.alert`
3. لیست تمام فایل‌ها نمایش داده می‌شود

**یا از Terminal:**
```bash
# در Windows PowerShell
Get-ChildItem -Recurse -Include *.js,*.jsx | Select-String "Alert\.alert" | Group-Object Path | Select-Object Name,Count

# در Mac/Linux
grep -r "Alert\.alert" --include="*.js" --include="*.jsx" .
```

### 📊 لیست فایل‌های نیازمند تغییر

بر اساس بررسی انجام شده، این فایل‌ها نیاز به تغییر دارند:

#### ✅ انجام شده:
- ✅ `hooks/useLogout.js`
- ✅ `org/logreg/Login.js`
- ✅ `org/logreg/Register.js`

#### ⏳ نیاز به انجام:

**اولویت بالا:**
1. `org/logreg/OTPVerification.js` - 8 Alert
2. `screens/account/OrganizationProfile.js` - 16 Alert
3. `screens/organization/OrganizationContract.js` - 15 Alert

**اولویت متوسط:**
4. `org/logreg/OrganizationResetPassword.js` - 5 Alert
5. `org/logreg/OrganizationForgotPassword.js` - 2 Alert
6. `screens/notes/AddEditNoteScreen.js` - 4 Alert

**اولویت پایین:**
7. `screens/NotesScreen.js` - 1 Alert
8. `screens/account/AddressScreen.js` - 1 Alert
9. `screens/auth/RegistrationVerificationScreen.js` - 1 Alert
10. `screens/auth/ResetPasswordScreen.js` - 1 Alert
11. `components/LocationPicker.js` - 1 Alert

### 🔄 روش سریع: Find & Replace

می‌توانید از Find & Replace استفاده کنید:

1. فایل را باز کنید
2. `Ctrl+H` برای Find & Replace
3. **Find**: `Alert.alert(`
4. **Replace**: `showAlert(`
5. **Replace All**
6. Import ها را به‌روزرسانی کنید

---

## 4. چک‌لیست پیاده‌سازی

برای اعمال این تغییرات در پروژه جدید (مثل وب‌اپ تکنسین):

### ✅ مرحله 1: مدیریت Browser Navigation

- [ ] کپی کردن `ROUTE_MAP` و `PATH_MAP` و `MAIN_APP_SCREENS`
- [ ] تنظیم تمام route های پروژه در map ها
- [ ] اضافه کردن ref ها (`navigationRef`, `currentPath`, `isNavigatingFromBrowser`, `navigationTimeout`)
- [ ] پیاده‌سازی `handlePopState` در useEffect
- [ ] پیاده‌سازی `onStateChange` handler در NavigationContainer
- [ ] تست browser back/forward button

### ✅ مرحله 2: مدیریت Page Reload

- [ ] تنظیم `linking` configuration
- [ ] پیاده‌سازی `getStateFromPath` custom function
- [ ] تنظیم `config.screens` برای تمام صفحات
- [ ] اضافه کردن `linking` prop به NavigationContainer
- [ ] تست page reload در مرورگر (F5)
- [ ] تست deep linking با URL های مختلف

### ✅ مرحله 3: مدیریت Alert ها

- [ ] کپی کردن تابع `showAlert` به `helpers/Common.js`
- [ ] پیدا کردن تمام فایل‌های دارای `Alert.alert`
- [ ] برای هر فایل:
  - [ ] حذف `Alert` از imports
  - [ ] اضافه کردن `import { showAlert } from '../../helpers/Common'`
  - [ ] جایگزینی `Alert.alert(` با `showAlert(`
- [ ] تست تمام alert ها در وب
- [ ] تست تمام alert ها در موبایل

### ✅ مرحله 4: تست نهایی

- [ ] تست browser back button در تمام صفحات
- [ ] تست browser forward button
- [ ] تست page reload (F5) در صفحات مختلف
- [ ] تست deep linking با URL های مختلف
- [ ] تست alert های ساده در وب
- [ ] تست confirmation dialogs در وب
- [ ] تست alert ها در iOS
- [ ] تست alert ها در Android
- [ ] تست در مرورگرهای مختلف (Chrome, Firefox, Safari, Edge)

---

## 🎯 نکات مهم و Best Practices

### 1. Browser Navigation

**✅ انجام دهید:**
- از `replaceState` به جای `pushState` استفاده کنید تا duplicate history entry ایجاد نشود
- Flag هایی مثل `isNavigatingFromBrowser` برای جلوگیری از infinite loop استفاده کنید
- Path های فعلی را track کنید تا از navigation های غیرضروری جلوگیری کنید
- Console.log های مفید برای debugging استفاده کنید (در production حذف کنید)

**❌ انجام ندهید:**
- هر بار که navigation state تغییر می‌کند URL را update نکنید
- بدون flag همزمان از `popstate` listener و navigation state change استفاده نکنید
- URL ها را manually بدون sync با navigation state تغییر ندهید

### 2. Page Reload

**✅ انجام دهید:**
- از Redux Persist برای حفظ Redux state استفاده کنید
- Token و اطلاعات حساس را در AsyncStorage/localStorage ذخیره کنید
- Custom `getStateFromPath` برای navigation structure پیچیده پیاده‌سازی کنید
- Fallback component برای loading state تعریف کنید

**❌ انجام ندهید:**
- اطلاعات حساس را در URL قرار ندهید
- به URL parameters برای state management وابسته نشوید
- AsyncStorage را در web برای navigation state استفاده نکنید

### 3. Alert Management

**✅ انجام دهید:**
- یک تابع helper سراسری برای alert ها بسازید
- از Platform detection برای تشخیص web/native استفاده کنید
- Button style ها را به درستی handle کنید
- پیام‌های فارسی را به درستی نمایش دهید

**❌ انجام ندهید:**
- مستقیم از `Alert.alert` در کدهای جدید استفاده نکنید
- از alert های browser بدون پشتیبانی RTL برای متن فارسی استفاده نکنید
- بیش از 2 دکمه در confirmation dialogs استفاده نکنید (محدودیت `window.confirm`)

---

## 🐛 عیب‌یابی (Troubleshooting)

### مشکل: Browser back button کار نمی‌کند

**راه‌حل:**
1. Console را باز کنید و log ها را بررسی کنید
2. مطمئن شوید `ROUTE_MAP` شامل path فعلی است
3. بررسی کنید که screen name در `MAIN_APP_SCREENS` درست تعریف شده
4. مطمئن شوید `navigationRef.current.isReady()` true است

### مشکل: Page reload به صفحه اشتباه می‌رود

**راه‌حل:**
1. `linking.config.screens` را بررسی کنید
2. `getStateFromPath` را debug کنید
3. مطمئن شوید nested navigator ها درست تعریف شده‌اند
4. URL pattern ها را بررسی کنید

### مشکل: Alert در وب نمایش داده نمی‌شود

**راه‌حل:**
1. مطمئن شوید `showAlert` import شده
2. بررسی کنید که `Alert.alert` به `showAlert` تغییر کرده
3. Console را برای error ها بررسی کنید
4. مطمئن شوید `Platform.OS` درست detect می‌شود

### مشکل: Infinite loop در navigation

**راه‌حل:**
1. Flag `isNavigatingFromBrowser` را بررسی کنید
2. مطمئن شوید path ها قبل از update مقایسه می‌شوند
3. از `replaceState` به جای `pushState` استفاده کنید
4. Timeout را برای reset کردن flag ها اضافه کنید

---

## 📚 منابع و مستندات مرتبط

- [React Navigation - Web Support](https://reactnavigation.org/docs/web-support)
- [React Navigation - Deep Linking](https://reactnavigation.org/docs/deep-linking)
- [Expo - Web Support](https://docs.expo.dev/workflow/web/)
- [MDN - History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [MDN - Window.confirm](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm)
- [MDN - Window.alert](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert)

---

## 📝 یادداشت‌های نهایی

این راهنما شامل تمام تغییراتی است که در پروژه Loop User App برای پشتیبانی کامل از وب انجام شده است. 

**برای اعمال در پروژه تکنسین:**

1. ابتدا ساختار navigation پروژه را بررسی کنید
2. Route map ها را متناسب با screen های پروژه تنظیم کنید
3. تابع `showAlert` را کپی کنید
4. به ترتیب اولویت، فایل‌ها را یکی یکی update کنید
5. بعد از هر مرحله، تست کامل انجام دهید

**زمان تخمینی برای پیاده‌سازی کامل:**
- Browser Navigation: 2-3 ساعت
- Page Reload: 1-2 ساعت
- Alert Management: 3-4 ساعت (بسته به تعداد فایل‌ها)
- تست و Debug: 2-3 ساعت

**جمع کل: 8-12 ساعت**

---

**تاریخ ایجاد:** 2025-11-09  
**نسخه:** 1.0  
**وضعیت:** ✅ کامل و آماده استفاده  
**نویسنده:** GitHub Copilot  
**پروژه:** Loop User App
