# Organization Profile API Documentation

## 📋 مستندات API پروفایل سازمانی

### 🔍 API های مورد نیاز

---

## 1️⃣ دریافت اطلاعات پروفایل سازمانی

**Endpoint:** `GET /api/organization/profile`

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "اطلاعات پروفایل با موفقیت بازیابی شد",
  "data": {
    "organization_name": "شرکت نمونه",
    "manager_full_name": "محمد رضایی",
    "manager_national_code": "1234567890",
    "manager_mobile": "09123456789",
    "organization_phone": "02112345678",
    "manager_birthdate": "1370/01/01",
    "organization_email": "info@example.com",
    "city": "تهران",
    "region": "منطقه 1",
    "organization_address": "خیابان نمونه، پلاک 123",
    "postal_code": "1234567890",
    "profile_image": "images/organizations/profile.jpg"
  }
}
```

**Response (Error - 401):**
```json
{
  "status": "error",
  "message": "کاربر احراز هویت نشده است"
}
```

**Response (Error - 404):**
```json
{
  "status": "error",
  "message": "اطلاعات سازمان یافت نشد"
}
```

---

## 2️⃣ به‌روزرسانی پروفایل سازمانی

**Endpoint:** `POST /api/organization/profile`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
Accept: application/json
```

**Request Body (FormData):**
```
profile_image: File (optional) - تصویر پروفایل (jpg, png, jpeg)
organization_name: string (required) - نام سازمان
organization_email: string (required) - ایمیل سازمان
organization_phone: string (required) - تلفن ثابت سازمان
organization_address: string (required) - آدرس سازمان
manager_full_name: string (required) - نام و نام خانوادگی مدیر
city: string (required) - شهر
region: string (required) - منطقه
postal_code: string (required) - کد پستی (10 رقم)
manager_birthdate: string (optional) - تاریخ تولد مدیر (فرمت: YYYY-MM-DD میلادی)
```

**Validation Rules:**
- `organization_name`: حداقل 3 کاراکتر
- `organization_email`: فرمت ایمیل معتبر
- `organization_phone`: 11 رقم، شروع با 0
- `postal_code`: دقیقاً 10 رقم
- `manager_mobile`: غیرقابل تغییر (نمایش فقط)
- `manager_national_code`: غیرقابل تغییر (نمایش فقط)

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "پروفایل با موفقیت به‌روزرسانی شد",
  "data": {
    "organization_name": "شرکت نمونه آپدیت شده",
    "manager_full_name": "محمد رضایی",
    // ... سایر فیلدها
  }
}
```

**Response (Error - 422 Validation):**
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

**Response (Error - 413):**
```json
{
  "status": "error",
  "message": "حجم فایل بیش از حد مجاز است (حداکثر 2MB)"
}
```

---

## 3️⃣ تغییر رمز عبور (مشترک با کاربر عادی)

**Endpoint:** `PATCH /api/profile/password`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "current_password": "رمز عبور فعلی",
  "password": "رمز عبور جدید (حداقل 8 کاراکتر)"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "رمز عبور با موفقیت تغییر یافت"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "رمز عبور فعلی نادرست است"
}
```

**Response (Error - 422):**
```json
{
  "success": false,
  "message": "خطای اعتبارسنجی",
  "errors": {
    "password": ["رمز عبور جدید باید حداقل 8 کاراکتر باشد"]
  }
}
```

---

## 🔧 نکات پیاده‌سازی Backend

### دیتابیس (جدول organizations)
```sql
CREATE TABLE organizations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    organization_code VARCHAR(50) UNIQUE NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    organization_email VARCHAR(255) NOT NULL,
    organization_phone VARCHAR(11) NOT NULL,
    organization_address TEXT NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    manager_full_name VARCHAR(255) NOT NULL,
    manager_national_code VARCHAR(10) NOT NULL,
    manager_mobile VARCHAR(11) NOT NULL,
    manager_birthdate DATE NULL,
    profile_image VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_organization_code (organization_code),
    INDEX idx_user_id (user_id)
);
```

