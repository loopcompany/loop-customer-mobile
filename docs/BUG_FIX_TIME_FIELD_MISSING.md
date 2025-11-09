# 🐛 Bug Fix: فیلد Time در ServiceSchedule نمایش داده نمی‌شد

**تاریخ:** 2025-11-08  
**اولویت:** 🔴 Critical  
**وضعیت:** ✅ حل شد

---

## 📋 توضیح مشکل

### علامت مشکل
کاربر گزارش داد:
> "من در ثبت سفارش نوع سرویسم رو کوتاه مدت انتخاب کردم و گزینه هایی که مربوط به این ایتم بود را هم تکمیل کردم اما باز هم ارور اجباری بودن میگیرم"

### تحلیل مشکل

1. کاربر سازمانی `short_term` را انتخاب کرد
2. فیلدهای نمایش داده شده را پر کرد
3. اما همچنان validation خطای "فیلدهای اجباری" می‌داد

### علت ریشه‌ای ⚠️

در کامپوننت `ServiceSchedule.js`، فقط این فیلدها رندر می‌شدند:
- ✅ `radioButton` (برای duration)
- ✅ `date`
- ✅ `file`
- ❌ **`time` اصلاً رندر نمی‌شد!**

اما در Validation در `Steps.js`، فیلد `time` اجباری بود:

```javascript
// در Steps.js - validation
if (field.type === 'time') {
    return !!field.value; // اجباری است
}
```

پس:
- کاربر فیلد `time` را نمی‌دید
- اما validation انتظار داشت که `time` پر شده باشد
- نتیجه: همیشه validation fail می‌شد ❌

---

## 🔧 راه‌حل

### فایل تغییر یافته
`components/ServiceSchedule.js`

### تغییرات

#### 1️⃣ اضافه کردن Import
```javascript
// قبل
import Date from './Date';
import File from './File';

// بعد
import Date from './Date';
import Time from './Time';  // ← اضافه شد
import File from './File';
```

#### 2️⃣ اضافه کردن رندر Time
```javascript
// در conditionalFields.map()

// Date type
if (field.type === 'date') {
    return (
        <View key={field.id}>
            <Date step={step} data={field} />
        </View>
    );
}

// Time type - این قسمت اضافه شد ⬇️
if (field.type === 'time') {
    console.log('⏰ [ServiceSchedule] رندر Time:', field.id);
    return (
        <View key={field.id}>
            <Time step={step} data={field} />
        </View>
    );
}

// File type
if (field.type === 'file') {
    return (
        <View key={field.id}>
            <File step={step} data={field} />
        </View>
    );
}
```

#### 3️⃣ اضافه کردن لاگ‌های Debug
برای پیگیری بهتر، لاگ‌هایی اضافه شد:
```javascript
console.log('🔄 [ServiceSchedule] رندر فیلد شرطی:', field.id, 'نوع:', field.type);
console.log('📅 [ServiceSchedule] رندر Date:', field.id);
console.log('⏰ [ServiceSchedule] رندر Time:', field.id);
console.log('📎 [ServiceSchedule] رندر File:', field.id);
console.log('⚠️ [ServiceSchedule] نوع فیلد ناشناخته:', field.type);
```

---

## ✅ نتیجه

حالا برای `short_term` این فیلدها نمایش داده می‌شوند:

| فیلد | نوع | اجباری | نمایش |
|------|-----|--------|-------|
| Date | date | ✅ | ✅ |
| Time | time | ✅ | ✅ (اضافه شد) |
| File | file | ❌ | ✅ |

برای `long_term`:

| فیلد | نوع | اجباری | نمایش |
|------|-----|--------|-------|
| Duration | radioButton | ✅ | ✅ |
| Date | date | ✅ | ✅ |
| Time | time | ✅ | ✅ (اضافه شد) |
| File | file | ❌ | ✅ |

---

## 🧪 تست

### قبل از Fix ❌
```
1. انتخاب short_term
2. پر کردن Date
3. (Time نمایش داده نمی‌شد)
4. کلیک "مرحله بعد"

نتیجه: ❌ "لطفا فیلدهای الزامی را تکمیل نمایید."
```

### بعد از Fix ✅
```
1. انتخاب short_term
2. نمایش Date
3. نمایش Time ✅ (جدید)
4. پر کردن Date و Time
5. کلیک "مرحله بعد"

نتیجه: ✅ رفتن به مرحله بعد موفق
```

---

## 📊 لاگ‌های Debug

### هنگام رندر:
```
🔄 [ServiceSchedule] رندر فیلد شرطی: short_term_date نوع: date
📅 [ServiceSchedule] رندر Date: short_term_date

🔄 [ServiceSchedule] رندر فیلد شرطی: short_term_time نوع: time
⏰ [ServiceSchedule] رندر Time: short_term_time

🔄 [ServiceSchedule] رندر فیلد شرطی: short_term_file نوع: file
📎 [ServiceSchedule] رندر File: short_term_file
```

### هنگام Validation:
```
🔍 [Steps.validation] بررسی service_schedule...
✅ [Steps.validation] service_schedule: نوع انتخاب شده: short_term
📋 [Steps.validation] تعداد فیلدهای شرطی: 3
✅ [Steps.validation] short_term_date (date): 2025-11-15
✅ [Steps.validation] short_term_time (time): 14:00-16:00
ℹ️ [Steps.validation] short_term_file (file): اختیاری
✅ [Steps.validation] service_schedule کامل است
```

---

## 🔍 چک‌لیست برای مشکلات مشابه

اگر validation خطا می‌دهد اما فیلدها پر شده‌اند:

- [ ] آیا تمام فیلدهای اجباری در UI رندر می‌شوند؟
- [ ] آیا component مناسب (Date, Time, File, ...) import شده؟
- [ ] آیا در conditionalFields.map() تمام نوع‌های فیلد چک می‌شوند؟
- [ ] آیا لاگ‌ها نشان می‌دهند که فیلد رندر شده است؟
- [ ] آیا dispatch درست اجرا می‌شود و state آپدیت می‌شود؟

---

## 📚 فایل‌های مرتبط

- `components/ServiceSchedule.js` - کامپوننت اصلی (✅ Fix اعمال شد)
- `components/Time.js` - کامپوننت Time که import شد
- `screens/category/Steps.js` - Validation logic
- `slices/stepSlice.js` - Redux state management

---

## ⚠️ یادآوری برای آینده

هنگام اضافه کردن فیلد جدید به `service_schedule`:

1. ✅ Backend باید فیلد را در `/api/steps/fetch` بفرستد
2. ✅ Frontend باید component مربوطه را import کند
3. ✅ در `conditionalFields.map()` شرط رندر اضافه شود
4. ✅ Validation در `Steps.js` آپدیت شود
5. ✅ در `buildServiceSchedulePayload()` فیلد استخراج شود

---

**وضعیت:** ✅ مشکل حل شد - کاربران حالا می‌توانند فیلد Time را ببینند و پر کنند  
**تست:** ✅ تست شد و کار می‌کند  
**مستندات:** ✅ این فایل ایجاد شد  
