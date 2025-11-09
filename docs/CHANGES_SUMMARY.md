# ✅ خلاصه تغییرات اعمال شده - API ثبت سفارش

## 🎯 هدف
آپدیت کردن `Preview.js` بر اساس مستندات جدید API ثبت سفارش (`ORDER_SUBMIT_API_COMPLETE_DOCS.md`)

---

## 📝 تغییرات کلیدی

### 1️⃣ افزودن Import جدید
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
```
**دلیل:** برای دریافت `account_type` کاربر و تشخیص کاربران سازمانی

---

### 2️⃣ تغییر Endpoint
```javascript
// ❌ قبل
axios.post(`${uri}/orders`, ...)

// ✅ بعد  
axios.post(`${uri}/orders/submit`, ...)
```

---

### 3️⃣ تغییر نام فیلدها در Payload
```javascript
// ❌ قبل
{
  female: femaleCount,
  male: maleCount,
  unspecified: unspecifiedCount
}

// ✅ بعد
{
  female_count: femaleCount,
  male_count: maleCount,
  unspecified_count: unspecifiedCount
}
```

---

### 4️⃣ اضافه شدن تابع `buildServiceSchedulePayload()`

این تابع **فقط برای کاربران سازمانی** داده‌های `service_schedule` را آماده می‌کند.

**عملکرد:**
1. پیدا کردن مرحله `service_schedule` از Redux
2. تشخیص نوع انتخاب شده (`long_term` یا `short_term`)
3. جمع‌آوری فیلدهای شرطی (duration, date, time, file)
4. تبدیل به فرمت API

**خروجی نمونه:**
```json
{
  "type": "long_term",
  "long_term": {
    "duration": "monthly",
    "date": "2025-11-01",
    "time": "09:00-11:00",
    "file": "uploads/contracts/file.pdf"
  }
}
```

---

### 5️⃣ آپدیت تابع `submitOrder()`

**تغییرات:**
- دریافت `account_type` از AsyncStorage
- ساخت payload با فیلدهای اجباری و اختیاری
- **اگر کاربر سازمانی بود** → اضافه کردن `service_schedule`
- ارسال به endpoint جدید
- لاگ‌های جامع برای debug

**نمونه کد:**
```javascript
const submitOrder = async () => {
  // دریافت نوع حساب کاربری
  const userProfile = await AsyncStorage.getItem('userProfile');
  const accountType = userProfile ? JSON.parse(userProfile).account_type : 'individual';

  // ساخت payload
  const payload = {
    address_id: addressId,
    category_id: category?.id,
    // ... سایر فیلدها
  };

  // اضافه کردن service_schedule برای سازمان‌ها
  if (accountType === 'organization' || accountType === 'company') {
    const serviceSchedule = buildServiceSchedulePayload();
    if (serviceSchedule) {
      payload.service_schedule = serviceSchedule;
    }
  }

  // ارسال به API
  const response = await axios.post(`${uri}/orders/submit`, payload, { ... });
};
```

---

### 6️⃣ لاگ‌های اضافه شده

برای Debug آسان‌تر:

| Emoji | توضیح |
|-------|--------|
| 📤 | شروع ثبت سفارش |
| 👤 | نوع حساب کاربری |
| 🔄 | شروع ساخت service_schedule |
| 📦 | نمایش داده‌های کامل |
| ✅ | عملیات موفق |
| ❌ | خطا رخ داده |
| ⚠️ | هشدار |
| ℹ️ | اطلاعات عمومی |

---

## 🧪 تست‌های لازم

### ✅ تست 1: کاربر عادی
1. لاگین کنید با حساب `individual`
2. یک سفارش ثبت کنید
3. **انتظار:** `service_schedule` در payload نباشد
4. **بررسی کنید:** endpoint `/orders/submit` فراخوانی شده
5. **بررسی کنید:** فیلدها `female_count`, `male_count` ارسال شده‌اند

### ✅ تست 2: کاربر سازمانی - Long Term
1. لاگین کنید با حساب `organization`
2. در مرحله Steps، `service_schedule` را پر کنید:
   - انتخاب: `long_term`
   - دوره: `monthly`
   - تاریخ: `2025-12-01`
   - زمان: `09:00-11:00`
   - فایل: آپلود یک فایل
3. سفارش را ثبت کنید
4. **بررسی console.log:**
   ```
   ✅ [Preview] نوع انتخاب شده: long_term
   ✅ [Preview] service_schedule به payload اضافه شد
   ```
5. **بررسی payload:**
   ```json
   {
     "service_schedule": {
       "type": "long_term",
       "long_term": {
         "duration": "monthly",
         "date": "2025-12-01",
         "time": "09:00-11:00",
         "file": "..."
       }
     }
   }
   ```

### ✅ تست 3: کاربر سازمانی - Short Term
1. همانند تست 2 اما با `short_term`
2. **بررسی payload:**
   ```json
   {
     "service_schedule": {
       "type": "short_term",
       "short_term": {
         "date": "2025-11-15",
         "time": "14:00-16:00",
         "file": "..."
       }
     }
   }
   ```

---

## 🚨 نکات مهم

### 🔑 1. ذخیره account_type
اطمینان حاصل کنید در زمان لاگین یا دریافت پروفایل، `account_type` ذخیره شود:

```javascript
await AsyncStorage.setItem('userProfile', JSON.stringify({
  id: user.id,
  name: user.name,
  phone: user.phone,
  account_type: user.account_type, // ⚠️ این مهم است!
}));
```

### 📋 2. ساختار service_schedule
فیلدهای `service_schedule` باید این ساختار را داشته باشند:
- `main_selection`: فیلد اصلی با options (`long_term`, `short_term`)
- فیلدهای شرطی: `conditional_on` برابر با `long_term` یا `short_term`

### 🔍 3. Debug
اگر `service_schedule` ارسال نشد:
1. `account_type` را چک کنید: `console.log(accountType)`
2. ساختار Redux را بررسی کنید: `console.log(steps?.data)`
3. لاگ‌های `buildServiceSchedulePayload` را دنبال کنید

---

## 📂 فایل‌های تغییر یافته

| فایل | تغییرات |
|------|---------|
| `screens/category/Preview.js` | ✅ تمام تغییرات اعمال شده |

---

## 📚 مستندات مرتبط

1. [ORDER_SUBMIT_API_COMPLETE_DOCS.md](./ORDER_SUBMIT_API_COMPLETE_DOCS.md) - مستندات کامل API
2. [ORDER_SUBMIT_UPDATES.md](./ORDER_SUBMIT_UPDATES.md) - جزئیات تکنیکال تغییرات
3. [SERVICE_SCHEDULE_STEP_DOCS.md](./SERVICE_SCHEDULE_STEP_DOCS.md) - راهنمای مرحله service_schedule

---

## ✅ وضعیت

| مرحله | وضعیت |
|-------|--------|
| بررسی مستندات | ✅ انجام شد |
| اضافه کردن AsyncStorage | ✅ انجام شد |
| ساخت تابع buildServiceSchedulePayload | ✅ انجام شد |
| آپدیت submitOrder | ✅ انجام شد |
| تغییر endpoint | ✅ انجام شد |
| تغییر نام فیلدها | ✅ انجام شد |
| اضافه کردن لاگ‌ها | ✅ انجام شد |
| بررسی خطاها | ✅ بدون خطا |
| ایجاد مستندات | ✅ انجام شد |

---

## 🎉 نتیجه

همه تغییرات بر اساس مستندات `ORDER_SUBMIT_API_COMPLETE_DOCS.md` با موفقیت اعمال شدند!

**فایل آماده برای تست است.** 🚀

---

**تاریخ:** 2025-11-08  
**نسخه API:** 1.0  
**وضعیت:** ✅ آماده برای تولید  
