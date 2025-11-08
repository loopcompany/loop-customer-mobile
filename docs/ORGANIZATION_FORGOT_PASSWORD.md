# 🔐 فرآیند بازیابی رمز عبور سازمانی

## 📋 خلاصه

سیستم بازیابی رمز عبور برای حساب‌های سازمانی که نیاز به **کد سازمانی 6 رقمی** و **شماره موبایل مدیر** دارد.

---

## 🔄 فلوی کامل

```
[Login Screen]
    ↓ کلیک روی "فراموشی رمز عبور"
    ↓
[OrganizationForgotPassword]
    ↓ وارد کردن: کد سازمانی + شماره موبایل
    ↓ POST /api/organization/forgot-password
    ↓
[API ارسال کد 6 رقمی به موبایل]
    ↓
[OrganizationResetPassword]
    ↓ وارد کردن: کد 6 رقمی + رمز جدید + تکرار رمز
    ↓ POST /api/organization/reset-password
    ↓
[Success Alert]
    ↓
[Login Screen]
    ↓ ورود با رمز جدید
```

---

## 📁 فایل‌های ایجاد شده

### 1️⃣ `org/logreg/OrganizationForgotPassword.js`

**وظیفه:** دریافت کد سازمانی و شماره موبایل مدیر

**ورودی‌ها:**
- کد سازمانی (6 رقم)
- شماره موبایل مدیر (11 رقم - 09XXXXXXXXX)

**اعتبارسنجی:**
```javascript
// کد سازمانی
if (organizationCode.length !== 6 || !/^\d{6}$/.test(organizationCode)) {
  error = 'کد سازمانی باید 6 رقم باشد';
}

// شماره موبایل
if (!/^09\d{9}$/.test(mobileNumber)) {
  error = 'فرمت شماره موبایل صحیح نیست';
}
```

**API Call:**
```javascript
POST /api/organization/forgot-password
Body: {
  organization_code: "194244",
  mobile: "09123456789"
}

Response: {
  status: "success",
  message: "کد بازیابی به شماره موبایل ارسال شد"
}
```

**Navigation:**
```javascript
navigation.navigate('OrganizationResetPassword', {
  organizationCode: '194244',
  phone: '09123456789',
});
```

---

### 2️⃣ `org/logreg/OrganizationResetPassword.js`

**وظیفه:** تایید کد و تنظیم رمز جدید

**ورودی‌ها:**
- کد تایید 6 رقمی (از SMS)
- رمز عبور جدید (حداقل 6 کاراکتر)
- تکرار رمز عبور جدید

**اعتبارسنجی:**
```javascript
// کد تایید
if (code.length !== 6) {
  error = 'لطفا کد 6 رقمی را وارد کنید';
}

// رمز عبور جدید
if (newPassword.length < 6) {
  error = 'رمز عبور باید حداقل 6 کاراکتر باشد';
}

// تطابق رمزها
if (newPassword !== confirmPassword) {
  error = 'رمز عبور و تکرار آن یکسان نیستند';
}
```

**API Call:**
```javascript
POST /api/organization/reset-password
Body: {
  organization_code: "194244",
  phone: "09123456789",
  code: "123456",
  password: "newpass123",
  password_confirmation: "newpass123"
}

Response: {
  status: "success",
  message: "رمز عبور با موفقیت تغییر یافت"
}
```

**Navigation بعد از موفقیت:**
```javascript
navigation.navigate('Login');
```

---

## 🎨 طراحی UI

### OrganizationForgotPassword:

```
┌─────────────────────────────────────┐
│  بازیابی رمز عبور سازمانی           │
│  کد سازمانی و شماره موبایل مدیر    │
│  را وارد کنید                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  کد سازمانی *                       │
│  ┌───────────────────────────────┐  │
│  │      [_ _ _ _ _ _]           │  │ 6 رقم
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  شماره موبایل مدیر *                │
│  ┌───────────────────────────────┐  │
│  │    09123456789               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💡 کد بازیابی به شماره موبایل     │
│  ثبت شده در حساب مدیر ارسال می‌شود │
└─────────────────────────────────────┘

        [ ارسال کد بازیابی ]
        
        بازگشت به صفحه ورود
```

