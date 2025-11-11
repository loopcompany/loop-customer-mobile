# 🌐 راهنمای جامع اجرای پروژه به صورت Web App

## 📋 فهرست مطالب
- [معرفی](#معرفی)
- [پیش‌نیازها](#پیشنیازها)
- [نصب و راه‌اندازی](#نصب-و-راهاندازی)
- [اجرای پروژه](#اجرای-پروژه)
- [تنظیمات نقشه (Map)](#تنظیمات-نقشه-map)
- [مشکلات رایج و راه‌حل‌ها](#مشکلات-رایج-و-راهحلها)
- [بهینه‌سازی برای Production](#بهینهسازی-برای-production)

---

## 🎯 معرفی

این پروژه یک اپلیکیشن **React Native** مبتنی بر **Expo** است که قابلیت اجرا به صورت:
- 📱 **موبایل**: Android و iOS
- 🌐 **وب**: Web Application

### تکنولوژی‌های اصلی
- **Expo SDK**: ~53.0.22
- **React Native**: 0.79.6 (New Architecture)
- **React Navigation**: v7
- **Redux Toolkit**: State Management
- **i18next**: چندزبانگی (فارسی/انگلیسی)
- **Leaflet**: نقشه برای وب
- **React Native Maps**: نقشه برای موبایل

---

## 🔧 پیش‌نیازها

### نرم‌افزارهای مورد نیاز:
```bash
# Node.js (نسخه 18 یا بالاتر)
node --version  # باید v18.x یا بالاتر باشد

# npm یا yarn
npm --version
# یا
yarn --version

# Git
git --version
```

### نصب Expo CLI (اختیاری):
```bash
npm install -g expo-cli
```

---

## 📦 نصب و راه‌اندازی

### 1️⃣ کلون کردن پروژه
```bash
git clone https://github.com/zahramokhtari792/loop-user-app.git
cd loop-user-app
```

### 2️⃣ نصب Dependencies
```bash
# با npm
npm install

# یا با yarn
yarn install
```

### 3️⃣ بررسی نصب موفقیت‌آمیز
```bash
# بررسی وجود node_modules
ls node_modules

# تعداد پکیج‌های نصب شده
npm list --depth=0
```

---

## 🚀 اجرای پروژه

### اجرای به صورت Web App

#### روش 1: استفاده از npm scripts
```bash
# اجرای در حالت توسعه
npm start

# سپس در مرورگر گزینه 'w' را بزنید
# یا به آدرس زیر بروید:
# http://localhost:8081
```

#### روش 2: اجرای مستقیم وب
```bash
npm run web
# یا
npx expo start --web
```

#### روش 3: اجرا با Clear Cache
```bash
# اگر مشکلی وجود داشت، با پاک کردن cache اجرا کنید
npx expo start -c --web
```

### پورت‌های پیش‌فرض
- **Metro Bundler**: `http://localhost:8081`
- **Web App**: `http://localhost:8082` (اگر 8081 اشغال باشد)

### تغییر پورت دستی
```bash
# اجرا روی پورت دلخواه
npx expo start --web --port 3000
```

---

## 🗺️ تنظیمات نقشه (Map)

پروژه از **دو سیستم نقشه** استفاده می‌کند:

### 1️⃣ برای Web: Leaflet
**فایل‌های مرتبط:**
```
├── components/MapView.web.js          # نقشه وب
├── components/MapView.simple.js       # fallback ساده
├── screens/MapPickerScreen.js         # صفحه انتخاب موقعیت
└── screens/address/Map.js             # نقشه در بخش آدرس
```

**تنظیمات CSS:**
- ❌ **CSS به صورت مستقیم import نشود** (باعث خطای Metro می‌شود)
- ✅ CSS از طریق CDN لود می‌شود

**نحوه کار:**
```javascript
// components/MapView.web.js
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

// CSS باید در HTML لود شود، نه اینجا!
// ❌ import 'leaflet/dist/leaflet.css';  // این کار نکنید!
```

**راه‌حل بارگذاری CSS:**

**گزینه A: استفاده از CDN (توصیه می‌شود)**
```html
<!-- در web/index.html یا app.json -->
<link 
  rel="stylesheet" 
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""
/>
```

**گزینه B: تنظیم در app.json**
```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "build": {
        "babel": {
          "include": ["leaflet"]
        }
      }
    }
  }
}
```

### 2️⃣ برای موبایل: React Native Maps
```javascript
// components/MapView.js (برای native)
import MapView, { Marker } from 'react-native-maps';
```

### مشکلات رایج نقشه و راه‌حل

#### ❌ خطا: "Importing local resources in CSS is not supported"
**علت**: Metro Bundler نمی‌تواند فایل‌های CSS با path‌های محلی را پردازش کند.

**راه‌حل:**
1. فایل `index.web.js` را چک کنید
2. مطمئن شوید `import 'leaflet/dist/leaflet.css'` وجود **ندارد**
3. از CDN استفاده کنید

```javascript
// ✅ درست - index.web.js
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

```javascript
// ❌ اشتباه
import 'leaflet/dist/leaflet.css';  // این خط را حذف کنید
```

#### ❌ نقشه نمایش داده نمی‌شود
**راه‌حل:**
1. Console مرورگر را چک کنید (F12)
2. مطمئن شوید CSS Leaflet لود شده است
3. بررسی کنید که آیکون‌های marker به درستی لود می‌شوند

```javascript
// اضافه کردن default icon برای marker
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
```

### استفاده از نقشه در کامپوننت‌ها

```javascript
import MapView from '../components/MapView';

// در Web استفاده می‌شود
<MapView
  center={[35.6892, 51.3890]} // تهران
  zoom={13}
  style={{ width: '100%', height: 400 }}
  onLocationSelect={(location) => {
    console.log('Selected:', location);
  }}
/>
```

---

## 🔄 سیستم Navigation در Web

### ساختار Navigation
پروژه از **React Navigation v7** استفاده می‌کند با پشتیبانی کامل از browser history.

**فایل اصلی:** `App.js`

```javascript
// Structure
<NavigationContainer linking={linking}>
  <Stack.Navigator>
    {/* Auth Screens */}
    <Stack.Screen name="Landing" />
    <Stack.Screen name="Welcome" />
    
    {/* All Screens - Flat Structure */}
    <Stack.Screen name="FolderScreen" />
    <Stack.Screen name="Profile" />
    <Stack.Screen name="OrdersScreen" />
    {/* ... all other screens ... */}
  </Stack.Navigator>
</NavigationContainer>
```

### Linking Configuration
```javascript
const linking = {
  prefixes: ['http://localhost:8081', 'https://loop.app'],
  config: {
    screens: {
      Landing: '',
      Welcome: 'welcome',
      // Flat structure - all screens at same level
      FolderScreen: 'folder',
      Profile: 'profile',
      OrdersScreen: 'orders',
      // ...
    }
  }
};
```

### نکات مهم Navigation:
- ✅ Browser back button به درستی کار می‌کند
- ✅ URL با navigation state همگام است
- ✅ Deep linking پشتیبانی می‌شود
- ❌ از `window.history.replaceState` استفاده نکنید (مشکل back button)
- ✅ React Navigation خودش history را مدیریت می‌کند

---

## 🎨 استایل و Theme

### سیستم رنگ
```javascript
// theme/Color.js
export const themeColor0 = '#FFFFFF';
export const themeColor1 = '#000000';
export const themeColor2 = '#FF6B6B';
// ... تا themeColor14
```

### فونت‌های فارسی
```javascript
// در App.js
const [loaded] = useFonts({
  'VazirBold': require('./assets/fonts/Vazir-Bold-FD.ttf'),
  'VazirLight': require('./assets/fonts/Vazir-Light-FD.ttf'),
});
```

### استفاده در کامپوننت
```javascript
import { NewStyles } from '../styles/NewStyles';

<Text style={NewStyles.VazirBold16}>متن فارسی</Text>
```

---

## 🐛 مشکلات رایج و راه‌حل‌ها

### 1️⃣ پروژه اجرا نمی‌شود

**علت احتمالی 1: پورت اشغال است**
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8081 | xargs kill -9
```

**علت احتمالی 2: Cache خراب است**
```bash
# پاک کردن همه cache‌ها
npx expo start -c
# یا
rm -rf node_modules .expo
npm install
```

### 2️⃣ Reload در موبایل باعث ماندن در صفحه می‌شود

**راه‌حل:** State persistence فقط در dev mode فعال است
```javascript
// App.js
onStateChange={(state) => {
  // فقط در dev mode و برای native ذخیره می‌شود
  if (state && Platform.OS !== 'web' && __DEV__) {
    AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  }
}}
```

### 3️⃣ خطای "Can't find variable: process"

**راه‌حل:** تنظیم babel config
```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
```

### 4️⃣ نقشه صفحه سیاه نمایش می‌دهد

**راه‌حل:**
1. Console را چک کنید
2. CSS Leaflet را بررسی کنید
3. از CDN استفاده کنید به جای import مستقیم

```html
<!-- در public/index.html یا web/index.html -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

### 5️⃣ Back button در مرورگر کار نمی‌کند

**علت:** Custom navigation logic اشتباه

**راه‌حل:** حذف تمام custom handlers و اعتماد به React Navigation
```javascript
// ❌ اشتباه
window.addEventListener('popstate', customHandler);
window.history.pushState();

// ✅ درست
// React Navigation خودش handle می‌کند
```

---

## 📱 تفاوت‌های Platform

### Web vs Native

| ویژگی | Web | Native |
|-------|-----|--------|
| Map Library | Leaflet | React Native Maps |
| AsyncStorage | localStorage | Native Storage |
| Alert | window.confirm | Alert.alert |
| Navigation | Browser History | Native Stack |
| Fonts | Web Fonts | TTF Files |

### Platform-Specific Code
```javascript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // کد مخصوص وب
} else {
  // کد مخصوص موبایل
}

// یا استفاده از Platform.select
const MapComponent = Platform.select({
  web: () => require('./MapView.web'),
  default: () => require('./MapView'),
})();
```

---

## 🚀 بهینه‌سازی برای Production

### 1️⃣ Build برای Web
```bash
# ساخت نسخه production
npx expo export:web

# خروجی در پوشه web-build/
```

### 2️⃣ تنظیمات بهینه‌سازی
```json
// app.json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "build": {
        "babel": {
          "include": []
        }
      },
      "splash": {
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

### 3️⃣ Environment Variables
```bash
# .env
API_URL=https://narchino.com/api
IMAGE_URL=https://narchino.com/storage
```

```javascript
// استفاده در کد
import { API_URL } from '@env';
```

### 4️⃣ Code Splitting (Web)
```javascript
// استفاده از React.lazy
const GameScreen = React.lazy(() => import('./screens/game/GamePlayScreen'));

<Suspense fallback={<Loading />}>
  <GameScreen />
</Suspense>
```

---

## 📊 State Management

### Redux Toolkit
```javascript
// store.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';

export default configureStore({
  reducer: {
    auth: authSlice,
    language: languageSlice,
    user: userSlice,
  }
});
```

### استفاده در کامپوننت
```javascript
import { useSelector, useDispatch } from 'react-redux';

const token = useSelector(state => state.auth.token);
const dispatch = useDispatch();

dispatch(login({ username, password }));
```

---

## 🌍 چندزبانگی (i18next)

```javascript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

<Text>{t('welcome.title')}</Text>

// تغییر زبان
i18n.changeLanguage('fa');
```

---

## 🔐 API و Authentication

### Base URLs
```javascript
// services/URL.js
export const API_URL = 'https://narchino.com/api';
export const IMAGE_URL = 'https://narchino.com/storage';
```

### Axios Configuration
```javascript
// services/Api.js
import axios from 'axios';
import { store } from '../store';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📝 چک‌لیست راه‌اندازی برای پروژه جدید

- [ ] Node.js نصب است (v18+)
- [ ] پروژه clone شده
- [ ] `npm install` اجرا شده
- [ ] فایل `.env` تنظیم شده
- [ ] `npm start` کار می‌کند
- [ ] وب اپ در مرورگر باز می‌شود (http://localhost:8081)
- [ ] نقشه به درستی نمایش داده می‌شود
- [ ] CSS Leaflet از CDN لود می‌شود
- [ ] Navigation و back button کار می‌کنند
- [ ] API endpoints در دسترس هستند

---

## 📞 منابع و لینک‌های مفید

### مستندات
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Leaflet](https://leafletjs.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

### پروژه
- **Repository**: https://github.com/zahramokhtari792/loop-user-app
- **API Base**: https://narchino.com/api
- **Branch اصلی**: main

---

## 🎓 نکات پیشرفته

### Custom Hooks
```javascript
// hooks/useAuth.js
export const useAuth = () => {
  const token = useSelector(state => state.auth.token);
  const isLoggedIn = !!token;
  return { token, isLoggedIn };
};
```

### Performance Optimization
```javascript
// استفاده از memo برای جلوگیری از re-render
import React, { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  return <View>{/* ... */}</View>;
});
```

### Error Boundary
```javascript
// components/ErrorBoundary.js
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.log('Error:', error, errorInfo);
  }
  
  render() {
    return this.props.children;
  }
}
```

---

## 🔍 Debugging

### React Native Debugger
```bash
# فعال کردن debug mode
در مرورگر: F12 یا Cmd+Option+I
در موبایل: شیک دادن گوشی > Enable Debug
```

### Console Logs
```javascript
// فقط در dev mode
if (__DEV__) {
  console.log('Debug info:', data);
}
```

### Network Debugging
```bash
# نمایش همه درخواست‌های API
npx expo start --tunnel
```

---

## ⚡ نکات نهایی

1. **همیشه با Clear Cache شروع کنید** اگر مشکلی پیش آمد
2. **CSS Leaflet را مستقیم import نکنید** (باعث خطا می‌شود)
3. **State persistence را در production غیرفعال کنید**
4. **از Platform.select برای کد platform-specific استفاده کنید**
5. **Browser console را برای debug استفاده کنید**
6. **React Navigation خودش history را مدیریت می‌کند** - دخالت نکنید!

---

## 📧 پشتیبانی

اگر مشکلی پیش آمد:
1. ابتدا این مستند را کامل بخوانید
2. Console و Network tab مرورگر را چک کنید
3. Cache را پاک کنید و دوباره اجرا کنید
4. از بخش "مشکلات رایج" استفاده کنید

---

**✅ موفق باشید!** 🚀
