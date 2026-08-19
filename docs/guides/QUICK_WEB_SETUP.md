# 🚀 راهنمای سریع اجرای Web App - Expo Projects

## ⚡ نصب سریع

```bash
# 1. کلون و نصب
git clone <repository-url>
cd <project-name>
npm install

# 2. اجرای وب
npm start
# سپس 'w' را در ترمینال بزنید
# یا
npx expo start --web
```

---

## 🗺️ راهنمای سریع نقشه (Leaflet for Web)

### ⚠️ مهم‌ترین نکته
```javascript
// ❌ هرگز این کار را نکنید
import 'leaflet/dist/leaflet.css';

// ✅ به جای آن از CDN استفاده کنید
```

### تنظیم Leaflet CSS

**روش 1: اضافه کردن به HTML**
```html
<!-- در web/index.html یا public/index.html -->
<link 
  rel="stylesheet" 
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""
/>
```

**روش 2: استفاده از app.json**
```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

### ساختار فایل‌های نقشه
```
components/
├── MapView.web.js      # برای وب (Leaflet)
├── MapView.js          # برای موبایل (React Native Maps)
└── MapView.simple.js   # Fallback ساده
```

### استفاده در کامپوننت
```javascript
import MapView from '../components/MapView';

<MapView
  center={[35.6892, 51.3890]}
  zoom={13}
  style={{ width: '100%', height: 400 }}
  onLocationSelect={(location) => console.log(location)}
/>
```

---

## 🔧 Navigation Setup

### تنظیم Browser History
```javascript
// App.js
const linking = Platform.OS === 'web' ? {
  prefixes: ['http://localhost:8081', 'http://localhost:8082'],
  config: {
    screens: {
      Home: '',
      Profile: 'profile',
      Settings: 'settings',
      // ...
    }
  }
} : undefined;

<NavigationContainer linking={linking}>
  {/* ... */}
</NavigationContainer>
```

### نکات کلیدی Navigation:
- ✅ React Navigation خودش URL را مدیریت می‌کند
- ❌ از `window.history.pushState` استفاده نکنید
- ❌ `popstate` event را override نکنید
- ✅ Browser back button خودش کار می‌کند

---

## 🐛 مشکلات رایج

### 1. خطای CSS Import
```
Error: Importing local resources in CSS is not supported
```
**راه‌حل:** CSS را از CDN لود کنید، نه import مستقیم

### 2. Back Button کار نمی‌کند
**راه‌حل:** Custom navigation handlers را حذف کنید

### 3. Reload در موبایل مشکل دارد
**راه‌حل:** State persistence را فقط در dev mode نگه دارید:
```javascript
onStateChange={(state) => {
  if (state && Platform.OS !== 'web' && __DEV__) {
    AsyncStorage.setItem(KEY, JSON.stringify(state));
  }
}}
```

### 4. پورت اشغال است
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
pkill -f node
```

---

## 📦 Platform-Specific Code

```javascript
import { Platform } from 'react-native';

// روش 1
if (Platform.OS === 'web') {
  // کد وب
} else {
  // کد موبایل
}

// روش 2
const Component = Platform.select({
  web: () => require('./Component.web'),
  default: () => require('./Component'),
})();
```

---

## 🚀 Build Production

```bash
# Build وب
npx expo export:web

# خروجی در: web-build/
```

---

## ✅ چک‌لیست راه‌اندازی

- [ ] `npm install` اجرا شده
- [ ] `npx expo start --web` کار می‌کند
- [ ] CSS Leaflet از CDN لود می‌شود
- [ ] Navigation و back button درست کار می‌کنند
- [ ] نقشه نمایش داده می‌شود
- [ ] هیچ custom `popstate` handler نداریم
- [ ] State persistence فقط dev mode است

---

## 🔗 منابع

- [Expo Web](https://docs.expo.dev/workflow/web/)
- [React Navigation Linking](https://reactnavigation.org/docs/configuring-links/)
- [Leaflet React](https://react-leaflet.js.org/)

---

## 💡 نکات طلایی

1. **هرگز CSS Leaflet را مستقیم import نکنید**
2. **React Navigation را دست نزنید - خودش می‌داند چه کار کند**
3. **با Clear Cache شروع کنید: `npx expo start -c`**
4. **Console مرورگر دوست شماست (F12)**
5. **Platform.select برای کد مخصوص هر پلتفرم**

---

**موفق باشید! 🎉**
