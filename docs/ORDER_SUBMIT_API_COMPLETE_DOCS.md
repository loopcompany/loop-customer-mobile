# 📱 API ثبت سفارش - مستندات کامل برای تیم موبایل

## 📌 اطلاعات کلی

| مشخصه | مقدار |
|-------|-------|
| **Endpoint** | `POST /api/orders/submit` |
| **نیاز به احراز هویت** | ✅ بله (Bearer Token) |
| **Content-Type** | `application/json` |
| **نسخه API** | v1.0 |
| **تاریخ آخرین آپدیت** | 2025-11-08 |

---

## 🔐 Authentication

### Headers مورد نیاز

```http
POST /api/orders/submit HTTP/1.1
Host: your-api-domain.com
Content-Type: application/json
Accept: application/json
Authorization: Bearer {YOUR_ACCESS_TOKEN}
```

### نمونه کد برای دریافت Token

```javascript
// ابتدا لاگین کنید
const loginResponse = await fetch('http://your-api.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    phone: '09123456789',
    password: 'your_password'
  })
});

const { token } = await loginResponse.json();
// از این token در header Authorization استفاده کنید
```

---

## 📥 Request Body

### فیلدهای اجباری

| فیلد | نوع | الزامی | توضیحات | مثال |
|------|-----|--------|---------|------|
| `address_id` | integer | ✅ | شناسه آدرس کاربر (از `/api/addresses` دریافت شده) | `1` |
| `category_id` | integer | ✅ | شناسه دسته‌بندی (از `/api/categories` دریافت شده) | `2` |
| `total_price` | number | ✅ | مجموع قیمت نهایی (به تومان) | `500000` |
| `date` | string | ✅ | تاریخ سفارش (فرمت: YYYY-MM-DD) | `"2025-11-10"` |
| `time` | string | ✅ | بازه زمانی سفارش | `"14:00-16:00"` |

### فیلدهای اختیاری

| فیلد | نوع | الزامی | توضیحات | مثال |
|------|-----|--------|---------|------|
| `is_urgent` | boolean | ❌ | آیا سفارش فوری است؟ | `true` |
| `is_fixed` | boolean | ❌ | آیا سفارش قیمت ثابت دارد؟ | `false` |
| `image_path` | string | ❌ | مسیر تصویر آپلود شده | `"uploads/orders/image.jpg"` |
| `description` | string | ❌ | توضیحات کاربر (حداکثر 1000 کاراکتر) | `"لطفاً دقت کنید..."` |
| `female_count` | integer | ❌ | تعداد متخصص زن | `1` |
| `male_count` | integer | ❌ | تعداد متخصص مرد | `0` |
| `unspecified_count` | integer | ❌ | تعداد متخصص نامشخص | `0` |
| `discount_code` | string | ❌ | کد تخفیف (حداکثر 50 کاراکتر) | `"SUMMER2025"` |
| `steps` | array | ❌ | پاسخ‌های مراحل فرم (از `/api/steps/fetch`) | `[...]` |

---

## 🏢 Service Schedule (ویژه سازمان‌ها)

### شرایط نمایش

این بخش **فقط برای کاربران سازمانی** است:
- `account_type` کاربر باید `organization` یا `company` باشد
- مرحله `service_schedule` در `/api/steps/fetch` برای این کاربران نمایش داده می‌شود

### ساختار کلی

```json
{
  "service_schedule": {
    "type": "long_term | short_term",
    "long_term": { ... },    // فقط اگر type=long_term
    "short_term": { ... }    // فقط اگر type=short_term
  }
}
```

### فیلدهای Service Schedule

#### نوع بلندمدت (Long-term)

| فیلد | نوع | الزامی | توضیحات | مثال |
|------|-----|--------|---------|------|
| `type` | string | ✅ | نوع زمان‌بندی | `"long_term"` |
| `long_term.duration` | string | ❌ | دوره تناوب (ماهانه/سالانه) | `"monthly"` یا `"yearly"` |
| `long_term.date` | string | ❌ | تاریخ شروع (YYYY-MM-DD) | `"2025-11-01"` |
| `long_term.time` | string | ❌ | بازه زمانی | `"09:00-11:00"` |
| `long_term.file` | string | ❌ | مسیر فایل توافق نامه | `"uploads/contracts/file.pdf"` |

#### نوع کوتاه‌مدت (Short-term)

