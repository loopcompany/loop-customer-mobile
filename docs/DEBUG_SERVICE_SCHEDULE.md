# 🔍 راهنمای Debug - مشکل service_schedule

**تاریخ:** 2025-11-08  
**وضعیت:** 🔧 در حال debug

---

## 📋 مشکل گزارش شده

کاربر می‌گوید:
> "من در ثبت سفارش نوع سرویسم رو کوتاه مدت انتخاب کردم و گزینه هایی که مربوط به این ایتم بود را هم تکمیل کردم اما باز هم ارور اجباری بودن میگیرم"

---

## 🔧 لاگ‌های اضافه شده

### 1️⃣ در `ServiceSchedule.js`

#### لاگ‌های اولیه (هنگام load):
```javascript
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 [ServiceSchedule] کامپوننت لود شد - Step:', step);
console.log('🔄 [ServiceSchedule] Redux State این step:', ...);
console.log('📦 [ServiceSchedule] داده ورودی data:', ...);
```

**چه چیزی رو بررسی کنیم:**
- آیا `step` درست است؟
- آیا Redux state داده‌های service_schedule رو داره؟
- آیا `data` prop ساختار درستی داره؟

#### لاگ بررسی mainField:
```javascript
console.log('🔍 [ServiceSchedule] mainField:', mainField ? 'یافت شد' : 'یافت نشد');
console.log('📋 [ServiceSchedule] mainField options:');
mainField.options?.forEach(opt => {
    console.log(`   ${opt.value > 0 ? '✅' : '⭕'} ${opt.id}: value=${opt.value}`);
});
```

**چه چیزی رو بررسی کنیم:**
- آیا `mainField` با `id: 'main_selection'` وجود داره؟
- کدوم option `value > 0` داره؟ (long_term یا short_term)

#### لاگ فیلدهای شرطی:
```javascript
console.log('📱 [ServiceSchedule] تعداد فیلدهای شرطی:', conditionalFields.length);
console.log('📋 [ServiceSchedule] لیست فیلدهای شرطی:');
conditionalFields.forEach(f => {
    console.log(`   - ${f.id} (type: ${f.type}, value: ${f.value || 'خالی'})`);
});
```

**چه چیزی رو بررسی کنیم:**
- آیا فیلدهای شرطی درست پیدا شدن؟
- آیا `conditional_on` با انتخاب ما مطابقت داره؟
- آیا فیلد `time` در لیست هست؟

#### لاگ رندر فیلدها:
```javascript
console.log('🔄 [ServiceSchedule] رندر فیلد شرطی:', field.id, 'نوع:', field.type);
console.log('📅 [ServiceSchedule] رندر Date:', field.id);
console.log('⏰ [ServiceSchedule] رندر Time:', field.id);
console.log('📎 [ServiceSchedule] رندر File:', field.id);
```

**چه چیزی رو بررسی کنیم:**
- آیا همه فیلدهای مورد نیاز رندر می‌شن؟
- آیا Time component لود می‌شه؟

#### لاگ کلیک‌ها:
```javascript
console.log('👆 [ServiceSchedule] کلیک روی main option:', option.id);
console.log('📤 [ServiceSchedule] dispatch با:', { fieldId, fieldDetailId, step });
console.log('✅ [ServiceSchedule] dispatch انجام شد');
```

**چه چیزی رو بررسی کنیم:**
- آیا کلیک‌ها ثبت می‌شن؟
- آیا dispatch صدا زده می‌شه؟

---

### 2️⃣ در `Steps.js`

#### لاگ شروع validation:
```javascript
console.log('━━━━━━━━━ VALIDATION START ━━━━━━━━━');
console.log('🔍 [Steps.required] بررسی validation برای step:', step);
console.log('📦 [Steps.required] داده این step:', ...);
```

#### لاگ بررسی هر item:
```javascript
console.log(`🔍 [Steps.required] بررسی item: ${item.type} (id: ${item.id})`);
console.log(`   is_required: ${item.is_required}`);
console.log(`   ✓ type: ${item.type}, value: "${item.value}", valid: ${isValid ? '✅' : '❌'}`);
```

#### لاگ نتیجه validation:
```javascript
console.log('━━━━━━━━━ VALIDATION RESULT:', result ? '✅ VALID' : '❌ INVALID', '━━━━━━━━━');
```

---

## 📊 نمونه لاگ‌های مورد انتظار