### Controller Example (Laravel)
```php
// GET /organization/profile
public function show(Request $request)
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
            'organization_name' => $organization->organization_name,
            'manager_full_name' => $organization->manager_full_name,
            'manager_national_code' => $organization->manager_national_code,
            'manager_mobile' => $organization->manager_mobile,
            'organization_phone' => $organization->organization_phone,
            'manager_birthdate' => $organization->manager_birthdate 
                ? \Morilog\Jalali\Jalalian::fromCarbon($organization->manager_birthdate)->format('Y/m/d')
                : null,
            'organization_email' => $organization->organization_email,
            'city' => $organization->city,
            'region' => $organization->region,
            'organization_address' => $organization->organization_address,
            'postal_code' => $organization->postal_code,
            'profile_image' => $organization->profile_image,
        ]
    ]);
}

// POST /organization/profile
public function update(Request $request)
{
    $user = $request->user();
    $organization = Organization::where('user_id', $user->id)->first();
    
    if (!$organization) {
        return response()->json([
            'status' => 'error',
            'message' => 'اطلاعات سازمان یافت نشد'
        ], 404);
    }
    
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
            Storage::delete('public/' . $organization->profile_image);
        }
        
        $path = $request->file('profile_image')->store('images/organizations', 'public');
        $validated['profile_image'] = $path;
    }
    
    $organization->update($validated);
    
    return response()->json([
        'status' => 'success',
        'message' => 'پروفایل با موفقیت به‌روزرسانی شد',
        'data' => $organization->fresh()
    ]);
}
```

---

## 📝 Frontend Implementation Notes

### State Management
```javascript
// States needed
const [profileImage, setProfileImage] = useState(null);
const [organizationName, setOrganizationName] = useState('');
const [familyName, setFamilyName] = useState('');
const [nationalCode, setNationalCode] = useState(''); // Read-only
const [mobileNumber, setMobileNumber] = useState(''); // Read-only
const [organizationPhoneNumber, setOrganizationPhoneNumber] = useState('');
const [birthDate, setBirthDate] = useState('');
const [organizationEmail, setOrganizationEmail] = useState('');
const [city, setCity] = useState('');
const [region, setRegion] = useState('');
const [organizationAddress, setOrganizationAddress] = useState('');
const [organizationPostalCode, setOrganizationPostalCode] = useState('');
const [isEditing, setIsEditing] = useState(false);
```

### Date Conversion
```javascript
import { jalaliToGregorian } from '../../helpers/Common';

// تبدیل تاریخ شمسی به میلادی برای ارسال به سرور
if (birthDate) {
  const gregorianDate = jalaliToGregorian(birthDate); // "1370/01/01" -> "1991-03-21"
  formData.append('manager_birthdate', gregorianDate);
}
```

---

## ✅ Checklist برای Backend Developer

- [ ] ساخت جدول `organizations` در دیتابیس
- [ ] پیاده‌سازی `GET /api/organization/profile`
- [ ] پیاده‌سازی `POST /api/organization/profile` با پشتیبانی از `multipart/form-data`
- [ ] Validation rules برای تمام فیلدها
- [ ] آپلود و ذخیره تصویر پروفایل
- [ ] تبدیل تاریخ شمسی به میلادی در سمت سرور
- [ ] برگرداندن URL کامل تصویر (`/storage/images/organizations/...`)
- [ ] محافظت از فیلدهای غیرقابل تغییر (`manager_national_code`, `manager_mobile`)
- [ ] Test با Postman/Insomnia
- [ ] Error handling مناسب

---

## 🧪 تست با Postman

### Test 1: دریافت پروفایل
```
GET http://your-domain.com/api/organization/profile
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
```

### Test 2: به‌روزرسانی پروفایل
```
POST http://your-domain.com/api/organization/profile
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: multipart/form-data
  Accept: application/json
  
Body (form-data):
  organization_name: شرکت تست
  organization_email: test@example.com
  organization_phone: 02112345678
  organization_address: آدرس تست
  manager_full_name: احمد احمدی
  city: تهران
  region: منطقه 1
  postal_code: 1234567890
  manager_birthdate: 1991-03-21
  profile_image: [SELECT FILE]
```

---

## 📞 تماس با Backend

**اگر API های زیر موجود نیستند، لطفاً با تیم Backend هماهنگ کنید:**

1. ✅ `GET /api/organization/profile` - دریافت پروفایل سازمانی
2. ✅ `POST /api/organization/profile` - به‌روزرسانی پروفایل سازمانی (با پشتیبانی از multipart/form-data)
3. ✅ `PATCH /api/profile/password` - تغییر رمز عبور (احتمالاً موجود است)

---

**تاریخ ایجاد:** 2025-11-08
**نسخه:** 1.0
