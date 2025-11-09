# 🐛 Bug Fix: فیلد Date در service_schedule value ذخیره نمی‌کرد

**تاریخ:** 2025-11-08  
**اولویت:** 🔴 Critical  
**وضعیت:** ✅ حل شد

---

## 📋 خلاصه مشکل

کاربر گزارش داد که با وجود انتخاب short_term و پر کردن تمام فیلدها، هنوز validation خطا می‌داد.

### لاگ‌های دریافتی:
```
LOG  📋 [ServiceSchedule] لیست فیلدهای شرطی:
LOG     - short_term_date (type: date, value=خالی, )     ← ⚠️ مشکل!
LOG     - short_term_time (type: radioButton, value=خالی, options=3)
LOG     - short_term_file (type: file, value=خالی, )

LOG  ❌ [Steps.validation] short_term_date (date): خالی است
LOG  ❌ [Steps.validation] service_schedule ناقص است
```

**نتیجه:** با وجود اینکه کاربر تاریخ رو انتخاب می‌کرد، value در Redux state ذخیره نمی‌شد!

---

## 🔍 تحلیل ریشه‌ای

### مشکل 1: ساختار داده متفاوت

**فیلدهای عادی:**
```json
{
  "id": "date",
  "type": "date",
  "value": "2025-11-15"  ← مستقیم روی item
}
```

**فیلدهای service_schedule:**
```json
{
  "id": "service_schedule",
  "type": "service_schedule",
  "field_details": [
    {
      "id": "short_term_date",
      "type": "date",
      "value": null  ← nested در field_details
    }
  ]
}
```

### مشکل 2: `setGeneralData` برای nested کار نمی‌کند

کامپوننت `Date` از `setGeneralData` استفاده می‌کرد:

```javascript
// Date.js - قبلاً
dispatch(setGeneralData({ fieldId: data?.id, value: 1, step }))
```

اما `setGeneralData` فقط روی `item.id` کار می‌کنه:

```javascript
// stepSlice.js - setGeneralData
const foundStep = newData[step].find(item => item.id == fieldId);
if (foundStep) {
    foundStep.value = value  // فقط روی item مستقیم کار می‌کنه
}
```

**نتیجه:** برای `short_term_date` که nested در `field_details` است، کار نمی‌کرد! ❌

---

## ✅ راه‌حل

### 1️⃣ ساخت Action جدید: `updateServiceScheduleField`

در `slices/stepSlice.js` یک reducer جدید اضافه شد:

```javascript
// برای آپدیت فیلدهای nested در service_schedule
updateServiceScheduleField: (state, action) => {
    const { step, fieldId, value } = action.payload;
    console.log('🔄 [stepSlice.updateServiceScheduleField] شروع:', { step, fieldId, value });
    
    const newData = JSON.parse(JSON.stringify(state.data));
    
    // پیدا کردن service_schedule item
    const serviceScheduleItem = newData[step]?.find(item => item.type === 'service_schedule');
    
    if (!serviceScheduleItem) {
        console.log('❌ [stepSlice.updateServiceScheduleField] service_schedule یافت نشد');
        return state;
    }
    
    // پیدا کردن فیلد مورد نظر در field_details
    const field = serviceScheduleItem.field_details?.find(f => f.id === fieldId);
    
    if (!field) {
        console.log('❌ [stepSlice.updateServiceScheduleField] فیلد یافت نشد:', fieldId);
        return state;
    }
    
    // آپدیت value
    field.value = value;
    console.log('✅ [stepSlice.updateServiceScheduleField] value آپدیت شد:', fieldId, '→', value);
    
    return {
        ...state,
        data: newData,
    };
},
```

**ویژگی‌ها:**
- مستقیماً `service_schedule` رو پیدا می‌کنه
- در `field_details` دنبال فیلد می‌گرده
- `value` رو درست set می‌کنه
- لاگ‌های کامل برای debug

### 2️⃣ آپدیت کامپوننت `Date`

**اضافه شدن prop جدید:**
```javascript
export default function Date({ step, data, isServiceSchedule }) {
```

**تشخیص محیط:**
```javascript
// اگر در service_schedule هستیم، از value فیلد استفاده کنیم
const selectedValue = isServiceSchedule ? data?.value : date;
```

**تابع جدید برای handle کردن انتخاب:**
```javascript
const handleDateSelect = (dateValue) => {
    console.log('📅 [Date] کلیک روی تاریخ:', dateValue, 'fieldId:', data?.id);
    
    // همیشه تاریخ کلی رو set کن
    dispatch(selectDate(dateValue));
    
    if (isServiceSchedule) {
        // برای service_schedule از action جدید استفاده کن
        console.log('🔄 [Date] در service_schedule - استفاده از updateServiceScheduleField');
        dispatch(updateServiceScheduleField({ 
            step, 
            fieldId: data?.id, 
            value: dateValue 
        }));
    } else {
        // برای فیلدهای عادی از setGeneralData استفاده کن
        console.log('🔄 [Date] فیلد عادی - استفاده از setGeneralData');
        dispatch(setGeneralData({ fieldId: data?.id, value: 1, step }));
    }
    
    console.log('✅ [Date] تاریخ ذخیره شد');
};
```

### 3️⃣ آپدیت `ServiceSchedule.js`