### سناریو موفق ✅

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [ServiceSchedule] کامپوننت لود شد - Step: 2
🔄 [ServiceSchedule] Redux State این step: [...]
📦 [ServiceSchedule] داده ورودی data: [...]
🔍 [ServiceSchedule] mainField: یافت شد
📋 [ServiceSchedule] mainField options:
   ⭕ long_term: value=0, title=بلند مدت
   ✅ short_term: value=1, title=کوتاه مدت
✅ [ServiceSchedule] گزینه انتخاب شده: short_term
📱 [ServiceSchedule] تعداد فیلدهای شرطی: 3
📋 [ServiceSchedule] لیست فیلدهای شرطی:
   - short_term_date (type: date, value="2025-11-15", )
   - short_term_time (type: time, value="14:00-16:00", )
   - short_term_file (type: file, value=خالی, )
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 [ServiceSchedule] رندر فیلد شرطی: short_term_date نوع: date
📅 [ServiceSchedule] رندر Date: short_term_date
🔄 [ServiceSchedule] رندر فیلد شرطی: short_term_time نوع: time
⏰ [ServiceSchedule] رندر Time: short_term_time
🔄 [ServiceSchedule] رندر فیلد شرطی: short_term_file نوع: file
📎 [ServiceSchedule] رندر File: short_term_file

━━━━━━━━━ VALIDATION START ━━━━━━━━━
🔍 [Steps.required] بررسی validation برای step: 2
🔍 [Steps.required] بررسی item: service_schedule (id: 123)
   is_required: 1
🔍 [Steps.validation] بررسی service_schedule...
✅ [Steps.validation] service_schedule: نوع انتخاب شده: short_term
📋 [Steps.validation] تعداد فیلدهای شرطی: 3
✅ [Steps.validation] short_term_date (date): 2025-11-15
✅ [Steps.validation] short_term_time (time): 14:00-16:00
ℹ️ [Steps.validation] short_term_file (file): اختیاری
✅ [Steps.validation] service_schedule کامل است
━━━━━━━━━ VALIDATION RESULT: ✅ VALID ━━━━━━━━━
```

### سناریو ناموفق ❌

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [ServiceSchedule] کامپوننت لود شد - Step: 2
✅ [ServiceSchedule] گزینه انتخاب شده: short_term
📱 [ServiceSchedule] تعداد فیلدهای شرطی: 3
📋 [ServiceSchedule] لیست فیلدهای شرطی:
   - short_term_date (type: date, value="2025-11-15", )
   - short_term_time (type: time, value=خالی, )    ← ⚠️ مشکل!
   - short_term_file (type: file, value=خالی, )
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━ VALIDATION START ━━━━━━━━━
✅ [Steps.validation] service_schedule: نوع انتخاب شده: short_term
✅ [Steps.validation] short_term_date (date): 2025-11-15
❌ [Steps.validation] short_term_time (time): خالی است    ← ⚠️ مشکل!
ℹ️ [Steps.validation] short_term_file (file): اختیاری
❌ [Steps.validation] service_schedule ناقص است
━━━━━━━━━ VALIDATION RESULT: ❌ INVALID ━━━━━━━━━
```

---

## 🔍 نکات کلیدی برای بررسی

### 1. بررسی ساختار داده از Backend

**آیا Backend این ساختار رو میفرسته؟**
```json
{
  "type": "service_schedule",
  "field_details": [
    {
      "id": "main_selection",
      "type": "radioButton",
      "options": [
        { "id": "long_term", "value": 0 },
        { "id": "short_term", "value": 1 }
      ]
    },
    {
      "id": "short_term_date",
      "type": "date",
      "conditional_on": "short_term",
      "value": ""
    },
    {
      "id": "short_term_time",
      "type": "time",
      "conditional_on": "short_term",
      "value": ""
    },
    {
      "id": "short_term_file",
      "type": "file",
      "conditional_on": "short_term",
      "value": ""
    }
  ]
}
```

### 2. بررسی نام فیلدها

**مطمئن شوید نام فیلدها با Backend مطابقت دارند:**
- ✅ `short_term` (نه `shortTerm` یا `short-term`)
- ✅ `short_term_date`
- ✅ `short_term_time`
- ✅ `short_term_file`

### 3. بررسی conditional_on

