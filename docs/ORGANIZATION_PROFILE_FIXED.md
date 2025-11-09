# ✅ مشکلات برطرف شده - پروفایل سازمانی

## 🔧 تغییرات اعمال شده در Frontend

### 1️⃣ تغییر متد از POST به PUT

**مشکل:**
```
ERROR: Request failed with status code 405
message: "The POST method is not supported for route api/organization/profile. 
Supported methods: GET, HEAD, PUT."
```

**راه‌حل:**
```javascript
// قبل:
const response = await axios.post(`${uri}/organization/profile`, formData, {...});

// بعد:
const response = await axios.put(`${uri}/organization/profile`, formData, {...});
```

✅ **وضعیت:** برطرف شد

---

### 2️⃣ بهبود خواندن شماره موبایل از AsyncStorage

**مشکل:**
```
LOG  ⚠️ [OrganizationProfile] manager_mobile null است، خواندن از AsyncStorage...
LOG  📱 [OrganizationProfile] شماره موبایل از AsyncStorage: undefined
```

**علت:**
- در `organizationData` فیلد `manager_mobile` وجود نداشت
- باید از `userData` هم بخوانیم

**راه‌حل:**
```javascript
// اگر شماره موبایل null بود، از AsyncStorage بخوان
if (data.manager_mobile) {
  setMobileNumber(data.manager_mobile);
} else {
  // 1. ابتدا از organizationData بخوان
  const orgData = await AsyncStorage.getItem('organizationData');
  if (orgData) {
    const savedData = JSON.parse(orgData);
    if (savedData.manager_mobile) {
      setMobileNumber(savedData.manager_mobile);
    }
  }
  
  // 2. اگر نبود، از userData بخوان
  if (!mobileNumber) {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.phone || user.mobile) {
        setMobileNumber(user.phone || user.mobile);
      }
    }
  }
}
```

✅ **وضعیت:** برطرف شد

---

## 📋 API Endpoint برای Backend

### PUT `/api/organization/profile`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
Accept: application/json
```

**Request Body (FormData):**
```
profile_image: File (optional)
organization_name: string
organization_email: string
organization_phone: string
organization_address: string
manager_full_name: string
city: string
region: string
postal_code: string
manager_birthdate: string (YYYY-MM-DD)
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "پروفایل با موفقیت به‌روزرسانی شد",
  "data": {
    "organization_name": "چنارخیام",
    "organization_email": "info@example.com",
    "organization_phone": "02133565817",
    "organization_address": "نیاوران...",
    "manager_full_name": "اتنا کلهرراد",
    "manager_national_code": "0024095699",
    "manager_mobile": "09123456789",
    "manager_birthdate": "1380/01/29",
    "city": "تهران",
    "region": "1",
    "postal_code": "7755332244",
    "profile_image": "images/organizations/profile-123.jpg"
  }
}
```

**Response (Error - 422):**
```json
{
  "status": "error",
  "message": "خطای اعتبارسنجی",
  "errors": {
    "organization_email": ["فرمت ایمیل نامعتبر است"],
    "postal_code": ["کد پستی باید 10 رقم باشد"]
  }
}
```

---

## 🔧 پیاده‌سازی Backend (Laravel)

### Controller Example

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Organization;
use Morilog\Jalali\Jalalian;

class OrganizationController extends Controller
{
    /**
     * به‌روزرسانی پروفایل سازمان
     * 
     * @route PUT /api/organization/profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            $organization = Organization::where('user_id', $user->id)->first();
            
            if (!$organization) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'اطلاعات سازمان یافت نشد'
                ], 404);
            }
            
            // Validation
            $validated = $request->validate([
                'profile_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'organization_name' => 'required|string|min:3|max:255',
                'organization_email' => 'required|email|max:255',
                'organization_phone' => 'required|string|regex:/^0\d{10}$/',
                'organization_address' => 'required|string',
                'manager_full_name' => 'required|string|max:255',
                'city' => 'required|string|max:100',
                'region' => 'required|string|max:100',
                'postal_code' => 'required|string|size:10|regex:/^\d{10}$/',
                'manager_birthdate' => 'nullable|date',
            ]);
            
            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                // Delete old image
                if ($organization->profile_image) {
                    \Storage::delete('public/' . $organization->profile_image);
                }
                
                $path = $request->file('profile_image')->store('images/organizations', 'public');
                $validated['profile_image'] = $path;
            }
            
            // Update organization
            $organization->update($validated);
            
            // Return updated data with Jalali date
            $birthdate = null;
            if ($organization->manager_birthdate) {
                $birthdate = Jalalian::fromCarbon($organization->manager_birthdate)->format('Y/m/d');
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'پروفایل با موفقیت به‌روزرسانی شد',
                'data' => [
                    'organization_name' => $organization->organization_name,
                    'organization_email' => $organization->organization_email,
                    'organization_phone' => $organization->organization_phone,
                    'organization_address' => $organization->organization_address,
                    'city' => $organization->city,
                    'region' => $organization->region,
                    'postal_code' => $organization->postal_code,
                    'manager_full_name' => $organization->manager_full_name,
                    'manager_national_code' => $organization->manager_national_code,
                    'manager_mobile' => $organization->manager_mobile ?? $user->phone,
                    'manager_birthdate' => $birthdate,
                    'profile_image' => $organization->profile_image,
                ]
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'خطای اعتبارسنجی',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('خطا در به‌روزرسانی پروفایل سازمان: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'خطای سرور'
            ], 500);
        }
    }
}
```

### Route

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/organization/profile', [OrganizationController::class, 'getProfile']);
    Route::put('/organization/profile', [OrganizationController::class, 'updateProfile']); // PUT not POST
});
```

---

## ✅ Checklist برای Backend

- [x] تغییر متد از POST به PUT در Route
- [ ] پیاده‌سازی `updateProfile()` method
- [ ] Validation rules
- [ ] پشتیبانی از آپلود تصویر
- [ ] برگرداندن `manager_mobile` (از جدول organizations یا users)
- [ ] تبدیل تاریخ به شمسی در Response
- [ ] تست با Postman

---

## 🧪 تست با Postman

### Request
```
PUT http://192.168.21.107:8000/api/organization/profile

Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
  Content-Type: multipart/form-data

Body (form-data):
  organization_name: چنارخیام
  organization_email: info@example.com
  organization_phone: 02133565817
  organization_address: نیاوران...
  manager_full_name: اتنا کلهرراد
  city: تهران
  region: 1
  postal_code: 7755332244
  manager_birthdate: 2001-04-18
  profile_image: [SELECT FILE]
```

### Expected Response (200)
```json
{
  "status": "success",
  "message": "پروفایل با موفقیت به‌روزرسانی شد",
  "data": {
    "organization_name": "چنارخیام",
    "organization_email": "info@example.com",
    // ... rest of fields
    "manager_mobile": "09123456789",
    "profile_image": "images/organizations/profile-123.jpg"
  }
}
```

---

## 📊 خلاصه تغییرات

| مشکل | وضعیت قبل | وضعیت فعلی |
|------|-----------|------------|
| HTTP Method | POST ❌ | PUT ✅ |
| manager_mobile از AsyncStorage | undefined ❌ | بررسی userData و organizationData ✅ |
| Console Logs | کم | کامل و دقیق ✅ |

---

**تاریخ:** 2025-11-08  
**وضعیت:** ✅ Frontend آماده، منتظر پیاده‌سازی PUT endpoint در Backend  
**اولویت:** 🔴 بالا