### OrganizationResetPassword:

```
┌─────────────────────────────────────┐
│  کد بازیابی ارسال شد                │
│  کد 6 رقمی ارسال شده به            │
│  09123456789 را وارد کنید          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  کد سازمانی:                        │
│     1 9 4 2 4 4                    │
└─────────────────────────────────────┘

کد تایید *
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘

زمان باقیمانده: 2:00

┌─────────────────────────────────────┐
│  رمز عبور جدید *                    │
│  ┌───────────────────────────────┐  │
│  │    ••••••••          👁️       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  تکرار رمز عبور جدید *              │
│  ┌───────────────────────────────┐  │
│  │    ••••••••          👁️       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

        [ تغییر رمز عبور ]
        
        [ ارسال مجدد کد ]
```

---

## 🔒 امنیت

### 1. اعتبارسنجی سمت کلاینت
```javascript
✅ کد سازمانی: دقیقا 6 رقم
✅ شماره موبایل: فرمت 09XXXXXXXXX
✅ کد تایید: دقیقا 6 رقم
✅ رمز عبور: حداقل 6 کاراکتر
✅ تطابق رمزها
```

### 2. محدودیت‌ها
```javascript
⏱️ تایمر 2 دقیقه برای کد تایید
🔁 دکمه ارسال مجدد فقط بعد از اتمام تایمر
🔐 رمز عبور مخفی با قابلیت نمایش
```

### 3. مدیریت خطا
```javascript
❌ Response errors → نمایش message سرور
❌ Request errors → "سرور پاسخگو نیست"
❌ Validation errors → نمایش در کنار فیلد
```

---

## 📡 API Endpoints

### 1. ارسال کد بازیابی
```http
POST /api/organization/forgot-password

Request:
{
  "organization_code": "194244",
  "mobile": "09123456789"
}

Success Response (200):
{
  "status": "success",
  "message": "کد بازیابی به شماره موبایل ارسال شد"
}

Error Response (404):
{
  "status": "error",
  "message": "سازمان یا شماره موبایل یافت نشد"
}

Error Response (422):
{
  "status": "error",
  "message": "اطلاعات وارد شده صحیح نیست",
  "errors": {
    "organization_code": ["کد سازمانی نامعتبر است"],
    "mobile": ["فرمت شماره موبایل صحیح نیست"]
  }
}
```

### 2. تغییر رمز عبور
```http
POST /api/organization/reset-password

Request:
{
  "organization_code": "194244",
  "phone": "09123456789",
  "code": "123456",
  "password": "newpass123",
  "password_confirmation": "newpass123"
}

Success Response (200):
{
  "status": "success",
  "message": "رمز عبور با موفقیت تغییر یافت"
}

Error Response (400):
{
  "status": "error",
  "message": "کد تایید اشتباه یا منقضی شده است"
}

Error Response (422):
{
  "status": "error",
  "message": "خطا در اعتبارسنجی",
  "errors": {
    "password": ["رمز عبور باید حداقل 6 کاراکتر باشد"],
    "password_confirmation": ["تکرار رمز عبور با رمز اصلی مطابقت ندارد"]
  }
}
```

---

## 🧪 سناریوهای تست

### ✅ سناریوی موفق:
1. کاربر در Login روی "فراموشی رمز عبور" کلیک می‌کند
2. وارد صفحه OrganizationForgotPassword می‌شود
3. کد سازمانی `194244` و موبایل `09123456789` را وارد می‌کند
4. کد بازیابی به موبایل ارسال می‌شود
5. وارد صفحه OrganizationResetPassword می‌شود
6. کد 6 رقمی `123456` را وارد می‌کند
7. رمز جدید `myNewPass123` را وارد می‌کند
8. تکرار رمز را وارد می‌کند
9. رمز عبور با موفقیت تغییر می‌یابد
10. به صفحه Login منتقل می‌شود
11. با رمز جدید وارد می‌شود

