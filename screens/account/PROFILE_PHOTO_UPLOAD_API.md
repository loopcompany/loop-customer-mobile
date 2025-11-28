# API آپلود تصویر پروفایل کاربر

این مستند نحوه آپلود تصویر پروفایل برای کاربران عادی را شرح می‌دهد.

## 📋 اطلاعات کلی

- **Endpoint:** `PUT /api/profile`
- **Method:** `PUT`
- **Authentication:** Bearer Token (required)
- **Content-Type:** `multipart/form-data`

---

## 🔑 Headers

```http
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
Accept: application/json
```

---

## 📤 Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `profile_photo_path` | file | خیر | تصویر پروفایل کاربر |
| `name` | string | خیر | نام کاربر |
| `last_name` | string | خیر | نام خانوادگی |
| `email` | string | خیر | ایمیل |
| `melicode` | string | خیر | کد ملی |
| `birth_date` | string | خیر | تاریخ تولد (1370/05/15) |
| `mobile_number` | string | خیر | شماره موبایل |
| `phone_number` | string | خیر | شماره تلفن |
| `postal_code` | string | خیر | کد پستی |
| `city` | string | خیر | شهر |
| `region` | string | خیر | منطقه |
| `home_address` | string | خیر | آدرس منزل |
| `work_address` | string | خیر | آدرس محل کار |
| `card_number` | string | خیر | شماره کارت (16 رقم) |
| `sheba_number` | string | خیر | شماره شبا (IR + 24 رقم) |

### محدودیت‌های تصویر:
- **فرمت‌های مجاز:** jpeg, jpg, png, webp
- **حداکثر حجم:** 5MB (5120KB)
- **نوع فایل:** image

---

## ✅ Response موفق (200 OK)

```json
{
  "success": true,
  "message": "اطلاعات شما با موفقیت به‌روزرسانی شد.",
  "user": {
    "id": 123,
    "name": "علی",
    "last_name": "احمدی",
    "phone": "09123456789",
    "email": "ali@example.com",
    "melicode": "1234567890",
    "profile_photo_path": "images/profiles/abc123.jpg",
    "phone_verified_at": "2025-11-26T10:30:00.000000Z",
    "email_verified_at": null,
    "referral_code": "ABC123",
    "other_referral_code": null,
    "has_access": true,
    "is_phone_verified": true,
    "created_at": "2025-01-15T08:00:00.000000Z",
    "updated_at": "2025-11-26T10:30:00.000000Z"
  },
  "changes": {
    "email_changed": false,
    "password_changed": false,
    "profile_data_changed": false
  },
  "requires_verification": false
}
```

---

## ❌ Response خطا

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "کاربر یافت نشد."
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "دسترسی شما محدود شده است."
}
```

### 422 - Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "profile_photo_path": [
      "فایل باید یک تصویر باشد.",
      "فرمت تصویر باید jpg، jpeg، png یا webp باشد.",
      "حجم تصویر نباید بیشتر از 5 مگابایت باشد."
    ]
  }
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "خطا در به‌روزرسانی پروفایل.",
  "error": "Error details..."
}
```

---

## 📱 نمایش تصویر

برای نمایش تصویر پروفایل، از URL زیر استفاده کنید:

```
https://your-domain.com/storage/{profile_photo_path}
```

مثال:
```
https://your-domain.com/storage/images/profiles/abc123.jpg
```

---

## 🔧 مثال‌های کد

### cURL

```bash
curl -X PUT 'https://your-domain.com/api/profile' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Accept: application/json' \
  -F 'profile_photo_path=@/path/to/image.jpg' \
  -F 'name=علی' \
  -F 'last_name=احمدی'
```

### JavaScript (Fetch API)

```javascript
const updateProfileWithImage = async (imageFile, profileData) => {
  const formData = new FormData();
  
  // اضافه کردن تصویر
  if (imageFile) {
    formData.append('profile_photo_path', imageFile);
  }
  
  // اضافه کردن سایر فیلدها
  Object.keys(profileData).forEach(key => {
    if (profileData[key] !== null && profileData[key] !== undefined) {
      formData.append(key, profileData[key]);
    }
  });

  try {
    const response = await fetch('https://your-domain.com/api/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        // توجه: Content-Type را تنظیم نکنید، مرورگر آن را خودکار تنظیم می‌کند
      },
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('پروفایل با موفقیت به‌روزرسانی شد:', data);
      return data;
    } else {
      console.error('خطا در به‌روزرسانی پروفایل:', data);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('خطای شبکه:', error);
    throw error;
  }
};

// نحوه استفاده
const fileInput = document.querySelector('input[type="file"]');
const imageFile = fileInput.files[0];

updateProfileWithImage(imageFile, {
  name: 'علی',
  last_name: 'احمدی'
});
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const updateProfileWithImage = async (imageFile, profileData) => {
  const formData = new FormData();
  
  // اضافه کردن تصویر
  if (imageFile) {
    formData.append('profile_photo_path', imageFile);
  }
  
  // اضافه کردن سایر فیلدها
  Object.keys(profileData).forEach(key => {
    if (profileData[key] !== null && profileData[key] !== undefined) {
      formData.append(key, profileData[key]);
    }
  });

  try {
    const response = await axios.put(
      'https://your-domain.com/api/profile',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      }
    );

    console.log('پروفایل با موفقیت به‌روزرسانی شد:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('خطا در به‌روزرسانی پروفایل:', error.response.data);
      throw new Error(error.response.data.message);
    } else {
      console.error('خطای شبکه:', error);
      throw error;
    }
  }
};

// نحوه استفاده
const fileInput = document.querySelector('input[type="file"]');
const imageFile = fileInput.files[0];

updateProfileWithImage(imageFile, {
  name: 'علی',
  last_name: 'احمدی'
});
```

