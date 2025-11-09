# 🔧 بهبودهای لازم برای API پروفایل سازمانی

## ✅ API فعلاً کار می‌کند!

Response فعلی:
```json
{
  "status": "success",
  "message": "اطلاعات پروفایل با موفقیت بازیابی شد",
  "data": {
    "organization_name": "چنارخیام",
    "organization_phone": "02133565817",
    "organization_address": "نیاوران خیابان نیکوقدم ساختمان البرز دانلود",
    "manager_full_name": "اتنا کلهرراد",
    "manager_national_code": "0024095699",
    "profile_image": null,
    "organization_email": "Atena.kalharrad@gmail.coma",
    "manager_mobile": null, ⚠️
    "manager_birthdate": "1380/01/29",
    "city": "تهران",
    "region": "1",
    "postal_code": "7755332244"
  }
}
```

---

## ⚠️ مشکلات که باید برطرف شوند:

### 1️⃣ `manager_mobile` نباید null باشد

**مشکل:**
```json
"manager_mobile": null
```

**علت احتمالی:**
- در جدول `organizations` فیلد `manager_mobile` وجود ندارد
- یا در هنگام ثبت‌نام، شماره موبایل ذخیره نشده

**راه‌حل Backend:**

در جدول `organizations`، شماره موبایل مدیر باید از جدول `users` گرفته شود:

```php
public function getProfile(Request $request)
{
    $user = $request->user();
    $organization = Organization::where('user_id', $user->id)->first();
    
    if (!$organization) {
        return response()->json([
            'status' => 'error',
            'message' => 'اطلاعات سازمان یافت نشد'
        ], 404);
    }
    
    return response()->json([
        'status' => 'success',
        'message' => 'اطلاعات پروفایل با موفقیت بازیابی شد',
        'data' => [
            // ... سایر فیلدها
            
            // شماره موبایل باید از user table گرفته شود
            'manager_mobile' => $organization->manager_mobile ?? $user->phone ?? $user->mobile,
            
            // یا اگر relation داریم:
            'manager_mobile' => $organization->manager_mobile ?? $organization->user->phone,
        ]
    ]);
}
```

**Migration (اگر فیلد وجود ندارد):**
```php
Schema::table('organizations', function (Blueprint $table) {
    $table->string('manager_mobile', 11)->nullable()->after('manager_national_code');
});
```

**هنگام ثبت‌نام سازمان:**
```php
public function register(Request $request)
{
    // ...
    
    $organization = Organization::create([
        // ... سایر فیلدها
        'manager_mobile' => $request->manager_mobile, // از request
        // یا
        'manager_mobile' => $user->phone, // از user table
    ]);
}
```

---

### 2️⃣ Typo در ایمیل

**مشکل:**
```json
"organization_email": "Atena.kalharrad@gmail.coma"
                                                  ^^^ 
                                                  باید com باشد
```

این یک مشکل داده‌ای است که کاربر در هنگام ثبت‌نام وارد کرده.

**راه‌حل:**
- Validation بهتر در Frontend و Backend
- امکان ویرایش ایمیل در صفحه پروفایل

---

### 3️⃣ `profile_image` همیشه null است

**مشکل:**
```json
"profile_image": null
```

**علت:**
کاربر هنوز تصویری آپلود نکرده.

**این مشکل نیست!** ولی باید:
1. ✅ در Frontend placeholder مناسب نمایش داده شود (🏢 ایموجی)
2. ✅ امکان آپلود تصویر در صفحه پروفایل وجود داشته باشد

---

## 🔧 اقدامات لازم Backend:

### فوری (High Priority):
- [ ] ✅ برطرف کردن `manager_mobile: null`
  - [ ] اضافه کردن فیلد به جدول (اگر وجود ندارد)
  - [ ] گرفتن از `users.phone` یا `organizations.manager_mobile`
  - [ ] تست با API

### متوسط (Medium Priority):
- [ ] Validation بهتر برای ایمیل (جلوگیری از typo)
- [ ] اضافه کردن endpoint `POST /api/organization/profile` برای ویرایش
- [ ] پشتیبانی از آپلود `profile_image`

---

## ✅ وضعیت Frontend:

### انجام شده:
1. ✅ دریافت و نمایش اطلاعات از API
2. ✅ Fallback به AsyncStorage برای `manager_mobile` اگر null باشد
3. ✅ نمایش placeholder برای تصویر پروفایل
4. ✅ Console logs برای Debug
5. ✅ مدیریت فیلدهای null

### در حال انتظار:
- ⏳ برطرف شدن `manager_mobile: null` در Backend
- ⏳ پیاده‌سازی `POST /api/organization/profile` برای ویرایش

---

## 🧪 تست:

### Test Case 1: بررسی manager_mobile
```bash
# Request
GET /api/organization/profile
Authorization: Bearer {token}

# Expected Response
{
  "data": {
    "manager_mobile": "09123456789", ✅ نباید null باشد
    // ...
  }
}
```

### Test Case 2: بررسی profile_image (بعد از آپلود)
```bash
# 1. آپلود تصویر
POST /api/organization/profile
FormData:
  profile_image: [FILE]
  
# 2. دریافت پروفایل
GET /api/organization/profile

# Expected
{
  "data": {
    "profile_image": "images/organizations/123-profile.jpg", ✅
    // ...
  }
}
```

---

## 📊 خلاصه:

| فیلد | وضعیت فعلی | نیاز به اقدام |
|------|------------|---------------|
| `organization_name` | ✅ OK | - |
| `organization_phone` | ✅ OK | - |
| `organization_address` | ✅ OK | - |
| `organization_email` | ⚠️ Typo | Validation بهتر |
| `manager_full_name` | ✅ OK | - |
| `manager_national_code` | ✅ OK | - |
| `manager_mobile` | ❌ null | **فوری: باید برطرف شود** |
| `manager_birthdate` | ✅ OK | - |
| `city` | ✅ OK | - |
| `region` | ✅ OK | - |
| `postal_code` | ✅ OK | - |
| `profile_image` | ⚠️ null | طبیعی (کاربر آپلود نکرده) |

---

**تاریخ:** 2025-11-08  
**وضعیت:** ✅ API کار می‌کند، نیاز به بهبود `manager_mobile`  
**اولویت:** 🟡 متوسط (Frontend از AsyncStorage استفاده می‌کند)
