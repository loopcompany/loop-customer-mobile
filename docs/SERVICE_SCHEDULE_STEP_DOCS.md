# Service Schedule Step - مستندات برای توسعه‌دهنده اپلیکیشن

## نمای کلی

مرحله **"زمان نگهداری و سرویس"** یک step خاص است که فقط برای **کاربران سازمانی** (`account_type = 'organization'` یا `'company'`) نمایش داده می‌شود.

این مرحله دارای `type: "service_schedule"` است و شامل چندین فیلد شرطی (conditional) می‌باشد.

---

## شناسایی Step

```json
{
  "id": "service_schedule",
  "title": "زمان نگهداری و سرویس",
  "type": "service_schedule",
  "is_required": 1,
  "icon_name": "calendar-outline",
  "des": "نوع زمان‌بندی سرویس خود را انتخاب کنید"
}
```

**نکته مهم:** این step معمولاً در **index 0 یا 1** قرار دارد (قبل از تاریخ و آدرس).

---

## ساختار کامل JSON

```json
{
  "id": "service_schedule",
  "title": "زمان نگهداری و سرویس",
  "type": "service_schedule",
  "is_required": 1,
  "icon_name": "calendar-outline",
  "des": "نوع زمان‌بندی سرویس خود را انتخاب کنید",
  "field_details": [
    {
      "id": "main_selection",
      "title": "نوع سرویس",
      "type": "radioButton",
      "options": [
        {
          "id": "short_term",
          "title": "کوتاه مدت",
          "value": 0,
          "is_checked": 0
        },
        {
          "id": "long_term",
          "title": "بلند مدت",
          "value": 0,
          "is_checked": 0
        }
      ]
    },
    {
      "id": "long_term_duration",
      "title": "مدت زمان (بلند مدت)",
      "type": "radioButton",
      "conditional_on": "long_term",
      "options": [
        {
          "id": "60_days_every_15",
          "title": "60 روزه هر 15 روز کاری",
          "value": 0,
          "is_checked": 0
        },
        {
          "id": "120_days_every_15",
          "title": "120 روزه هر 15 روز کاری",
          "value": 0,
          "is_checked": 0
        },
        {
          "id": "120_days_every_30",
          "title": "120 روزه هر 30 روز کاری",
          "value": 0,
          "is_checked": 0
        },
        {
          "id": "1_year_every_month",
          "title": "یکسال هر یک ماه",
          "value": 0,
          "is_checked": 0
        }
      ]
    },
    {
      "id": "long_term_date",
      "title": "تاریخ شروع (بلند مدت)",
      "type": "date",
      "conditional_on": "long_term",
      "value": null
    },
    {
      "id": "long_term_time",
      "title": "ساعت (بلند مدت)",
      "type": "radioButton",
      "conditional_on": "long_term",
      "options": [
        {
          "id": "10_am_onwards",
          "title": "10 صبح به بعد",
          "value": 0,
          "is_checked": 0
        },
        {
          "id": "12_pm_onwards",
          "title": "12 ظهر به بعد",
          "value": 0,
          "is_checked": 0
        },
        {
          "id": "14_to_16_afternoon",
          "title": "14 الی 16 عصر",
          "value": 0,
          "is_checked": 0
        }
      ]
    },
    {
      "id": "long_term_file",
      "title": "بارگذاری فایل (بلند مدت)",
      "type": "file",
      "conditional_on": "long_term",
      "value": null
    },
    {
      "id": "short_term_date",
      "title": "تاریخ (کوتاه مدت)",
      "type": "date",
      "conditional_on": "short_term",
      "value": null
    },
    {
      "id": "short_term_time",
      "title": "ساعت (کوتاه مدت)",
      "type": "radioButton",
      "conditional_on": "short_term",
      "options": [
        {
          "id": "10_am_onwards",
          "title": "10 صبح به بعد",
          "value": 0,
          "is_checked": 0
        },
        {
          "id": "12_pm_onwards",
          "title": "12 ظهر به بعد",
          "value": 0,
          "is_checked": 0
        },
        {
          "id": "14_to_16_afternoon",
          "title": "14 الی 16 عصر",
          "value": 0,
          "is_checked": 0
        }
      ]
    },
    {
      "id": "short_term_file",
      "title": "بارگذاری فایل (کوتاه مدت)",
      "type": "file",
      "conditional_on": "short_term",
      "value": null
    }
  ]
}
```

---

## منطق نمایش (Display Logic)

### 1. فیلد اصلی (همیشه نمایش داده می‌شود)