### ❌ سناریوهای خطا:

**1. کد سازمانی اشتباه:**
```
Input: organizationCode = "999999"
Error: "سازمان با این کد یافت نشد"
```

**2. شماره موبایل متفاوت:**
```
Input: mobile = "09111111111" (غیر از موبایل ثبت شده)
Error: "شماره موبایل با سازمان مطابقت ندارد"
```

**3. کد تایید اشتباه:**
```
Input: code = "000000"
Error: "کد تایید اشتباه است"
```

**4. کد تایید منقضی شده:**
```
Input: code = "123456" (بعد از 10 دقیقه)
Error: "کد تایید منقضی شده است. لطفا مجددا درخواست دهید"
```

**5. رمزهای ناهمخوان:**
```
Input: 
  password = "pass123"
  password_confirmation = "pass456"
Error: "رمز عبور و تکرار آن یکسان نیستند"
```

---

## 📝 تفاوت با کاربران عادی

| مورد | کاربر عادی | کاربر سازمانی |
|------|-------------|----------------|
| صفحه فراموشی | ForgotPassword.js | OrganizationForgotPassword.js |
| فیلدهای ورودی | کد ملی + موبایل + ایمیل | کد سازمانی + موبایل |
| صفحه تغییر رمز | ResetPasswordScreen.js | OrganizationResetPassword.js |
| API endpoint | /forgot-password | /organization/forgot-password |
| شناسایی حساب | کد ملی | کد سازمانی |
| موبایل | موبایل کاربر | موبایل مدیر سازمان |

---

## 🔗 Navigation در App.js

```javascript
// Import
import OrganizationForgotPassword from "./org/logreg/OrganizationForgotPassword";
import OrganizationResetPassword from "./org/logreg/OrganizationResetPassword";

// Screens
<Stack.Screen
  component={OrganizationForgotPassword}
  name="OrganizationForgotPassword"
  options={{ headerShown: false }}
/>
<Stack.Screen
  component={OrganizationResetPassword}
  name="OrganizationResetPassword"
  options={{ headerShown: false }}
/>
```

---

## 🔧 تغییرات در Login.js

```javascript
// قبل
const handleForgotPassword = () => {
  navigation.navigate('ResetPasswordScreen'); // ❌ برای کاربران عادی
};

// بعد
const handleForgotPassword = () => {
  navigation.navigate('OrganizationForgotPassword'); // ✅ برای سازمان
};
```

---

## ✅ چک‌لیست پیاده‌سازی

- [x] ایجاد OrganizationForgotPassword.js
- [x] ایجاد OrganizationResetPassword.js
- [x] اضافه کردن به App.js
- [x] تغییر navigation در Login.js
- [x] اعتبارسنجی کد سازمانی (6 رقم)
- [x] اعتبارسنجی شماره موبایل (11 رقم)
- [x] اعتبارسنجی کد تایید (6 رقم)
- [x] اعتبارسنجی رمز عبور (حداقل 6 کاراکتر)
- [x] تایمر 2 دقیقه برای کد
- [x] قابلیت ارسال مجدد کد
- [x] نمایش/مخفی کردن رمز عبور
- [x] مدیریت خطاهای API
- [x] Console logs برای debugging
- [x] UI فارسی و RTL

---

## 🚀 آماده برای تست

فرآیند بازیابی رمز عبور سازمانی **کاملاً پیاده‌سازی شده** و آماده تست با API واقعی است.

**مسیر تست:**
```
Login → فراموشی رمز عبور → 
OrganizationForgotPassword → 
OrganizationResetPassword → 
Login (با رمز جدید)
```

---

**تاریخ**: 2025-11-08  
**وضعیت**: ✅ کامل و آماده تست  
**فایل‌های ایجاد شده**: 2 فایل + تغییرات در 2 فایل