| فیلد | نوع | الزامی | توضیحات | مثال |
|------|-----|--------|---------|------|
| `type` | string | ✅ | نوع زمان‌بندی | `"short_term"` |
| `short_term.date` | string | ❌ | تاریخ سرویس (YYYY-MM-DD) | `"2025-11-05"` |
| `short_term.time` | string | ❌ | بازه زمانی | `"14:00-16:00"` |
| `short_term.file` | string | ❌ | مسیر فایل توافق نامه | `"uploads/contracts/file.pdf"` |

---

## 📤 نمونه Request - کاربر عادی

```json
{
  "address_id": 1,
  "category_id": 2,
  "total_price": 500000,
  "date": "2025-11-10",
  "time": "14:00-16:00",
  "is_urgent": false,
  "is_fixed": true,
  "description": "لطفاً دقت کنید که لوازم تمیز باشند",
  "female_count": 0,
  "male_count": 1,
  "unspecified_count": 0,
  "discount_code": "WELCOME10",
  "steps": [
    {
      "step_id": 1,
      "fields": [
        {
          "field_id": 5,
          "value": "تعمیرات"
        }
      ]
    }
  ]
}
```

---

## 📤 نمونه Request - سازمان (Long-term)

```json
{
  "address_id": 3,
  "category_id": 2,
  "total_price": 2000000,
  "date": "2025-11-15",
  "time": "08:00-10:00",
  "description": "سرویس دوره‌ای ماهانه برای دفتر مرکزی",
  "male_count": 2,
  "service_schedule": {
    "type": "long_term",
    "long_term": {
      "duration": "monthly",
      "date": "2025-11-01",
      "time": "09:00-11:00",
      "file": "uploads/contracts/monthly_contract_2025.pdf"
    }
  },
  "steps": [
    {
      "step_id": 1,
      "fields": [
        {
          "field_id": 5,
          "value": "نگهداری و سرویس"
        }
      ]
    }
  ]
}
```

---

## 📤 نمونه Request - سازمان (Short-term)

```json
{
  "address_id": 3,
  "category_id": 2,
  "total_price": 1200000,
  "date": "2025-11-20",
  "time": "10:00-12:00",
  "description": "سرویس یکبار مصرف قبل از مراسم",
  "female_count": 1,
  "service_schedule": {
    "type": "short_term",
    "short_term": {
      "date": "2025-11-05",
      "time": "14:00-16:00",
      "file": "uploads/contracts/short_term_agreement.pdf"
    }
  },
  "steps": [...]
}
```

---

## ✅ Response موفق (Success)

### Status Code: `200 OK`

```json
{
  "success": true,
  "message": "سفارش با موفقیت ثبت شد.",
  "order": {
    "id": 123,
    "user_id": 9,
    "user_address_id": 3,
    "category_id": 2,
    "status": "pending",
    "payment_status": "pending",
    "pakar_price": 2000000,
    "is_urgent": false,
    "is_fixed": true,
    "date": "2025-11-15",
    "time": "08:00-10:00",
    "female_count": 0,
    "male_count": 2,
    "unspecified_count": 0,
    "service_schedule_type": "long_term",
    "service_schedule_long_duration": "monthly",
    "service_schedule_long_date": "2025-11-01",
    "service_schedule_long_time": "09:00-11:00",
    "service_schedule_long_file": "uploads/contracts/monthly_contract_2025.pdf",
    "created_at": "2025-11-08T10:30:00.000000Z",
    "updated_at": "2025-11-08T10:30:00.000000Z"
  }
}
```

### فیلدهای Response

| فیلد | توضیح |
|------|--------|
| `success` | وضعیت موفقیت (همیشه `true` در صورت موفقیت) |
| `message` | پیام فارسی برای نمایش به کاربر |
| `order` | اطلاعات کامل سفارش ثبت شده |
| `order.id` | شناسه یکتای سفارش (برای پیگیری) |
| `order.status` | وضعیت سفارش (`pending`, `accepted`, `in_progress`, ...) |
| `order.payment_status` | وضعیت پرداخت (`pending`, `paid`, `failed`) |

---

## ❌ Response خطا (Error)

### 1. خطای اعتبارسنجی (Validation Error)

**Status Code:** `422 Unprocessable Entity`

