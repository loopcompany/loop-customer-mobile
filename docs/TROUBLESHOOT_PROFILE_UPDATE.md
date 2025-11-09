# 🔍 راهنمای عیب‌یابی: چرا پروفایل Update نشد؟

## 📋 چک‌لیست عیب‌یابی

### مرحله 1: بررسی Console Logs

وقتی دکمه "ذخیره تغییرات" رو میزنی، به دنبال این لاگ‌ها باش:

#### ✅ **حالت موفقیت‌آمیز:**
```
🔄 [OrganizationProfile] شروع به‌روزرسانی پروفایل...
📝 [OrganizationProfile] ساخت FormData...
📦 [OrganizationProfile] داده‌های ارسالی: {...}
📡 [OrganizationProfile] ارسال درخواست به: http://...
📡 [OrganizationProfile] استفاده از متد: PUT
✅ [OrganizationProfile] پاسخ دریافت شد: {status: "success", ...}
```

بعدش باید:
1. Alert با پیام "موفق" نمایش داده بشه
2. صفحه از حالت ویرایش خارج بشه (دکمه "ویرایش" دوباره ظاهر بشه)
3. اطلاعات جدید نمایش داده بشه

#### ❌ **حالت خطا:**

**خطای 405 (Backend آماده نیست):**
```
❌ [OrganizationProfile] خطا در به‌روزرسانی: [AxiosError: Request failed with status code 405]
❌ [OrganizationProfile] جزئیات خطا: {status: 405, ...}
```
➡️ **راه‌حل:** Backend باید endpoint `PUT /api/organization/profile` رو پیاده‌سازی کنه

**خطای 422 (Validation):**
```
❌ [OrganizationProfile] خطا در به‌روزرسانی: [AxiosError: Request failed with status code 422]
❌ [OrganizationProfile] جزئیات خطا: {
  status: 422,
  response: {
    errors: {
      organization_email: ["فرمت ایمیل نامعتبر است"],
      postal_code: ["کد پستی باید 10 رقم باشد"]
    }
  }
}
```
➡️ **راه‌حل:** داده‌های ورودی رو اصلاح کن (ایمیل، کد پستی، و...)

**خطای 401/403 (Unauthorized):**
```
❌ [OrganizationProfile] خطا در به‌روزرسانی: [AxiosError: Request failed with status code 401]
```
➡️ **راه‌حل:** دوباره Login کن

---

## 🔧 سناریوهای مختلف و راه‌حل‌ها

### سناریو 1: هیچ اتفاقی نمی‌افته 🤔

**علائم:**
- دکمه "ذخیره تغییرات" رو میزنی
- هیچ Alert یا پیامی نمیاد
- صفحه به حالت ویرایش باقی می‌مونه

**علت‌های احتمالی:**
1. JavaScript error که catch نشده
2. دکمه disabled هست
3. Loading state true مونده

**راه‌حل:**
```javascript
// بررسی Console
// اگر هیچ لاگی نیست → دکمه کار نمی‌کنه
// اگر لاگ "شروع به‌روزرسانی" هست ولی بقیه نیست → در وسط کار خطا خورده
```

---

### سناریو 2: Alert "موفق" میاد ولی اطلاعات عوض نمیشه 🔄

**علائم:**
- پیام "پروفایل با موفقیت به‌روزرسانی شد" نمایش داده میشه
- ولی وقتی صفحه رو دوباره باز می‌کنی، اطلاعات قدیمی هست

**علت‌های احتمالی:**

#### A) Backend داده‌ها رو ذخیره نکرده
```javascript
// بررسی Console
✅ [OrganizationProfile] پاسخ دریافت شد: {
  status: "success",
  data: {
    organization_name: "نام قدیمی" ← مشکل اینجاست!
  }
}
```
➡️ **راه‌حل:** Backend Controller رو چک کن که `update()` انجام بده

#### B) Frontend داده‌های قدیمی رو دوباره set می‌کنه
```javascript
// در loadOrganizationProfile()
setOrganizationName(data.organization_name || '');
// اگر data.organization_name قدیمی بود...
```
➡️ **راه‌حل:** Backend باید داده‌های جدید رو برگردونه

---

### سناریو 3: خطای 405 Method Not Allowed ⚠️

**علائم:**
```
ERROR: Request failed with status code 405
message: "The PUT method is not supported..."
```

**علت:**
Backend هنوز `PUT /api/organization/profile` رو پیاده‌سازی نکرده

