# 🔧 رفع مشکل Navigation در صفحه Welcome

**تاریخ**: 2025-11-10  
**فایل**: `screens/Welcome.js`

---

## 🐛 مشکل قبلی

بعد از صفحه خوش‌آمدید (Welcome)، کاربر به صفحه `OrderMenuScreen` هدایت می‌شد که:

1. ❌ `OrderMenuScreen` یک صفحه Protected است (نیاز به تایید کامل)
2. ❌ کاربر تایید نشده صفحه محدودیت می‌دید
3. ❌ کاربر لاگین نکرده هم صفحه محدودیت می‌دید
4. ❌ UX بد: کاربر نمی‌دونست باید چیکار کنه

**کد قدیمی:**
```javascript
<TouchableWithoutFeedback
  onPress={() => {
    navigation.navigate("OrderMenuScreen"); // ❌ مشکل اینجاست!
  }}
>
```

---

## ✅ راه‌حل

حالا صفحه Welcome چک می‌کنه که کاربر لاگین کرده یا نه:

### چک Authentication
```javascript
const { isAuthenticated } = useSelector(state => state.auth);

const handlePress = () => {
  if (isAuthenticated) {
    // کاربر لاگین کرده → به صفحه اصلی
    navigation.navigate("FolderScreen");
  } else {
    // کاربر لاگین نکرده → به صفحه لاگین
    navigation.navigate("SignInLanding");
  }
};
```

---

## 📋 فلوی جدید Navigation

### سناریو 1: کاربر لاگین نکرده
```
1. App باز میشه → Landing
2. Landing چک می‌کنه: isAuthenticated = false
3. هدایت به Welcome
4. کاربر روی صفحه کلیک می‌کنه
5. ✅ هدایت به SignInLanding (صفحه لاگین)
```

### سناریو 2: کاربر لاگین کرده (هر نوع کاربر)
```
1. App باز میشه → Landing
2. Landing چک می‌کنه: isAuthenticated = true
3. ✅ هدایت مستقیم به FolderScreen (صفحه اصلی)
```

### سناریو 3: کاربر در Welcome کلیک می‌کنه (لاگین کرده)
```
1. کاربر در صفحه Welcome
2. کلیک روی صفحه
3. چک: isAuthenticated = true
4. ✅ هدایت به FolderScreen
```

---

## 🎯 مزایا

1. ✅ **UX بهتر**: کاربر لاگین نکرده به جای صفحه محدودیت، مستقیم به لاگین میره
2. ✅ **منطقی**: کاربر لاگین کرده مستقیم به صفحه اصلی میره
3. ✅ **بدون صفحه محدودیت**: دیگه کاربر صفحه "دسترسی محدود" نمی‌بینه
4. ✅ **Simple**: یک چک ساده و واضح

---

## 🔄 مقایسه قبل و بعد

| حالت | قبل | بعد |
|------|-----|-----|
| کاربر لاگین نکرده | ❌ صفحه محدودیت OrderMenuScreen | ✅ هدایت به SignInLanding |
| کاربر فردی | ❌ OrderMenuScreen (محدودیت احتمالی) | ✅ هدایت به FolderScreen |
| کاربر سازمانی (تایید نشده) | ❌ صفحه محدودیت OrderMenuScreen | ✅ هدایت به FolderScreen |
| کاربر سازمانی (تایید شده) | ✅ OrderMenuScreen | ✅ هدایت به FolderScreen |

---

## 📝 تغییرات

### فایل: `screens/Welcome.js`

**اضافه شد:**
- ✅ Import `useSelector` از Redux
- ✅ دریافت `isAuthenticated` از Redux state
- ✅ تابع `handlePress()` با چک authentication
- ✅ هدایت به `SignInLanding` برای کاربران لاگین نکرده
- ✅ هدایت به `FolderScreen` برای کاربران لاگین کرده

**حذف شد:**
- ❌ Navigation مستقیم به `OrderMenuScreen`

---

## 🧪 تست

برای تست:

1. **کاربر جدید (لاگین نکرده)**:
   - باز کردن اپ → Welcome → کلیک → SignInLanding ✅

2. **کاربر لاگین کرده**:
   - باز کردن اپ → مستقیم به FolderScreen ✅
   - اگر در Welcome باشه → کلیک → FolderScreen ✅

3. **کاربر سازمانی تایید نشده**:
   - باز کردن اپ → مستقیم به FolderScreen ✅
   - میتونه از منو به OrganizationProfile بره ✅

---

## ✍️ نویسنده

GitHub Copilot  
تاریخ: ۲۰ آبان ۱۴۰۴