```json
{
  "success": false,
  "message": "خطا در اعتبارسنجی داده‌ها",
  "errors": {
    "address_id": [
      "آدرس الزامی است."
    ],
    "total_price": [
      "قیمت کل باید عدد باشد."
    ],
    "date": [
      "فرمت تاریخ صحیح نیست (Y-m-d)."
    ],
    "service_schedule.type": [
      "نوع زمان‌بندی باید long_term یا short_term باشد."
    ]
  }
}
```

### 2. خطای احراز هویت (Authentication Error)

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Unauthenticated."
}
```

### 3. خطای دسترسی (Authorization Error)

**Status Code:** `403 Forbidden`

```json
{
  "success": false,
  "message": "شما مجاز به انجام این عملیات نیستید.",
  "error_code": "UNAUTHORIZED"
}
```

### 4. خطای سرور (Server Error)

**Status Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.",
  "error_code": "ORDER_SUBMIT_ERROR"
}
```

---

## 🔍 تمام پیام‌های خطای Validation

### خطاهای فیلدهای اصلی

| فیلد | پیام خطا |
|------|----------|
| `address_id.required` | آدرس الزامی است. |
| `address_id.exists` | آدرس انتخاب شده معتبر نیست. |
| `category_id.required` | دسته‌بندی الزامی است. |
| `category_id.exists` | دسته‌بندی انتخاب شده معتبر نیست. |
| `total_price.required` | قیمت کل الزامی است. |
| `total_price.numeric` | قیمت کل باید عدد باشد. |
| `total_price.min` | قیمت کل نمی‌تواند منفی باشد. |
| `date.required` | تاریخ الزامی است. |
| `date.date_format` | فرمت تاریخ صحیح نیست (Y-m-d). |
| `time.required` | زمان الزامی است. |
| `description.max` | توضیحات نباید بیش از 1000 کاراکتر باشد. |
| `discount_code.max` | کد تخفیف نباید بیش از 50 کاراکتر باشد. |

### خطاهای Service Schedule

| فیلد | پیام خطا |
|------|----------|
| `service_schedule.array` | زمان نگهداری و سرویس باید به صورت آرایه ارسال شود. |
| `service_schedule.type.in` | نوع زمان‌بندی باید long_term یا short_term باشد. |
| `service_schedule.long_term.date.date_format` | فرمت تاریخ بلندمدت صحیح نیست (Y-m-d). |
| `service_schedule.short_term.date.date_format` | فرمت تاریخ کوتاه‌مدت صحیح نیست (Y-m-d). |

---

## 💻 نمونه کد React Native

### 1. تابع ارسال سفارش (کامل)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://your-api-domain.com/api';

/**
 * ثبت سفارش جدید
 * @param {Object} orderData - داده‌های سفارش
 * @returns {Promise<Object>} - نتیجه ثبت سفارش
 */