**راه‌حل:**
به Backend team بگو این endpoint رو اضافه کنه:

```php
// routes/api.php
Route::put('/organization/profile', [OrganizationController::class, 'updateProfile']);

// OrganizationController.php
public function updateProfile(Request $request) {
    // Validation
    $validated = $request->validate([...]);
    
    // Update
    $organization->update($validated);
    
    // Return updated data
    return response()->json([
        'status' => 'success',
        'message' => 'پروفایل با موفقیت به‌روزرسانی شد',
        'data' => $organization // داده‌های جدید
    ]);
}
```

---

### سناریو 4: خطای Validation (422) 📝

**علائم:**
```
Alert: خطای اعتبارسنجی
• فرمت ایمیل نامعتبر است
• کد پستی باید 10 رقم باشد
```

**راه‌حل:**
داده‌های ورودی رو اصلاح کن:
- ایمیل: باید فرمت `email@example.com` باشه
- کد پستی: باید دقیقاً 10 رقم باشه
- تلفن: باید 11 رقم باشه و با 0 شروع بشه

---

### سناریو 5: فیلدهای خاصی Update نمیشن 🔍

**مثال:** نام سازمان عوض میشه ولی ایمیل نه

**علت:**
Backend ممکنه بعضی فیلدها رو `fillable` نکرده باشه

**راه‌حل Backend:**
```php
// Organization Model
protected $fillable = [
    'organization_name',
    'organization_email', // ← این رو چک کن
    'organization_phone',
    'organization_address',
    'manager_full_name',
    'city',
    'region',
    'postal_code',
    'manager_birthdate',
    'profile_image',
];
```

---

## 🧪 تست دستی

### مرحله 1: باز کردن صفحه
1. Login کن با حساب سازمانی
2. برو به "حساب کاربری"
3. صفحه OrganizationProfile باز میشه

### مرحله 2: ویرایش
1. دکمه "ویرایش" رو بزن
2. یک فیلد رو تغییر بده (مثلاً نام سازمان از "چنارخیام" به "چنارخیام تست")
3. دکمه "ذخیره تغییرات" رو بزن

### مرحله 3: بررسی Console
```javascript
// باید این لاگ‌ها رو ببینی:
📦 [OrganizationProfile] داده‌های ارسالی: {
  organization_name: "چنارخیام تست", ← مقدار جدید
  ...
}
```

### مرحله 4: بررسی Response
```javascript
✅ [OrganizationProfile] پاسخ دریافت شد: {
  status: "success",
  data: {
    organization_name: "چنارخیام تست", ← باید جدید باشه
    ...
  }
}
```

### مرحله 5: بررسی UI
- Alert "موفق" نمایش داده میشه؟ ✅
- صفحه از حالت ویرایش خارج میشه؟ ✅
- فیلد نمایش مقدار جدید رو داره؟ ✅

---

## 📊 جدول عیب‌یابی سریع

| علامت | علت احتمالی | راه‌حل |
|-------|-------------|--------|
| هیچ لاگی نیست | دکمه کار نمی‌کنه | چک کن `loading` false باشه |
| خطای 405 | Backend آماده نیست | پیاده‌سازی PUT endpoint |
| خطای 422 | Validation error | اصلاح داده‌های ورودی |
| خطای 401 | Token منقضی شده | دوباره Login کن |
| "موفق" ولی تغییر نکرد | Backend ذخیره نکرده | چک کن `update()` انجام بشه |
| بعضی فیلدها عوض نمیشن | فیلد fillable نیست | اضافه کن به Model |

---

## 🔑 نکات کلیدی

1. ✅ **همیشه Console logs رو بررسی کن**
2. ✅ **Backend باید داده‌های جدید رو برگردونه** (نه قدیمی)
3. ✅ **بعد از update موفق، `loadOrganizationProfile()` صدا زده میشه**
4. ✅ **اگر 405 اومد، Backend هنوز PUT رو نزده**

---

## 📞 چک‌لیست برای گزارش مشکل

اگر مشکل حل نشد، این اطلاعات رو بده:

- [ ] آخرین لاگ Console چی بود؟
- [ ] Alert چی گفت؟ ("موفق" یا پیام خطا)
- [ ] کدوم فیلد رو تغییر دادی؟
- [ ] آیا صفحه از حالت ویرایش خارج شد؟
- [ ] آیا Backend endpoint `PUT /api/organization/profile` داره؟

---

**تاریخ:** 2025-11-08  
**نسخه:** 2.0
