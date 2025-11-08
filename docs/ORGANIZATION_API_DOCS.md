# Organization Registration API Documentation

## Overview
این مستندات APIهای مربوط به ثبت‌نام، ورود و مدیریت سازمان‌ها را شرح می‌دهد.

---

## Base URL
```
/api/organization
```

---

## 1. ثبت‌نام سازمان جدید

### Endpoint
```http
POST /api/organization/register
```

### Content-Type
```
multipart/form-data
```

### Request Parameters

| فیلد | نوع | الزامی | توضیحات |
|------|-----|--------|---------|
| `profile_image` | file | خیر | تصویر پروفایل (jpg, jpeg, png, webp - حداکثر 5MB) |
| `organization_name` | string | بله | نام رسمی سازمان (2-200 کاراکتر) |
| `organization_email` | string | بله | ایمیل سازمان (یونیک) |
| `organization_phone` | string | بله | تلفن ثابت سازمان (مثال: 02112345678) |
| `organization_address` | string | بله | آدرس سازمان (10-1000 کاراکتر) |
| `manager_full_name` | string | بله | نام و نام خانوادگی مدیر (2-120 کاراکتر) |
| `manager_national_code` | string | بله | کد ملی مدیر (10 رقم، یونیک) |
| `manager_mobile` | string | بله | شماره موبایل مدیر (09xxxxxxxxx، یونیک) |
| `manager_birthdate` | string | بله | تاریخ تولد مدیر (YYYY-MM-DD، حداقل 18 سال) |
| `city` | string | بله | شهر |
| `region` | string | بله | منطقه |
| `postal_code` | string | بله | کد پستی (10 رقم) |
| `password` | string | بله | رمز عبور (حداقل 8 کاراکتر) |

### Success Response (201 Created)
```json
{
    "status": "success",
    "message": "ثبت‌نام سازمان با موفقیت انجام شد. کد تایید به شماره موبایل ارسال شد.",
    "data": {
        "user_id": 123,
        "organization_id": 45,
        "organization_code": "123456",
        "phone": "09121234567",
        "email": "info@organization.ir",
        "is_update": false
    }
}
```

### Error Response (400 Bad Request)
```json
{
    "status": "error",
    "message": "خطا در اعتبارسنجی اطلاعات",
    "errors": {
        "organization_email": [
            "این ایمیل قبلاً برای کاربر تایید شده‌ای ثبت شده است."
        ],
        "manager_national_code": [
            "کد ملی مدیر معتبر نیست."
        ]
    }
}
```

---

## 2. تایید شماره موبایل

### Endpoint
```http
POST /api/organization/verify-phone
```

### Request Body
```json
{
    "phone": "09121234567",
    "code": "12345"
}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "شماره موبایل با موفقیت تایید شد.",
    "data": {
        "token": "1|abc123...",
        "user": {
            "id": 123,
            "phone": "09121234567",
            "email": "info@organization.ir",
            "account_type": "organization"
        }
    }
}
```

### Error Response (400 Bad Request)
```json
{
    "status": "error",
    "message": "کد تایید اشتباه است."
}
```

---

## 3. ارسال مجدد کد تایید

### Endpoint
```http
POST /api/organization/resend-code
```

### Request Body
```json
{
    "phone": "09121234567"
}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "کد تایید مجدداً ارسال شد."
}
```

---

## 4. ورود سازمان

### Endpoint
```http
POST /api/organization/login
```

### Request Body
```json
{
    "organization_code": "123456",
    "password": "YourPassword123"
}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "ورود با موفقیت انجام شد.",
    "data": {
        "token": "2|xyz789...",
        "user": {
            "id": 123,
            "phone": "09121234567",
            "email": "info@organization.ir",
            "account_type": "organization"
        },
        "organization": {
            "id": 45,
            "organization_name": "وزارت آموزش و پرورش",
            "organization_code": "123456",
            "manager_full_name": "علی محمدی"
        }
    }
}
```

### Error Responses

#### کد سازمانی یافت نشد (401 Unauthorized)
```json
{
    "status": "error",
    "message": "کد سازمانی یافت نشد.",
    "error": "organization_not_found"
}
```

