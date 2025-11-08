# 👁️ تغییر آیکن چشم در فیلدهای رمز عبور

## 📝 خلاصه تغییرات

استیکرهای چشم (👁️ و 👁️‍🗨️) در فیلدهای رمز عبور با آیکن‌های حرفه‌ای **Ionicons** جایگزین شدند.

---

## 🎯 فایل‌های تغییر یافته

### 1️⃣ `org/logreg/Login.js` - صفحه ورود

**قبل:**
```jsx
<Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
```

**بعد:**
```jsx
<Ionicons 
  name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
  size={22} 
  color="#666" 
/>
```

**Import اضافه شده:**
```jsx
import { Ionicons } from '@expo/vector-icons';
```

---

### 2️⃣ `org/logreg/OrganizationResetPassword.js` - صفحه تغییر رمز عبور

#### الف) فیلد "رمز عبور جدید"

**قبل:**
```jsx
<Text style={{ fontSize: 20 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
```

**بعد:**
```jsx
<Ionicons 
  name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
  size={22} 
  color="#666" 
/>
```

#### ب) فیلد "تکرار رمز عبور جدید"

**قبل:**
```jsx
<Text style={{ fontSize: 20 }}>
  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
</Text>
```

**بعد:**
```jsx
<Ionicons 
  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
  size={22} 
  color="#666" 
/>
```

**Import اضافه شده:**
```jsx
import { Ionicons } from '@expo/vector-icons';
```

---

## 🎨 نمای ویژوال

### قبل (استیکر):
```
┌─────────────────────────────────┐
│  رمز عبور    👁️‍🗨️            │  ← استیکر
└─────────────────────────────────┘
```

### بعد (آیکن):
```
┌─────────────────────────────────┐
│  رمز عبور    👁️ (outlined)    │  ← آیکن Ionicons
└─────────────────────────────────┘
```

---

## 📊 مشخصات آیکن

| ویژگی | مقدار |
|-------|-------|
| **کتابخانه** | @expo/vector-icons (Ionicons) |
| **آیکن باز** | `eye-outline` |
| **آیکن بسته** | `eye-off-outline` |
| **اندازه** | 22 پیکسل |
| **رنگ** | #666 (خاکستری) |
| **موقعیت** | left: 15px |

---

## ✅ مزایای آیکن نسبت به استیکر

1. **یکپارچگی بصری**: آیکن‌ها با طراحی UI هماهنگ‌تر هستند
2. **وضوح بیشتر**: در تمام اندازه‌های صفحه نمایش واضح هستند (Vector)
3. **سفارشی‌سازی**: قابلیت تغییر رنگ و اندازه دارند
4. **حرفه‌ای‌تر**: ظاهر حرفه‌ای‌تری نسبت به استیکر دارند
5. **سازگاری**: با تم و رنگ‌بندی اپلیکیشن سازگارند

---

## 🔄 منطق نمایش

```javascript
// وقتی showPassword = true
<Ionicons name="eye-outline" />     // چشم باز - رمز قابل مشاهده

// وقتی showPassword = false  
<Ionicons name="eye-off-outline" /> // چشم بسته - رمز مخفی
```

---

## 📱 صفحاتی که آپدیت شدند

- ✅ **Register.js** - ثبت‌نام سازمانی (1 فیلد رمز عبور)
- ✅ **Login.js** - ورود سازمانی (1 فیلد رمز عبور)
- ✅ **OrganizationResetPassword.js** - تغییر رمز عبور (2 فیلد رمز عبور)

---

## 🧪 تست

### تست‌های مورد نیاز:

1. **صفحه ورود:**
   - ✅ کلیک روی آیکن چشم → رمز نمایش داده شود
   - ✅ کلیک مجدد → رمز مخفی شود
   - ✅ آیکن به درستی تغییر کند (eye-outline ↔ eye-off-outline)

2. **صفحه تغییر رمز عبور:**
   - ✅ هر دو فیلد رمز عبور مستقل عمل کنند
   - ✅ آیکن‌ها به درستی نمایش داده شوند
   - ✅ رنگ و اندازه آیکن‌ها یکسان باشد

---

## 🎯 کد نهایی

### در Login.js:
```jsx
<TouchableOpacity 
  onPress={() => setShowPassword(!showPassword)}
  style={{ 
    position: 'absolute', 
    left: 12, 
    top: 10, 
    zIndex: 1 
  }}
>
  <Ionicons 
    name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
    size={22} 
    color="#666" 
  />
</TouchableOpacity>
```

### در OrganizationResetPassword.js:
```jsx
{/* برای رمز عبور جدید */}
<TouchableOpacity
  onPress={() => setShowPassword(!showPassword)}
  style={{
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  }}
>
  <Ionicons 
    name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
    size={22} 
    color="#666" 
  />
</TouchableOpacity>

{/* برای تکرار رمز عبور */}
<TouchableOpacity
  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
  style={{
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  }}
>
  <Ionicons 
    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
    size={22} 
    color="#666" 
  />
</TouchableOpacity>
```

---

## 📚 مستندات Ionicons

- **وبسایت**: https://ionic.io/ionicons
- **در Expo**: از `@expo/vector-icons` استفاده می‌شود
- **آیکن‌های مرتبط**:
  - `eye-outline` - چشم باز (خطی)
  - `eye-off-outline` - چشم بسته (خطی)
  - `eye` - چشم باز (پر)
  - `eye-off` - چشم بسته (پر)

---

## ✅ وضعیت نهایی

- ✅ Import Ionicons اضافه شد
- ✅ استیکرها حذف شدند
- ✅ آیکن‌های حرفه‌ای جایگزین شدند
- ✅ بدون خطا
- ✅ آماده تست

---

**تاریخ تغییر**: 2025-11-08  
**فایل‌های تغییر یافته**: 3 فایل  
**تعداد آیکن‌های جایگزین شده**: 4 مورد (1 در Register + 1 در Login + 2 در ResetPassword)
