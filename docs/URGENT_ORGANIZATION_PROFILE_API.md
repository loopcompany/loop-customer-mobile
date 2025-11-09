# 🚨 مشکل فعلی: دریافت اطلاعات پروفایل سازمانی

## ❌ مشکل

صفحه پروفایل سازمانی (`OrganizationProfile.js`) اطلاعات سازمان را نمایش نمی‌دهد.

## 🔍 علت مشکل

API endpoint `GET /api/organization/profile` یا وجود ندارد یا ساختار پاسخ آن متفاوت است.

---

## ✅ API مورد نیاز (فوری)

### GET `/api/organization/profile`

**توضیح:** دریافت اطلاعات کامل پروفایل سازمان

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response مورد انتظار (200 OK):**

```json
{
  "status": "success",
  "message": "اطلاعات پروفایل با موفقیت بازیابی شد",
  "data": {
    "organization_name": "شرکت نمونه",
    "organization_email": "info@example.com",
    "organization_phone": "02112345678",
    "organization_address": "تهران، خیابان آزادی، پلاک 123",
    "city": "تهران",
    "region": "منطقه 1",
    "postal_code": "1234567890",
    "manager_full_name": "احمد احمدی",
    "manager_national_code": "1234567890",
    "manager_mobile": "09123456789",
    "manager_birthdate": "1370/01/01",
    "profile_image": "images/organizations/profile-123.jpg"
  }
}
```

**نکات مهم:**

1. ✅ `status` باید `"success"` باشد
2. ✅ داده‌ها در `data` قرار دارند
3. ✅ `profile_image` فقط path نسبی است (بدون `/storage/`)
4. ✅ تاریخ تولد به صورت شمسی (`1370/01/01`)
5. ✅ تمام فیلدها optional هستند (ممکن است null باشند)

---

## 🔧 پیاده‌سازی Backend (Laravel)

### 1. Route
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/organization/profile', [OrganizationController::class, 'getProfile']);
    Route::post('/organization/profile', [OrganizationController::class, 'updateProfile']);
});
```

### 2. Controller
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Organization;
use Morilog\Jalali\Jalalian;

class OrganizationController extends Controller
{
    /**
     * دریافت اطلاعات پروفایل سازمان
     */
    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            // یافتن سازمان مرتبط با کاربر
            $organization = Organization::where('user_id', $user->id)->first();
            
            if (!$organization) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'اطلاعات سازمان یافت نشد'
                ], 404);
            }
            
            // تبدیل تاریخ میلادی به شمسی
            $birthdate = null;
            if ($organization->manager_birthdate) {
                $birthdate = Jalalian::fromCarbon($organization->manager_birthdate)->format('Y/m/d');
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'اطلاعات پروفایل با موفقیت بازیابی شد',
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
                    'manager_mobile' => $organization->manager_mobile,
                    'manager_birthdate' => $birthdate,
                    'profile_image' => $organization->profile_image,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('خطا در دریافت پروفایل سازمان: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'خطای سرور: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

### 3. Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    protected $fillable = [
        'user_id',
        'organization_code',
        'organization_name',
        'organization_email',
        'organization_phone',
        'organization_address',
        'city',
        'region',
        'postal_code',
        'manager_full_name',
        'manager_national_code',
        'manager_mobile',
        'manager_birthdate',
        'profile_image',
    ];

    protected $casts = [
        'manager_birthdate' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### 4. Migration
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrganizationsTable extends Migration
{
    public function up()
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('organization_code')->unique();
            $table->string('organization_name');
            $table->string('organization_email');
            $table->string('organization_phone', 11);
            $table->text('organization_address');
            $table->string('city');
            $table->string('region');
            $table->string('postal_code', 10);
            $table->string('manager_full_name');
            $table->string('manager_national_code', 10);
            $table->string('manager_mobile', 11);
            $table->date('manager_birthdate')->nullable();
            $table->string('profile_image')->nullable();
            $table->timestamps();
            
            $table->index('organization_code');
        });
    }

    public function down()
    {
        Schema::dropIfExists('organizations');
    }
}
```

---

## 🧪 تست با Postman/Insomnia

### Request
```
GET http://your-api-url.com/api/organization/profile
Headers:
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
  Accept: application/json
```

### Expected Response
```json
{
  "status": "success",
  "message": "اطلاعات پروفایل با موفقیت بازیابی شد",
  "data": {
    "organization_name": "شرکت تست",
    "organization_email": "test@example.com",
    "organization_phone": "02112345678",
    "organization_address": "آدرس تست",
    "city": "تهران",
    "region": "1",
    "postal_code": "1234567890",
    "manager_full_name": "علی علوی",
    "manager_national_code": "0123456789",
    "manager_mobile": "09123456789",
    "manager_birthdate": "1370/05/15",
    "profile_image": "images/organizations/profile-123.jpg"
  }
}
```

---

## 📱 Frontend Implementation

### کد فعلی در `OrganizationProfile.js`:

```javascript
const loadOrganizationProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    const response = await axios.get(`${uri}/organization/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    if (response.data.status === 'success') {
      const data = response.data.data;
      
      // Set all fields
      setOrganizationName(data.organization_name || '');
      setFamilyName(data.manager_full_name || '');
      setNationalCode(data.manager_national_code || '');
      setMobileNumber(data.manager_mobile || '');
      setOrganizationPhoneNumber(data.organization_phone || '');
      setBirthDate(data.manager_birthdate || '');
      setOrganizationEmail(data.organization_email || '');
      setCity(data.city || '');
      setRegion(data.region || '');
      setOrganizationAddress(data.organization_address || '');
      setOrganizationPostalCode(data.postal_code || '');
      
      // Set profile image
      if (data.profile_image) {
        setProfileImage({ uri: `${uri}/storage/${data.profile_image}` });
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    
    // Fallback to AsyncStorage
    const organizationData = await AsyncStorage.getItem('organizationData');
    if (organizationData) {
      const data = JSON.parse(organizationData);
      // Load from storage...
    }
  }
};
```

---

## ✅ Checklist برای Backend Team

- [ ] ساخت Migration و اجرای آن
- [ ] ساخت Model `Organization`
- [ ] پیاده‌سازی `OrganizationController::getProfile()`
- [ ] افزودن Route به `routes/api.php`
- [ ] نصب و تنظیم `morilog/jalali` برای تبدیل تاریخ
- [ ] تست با Postman
- [ ] چک کردن Authorization middleware
- [ ] مطمئن شدن از وجود رابطه `user_id` با جدول `users`
- [ ] تست با token واقعی از فرآیند Login

---

## 🚀 اقدامات بعدی Frontend

پس از پیاده‌سازی API:

1. ✅ صفحه Profile سازمانی باز می‌شود
2. ✅ Console logs را بررسی کنید:
   - `🔄 [OrganizationProfile] شروع بارگذاری پروفایل...`
   - `✅ [OrganizationProfile] پاسخ دریافت شد: ...`
   - `📦 [OrganizationProfile] داده‌های دریافتی: ...`
3. ✅ بررسی نمایش فیلدها
4. ✅ بررسی نمایش تصویر پروفایل

---

**تاریخ:** 2025-11-08
**اولویت:** 🔴 بسیار بالا
**وضعیت:** ⏳ در انتظار پیاده‌سازی Backend