```
┌─────────────────────────────────┐
│  نوع سرویس                      │
│  ○ کوتاه مدت                    │
│  ○ بلند مدت                     │
└─────────────────────────────────┘
```

**Field ID:** `main_selection`

**Type:** `radioButton`

**Options:**
- `short_term`: کوتاه مدت
- `long_term`: بلند مدت

---

### 2. وقتی "بلند مدت" انتخاب شود

فیلدهای زیر نمایش داده می‌شوند (همه `conditional_on: "long_term"`):

#### a) مدت زمان (RadioButton)
```
┌─────────────────────────────────┐
│  مدت زمان (بلند مدت)            │
│  ○ 60 روزه هر 15 روز کاری      │
│  ○ 120 روزه هر 15 روز کاری     │
│  ○ 120 روزه هر 30 روز کاری     │
│  ○ یکسال هر یک ماه              │
└─────────────────────────────────┘
```
**Field ID:** `long_term_duration`

#### b) تاریخ شروع (Date Picker)
```
┌─────────────────────────────────┐
│  تاریخ شروع (بلند مدت)          │
│  [تقویم فارسی]                  │
└─────────────────────────────────┘
```
**Field ID:** `long_term_date`

**Type:** `date`

#### c) ساعت (RadioButton)
```
┌─────────────────────────────────┐
│  ساعت (بلند مدت)                │
│  ○ 10 صبح به بعد                │
│  ○ 12 ظهر به بعد                │
│  ○ 14 الی 16 عصر                │
└─────────────────────────────────┘
```
**Field ID:** `long_term_time`

#### d) بارگذاری فایل (File Upload)
```
┌─────────────────────────────────┐
│  بارگذاری فایل (بلند مدت)       │
│  [دکمه انتخاب فایل]             │
└─────────────────────────────────┘
```
**Field ID:** `long_term_file`

**Type:** `file`

---

### 3. وقتی "کوتاه مدت" انتخاب شود

فیلدهای زیر نمایش داده می‌شوند (همه `conditional_on: "short_term"`):

#### a) تاریخ (Date Picker)
```
┌─────────────────────────────────┐
│  تاریخ (کوتاه مدت)              │
│  [تقویم فارسی]                  │
└─────────────────────────────────┘
```
**Field ID:** `short_term_date`

**Type:** `date`

#### b) ساعت (RadioButton)
```
┌─────────────────────────────────┐
│  ساعت (کوتاه مدت)               │
│  ○ 10 صبح به بعد                │
│  ○ 12 ظهر به بعد                │
│  ○ 14 الی 16 عصر                │
└─────────────────────────────────┘
```
**Field ID:** `short_term_time`

#### c) بارگذاری فایل (File Upload)
```
┌─────────────────────────────────┐
│  بارگذاری فایل (کوتاه مدت)      │
│  [دکمه انتخاب فایل]             │
└─────────────────────────────────┘
```
**Field ID:** `short_term_file`

**Type:** `file`

---

## الگوریتم نمایش در React Native / Flutter

### Pseudo Code

```javascript
function renderServiceScheduleStep(step) {
  // 1. نمایش فیلد اصلی (main_selection)
  const mainSelection = step.field_details.find(f => f.id === 'main_selection');
  renderRadioButtons(mainSelection);
  
  // 2. گرفتن انتخاب کاربر
  const selectedOption = getSelectedValue(mainSelection); // 'short_term' or 'long_term'
  
  // 3. فیلتر و نمایش فیلدهای conditional
  const conditionalFields = step.field_details.filter(f => 
    f.conditional_on === selectedOption
  );
  
  // 4. رندر فیلدهای شرطی
  conditionalFields.forEach(field => {
    switch(field.type) {
      case 'radioButton':
        renderRadioButtons(field);
        break;
      case 'date':
        renderDatePicker(field);
        break;
      case 'file':
        renderFilePicker(field);
        break;
    }
  });
}
```

---

## مثال کد React Native

```jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ServiceScheduleStep = ({ stepData }) => {
  const [selectedMain, setSelectedMain] = useState(null);
  
  // پیدا کردن فیلد اصلی
  const mainField = stepData.field_details.find(f => f.id === 'main_selection');
  
  // پیدا کردن فیلدهای شرطی بر اساس انتخاب
  const conditionalFields = stepData.field_details.filter(
    f => f.conditional_on === selectedMain
  );
  
  return (
    <View>
      {/* عنوان Step */}
      <Text style={styles.title}>{stepData.title}</Text>
      <Text style={styles.description}>{stepData.des}</Text>
      
      {/* فیلد اصلی - نوع سرویس */}
      <Text style={styles.fieldTitle}>{mainField.title}</Text>
      {mainField.options.map(option => (
        <TouchableOpacity
          key={option.id}
          onPress={() => setSelectedMain(option.id)}
          style={styles.radioOption}
        >
          <View style={[
            styles.radio,
            selectedMain === option.id && styles.radioSelected
          ]} />
          <Text>{option.title}</Text>
        </TouchableOpacity>
      ))}
      
      {/* فیلدهای شرطی */}
      {selectedMain && conditionalFields.map(field => (
        <View key={field.id}>
          <Text style={styles.fieldTitle}>{field.title}</Text>
          
          {field.type === 'radioButton' && (
            <RadioButtonGroup field={field} />
          )}
          
          {field.type === 'date' && (
            <DatePicker field={field} />
          )}
          
          {field.type === 'file' && (
            <FilePicker field={field} />
          )}
        </View>
      ))}
    </View>
  );
};

export default ServiceScheduleStep;
```

---

## Validation Rules

### فیلدهای الزامی:

1. **`main_selection`**: باید حتماً یکی از گزینه‌ها انتخاب شود
2. **بر اساس انتخاب:**

   **اگر "بلند مدت" انتخاب شد:**
   - `long_term_duration`: الزامی
   - `long_term_date`: الزامی
   - `long_term_time`: الزامی
   - `long_term_file`: اختیاری

   **اگر "کوتاه مدت" انتخاب شد:**
   - `short_term_date`: الزامی
   - `short_term_time`: الزامی
   - `short_term_file`: اختیاری

---

## ارسال داده به Backend

### ساختار JSON برای Submit

```json
{
  "service_schedule": {
    "main_selection": "long_term",  // or "short_term"
    
    // اگر long_term انتخاب شده باشد:
    "long_term_duration": "120_days_every_30",
    "long_term_date": "1403/08/17",  // تاریخ شمسی
    "long_term_time": "10_am_onwards",
    "long_term_file": "base64_encoded_file_or_path",
    
    // اگر short_term انتخاب شده باشد:
    "short_term_date": "1403/08/20",
    "short_term_time": "12_pm_onwards",
    "short_term_file": "base64_encoded_file_or_path"
  }
}
```

---

## تست و Debug

### چک کردن وجود Step

```javascript
function hasServiceScheduleStep(steps) {
  return steps.some(step => 
    Array.isArray(step) && 
    step.length > 0 && 
    step[0].type === 'service_schedule'
  );
}
```

### لاگ برای Debug

```javascript
console.log('Steps received:', steps.length);
steps.forEach((step, index) => {
  if (Array.isArray(step) && step[0]) {
    console.log(`Step ${index}:`, step[0].type, step[0].title);
  }
});
```

---

## نکات مهم

1. ✅ این step فقط برای کاربران سازمانی (`organization` / `company`) ارسال می‌شود
2. ✅ فیلدهای conditional بر اساس `conditional_on` نمایش داده می‌شوند
3. ✅ باید state management برای ردیابی انتخاب‌ها داشته باشید
4. ✅ تاریخ‌ها به صورت شمسی دریافت و ارسال می‌شوند
5. ✅ فایل‌ها می‌توانند به صورت Base64 یا با آپلود جداگانه ارسال شوند

---

## سوالات متداول (FAQ)

**Q: چرا این step در اپلیکیشن من نمایش داده نمی‌شود؟**

A: بررسی کنید:
- آیا کاربر لاگین شده `account_type = 'organization'` دارد؟
- آیا توکن اعتبارسنجی صحیح است؟
- آیا API به آدرس صحیح متصل است؟

**Q: آیا باید همه فیلدهای conditional را پر کنم؟**

A: خیر، فقط فیلدهای مربوط به گزینه انتخابی (short_term یا long_term) باید پر شوند.

**Q: فرمت تاریخ چیست؟**

A: تاریخ شمسی به فرمت `YYYY/MM/DD` مثال: `1403/08/17`

---

## تماس با Backend Team

اگر مشکلی وجود دارد یا سوالی دارید:
- لاگ کامل request و response را ذخیره کنید
- `account_type` کاربر را بررسی کنید
- تعداد steps دریافتی را چک کنید

---

**نسخه:** 1.0

**تاریخ:** 1403/08/18

**وضعیت:** ✅ تایید شده و تست شده
