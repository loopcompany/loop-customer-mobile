# Location API Documentation

این API برای دریافت اطلاعات مکانی (استان‌ها، شهرها و مناطق) استفاده می‌شود.

## Base URL
```
/api/locations
```

---

## 1. دریافت لیست استان‌ها

دریافت لیست تمام استان‌های فعال

### Endpoint
```
GET /api/locations/provinces
```

### Headers
```
Accept: application/json
```

### Response Example (Success - 200)
```json
{
  "success": true,
  "message": "لیست استان‌ها با موفقیت دریافت شد.",
  "data": [
    {
      "id": 1,
      "code": "01",
      "title": "تهران",
      "latitude": 35.6892,
      "longitude": 51.3890
    },
    {
      "id": 2,
      "code": "02",
      "title": "اصفهان",
      "latitude": 32.6546,
      "longitude": 51.6680
    }
  ]
}
```

---

## 2. دریافت لیست شهرهای یک استان

دریافت لیست شهرهای یک استان خاص

### Endpoint
```
GET /api/locations/provinces/{provinceId}/cities
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| provinceId | integer | Yes | شناسه استان |

### Headers
```
Accept: application/json
```

### Example Request
```
GET /api/locations/provinces/1/cities
```

### Response Example (Success - 200)
```json
{
  "success": true,
  "message": "لیست شهرها با موفقیت دریافت شد.",
  "data": {
    "province": {
      "id": 1,
      "title": "تهران"
    },
    "cities": [
      {
        "id": 1,
        "province_id": 1,
        "title": "تهران",
        "latitude": 35.6892,
        "longitude": 51.3890
      },
      {
        "id": 2,
        "province_id": 1,
        "title": "شهریار",
        "latitude": 35.6580,
        "longitude": 51.0570
      }
    ]
  }
}
```

### Response Example (Error - 404)
```json
{
  "success": false,
  "message": "استان مورد نظر یافت نشد."
}
```

---

## 3. دریافت لیست مناطق یک شهر

دریافت لیست مناطق یک شهر خاص

### Endpoint
```
GET /api/locations/cities/{cityId}/regions
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cityId | integer | Yes | شناسه شهر |

### Headers
```
Accept: application/json
```

### Example Request
```
GET /api/locations/cities/1/regions
```

### Response Example (Success - 200)
```json
{
  "success": true,
  "message": "لیست مناطق با موفقیت دریافت شد.",
  "data": {
    "province": {
      "id": 1,
      "title": "تهران"
    },
    "city": {
      "id": 1,
      "title": "تهران"
    },
    "regions": [
      {
        "id": 1,
        "city_id": 1,
        "code": "01",
        "title": "منطقه 1",
        "latitude": 35.7703,
        "longitude": 51.4180
      },
      {
        "id": 2,
        "city_id": 1,
        "code": "02",
        "title": "منطقه 2",
        "latitude": 35.7580,
        "longitude": 51.4370
      }
    ]
  }
}
```

### Response Example (Error - 404)
```json
{
  "success": false,
  "message": "شهر مورد نظر یافت نشد."
}
```

---

## 4. جستجو در استان‌ها، شهرها و مناطق

جستجو در تمام سطوح مکانی

### Endpoint
```
GET /api/locations/search
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | عبارت جستجو (حداقل 2 کاراکتر) |

### Headers
```
Accept: application/json
```

### Example Request
```
GET /api/locations/search?q=تهران
```

### Response Example (Success - 200)
```json
{
  "success": true,
  "message": "نتایج جستجو",
  "data": {
    "provinces": [
      {
        "id": 1,
        "title": "تهران",
        "code": "01",
        "type": "province",
        "latitude": 35.6892,
        "longitude": 51.3890
      }
    ],
    "cities": [
      {
        "id": 1,
        "title": "تهران",
        "province_id": 1,
        "province_title": "تهران",
        "type": "city",
        "latitude": 35.6892,
        "longitude": 51.3890
      }
    ],
    "regions": [
      {
        "id": 1,
        "title": "منطقه 1 تهران",
        "code": "01",
        "city_id": 1,
        "city_title": "تهران",
        "province_id": 1,
        "province_title": "تهران",
        "type": "region",
        "latitude": 35.7703,
        "longitude": 51.4180
      }
    ],
    "total": 3
  }
}
```

### Response Example (Error - 400)
```json
{
  "success": false,
  "message": "لطفاً حداقل 2 کاراکتر برای جستجو وارد کنید."
}
```

---

## 5. دریافت اطلاعات کامل مکان

دریافت اطلاعات کامل یک مکان (استان، شهر و منطقه)

### Endpoint
```
GET /api/locations/details
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| province_id | integer | No | شناسه استان |
| city_id | integer | No | شناسه شهر |
| region_id | integer | No | شناسه منطقه |

