# راهنمای گام‌به‌گام: جایگزینی Colors با themeColor

## 🎯 هدف
جایگزینی تمام استفاده‌های `Colors.` با `themeColor` در پروژه

---

## 📋 لیست فایل‌های نیازمند تغییر (اولویت‌بندی شده)

### 🔴 اولویت خیلی بالا (بیشترین استفاده)
1. ✅ `theme/Color.js` - حذف Colors object
2. ⏳ `components/AccessRestrictedScreen.js` (~40 استفاده)
3. ⏳ `screens/organization/OrganizationContractScreen.js` (~35 استفاده)
4. ⏳ `screens/organization/OrganizationProfileScreen.js` (~15 استفاده)
5. ⏳ `components/ProtectedOrderButton.js` (~10 استفاده)

---

## 🔧 روش Find & Replace در VS Code

### مرحله 1: باز کردن Find & Replace
1. `Ctrl + H` (یا `Cmd + H` در Mac)
2. در بخش Find: `Colors\.` را بزنید (با نقطه)
3. گزینه **Regex** را فعال کنید (آیکون `.*`)

### مرحله 2: جایگزینی‌های دستی

برای هر فایل، به ترتیب این جایگزینی‌ها را انجام دهید:

#### 🔹 برای backgroundColor, bgColor, background:
```
Find: Colors\.white
Replace: themeColor4.bgColor(1)

Find: Colors\.lightGray
Replace: themeColor5.bgColor(1)

Find: Colors\.gray
Replace: themeColor3.bgColor(1)

Find: Colors\.red
Replace: themeColor6.bgColor(1)

Find: Colors\.green  
Replace: themeColor7.bgColor(1)

Find: Colors\.orange
Replace: themeColor11.bgColor(1)

Find: Colors\.blue
Replace: themeColor2.bgColor(1)

Find: Colors\.lightBlue
Replace: themeColor8.bgColor(1)

Find: Colors\.primary
Replace: themeColor0.bgColor(1)

Find: Colors\.secondary
Replace: themeColor1.bgColor(1)

Find: Colors\.purple
Replace: themeColor9.bgColor(1)

Find: Colors\.black
Replace: themeColor10.bgColor(1)

Find: Colors\.darkGray
Replace: themeColor12.bgColor(1)

Find: Colors\.darkBlue
Replace: themeColor13.bgColor(1)
```

#### 🔹 برای color, tintColor, borderColor (icon ها و text ها):
بعد از جایگزینی بالا، خطوطی که `color:` دارند را پیدا کنید و `.bgColor(1)` را با `.color` عوض کنید:

```
Find: color: themeColor(\d+)\.bgColor\(1\)
Replace: color: themeColor$1.color

Find: tintColor: themeColor(\d+)\.bgColor\(1\)
Replace: tintColor: themeColor$1.color

Find: borderColor: themeColor(\d+)\.bgColor\(1\)
Replace: borderColor: themeColor$1.color
```

### مرحله 3: بروزرسانی Imports

بعد از جایگزینی Colors، باید import را بروزرسانی کنید:

```javascript
// ❌ قبل
import { Colors } from '../theme/Color';

// ✅ بعد
import { themeColor0, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
```

**نکته:** فقط themeColor هایی را import کنید که در فایل استفاده شده‌اند.

---

## 📝 مثال عملی

### قبل:
```javascript
import { Colors } from '../theme/Color';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  text: {
    color: Colors.black,
  },
  icon: {
    color: Colors.primary,
  },
});
```

### بعد:
```javascript
import { themeColor0, themeColor4, themeColor10 } from '../theme/Color';

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColor4.bgColor(1),
  },
  text: {
    color: themeColor10.color,
  },
  icon: {
    color: themeColor0.color,
  },
});
```

---

## ⚠️ نکات مهم

### 1. تفاوت .color و .bgColor(1)
- **استفاده از `.bgColor(1)`**: برای backgroundColor, background
- **استفاده از `.color`**: برای color, tintColor, borderColor, shadowColor

### 2. ترتیب جایگزینی
همیشه **ابتدا** تمام Colors را با themeColor.bgColor(1) جایگزین کنید، **سپس** موارد color را اصلاح کنید.

### 3. بررسی دقیق
بعد از هر فایل، یک بار سریع بررسی کنید که:
- ✅ هیچ `Colors.` باقی نمانده
- ✅ import ها درست هستند  
- ✅ .color و .bgColor(1) درست استفاده شده‌اند

---

## 🔍 پیدا کردن فایل‌های باقیمانده

برای اطمینان از اینکه همه فایل‌ها update شده‌اند:

```bash
# در VS Code: Ctrl+Shift+F
# جستجو: Colors\.
```

اگر هیچ نتیجه‌ای پیدا نشد، کار تمام است! 🎉

---

## 📊 پیشرفت

### کامل شده:
- ✅ theme/Color.js

### در حال انجام:
- ⏳ components/AccessRestrictedScreen.js (شروع شده، نیازمند تکمیل)
- ⏳ ~95 فایل دیگر

---

## 💡 نکته نهایی

اگر تعداد فایل‌ها خیلی زیاد است و دستی زمان‌بر است، می‌توانیم:
1. Object Colors را با مقادیر صحیح برگردانیم (راه سریع)
2. یا کم‌کم فایل به فایل migrate کنیم

**تصمیم با شماست!** 😊

---

**تاریخ:** 2025-11-09  
**وضعیت:** 🔨 در حال انجام (2% تکمیل)