**آیا `conditional_on` با انتخاب شما مطابقت داره؟**
```javascript
// اگر short_term انتخاب شده:
field.conditional_on === 'short_term' // باید true باشه
```

### 4. بررسی value

**آیا value بعد از انتخاب ذخیره میشه؟**
- Date component باید `field.value` رو set کنه
- Time component باید `field.value` رو set کنه

---

## 📝 چک‌لیست Debug

با استفاده از لاگ‌ها، این موارد رو بررسی کن:

### مرحله 1: Load کامپوننت
- [ ] آیا ServiceSchedule لود می‌شه؟
- [ ] آیا step number درست است؟
- [ ] آیا data prop ساختار درستی داره؟
- [ ] آیا mainField یافت می‌شه؟

### مرحله 2: انتخاب نوع
- [ ] کلیک روی short_term ثبت می‌شه؟
- [ ] dispatch اجرا می‌شه؟
- [ ] value تغییر می‌کنه؟ (✅ برای short_term، ⭕ برای long_term)

### مرحله 3: نمایش فیلدهای شرطی
- [ ] تعداد فیلدهای شرطی 3 تا هست؟
- [ ] فیلد short_term_date نمایش داده می‌شه؟
- [ ] فیلد short_term_time نمایش داده می‌شه؟ ⚠️
- [ ] فیلد short_term_file نمایش داده می‌شه؟

### مرحله 4: پر کردن فیلدها
- [ ] آیا Date component کار می‌کنه و value set می‌شه؟
- [ ] آیا Time component کار می‌کنه و value set می‌شه؟ ⚠️
- [ ] آیا لاگ‌ها value جدید رو نشون میدن؟

### مرحله 5: Validation
- [ ] آیا validation start می‌شه؟
- [ ] آیا service_schedule item بررسی می‌شه؟
- [ ] آیا نوع انتخاب شده (short_term) درست تشخیص داده می‌شه؟
- [ ] آیا فیلدهای شرطی چک می‌شن؟
- [ ] کدوم فیلد ❌ خالی است؟

---

## 🎯 مراحل عیب‌یابی

### مرحله 1: بررسی لاگ‌ها
1. اپ رو باز کن
2. به صفحه Steps برو
3. کامپوننت service_schedule رو باز کن
4. short_term انتخاب کن
5. **همه لاگ‌ها رو برام بفرست**

### مرحله 2: بررسی فیلدهای نمایش داده شده
1. آیا فیلد Time نمایش داده می‌شه؟
2. اگر نه، چرا؟
3. لاگ رندر چی می‌گه؟

### مرحله 3: بررسی validation
1. Date و Time رو پر کن
2. روی "مرحله بعد" کلیک کن
3. لاگ‌های validation رو بررسی کن
4. کدوم فیلد fail می‌کنه؟

---

## 🐛 مشکلات احتمالی

### مشکل 1: Time component رندر نمی‌شه
**علت:**
- `field.type` درست نیست (مثلاً `"Time"` به جای `"time"`)
- یا `conditional_on` مطابقت نداره

**راه‌حل:**
لاگ این قسمت رو بررسی کن:
```
📋 [ServiceSchedule] لیست فیلدهای شرطی:
   - short_term_time (type: ???, ...)
```

### مشکل 2: Time value ذخیره نمی‌شه
**علت:**
- Time component dispatch درستی نمی‌زنه
- یا stepSlice درست update نمی‌شه

**راه‌حل:**
باید Time component رو هم لاگ کنیم (مرحله بعدی)

### مشکل 3: Validation fail می‌کنه با وجود پر بودن
**علت:**
- value در جای درستی ذخیره نشده
- یا ساختار validation اشتباه است

**راه‌حل:**
مقایسه کن:
- value در Redux state
- value که validation چک می‌کنه

---

## 📤 اطلاعات مورد نیاز برای کمک

لطفاً این اطلاعات رو برام بفرست:

1. **لاگ‌های کامل ServiceSchedule** (از وقتی که load می‌شه)
2. **لاگ‌های کامل validation** (از وقتی که روی مرحله بعد کلیک می‌کنی)
3. **اسکرین‌شات** از صفحه service_schedule (نشون بده چه فیلدهایی رو می‌بینی)
4. **Redux state** از DevTools (اگر داری)

---

**وضعیت:** 🔧 منتظر لاگ‌ها  
**مرحله بعدی:** بررسی لاگ‌ها و پیدا کردن مشکل دقیق  