**توجه:** حداقل یکی از پارامترها باید ارسال شود.

### Headers
```
Accept: application/json
```

### Example Request
```
GET /api/locations/details?province_id=1&city_id=1&region_id=1
```

### Response Example (Success - 200)
```json
{
  "success": true,
  "message": "اطلاعات مکانی با موفقیت دریافت شد.",
  "data": {
    "province": {
      "id": 1,
      "code": "01",
      "title": "تهران"
    },
    "city": {
      "id": 1,
      "title": "تهران",
      "latitude": 35.6892,
      "longitude": 51.3890
    },
    "region": {
      "id": 1,
      "code": "01",
      "title": "منطقه 1",
      "latitude": 35.7703,
      "longitude": 51.4180
    }
  }
}
```

### Response Example (Error - 404)
```json
{
  "success": false,
  "message": "اطلاعات مکانی یافت نشد."
}
```

---

## نمونه استفاده در Registration API

هنگام ثبت‌نام کاربر یا سازمان، فیلدهای زیر را اضافه کنید:

### Registration Request Example
```json
{
  "melicode": "1234567890",
  "phone": "09123456789",
  "email": "user@example.com",
  "province_id": 1,
  "city_id": 1,
  "region_id": 1,
  "other_referral_code": "ABC123"
}
```

### Organization Registration Request Example
```json
{
  "organization_name": "شرکت نمونه",
  "organization_email": "info@example.com",
  "organization_phone": "02112345678",
  "organization_address": "تهران، خیابان...",
  "manager_full_name": "علی احمدی",
  "manager_national_code": "1234567890",
  "manager_mobile": "09123456789",
  "manager_birthdate": "1990-01-01",
  "city": "تهران",
  "region": "منطقه 1",
  "postal_code": "1234567890",
  "province_id": 1,
  "city_id": 1,
  "region_id": 1,
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123"
}
```

---

## سناریوهای استفاده

### 1. نمایش لیست استان‌ها در صفحه ثبت‌نام
```
GET /api/locations/provinces
```

### 2. انتخاب استان و نمایش شهرهای آن
```
GET /api/locations/provinces/1/cities
```

### 3. انتخاب شهر و نمایش مناطق آن
```
GET /api/locations/cities/1/regions
```

### 4. جستجو سریع (Autocomplete)
```
GET /api/locations/search?q=تهر
```

### 5. نمایش اطلاعات کامل مکان کاربر
```
GET /api/locations/details?province_id=1&city_id=1&region_id=1
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | موفقیت‌آمیز |
| 400 | درخواست نامعتبر (مثلاً query کمتر از 2 کاراکتر) |
| 404 | مکان یافت نشد |
| 500 | خطای سرور |

---

## نکات مهم

1. تمام endpoint های این API عمومی هستند و نیاز به احراز هویت ندارند
2. فقط استان‌ها، شهرها و مناطقی که `is_show = 1` دارند نمایش داده می‌شوند
3. نتایج به ترتیب حروف الفبا مرتب می‌شوند
4. در جستجو، حداکثر 10 نتیج برای هر نوع (استان، شهر، منطقه) برگردانده می‌شود
5. فیلدهای `latitude` و `longitude` اختیاری هستند و ممکن است `null` باشند

---

## تاریخ به‌روزرسانی
2025-11-09
