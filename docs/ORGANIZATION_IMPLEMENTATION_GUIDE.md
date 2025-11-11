# راهنمای ثبت‌نام و ورود سازمانی

## فایل‌های اضافه/تغییر یافته

### 1. صفحات جدید/به‌روز شده
- ✅ `org/logreg/Register.js` - صفحه ثبت‌نام سازمانی (کامل شده)
- ✅ `org/logreg/Login.js` - صفحه ورود سازمانی (کامل شده)
- ✅ `org/logreg/OTPVerification.js` - صفحه تایید موبایل (جدید)

### 2. فایل‌های سرویس
- ✅ `services/ApiEndpoints.js` - اضافه شدن ORGANIZATION endpoints
- ✅ `App.js` - اضافه شدن OTPVerification به navigation

### 3. مستندات
- ✅ `docs/ORGANIZATION_API_DOCS.md` - مستندات کامل API

---

## ویژگی‌های پیاده‌سازی شده

### صفحه ثبت‌نام (`Register.js`)

#### ✅ آپلود تصویر پروفایل
- استفاده از `expo-image-picker`
- نمایش پیش‌نمایش تصویر
- اختیاری (optional)

#### ✅ فیلدهای فرم
1. **تصویر پروفایل** (اختیاری)
2. **نام سازمان** (الزامی) - 2-200 کاراکتر
3. **نام و نام خانوادگی مدیر** (الزامی) - 2-120 کاراکتر
4. **کد ملی مدیر** (الزامی) - 10 رقم + validation checksum
5. **شماره موبایل مدیر** (الزامی) - 09xxxxxxxxx
6. **تاریخ تولد** (الزامی) - فرمت YYYY-MM-DD
7. **ایمیل سازمان** (الزامی) - validation email
8. **تلفن ثابت سازمان** (الزامی)
9. **رمز عبور** (الزامی) - حداقل 8 کاراکتر
10. **شهر** (الزامی)
11. **منطقه** (الزامی)
12. **آدرس سازمان** (الزامی) - 10-1000 کاراکتر
13. **کد پستی** (الزامی) - 10 رقم

#### ✅ Validation
- اعتبارسنجی کد ملی ایران (checksum algorithm)
- اعتبارسنجی شماره موبایل (09xxxxxxxxx)
- اعتبارسنجی ایمیل (RFC format)
- اعتبارسنجی کد پستی (10 رقم)
- نمایش خطاها زیر هر فیلد

#### ✅ API Integration
- ارسال `multipart/form-data` به `/api/organization/register`
- مدیریت خطاهای سرور
- نمایش loading state
- ناوبری خودکار به صفحه OTP پس از موفقیت

---

### صفحه تایید موبایل (`OTPVerification.js`)

#### ✅ ویژگی‌ها
- ورودی 5 رقمی OTP
- Auto-focus به فیلد بعدی
- نمایش کد سازمانی (6 رقمی)
- تایمر 2 دقیقه‌ای (120 ثانیه)
- دکمه ارسال مجدد کد (پس از اتمام تایمر)
- ذخیره توکن در AsyncStorage
- ناوبری به صفحه اصلی پس از تایید

#### ✅ API Integration
- تایید کد: `POST /api/organization/verify-phone`
- ارسال مجدد: `POST /api/organization/resend-code`

---

### صفحه ورود (`Login.js`)

#### ✅ ویژگی‌ها
- ورود با کد سازمانی (6 رقم) و رمز عبور
- نمایش/مخفی کردن رمز عبور
- ذخیره کد سازمانی (remember me)
- مدیریت خطاهای مختلف:
  - کد سازمانی یافت نشد
  - شماره موبایل تایید نشده
  - رمز عبور اشتباه
  - حساب غیرفعال

#### ✅ API Integration
- ورود: `POST /api/organization/login`
- ذخیره token و اطلاعات کاربر در AsyncStorage
- ناوبری به صفحه اصلی

---

## نحوه استفاده

### 1. فلوی ثبت‌نام

```
Register Screen
    ↓ (پر کردن فرم + آپلود عکس)
    ↓ (دکمه ثبت‌نام)
    ↓ API Call: /api/organization/register
    ↓ موفق: دریافت organization_code
    ↓
OTP Verification Screen
    ↓ (ورود کد 5 رقمی)
    ↓ API Call: /api/organization/verify-phone
    ↓ موفق: دریافت token
    ↓
Main App (ورود به اپلیکیشن)
```