### React Native

```javascript
const updateProfileWithImage = async (imageUri, profileData) => {
  const formData = new FormData();
  
  // اضافه کردن تصویر
  if (imageUri) {
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('profile_photo_path', {
      uri: imageUri,
      name: filename,
      type: type
    });
  }
  
  // اضافه کردن سایر فیلدها
  Object.keys(profileData).forEach(key => {
    if (profileData[key] !== null && profileData[key] !== undefined) {
      formData.append(key, profileData[key]);
    }
  });

  try {
    const response = await fetch('https://your-domain.com/api/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('پروفایل با موفقیت به‌روزرسانی شد:', data);
      return data;
    } else {
      console.error('خطا در به‌روزرسانی پروفایل:', data);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('خطای شبکه:', error);
    throw error;
  }
};

// نحوه استفاده با react-native-image-picker
import { launchImageLibrary } from 'react-native-image-picker';

const pickImage = () => {
  launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920
  }, (response) => {
    if (response.didCancel) {
      console.log('انتخاب تصویر لغو شد');
    } else if (response.error) {
      console.log('خطا:', response.error);
    } else {
      const imageUri = response.assets[0].uri;
      updateProfileWithImage(imageUri, {
        name: 'علی',
        last_name: 'احمدی'
      });
    }
  });
};
```

### PHP

```php
<?php

$accessToken = 'YOUR_ACCESS_TOKEN';
$apiUrl = 'https://your-domain.com/api/profile';

// آماده‌سازی داده‌ها
$fields = [
    'name' => 'علی',
    'last_name' => 'احمدی'
];

// اضافه کردن تصویر
if (isset($_FILES['profile_photo_path']) && $_FILES['profile_photo_path']['error'] === UPLOAD_ERR_OK) {
    $fields['profile_photo_path'] = new CURLFile(
        $_FILES['profile_photo_path']['tmp_name'],
        $_FILES['profile_photo_path']['type'],
        $_FILES['profile_photo_path']['name']
    );
}

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_CUSTOMREQUEST => 'PUT',
    CURLOPT_POSTFIELDS => $fields,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $accessToken,
        'Accept: application/json'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);

if ($httpCode === 200) {
    echo "پروفایل با موفقیت به‌روزرسانی شد\n";
    print_r($data);
} else {
    echo "خطا در به‌روزرسانی پروفایل\n";
    print_r($data);
}
```

---

## 📝 نکات مهم

1. **فرمت درخواست:**
   - حتماً از `multipart/form-data` استفاده کنید
   - در JavaScript/Axios نیازی به تنظیم دستی Content-Type نیست

2. **نام فیلد:**
   - نام فیلد باید دقیقاً `profile_photo_path` باشد
   - این فیلد با `profile_image` (مخصوص سازمان‌ها) متفاوت است

3. **ذخیره‌سازی:**
   - تصاویر در `storage/app/public/images/profiles/` ذخیره می‌شوند
   - تصویر قبلی به‌صورت خودکار حذف می‌شود

4. **نمایش تصویر:**
   - برای نمایش از `/storage/{profile_photo_path}` استفاده کنید
   - مطمئن شوید که symbolic link برای storage ایجاد شده: `php artisan storage:link`

5. **امنیت:**
   - فقط فرمت‌های تصویر پذیرفته می‌شوند
   - حداکثر حجم 5MB است
   - تصویر فقط برای کاربر احراز هویت شده قابل آپلود است

6. **به‌روزرسانی جزئی:**
   - می‌توانید فقط تصویر را بدون سایر فیلدها ارسال کنید
   - یا تصویر را همراه با سایر فیلدها ارسال کنید

---

## 🧪 تست با Postman

1. **ایجاد درخواست جدید:**
   - Method: PUT
   - URL: `https://your-domain.com/api/profile`

2. **تنظیم Headers:**
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`
   - `Accept`: `application/json`

3. **تنظیم Body:**
   - Type: form-data
   - Key: `profile_photo_path`
   - Type: File
   - Value: انتخاب فایل تصویر از سیستم

4. **اضافه کردن فیلدهای اختیاری:**
   - Key: `name`, Value: `علی`
   - Key: `last_name`, Value: `احمدی`

5. **ارسال درخواست**

---

## 🔍 خطایابی

### مشکل: تصویر آپلود نمی‌شود

**راه‌حل:**
- مطمئن شوید Content-Type برابر `multipart/form-data` است
- بررسی کنید نام فیلد دقیقاً `profile_photo_path` باشد
- حجم فایل را چک کنید (حداکثر 5MB)
- فرمت فایل را بررسی کنید (jpeg, jpg, png, webp)

### مشکل: خطای 401 Unauthorized

**راه‌حل:**
- توکن Bearer را بررسی کنید
- مطمئن شوید توکن منقضی نشده است
- Authorization header را چک کنید

### مشکل: تصویر نمایش داده نمی‌شود

**راه‌حل:**
- دستور `php artisan storage:link` را اجرا کنید
- مسیر `/storage/` را قبل از path اضافه کنید
- دسترسی‌های پوشه storage را بررسی کنید

---

## 📞 پشتیبانی

در صورت بروز مشکل یا سوال، با تیم توسعه تماس بگیرید.