export const submitOrder = async (orderData) => {
  try {
    // دریافت token از AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('کاربر وارد نشده است');
    }

    // دریافت account_type کاربر
    const userProfile = await AsyncStorage.getItem('userProfile');
    const accountType = userProfile ? JSON.parse(userProfile).account_type : 'individual';

    // ساخت payload
    const payload = {
      address_id: orderData.addressId,
      category_id: orderData.categoryId,
      total_price: orderData.totalPrice,
      date: orderData.date, // فرمت: "2025-11-10"
      time: orderData.time, // فرمت: "14:00-16:00"
      description: orderData.description || '',
      is_urgent: orderData.isUrgent || false,
      is_fixed: orderData.isFixed || false,
      female_count: orderData.femaleCount || 0,
      male_count: orderData.maleCount || 0,
      unspecified_count: orderData.unspecifiedCount || 0,
      steps: orderData.steps || [],
    };

    // اضافه کردن کد تخفیف (اختیاری)
    if (orderData.discountCode) {
      payload.discount_code = orderData.discountCode;
    }

    // اضافه کردن تصویر (اختیاری)
    if (orderData.imagePath) {
      payload.image_path = orderData.imagePath;
    }

    // اضافه کردن service_schedule برای سازمان‌ها
    if (
      (accountType === 'organization' || accountType === 'company') &&
      orderData.serviceSchedule
    ) {
      payload.service_schedule = buildServiceSchedule(orderData.serviceSchedule);
    }

    // ارسال درخواست
    const response = await fetch(`${API_BASE_URL}/orders/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        order: result.order,
        message: result.message,
      };
    } else {
      // مدیریت خطاهای validation
      if (response.status === 422 && result.errors) {
        const errorMessages = Object.values(result.errors).flat();
        throw new Error(errorMessages.join('\n'));
      }
      
      throw new Error(result.message || 'خطا در ثبت سفارش');
    }
  } catch (error) {
    console.error('Submit order error:', error);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * ساخت ساختار service_schedule
 * @param {Object} serviceScheduleData
 * @returns {Object}
 */
const buildServiceSchedule = (serviceScheduleData) => {
  const schedule = {
    type: serviceScheduleData.type,
  };

  if (serviceScheduleData.type === 'long_term') {
    schedule.long_term = {
      duration: serviceScheduleData.longTerm.duration,
      date: serviceScheduleData.longTerm.date,
      time: serviceScheduleData.longTerm.time,
    };
    
    if (serviceScheduleData.longTerm.file) {
      schedule.long_term.file = serviceScheduleData.longTerm.file;
    }
  } else if (serviceScheduleData.type === 'short_term') {
    schedule.short_term = {
      date: serviceScheduleData.shortTerm.date,
      time: serviceScheduleData.shortTerm.time,
    };
    
    if (serviceScheduleData.shortTerm.file) {
      schedule.short_term.file = serviceScheduleData.shortTerm.file;
    }
  }

  return schedule;
};
```

### 2. استفاده در Component

```javascript
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { submitOrder } from './api/orderApi';

const OrderSubmitScreen = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmitOrder = async () => {
    setLoading(true);

    const orderData = {
      addressId: 3,
      categoryId: 2,
      totalPrice: 2000000,
      date: '2025-11-15',
      time: '08:00-10:00',
      description: 'سرویس دوره‌ای ماهانه',
      maleCount: 2,
      steps: [
        {
          step_id: 1,
          fields: [
            { field_id: 5, value: 'نگهداری' }
          ]
        }
      ],
      // برای سازمان‌ها
      serviceSchedule: {
        type: 'long_term',
        longTerm: {
          duration: 'monthly',
          date: '2025-11-01',
          time: '09:00-11:00',
          file: 'uploads/contract.pdf',
        }
      }
    };

    const result = await submitOrder(orderData);

    setLoading(false);

    if (result.success) {
      Alert.alert(
        'موفق',
        result.message,
        [
          {
            text: 'باشه',
            onPress: () => {
              // هدایت به صفحه جزئیات سفارش
              navigation.navigate('OrderDetail', { 
                orderId: result.order.id 
              });
            }
          }
        ]
      );
    } else {
      Alert.alert('خطا', result.message);
    }
  };

  return (
    <View>
      <Button
        title={loading ? 'در حال ارسال...' : 'ثبت سفارش'}
        onPress={handleSubmitOrder}
        disabled={loading}
      />
    </View>
  );
};

export default OrderSubmitScreen;
```

---

## 📋 Checklist برای توسعه‌دهنده موبایل

### قبل از شروع
- [ ] دریافت token احراز هویت از `/api/auth/login`
- [ ] دریافت profile کاربر از `/api/profile` و ذخیره `account_type`
- [ ] دریافت لیست آدرس‌ها از `/api/addresses`
- [ ] دریافت لیست دسته‌بندی‌ها از `/api/categories`

### هنگام ثبت سفارش
- [ ] بررسی `account_type` کاربر
- [ ] اگر `organization` یا `company` → نمایش مرحله service_schedule
- [ ] اگر `individual` → عدم ارسال فیلد service_schedule
- [ ] اعتبارسنجی فرمت تاریخ (YYYY-MM-DD)
- [ ] اعتبارسنجی محدودیت کاراکترها
- [ ] نمایش پیام‌های خطای فارسی از API

### بعد از دریافت پاسخ
- [ ] ذخیره `order.id` برای پیگیری
- [ ] نمایش پیام موفقیت/خطا به کاربر
- [ ] هدایت به صفحه جزئیات سفارش یا لیست سفارشات
- [ ] به‌روزرسانی لیست سفارشات محلی

---

## ⚠️ نکات مهم

### 1. تاریخ و زمان
- تاریخ باید به فرمت **ISO 8601** (`YYYY-MM-DD`) باشد
- مثال صحیح: `"2025-11-10"`
- مثال غلط: `"10/11/2025"` یا `"1404/08/19"`

### 2. Service Schedule
- فقط برای کاربران با `account_type` = `organization` یا `company`
- فیلد `type` اجباری است: `"long_term"` یا `"short_term"`
- بسته به `type`، فقط یکی از `long_term` یا `short_term` پر می‌شود

### 3. آپلود فایل
- ابتدا فایل را با API آپلود کنید: `POST /api/upload/file`
- سپس مسیر دریافتی را در فیلد `file` قرار دهید

### 4. مدیریت خطا
- همیشه `response.status` و `result.success` را چک کنید
- خطاهای validation در `result.errors` (object) قرار دارند
- سایر خطاها در `result.message` (string) هستند

### 5. Timeout
- برای درخواست ثبت سفارش timeout حداقل **30 ثانیه** تنظیم کنید

---

## 🧪 نمونه تست با cURL

### کاربر عادی

```bash
curl -X POST "http://your-api.com/api/orders/submit" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "address_id": 1,
    "category_id": 2,
    "total_price": 500000,
    "date": "2025-11-10",
    "time": "14:00-16:00",
    "male_count": 1
  }'
```

### کاربر سازمانی (Long-term)

```bash
curl -X POST "http://your-api.com/api/orders/submit" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "address_id": 3,
    "category_id": 2,
    "total_price": 2000000,
    "date": "2025-11-15",
    "time": "08:00-10:00",
    "male_count": 2,
    "service_schedule": {
      "type": "long_term",
      "long_term": {
        "duration": "monthly",
        "date": "2025-11-01",
        "time": "09:00-11:00"
      }
    }
  }'
```

---

## 🔗 API‌های مرتبط

| API | توضیح | مستندات |
|-----|-------|---------|
| `GET /api/profile` | دریافت اطلاعات کاربر (شامل account_type) | [PROFILE_API_DOCS.md](PROFILE_API_DOCS.md) |
| `GET /api/addresses` | لیست آدرس‌های کاربر | - |
| `GET /api/categories` | لیست دسته‌بندی‌ها | - |
| `POST /api/steps/fetch` | دریافت مراحل فرم (شامل service_schedule) | [SERVICE_SCHEDULE_STEP_DOCS.md](SERVICE_SCHEDULE_STEP_DOCS.md) |
| `POST /api/upload/file` | آپلود فایل | - |
| `GET /api/orders/{id}` | جزئیات سفارش | [ORDER_API_DOCS.md](ORDER_API_DOCS.md) |

---

## 📞 پشتیبانی

در صورت بروز مشکل یا سوال:
- 📧 ایمیل: support@loop-web.com
- 💬 تلگرام: @loop_support
- 📱 تلفن: 021-12345678

---

## 📝 تاریخچه تغییرات

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| 1.0.0 | 2025-11-08 | افزودن پشتیبانی از service_schedule برای سازمان‌ها |
| 0.9.0 | 2025-10-15 | نسخه اولیه API ثبت سفارش |

---

**نوشته شده توسط:** تیم توسعه Loop Web  
**زبان‌های پشتیبانی شده:** فارسی (Persian)  
**محیط تست:** http://192.168.21.107:8000  
**محیط تولید:** https://api.loop-web.com  

---

## ✨ Tips & Tricks

### 1. بهینه‌سازی درخواست

```javascript
// کش کردن اطلاعات کاربر
const cachedUserProfile = await AsyncStorage.getItem('userProfile');
if (cachedUserProfile) {
  const profile = JSON.parse(cachedUserProfile);
  // استفاده از profile.account_type
}
```

### 2. Retry Logic

```javascript
const submitOrderWithRetry = async (orderData, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await submitOrder(orderData);
      if (result.success) return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000)); // تاخیر 2 ثانیه
    }
  }
};
```

### 3. Validation سمت Client

```javascript
const validateOrderData = (data) => {
  const errors = [];
  
  if (!data.addressId) errors.push('آدرس الزامی است');
  if (!data.categoryId) errors.push('دسته‌بندی الزامی است');
  if (!data.totalPrice || data.totalPrice <= 0) errors.push('قیمت نامعتبر است');
  
  // بررسی فرمت تاریخ
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.date)) errors.push('فرمت تاریخ صحیح نیست');
  
  return errors;
};
```

---

🎉 **همه چیز آماده است! موفق باشید!** 🎉
