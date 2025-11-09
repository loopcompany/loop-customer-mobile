# 🐛 Bug: Backend فقط نام سازمان رو آپدیت می‌کنه

**تاریخ:** 2025-11-08  
**اولویت:** 🟡 Medium  
**وضعیت:** ⚠️ Needs Backend Fix

---

## 📋 خلاصه مشکل

هنگام آپدیت پروفایل سازمانی با `PUT /api/organization/profile`، **فقط `organization_name` آپدیت می‌شود** و بقیه فیلدها ignore می‌شوند!

### 🧪 تست انجام شده:

**Request:**
```json
PUT /api/organization/profile
{
  "organization_name": "چنارخیامhhgtu",
  "organization_email": "Andjdjdjd.kalharrad@gmail.coma",
  "manager_full_name": "اتنا کلهررادhdhdh",
  "organization_phone": "02133565817",
  "city": "تهران",
  "region": "1",
  "postal_code": "7755332244",
  "manager_birthdate": "1380/01/29"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "organization_name": "چنارخیامhhgtu",           // ✅ آپدیت شد
    "organization_email": "Atena.kalharrad@gmail.coma",  // ❌ تغییر نکرد
    "manager_full_name": "اتنا کلهرراد",            // ❌ تغییر نکرد
    // ...
  }
}
```

---

## 🔍 تحلیل

### مقایسه ارسالی و دریافتی:

| فیلد | ارسالی | دریافتی | وضعیت |
|------|---------|---------|--------|
| `organization_name` | `چنارخیامhhgtu` | `چنارخیامhhgtu` | ✅ |
| `organization_email` | `Andjdjdjd.kalharrad@gmail.coma` | `Atena.kalharrad@gmail.coma` | ❌ |
| `manager_full_name` | `اتنا کلهررادhdhdh` | `اتنا کلهرراد` | ❌ |

---

## 🎯 انتظار

طبق مستندات `ORGANIZATION_PROFILE_FIXED.md`، Backend باید **همه فیلدها** رو آپدیت کنه:

```php
// Controller
public function updateProfile(Request $request)
{
    $validated = $request->validate([
        'organization_name' => 'required|string|max:255',
        'manager_full_name' => 'required|string|max:255',
        'organization_email' => 'required|email',
        'organization_phone' => 'required|string',
        'city' => 'required|string',
        'region' => 'required|string',
        'postal_code' => 'required|string',
        // ...
    ]);

    $organization->update($validated);  // باید همه فیلدها آپدیت بشه
    
    return response()->json([...]);
}
```

---

## 💡 دلایل احتمالی مشکل

### 1️⃣ Model Fillable محدود است
```php
// Model: Organization.php
protected $fillable = [
    'organization_name',  // ✅ فقط این در fillable است؟
    // 'manager_full_name',  // ❌ این نیست؟
    // 'organization_email',  // ❌ این نیست؟
];
```

**راه‌حل:**
```php
protected $fillable = [
    'organization_name',
    'manager_full_name',
    'organization_email',
    'organization_phone',
    'organization_address',
    'city',
    'region',
    'postal_code',
    'manager_birthdate',
];
```

### 2️⃣ Controller فقط نام رو آپدیت می‌کنه
```php
// ❌ اشتباه
$organization->organization_name = $request->organization_name;
$organization->save();

// ✅ صحیح
$organization->update($validated);
```

### 3️⃣ Database Schema ناقص است
بررسی کنید که همه فیلدها در جدول `organizations` موجود باشند:
```sql
DESCRIBE organizations;
```

---

## ✅ راه‌حل پیشنهادی

### Backend:

1. **بررسی Model:**
```php
// app/Models/Organization.php
protected $fillable = [
    'organization_name',
    'organization_code',
    'organization_phone',
    'organization_address',
    'organization_email',
    'manager_full_name',
    'manager_national_code',
    'manager_mobile',
    'manager_birthdate',
    'city',
    'region',
    'postal_code',
    'profile_image',
];
```

2. **بررسی Controller:**
```php
// app/Http/Controllers/OrganizationController.php
public function updateProfile(Request $request)
{
    $organization = $request->user()->organization;
    
    $validated = $request->validate([
        'organization_name' => 'sometimes|string|max:255',
        'manager_full_name' => 'sometimes|string|max:255',
        'organization_email' => 'sometimes|email',
        // ... سایر فیلدها
    ]);
    
    // Log برای debug
    \Log::info('Update Organization:', $validated);
    
    $organization->update($validated);
    
    // Log بعد از update
    \Log::info('Updated Organization:', $organization->toArray());
    
    return response()->json([
        'status' => 'success',
        'data' => $organization,
    ]);
}
```

3. **تست:**
```bash
# در Backend
curl -X PUT "http://localhost:8000/api/organization/profile" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_name": "نام جدید",
    "manager_full_name": "مدیر جدید",
    "organization_email": "new@email.com"
  }'
```

---

## 📊 لاگ‌های تست

### Frontend logs:
```
📦 داده‌های ارسالی: {
  "organization_name": "چنارخیامhhgtu",
  "organization_email": "Andjdjdjd.kalharrad@gmail.coma",
  "manager_full_name": "اتنا کلهررادhdhdh"
}

✅ پاسخ دریافت شد: {
  "organization_name": "چنارخیامhhgtu",  ✅
  "organization_email": "Atena.kalharrad@gmail.coma",  ❌
  "manager_full_name": "اتنا کلهرراد"  ❌
}
```

---

## 🔗 مستندات مرتبط

- [ORGANIZATION_PROFILE_FIXED.md](./ORGANIZATION_PROFILE_FIXED.md) - مستندات کامل API
- [ORGANIZATION_PROFILE_API.md](./ORGANIZATION_PROFILE_API.md) - API Reference
- [OrganizationProfile.js](../screens/account/OrganizationProfile.js) - کامپوننت Frontend

---

## ⚡ نکات مهم

1. ✅ Frontend درست کار می‌کنه (همه فیلدها ارسال می‌شوند)
2. ✅ تاریخ به فرمت شمسی ارسال می‌شود (`1380/01/29`)
3. ✅ Content-Type درست است (`application/json` یا `multipart/form-data`)
4. ❌ Backend فقط `organization_name` رو آپدیت می‌کنه

---

## 📝 Checklist برای Backend Developer

- [ ] بررسی `$fillable` در Model `Organization`
- [ ] بررسی Controller که از `update($validated)` استفاده می‌کنه
- [ ] بررسی Database Schema (همه فیلدها موجود باشند)
- [ ] اضافه کردن Log برای debug
- [ ] تست با Postman/cURL
- [ ] آپدیت تمام فیلدها و بررسی response

---

**تاریخ گزارش:** 2025-11-08  
**گزارش‌دهنده:** Frontend Team  
**اولویت:** Medium (برای ادامه تست service_schedule نیاز نیست)  
**وضعیت:** Waiting for Backend Fix