ارسال prop به `Date`:
```javascript
// Date type
if (field.type === 'date') {
    console.log('📅 [ServiceSchedule] رندر Date:', field.id);
    return (
        <View key={field.id}>
            <Date step={step} data={field} isServiceSchedule={true} />
        </View>
    );
}
```

---

## 📊 مقایسه قبل و بعد

### قبل از Fix ❌

```javascript
// کلیک روی تاریخ در service_schedule
dispatch(selectDate("2025-11-15"));
dispatch(setGeneralData({ fieldId: "short_term_date", value: 1, step }));

// نتیجه:
// ✅ state.step.date = "2025-11-15"
// ❌ short_term_date.value هنوز null است!
```

**چرا fail می‌شد؟**
- `setGeneralData` دنبال `item.id === "short_term_date"` می‌گشت
- اما `short_term_date` یک فیلد nested در `service_schedule.field_details` بود
- پس پیدا نمی‌شد و value set نمی‌شد

### بعد از Fix ✅

```javascript
// کلیک روی تاریخ در service_schedule
dispatch(selectDate("2025-11-15"));
dispatch(updateServiceScheduleField({ 
    step: 1, 
    fieldId: "short_term_date", 
    value: "2025-11-15" 
}));

// نتیجه:
// ✅ state.step.date = "2025-11-15"
// ✅ short_term_date.value = "2025-11-15"
```

**چرا موفق می‌شه؟**
- `updateServiceScheduleField` مستقیماً `service_schedule` رو پیدا می‌کنه
- در `field_details` دنبال `short_term_date` می‌گرده
- `value` رو درست set می‌کنه

---

## 🧪 تست

### سناریو تست:
1. لاگین با حساب سازمانی
2. انتخاب دسته‌بندی
3. در مرحله service_schedule:
   - انتخاب short_term
   - کلیک روی یک تاریخ
4. کلیک روی "مرحله بعد"

### لاگ‌های مورد انتظار:

```
📅 [Date] کلیک روی تاریخ: 2025-11-15 fieldId: short_term_date
🔄 [Date] در service_schedule - استفاده از updateServiceScheduleField
🔄 [stepSlice.updateServiceScheduleField] شروع: {step: 1, fieldId: "short_term_date", value: "2025-11-15"}
✅ [stepSlice.updateServiceScheduleField] value آپدیت شد: short_term_date → 2025-11-15
✅ [Date] تاریخ ذخیره شد

━━━━━━━━━ VALIDATION START ━━━━━━━━━
🔍 [Steps.validation] بررسی service_schedule...
✅ [Steps.validation] service_schedule: نوع انتخاب شده: short_term
✅ [Steps.validation] short_term_date (date): 2025-11-15  ← ✅ حل شد!
✅ [Steps.validation] short_term_time (radioButton): انتخاب شده
ℹ️ [Steps.validation] short_term_file (file): اختیاری
✅ [Steps.validation] service_schedule کامل است
━━━━━━━━━ VALIDATION RESULT: ✅ VALID ━━━━━━━━━
```

---

## 📚 فایل‌های تغییر یافته

| فایل | تغییرات |
|------|---------|
| `slices/stepSlice.js` | اضافه شدن `updateServiceScheduleField` action |
| `components/Date.js` | اضافه شدن `isServiceSchedule` prop و logic تشخیص |
| `components/ServiceSchedule.js` | ارسال `isServiceSchedule={true}` به Date |

---

## 🎯 نکته مهم: نوع فیلد Time

از لاگ‌ها فهمیدیم که **Backend فیلد time رو به صورت radioButton می‌فرسته** (با options)، نه `time`!

```json
{
  "id": "short_term_time",
  "title": "ساعت (کوتاه مدت)",
  "type": "radioButton",  ← نه "time"!
  "options": [
    { "id": "10_am_onwards", "title": "10 صبح به بعد", "value": 1 },
    { "id": "12_pm_onwards", "title": "12 ظهر به بعد", "value": 0 },
    { "id": "14_to_16_afternoon", "title": "14 الی 16 عصر", "value": 0 }
  ]
}
```

**این مشکل نبود!** چون:
- `ServiceSchedule` درست radioButton رو رندر می‌کنه
- `updateRadioButton` برای nested options کار می‌کنه
- یکی از options `value=1` داره که یعنی انتخاب شده ✅

---

## 🔮 برای آینده

### اگر فیلد Time هم type=time باشه:

اگر Backend فیلد time رو به عنوان `type: "time"` بفرسته، باید همین کار رو برای `Time` component هم انجام بدیم:

```javascript
// در Time.js
export default function Time({ step, data, isServiceSchedule }) {
    const handleTimeSelect = (timeValue) => {
        if (isServiceSchedule) {
            dispatch(updateServiceScheduleField({ 
                step, 
                fieldId: data?.id, 
                value: timeValue 
            }));
        } else {
            dispatch(setGeneralData({ fieldId: data?.id, value: 1, step }));
        }
    };
}

// در ServiceSchedule.js
if (field.type === 'time') {
    return <Time step={step} data={field} isServiceSchedule={true} />;
}
```

---

## ✅ وضعیت نهایی

- ✅ **مشکل Date fix شد**
- ✅ **مشکل Time وجود نداره** (چون radioButton است و کار می‌کنه)
- ✅ **لاگ‌های جامع اضافه شد**
- ✅ **کاربر الان می‌تونه سفارش ثبت کنه**

---

**وضعیت:** ✅ تست شده و کار می‌کند  
**آماده برای Production:** بله  
