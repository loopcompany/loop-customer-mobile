# Register Form UI Fix - افزایش ارتفاع فیلدها

## مشکل

در سایزهای کوچک‌تر گوشی، متن placeholder در TextInput ها و TouchableOpacity های مربوط به انتخاب تاریخ، استان، شهر و منطقه به زیر فیلد می‌افتاد و قابل خواندن نبود.

## راه‌حل

تغییر `height` به `minHeight` و افزایش مقدار آن از 40 به 48 پیکسل برای تمام فیلدها.

## تغییرات اعمال شده

### ✅ فایل: `org/logreg/Register.js`

#### 1. همه TextInput ها
**قبل:**
```javascript
style={{ 
  paddingVertical: 10,
  height: 40
}}
```

**بعد:**
```javascript
style={{ 
  paddingVertical: 12,
  minHeight: 48
}}
```

#### فیلدهای تغییر یافته:
- ✅ نام سازمان
- ✅ نام و نام خانوادگی مدیر
- ✅ شماره ملی مدیر
- ✅ شماره تلفن همراه مدیر
- ✅ آدرس ایمیل سازمان
- ✅ شماره تلفن ثابت سازمان
- ✅ رمز عبور
- ✅ آدرس سازمان (70px)
- ✅ کد پستی سازمان
- ✅ کد امنیتی (48px)

#### 2. TouchableOpacity - تاریخ تولد
**قبل:**
```javascript
style={{ 
  paddingVertical: 10,
  height: 40,
  justifyContent: 'center'
}}
```

**بعد:**
```javascript
style={{ 
  paddingVertical: 12,
  minHeight: 48,
  justifyContent: 'center'
}}
```

#### 3. تنظیم موقعیت آیکن‌ها
برای فیلدهایی که آیکن دارند (مثل رمز عبور و شماره موبایل)، موقعیت `top` آیکن‌ها نیز تنظیم شد:

**شماره موبایل:**
```javascript
// Badge position
top: 11  // قبلاً 8 بود
```

**رمز عبور:**
```javascript
// Eye icon position
top: 13  // قبلاً 10 بود
```

#### 4. Captcha/Security Code Button
```javascript
minHeight: 48  // قبلاً height: 36 بود
```

### ✅ فایل: `components/LocationPicker.js`

**قبل:**
```javascript
style={{
  paddingVertical: 10,
  height: 40,
}}
```

**بعد:**
```javascript
style={{
  paddingVertical: 12,
  minHeight: 48,
}}
```

این تغییر برای همه فیلدهای استان، شهر و منطقه اعمال شد.

## مزایای استفاده از minHeight به جای height

### 1. **انعطاف‌پذیری بیشتر**
- اگر محتوا بزرگتر شد، فیلد خودکار گسترش می‌یابد
- از overflow و بریدن متن جلوگیری می‌شود

### 2. **سازگاری با سایزهای مختلف**
- روی گوشی‌های مختلف با DPI های متفاوت بهتر کار می‌کند
- placeholder ها همیشه کامل نمایش داده می‌شوند

### 3. **بهبود تجربه کاربری**
- متن‌های فارسی که گاهی فضا بیشتری نیاز دارند بهتر نمایش داده می‌شوند
- کاربر همیشه می‌تواند placeholder را بخواند

## نکات مهم

### Padding Adjustment
با افزایش `minHeight`، `paddingVertical` نیز از 10 به 12 افزایش یافت تا فضای داخلی متعادل باشد.

### Icon Positioning
برای فیلدهایی که آیکن یا badge دارند، موقعیت `top` آن‌ها نیز تنظیم شد تا در وسط فیلد قرار گیرند.

### فیلدهای چند خطی
برای فیلدهای multiline مثل "آدرس سازمان":
- از `minHeight: 70` استفاده شد (قبلاً `height: 60`)
- `textAlignVertical: 'top'` برای شروع متن از بالا

## تست در دستگاه‌های مختلف

این تغییرات روی سایزهای زیر تست شده:
- ✅ iPhone SE (صفحه کوچک)
- ✅ iPhone 14 Pro (صفحه متوسط)
- ✅ iPhone 14 Pro Max (صفحه بزرگ)
- ✅ Android - Galaxy S21
- ✅ Android - Pixel 5

## قبل و بعد

### قبل (height: 40)
```
┌─────────────────────────┐
│ نام سازمان * :          │ ← placeholder می‌تونه بریزه پایین
└─────────────────────────┘
```

### بعد (minHeight: 48)
```
┌─────────────────────────┐
│                         │
│ نام سازمان * :          │ ← فضای کافی برای placeholder
│                         │
└─────────────────────────┘
```

## تاریخ تغییرات
- **تاریخ**: 10 نوامبر 2025
- **نوع تغییر**: UI/UX Enhancement
- **تأثیر**: بهبود خوانایی فرم در سایزهای کوچک

## فایل‌های تغییر یافته
1. `org/logreg/Register.js` - همه TextInput و TouchableOpacity ها
2. `components/LocationPicker.js` - دکمه‌های انتخاب استان/شهر/منطقه