#### شماره موبایل تایید نشده (401 Unauthorized)
```json
{
    "status": "error",
    "message": "شماره موبایل هنوز تایید نشده است.",
    "error": "phone_not_verified"
}
```

#### رمز عبور اشتباه (401 Unauthorized)
```json
{
    "status": "error",
    "message": "رمز عبور اشتباه است.",
    "error": "invalid_password"
}
```

---

## 5. اعتبارسنجی توکن (Protected)

### Endpoint
```http
POST /api/organization/validate-token
```

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "توکن معتبر است.",
    "data": {
        "user": {
            "id": 123,
            "phone": "09121234567",
            "email": "info@organization.ir",
            "account_type": "organization"
        },
        "organization": {
            "id": 45,
            "organization_name": "وزارت آموزش و پرورش",
            "organization_code": "123456",
            "organization_phone": "02112345678",
            "organization_address": "تهران، خیابان انقلاب...",
            "manager_full_name": "علی محمدی",
            "manager_national_code": "0071234567"
        }
    }
}
```

---

## 6. خروج از حساب کاربری (Protected)

### Endpoint
```http
POST /api/organization/logout
```

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "خروج با موفقیت انجام شد."
}
```

---

## 7. خروج از تمام دستگاه‌ها (Protected)

### Endpoint
```http
POST /api/organization/logout-all
```

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "خروج از تمام دستگاه‌ها با موفقیت انجام شد."
}
```

---

## Validation Rules Summary

### فیلدهای سازمان
- **organization_name**: 2-200 کاراکتر
- **organization_email**: فرمت ایمیل معتبر، یونیک
- **organization_phone**: الگوی تلفن ثابت ایران (مثال: 02112345678)
- **organization_address**: 10-1000 کاراکتر
- **postal_code**: دقیقاً 10 رقم

### فیلدهای مدیر
- **manager_full_name**: 2-120 کاراکتر، فقط حروف فارسی/عربی/لاتین و فاصله
- **manager_national_code**: 10 رقم، اعتبارسنجی کد ملی ایران، یونیک
- **manager_mobile**: فرمت موبایل ایران (09xxxxxxxxx)، یونیک
- **manager_birthdate**: فرمت YYYY-MM-DD، حداقل 18 سال، حداکثر 100 سال

### تصویر پروفایل (اختیاری)
- **فرمت**: jpg, jpeg, png, webp
- **حداکثر حجم**: 5MB
- **حداکثر ابعاد**: 2000×2000 پیکسل

---

## Error Codes

| کد خطا | توضیحات |
|--------|---------|
| `phone_already_verified` | شماره موبایل قبلاً تایید شده |
| `organization_not_found` | کد سازمانی یافت نشد |
| `user_not_found` | کاربر یافت نشد |
| `phone_not_verified` | شماره موبایل تایید نشده |
| `account_disabled` | حساب کاربری غیرفعال |
| `invalid_password` | رمز عبور اشتباه |

---

## Database Schema

### جدول `users`
- افزودن فیلد `account_type` (enum: 'individual', 'organization', 'company')

### جدول `organizations`
```
- id
- user_id (FK to users, unique)
- organization_name (string, 200, indexed)
- organization_code (string, 6, unique)
- organization_phone (string, 15)
- organization_address (text)
- manager_full_name (string, 120)
- manager_national_code (string, 10, unique)
- timestamps
```

---

## Notes

1. **کد سازمانی (organization_code)**: 
   - عدد 6 رقمی یونیک
   - تولید خودکار توسط سیستم
   - استفاده در ورود به سیستم

2. **احراز هویت**:
   - پس از ثبت‌نام، کد تایید 5 رقمی به موبایل مدیر ارسال می‌شود
   - کاربر باید شماره موبایل را تایید کند
   - ورود با کد سازمانی و رمز عبور

3. **امنیت**:
   - تمام رمزهای عبور با bcrypt هش می‌شوند
   - توکن‌های Sanctum برای احراز هویت API
   - اعتبارسنجی کامل کد ملی ایران

4. **آپلود تصویر**:
   - تصویر پروفایل اختیاری است
   - ذخیره در `storage/app/public/profiles/organizations/`
   - تغییر نام به UUID برای امنیت
