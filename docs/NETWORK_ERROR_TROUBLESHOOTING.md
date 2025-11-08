# راهنمای رفع خطای Network Error

## خطای دریافت شده:
```
ERROR  Registration error: [AxiosError: Network Error]
```

## علل احتمالی و راه‌حل:

### 1️⃣ سرور در حال اجرا نیست
**بررسی:**
```bash
# اگر سرور Laravel است:
php artisan serve --host=192.168.21.107 --port=8000

# یا اگر از docker استفاده می‌کنید:
docker-compose up
```

**تست اتصال:**
- در مرورگر باز کنید: `http://192.168.21.107:8000`
- باید صفحه اصلی سرور نمایش داده شود

---

### 2️⃣ آدرس IP اشتباه است
**بررسی IP سرور:**
```bash
# Windows:
ipconfig

# Mac/Linux:
ifconfig
# یا
ip addr show
```

**آدرس فعلی در کد:**
```javascript
// services/URL.js
export const uri = 'http://192.168.21.107:8000/api';
```

**اگر IP تغییر کرده:**
1. IP واقعی سرور را پیدا کنید
2. در `services/URL.js` تغییر دهید
3. اپلیکیشن را reload کنید

---

### 3️⃣ دستگاه و سرور در یک شبکه نیستند
**بررسی:**
- دستگاه و کامپیوتر سرور باید به یک WiFi متصل باشند
- اگر از emulator استفاده می‌کنید، از `10.0.2.2` به جای localhost استفاده کنید
- اگر از دستگاه واقعی استفاده می‌کنید، firewall را چک کنید

**راه‌حل برای Android Emulator:**
```javascript
// services/URL.js
export const uri = 'http://10.0.2.2:8000/api';  // برای emulator
```

---

### 4️⃣ Firewall پورت 8000 را بلاک کرده
**Windows - اجازه دادن به پورت:**
```bash
netsh advfirewall firewall add rule name="Laravel Server" dir=in action=allow protocol=TCP localport=8000
```

**Mac - خاموش کردن موقت firewall:**
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

---

### 5️⃣ مشکل در CORS (Cross-Origin)
**بررسی کنسول سرور:**
اگر خطای CORS دیدید، در Laravel:

```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_origins' => ['*'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
];
```

---

### 6️⃣ مشکل در multipart/form-data
**تست با Postman:**
1. باز کنید: `POST http://192.168.21.107:8000/api/organization/register`
2. Body → form-data انتخاب کنید
3. فیلدها را اضافه کنید
4. ارسال کنید

**اگر در Postman کار کرد:**
- مشکل از کد React Native است
- لاگ‌ها را بررسی کنید: `npx react-native log-android` یا `log-ios`

---

## 🔍 دستورات دیباگ

### مشاهده لاگ‌های دقیق:
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios

# یا در Metro:
npm start
# سپس 'r' برای reload
```

### تست اتصال به سرور:
```javascript
// در یک فایل تست یا در console
import axios from 'axios';

axios.get('http://192.168.21.107:8000/api')
  .then(res => console.log('✅ Connected:', res.data))
  .catch(err => console.log('❌ Error:', err.message));
```

---

## ✅ چک‌لیست قبل از تست:

- [ ] سرور در حال اجرا است (`php artisan serve` یا `npm run dev`)
- [ ] آدرس IP در `services/URL.js` صحیح است
- [ ] دستگاه و سرور در یک شبکه هستند
- [ ] Firewall پورت 8000 را مسدود نکرده
- [ ] Endpoint `/api/organization/register` در سرور وجود دارد
- [ ] کد ثبت‌نام در سرور صحیح کار می‌کند

---

## 🧪 تست سریع اتصال

در کامپیوتر سرور:
```bash
curl http://192.168.21.107:8000/api
```

در دستگاه موبایل (از طریق مرورگر):
```
http://192.168.21.107:8000
```

اگر هیچ‌کدام پاسخ ندادند → مشکل از network است
اگر پاسخ دادند → مشکل از کد React Native است

---

## 📝 نکات مهم:

1. **Development URL** نباید `localhost` باشد، باید IP واقعی شبکه باشد
2. **Production** از HTTPS و domain واقعی استفاده کنید
3. **Expo Go** محدودیت‌های خاصی دارد، بهتر است از Expo dev build استفاده کنید
4. **Android 9+** به HTTPS نیاز دارد مگر در `android/app/src/main/AndroidManifest.xml` تنظیم شود:
   ```xml
   <application
     android:usesCleartextTraffic="true"
     ...>
   ```

---

## 🆘 اگر همچنان کار نکرد:

1. لاگ کامل را از Metro bundler بگیرید
2. Response از سرور را در Postman تست کنید
3. `console.log` در کد اضافه کنید و خروجی را چک کنید
4. سرور Laravel را در حالت debug اجرا کنید: `APP_DEBUG=true`
