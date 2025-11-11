# ✨ اضافه شدن دکمه ورود سازمانی به صفحه Welcome

**تاریخ**: 2025-11-10  
**فایل**: `screens/Welcome.js`

---

## 🎯 تغییر انجام شده

به صفحه خوش‌آمدید (Welcome) یک **دکمه ورود سازمانی / شرکتی** اضافه شد.

---

## 📱 UI جدید

### قبل:
```
┌─────────────────────────┐
│                         │
│         Logo            │
│                         │
│         سلام            │
│     به جوهر آینده       │
│      خوش آمدید          │
│                         │
│  (کل صفحه Clickable)    │
│                         │
└─────────────────────────┘
```

### حالا:
```
┌─────────────────────────┐
│                         │
│         Logo            │
│                         │
│         سلام            │
│     به جوهر آینده       │
│      خوش آمدید          │
│                         │
│  (کل صفحه Clickable)    │
│                         │
│  ┌───────────────────┐  │
│  │ 🏢 ورود سازمانی ← │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## 🔄 رفتار Navigation

### کلیک روی بقیه صفحه (Main Area):
```javascript
if (isAuthenticated) {
  navigate('MainApp/FolderScreen');
} else {
  navigate('SignInLanding'); // ورود فردی
}
```

### کلیک روی دکمه "ورود سازمانی":
```javascript
navigate('Grouping'); // صفحه انتخاب نوع سازمانی
```

---

## 📋 فلوی ورود سازمانی

```
Welcome
  ↓ (کلیک روی دکمه سازمانی)
Grouping (انتخاب نوع سازمانی)
  ↓
Login (ورود سازمانی)
  ↓
MainApp (اپلیکیشن اصلی)
```

---

## 🎨 استایل دکمه

```javascript
const styles = StyleSheet.create({
  organizationButton: {
    flexDirection: 'row-reverse',        // RTL
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColor1.bgColor(0.9),  // پس‌زمینه شفاف
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColor4.bgColor(0.3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,                        // Shadow در Android
  },
});
```

### ویژگی‌های ظاهری:
- ✅ آیکون Business (`business`) در سمت راست
- ✅ متن "ورود سازمانی / شرکتی" در وسط
- ✅ آیکون Arrow (`arrow-back`) در سمت چپ
- ✅ پس‌زمینه شفاف با shadow زیبا
- ✅ Border شفاف
- ✅ Position absolute در پایین صفحه

---

## 🧪 تست سناریوها

### ✅ سناریو 1: کاربر جدید
```
1. باز کردن اپ → Welcome
2. کلیک روی بقیه صفحه → SignInLanding (ورود فردی)
```

### ✅ سناریو 2: کاربر جدید (میخواد سازمانی بشه)
```
1. باز کردن اپ → Welcome
2. کلیک روی دکمه "ورود سازمانی" → Grouping
3. انتخاب نوع سازمانی → Login
4. ورود → MainApp
```

### ✅ سناریو 3: کاربر لاگین کرده
```
1. باز کردن اپ → Welcome
2. کلیک روی بقیه صفحه → MainApp/FolderScreen
```

---

## 💡 مزایا

1. ✅ **دسترسی آسان**: کاربران سازمانی راحت‌تر میتونن وارد بشن
2. ✅ **UI تمیز**: دکمه در پایین صفحه، جذاب و واضح
3. ✅ **تفکیک واضح**: کاربر فردی از سازمانی جدا شده
4. ✅ **انعطاف**: هر دو مسیر (فردی و سازمانی) در یک صفحه
5. ✅ **UX بهتر**: کاربر نمیگردنه دنبال ورود سازمانی

---

## 🔗 صفحات مرتبط

- `screens/Welcome.js` → صفحه خوش‌آمدید (تغییر یافته) ✅
- `org/logreg/Grouping.js` → انتخاب نوع سازمانی
- `org/logreg/Login.js` → ورود سازمانی
- `screens/auth/SignInLanding.js` → ورود فردی

---

## 📝 کد اضافه شده

### Import ها:
```javascript
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
```

### تابع جدید:
```javascript
const handleOrganizationPress = () => {
  navigation.navigate('Grouping');
};
```

### دکمه UI:
```javascript
<View style={styles.organizationButtonContainer}>
  <TouchableOpacity style={styles.organizationButton} onPress={handleOrganizationPress}>
    <Icon name='business' size={24} color={themeColor4.color} />
    <Text style={styles.organizationButtonText}>ورود سازمانی / شرکتی</Text>
    <Icon name='arrow-back' size={24} color={themeColor4.color} />
  </TouchableOpacity>
</View>
```

---

## ✍️ نویسنده

GitHub Copilot  
تاریخ: ۲۰ آبان ۱۴۰۴
