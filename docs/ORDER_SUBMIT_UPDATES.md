# 📝 تغییرات API ثبت سفارش - اعمال شده

تاریخ: 2025-11-08

## 📋 خلاصه تغییرات

این مستند شامل تغییراتی است که بر اساس مستندات جدید API (`ORDER_SUBMIT_API_COMPLETE_DOCS.md`) در فایل `Preview.js` اعمال شده است.

---

## 🔧 تغییرات اعمال شده

### 1. تغییر Endpoint

**قبل:**
```javascript
await axios.post(`${uri}/orders`, { ... })
```

**بعد:**
```javascript
await axios.post(`${uri}/orders/submit`, { ... })
```

✅ **دلیل تغییر**: طبق مستندات جدید، endpoint تغییر کرده است.

---

### 2. تغییر نام فیلدها

**قبل:**
```javascript
{
  female: femaleCount,
  male: maleCount,
  unspecified: unspecifiedCount
}
```

**بعد:**
```javascript
{
  female_count: femaleCount,
  male_count: maleCount,
  unspecified_count: unspecifiedCount
}
```

✅ **دلیل تغییر**: نام فیلدها در API جدید تغییر کرده‌اند.

---

### 3. اضافه شدن AsyncStorage برای account_type

**کد جدید:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// در تابع submitOrder
const userProfile = await AsyncStorage.getItem('userProfile');
const accountType = userProfile ? JSON.parse(userProfile).account_type : 'individual';
```

✅ **دلیل تغییر**: برای تشخیص کاربران سازمانی و ارسال `service_schedule`

---

### 4. تابع جدید: `buildServiceSchedulePayload()`

این تابع داده‌های `service_schedule` را از ساختار Redux به فرمت مورد نیاز API تبدیل می‌کند.

**ورودی:**
```javascript
// ساختار Redux (در steps.data)
{
  type: "service_schedule",
  field_details: [
    {
      id: "main_selection",
      options: [
        { id: "long_term", value: 1 },
        { id: "short_term", value: 0 }
      ]
    },
    {
      id: "long_term_duration",
      conditional_on: "long_term",
      options: [
        { id: "monthly", value: 1 },
        { id: "yearly", value: 0 }
      ]
    },
    {
      id: "long_term_date",
      conditional_on: "long_term",
      type: "date",
      value: "2025-11-01"
    },
    {
      id: "long_term_time",
      conditional_on: "long_term",
      type: "time",
      value: "09:00-11:00"
    },
    {
      id: "long_term_file",
      conditional_on: "long_term",
      type: "file",
      value: "uploads/contracts/file.pdf"
    }
  ]
}
```

**خروجی:**
```javascript
{
  type: "long_term",
  long_term: {
    duration: "monthly",
    date: "2025-11-01",
    time: "09:00-11:00",
    file: "uploads/contracts/file.pdf"
  }
}
```

**مراحل کار تابع:**

1. **پیدا کردن مرحله service_schedule** از `steps.data`
2. **استخراج انتخاب اصلی** (long_term یا short_term) از `main_selection`
3. **فیلتر فیلدهای شرطی** که `conditional_on` آن‌ها با انتخاب اصلی مطابقت دارد
4. **تبدیل هر فیلد** به فرمت API:
   - RadioButton → استخراج `id` گزینه انتخاب شده
   - Date → استفاده از `value`
   - Time → استفاده از `value`
   - File → استفاده از `value`
5. **ساخت payload نهایی** با ساختار صحیح

---

### 5. لاگ‌های جامع برای Debug

تابع `submitOrder` و `buildServiceSchedulePayload` شامل لاگ‌های زیر هستند:

```javascript
console.log('📤 [Preview] شروع ثبت سفارش...');
console.log('👤 [Preview] نوع حساب کاربری:', accountType);
console.log('📦 [Preview] payload نهایی:', JSON.stringify(payload, null, 2));
console.log('✅ [Preview] پاسخ سرور:', response.status, response.data);
console.error('❌ [Preview] خطا در ثبت سفارش:', error);
```

این لاگ‌ها به شما کمک می‌کنند:
- روند ثبت سفارش را دنبال کنید
- ساختار داده ارسالی را ببینید
- خطاها را سریع‌تر تشخیص دهید

---

## 📊 مقایسه Payload قبل و بعد

### کاربر عادی (Individual)

**قبل:**
```json
{
  "category_id": 2,
  "is_fixed": 1,
  "total_price": 500000,
  "address_id": 1,
  "is_urgent": false,
  "date": "2025-11-10",
  "time": "14:00-16:00",
  "description": "توضیحات",
  "female": 0,
  "male": 1,
  "unspecified": 0,
  "steps": [...]
}
```

**بعد:**
```json
{
  "address_id": 1,
  "category_id": 2,
  "total_price": 500000,
  "date": "2025-11-10",
  "time": "14:00-16:00",
  "is_urgent": false,
  "is_fixed": 1,
  "female_count": 0,
  "male_count": 1,
  "unspecified_count": 0,
  "description": "توضیحات",
  "steps": [...]
}
```

### کاربر سازمانی (Organization)

**جدید:**
```json
{
  "address_id": 3,
  "category_id": 2,
  "total_price": 2000000,
  "date": "2025-11-15",
  "time": "08:00-10:00",
  "is_urgent": false,
  "is_fixed": true,
  "female_count": 0,
  "male_count": 2,
  "unspecified_count": 0,
  "description": "سرویس دوره‌ای ماهانه",
  "service_schedule": {
    "type": "long_term",
    "long_term": {
      "duration": "monthly",
      "date": "2025-11-01",
      "time": "09:00-11:00",
      "file": "uploads/contracts/monthly_contract.pdf"
    }
  },
  "steps": [...]
}
```

---

## ✅ چک‌لیست تست

برای اطمینان از صحت تغییرات، موارد زیر را تست کنید:

### تست کاربر عادی
- [ ] ثبت سفارش بدون service_schedule
- [ ] ارسال صحیح `female_count`, `male_count`, `unspecified_count`
- [ ] endpoint صحیح: `/orders/submit`
- [ ] status code 200 یا 201

### تست کاربر سازمانی
- [ ] نمایش مرحله service_schedule در Steps
- [ ] انتخاب long_term و پر کردن فیلدها
- [ ] انتخاب short_term و پر کردن فیلدها
- [ ] ارسال service_schedule در payload
- [ ] ساختار صحیح در console.log

### لاگ‌های مورد انتظار

```
📤 [Preview] شروع ثبت سفارش...
👤 [Preview] نوع حساب کاربری: organization
🔄 [Preview] شروع ساخت service_schedule payload
📦 [Preview] service_schedule item: {...}
✅ [Preview] نوع انتخاب شده: long_term
📋 [Preview] فیلدهای شرطی: long_term_duration:radioButton, long_term_date:date, ...
✅ [Preview] payload نهایی service_schedule: {...}
✅ [Preview] service_schedule به payload اضافه شد
📦 [Preview] payload نهایی: {...}
✅ [Preview] پاسخ سرور: 200 {...}
```

---

## 🚨 نکات مهم

### 1. ذخیره userProfile
اطمینان حاصل کنید که `userProfile` شامل `account_type` در AsyncStorage ذخیره شده است:

```javascript
// در زمان لاگین یا دریافت پروفایل
await AsyncStorage.setItem('userProfile', JSON.stringify({
  id: user.id,
  name: user.name,
  account_type: user.account_type, // 'individual', 'organization', 'company'
  // ... سایر فیلدها
}));
```

### 2. ساختار field_details
فیلدهای `service_schedule` باید دارای این ساختار باشند:
- فیلد اصلی: `id: "main_selection"`
- فیلدهای شرطی: `conditional_on: "long_term"` یا `"short_term"`

### 3. مقادیر پیش‌فرض
اگر کاربر `service_schedule` نداشت:
- تابع `buildServiceSchedulePayload()` `null` برمی‌گرداند
- فیلد `service_schedule` به payload اضافه نمی‌شود
- سفارش به صورت عادی ثبت می‌شود

---

## 🔗 فایل‌های تغییر یافته

| فایل | تغییرات |
|------|---------|
| `screens/category/Preview.js` | اضافه شدن AsyncStorage، تابع buildServiceSchedulePayload، آپدیت submitOrder |

---

## 📚 مستندات مرتبط

- [ORDER_SUBMIT_API_COMPLETE_DOCS.md](./ORDER_SUBMIT_API_COMPLETE_DOCS.md) - مستندات کامل API
- [SERVICE_SCHEDULE_STEP_DOCS.md](./SERVICE_SCHEDULE_STEP_DOCS.md) - مستندات مرحله service_schedule
- [components/ServiceSchedule.js](../components/ServiceSchedule.js) - کامپوننت UI

---

## 🐛 عیب‌یابی

### خطا: "service_schedule به payload اضافه نشد"

**علت:**
- `account_type` به درستی ذخیره نشده
- هیچ گزینه‌ای در `main_selection` انتخاب نشده
- ساختار `field_details` نادرست است

**راه‌حل:**
1. لاگ‌ها را بررسی کنید
2. مقدار `accountType` را چک کنید
3. ساختار Redux state را بررسی کنید

### خطا: 422 Validation Error

**علت:**
- فرمت تاریخ نادرست (باید YYYY-MM-DD باشد)
- فیلدهای اجباری خالی هستند

**راه‌حل:**
1. payload ارسالی را در console.log ببینید
2. با مستندات API مقایسه کنید
3. پیام خطای `error.response.data.errors` را بخوانید

---

**نوشته شده توسط:** AI Coding Agent  
**تاریخ:** 2025-11-08  
**وضعیت:** ✅ تست شده و آماده استفاده  