### 2. فلوی ورود

```
Login Screen
    ↓ (ورود کد سازمانی + رمز عبور)
    ↓ API Call: /api/organization/login
    ↓ موفق: دریافت token + اطلاعات سازمان
    ↓
Main App
```

---

## تنظیمات مورد نیاز

### 1. تنظیم URL سرور
در فایل `services/URL.js`:
```javascript
export const uri = 'http://YOUR_SERVER_IP:8000/api';
```

### 2. Navigation Setup
مطمئن شوید که در `App.js` این screenها اضافه شده‌اند:
- `Register`
- `Login`
- `OTPVerification`
- `FolderScreen` (صفحه اصلی بعد از ورود)

---

## نمونه Data Flow

### ثبت‌نام
```javascript
// Request
POST /api/organization/register
Content-Type: multipart/form-data

{
  profile_image: File,
  organization_name: "وزارت آموزش",
  manager_full_name: "علی محمدی",
  manager_national_code: "0071234567",
  manager_mobile: "09121234567",
  // ... سایر فیلدها
}

// Response (Success)
{
  status: "success",
  data: {
    user_id: 123,
    organization_id: 45,
    organization_code: "123456",  // کد 6 رقمی
    phone: "09121234567",
    email: "info@org.ir"
  }
}
```

### تایید OTP
```javascript
// Request
POST /api/organization/verify-phone
{
  phone: "09121234567",
  code: "12345"  // کد 5 رقمی
}

// Response (Success)
{
  status: "success",
  data: {
    token: "1|abc123...",
    user: { /* user data */ }
  }
}
```

### ورود
```javascript
// Request
POST /api/organization/login
{
  organization_code: "123456",
  password: "Password123"
}

// Response (Success)
{
  status: "success",
  data: {
    token: "2|xyz789...",
    user: { /* user data */ },
    organization: { /* organization data */ }
  }
}
```

---

## Validation Rules

### کد ملی ایران
```javascript
function validateNationalCode(code) {
  if (!/^\d{10}$/.test(code)) return false;
  const check = parseInt(code[9]);
  const sum = code.split('').slice(0, 9)
    .reduce((acc, digit, i) => acc + parseInt(digit) * (10 - i), 0);
  const remainder = sum % 11;
  return (remainder < 2 && check === remainder) || 
         (remainder >= 2 && check === 11 - remainder);
}
```

### شماره موبایل
```javascript
/^09\d{9}$/  // باید با 09 شروع شود و 11 رقم باشد
```

### ایمیل
```javascript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### کد پستی
```javascript
/^\d{10}$/  // دقیقاً 10 رقم
```

---

## خطایابی (Troubleshooting)

### خطاهای رایج

1. **"Network Error"**
   - بررسی کنید سرور در حال اجرا است
   - URL در `services/URL.js` را چک کنید
   - اتصال اینترنت دستگاه را بررسی کنید

2. **"کد ملی نامعتبر است"**
   - کد ملی باید دقیقاً 10 رقم باشد
   - الگوریتم checksum رعایت شده باشد

3. **"تصویر آپلود نمی‌شود"**
   - مجوزهای دسترسی به گالری را چک کنید
   - حجم تصویر نباید بیشتر از 5MB باشد

4. **"کد تایید اشتباه است"**
   - کد را دقیق وارد کنید
   - اگر منقضی شد، از "ارسال مجدد" استفاده کنید

---

## To-Do (کارهای آینده)

- [ ] اضافه کردن date picker فارسی برای تاریخ تولد
- [ ] اضافه کردن dropdown برای انتخاب شهر
- [ ] پیاده‌سازی "فراموشی رمز عبور" برای سازمان
- [ ] اضافه کردن آپلود مدارک (اختیاری)
- [ ] پیاده‌سازی ویرایش پروفایل سازمان

---

## تماس و پشتیبانی

برای مشکلات و سوالات:
- بررسی `docs/ORGANIZATION_API_DOCS.md`
- چک کردن console logs
- بررسی response های API در Network tab

---

**آخرین به‌روزرسانی**: 2025-11-08
**نسخه**: 1.0.0
