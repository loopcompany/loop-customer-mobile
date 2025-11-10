# 🔒 Security Fix: Access Control System

**تاریخ**: 2025-11-10  
**نوع**: Critical Security Fixes  
**تأثیر**: High Priority

---

## 📋 خلاصه تغییرات

این بروزرسانی **8 باگ امنیتی و منطقی** در سیستم کنترل دسترسی کاربران سازمانی را رفع می‌کند.

---

## 🚨 باگ‌های رفع شده

### 1️⃣ **[CRITICAL] دسترسی آزاد برای کاربران logout شده**

**قبل از رفع:**
```javascript
if (userType !== 'organization' || !token || !isAuthenticated) {
  dispatch(setAccessStatus({
    has_complete_access: true  // ❌ خطرناک!
  }));
  return;
}
```

**بعد از رفع:**
```javascript
// 🔒 SECURITY: فقط کاربران احراز هویت شده
if (!token || !isAuthenticated) {
  return; // هیچ دسترسی نمی‌دهیم
}

if (userType === 'individual') {
  dispatch(setAccessStatus({
    has_complete_access: true // ✅ فقط برای individual
  }));
  return;
}

// اگر userType هنوز مشخص نیست، منتظر می‌مانیم
if (!userType || userType === null) {
  return;
}
```

**تأثیر**: یک کاربر logout شده دیگر نمی‌تواند به صفحات محافظت شده دسترسی داشته باشد.

---

### 2️⃣ **[HIGH] Race Condition در useEffect ها**

**قبل از رفع:**
```javascript
// دو useEffect تکراری که هر دو fetchAccessStatus را صدا می‌زدند
useEffect(() => {
  fetchAccessStatus();
}, [fetchAccessStatus]);

useEffect(() => {
  if (isAuthenticated && token) {
    fetchAccessStatus();
  }
}, [userType, token, isAuthenticated, fetchAccessStatus]);
```

**بعد از رفع:**
```javascript
// 🔧 FIX: فقط یک useEffect
useEffect(() => {
  if (isAuthenticated && token && userType) {
    fetchAccessStatus();
  }
}, [userType, token, isAuthenticated]);
```

**تأثیر**: کاهش درخواست‌های API تکراری و جلوگیری از data inconsistency.

---

### 3️⃣ **[HIGH] دسترسی موقت قبل از لود اطلاعات**

**قبل از رفع:**
```javascript
const actualHasCompleteAccess = userType === 'organization' 
  ? (hasCompleteAccess === true)
  : true; // ❌ اگر userType === null باشه، true میشه!
```

**بعد از رفع:**
```javascript
const actualHasCompleteAccess = (() => {
  // 🔒 اگر لاگین نکرده، هیچ دسترسی نداره
  if (!isAuthenticated || !token) return false;
  
  // اگر userType هنوز مشخص نیست، محدود باشه
  if (!userType || userType === null) return false;
  
  // کاربران فردی دسترسی آزاد
  if (userType === 'individual') return true;
  
  // کاربران سازمانی فقط با تایید کامل
  if (userType === 'organization') {
    return hasCompleteAccess === true;
  }
  
  return false;
})();
```

**تأثیر**: کاربران سازمانی در cold start دیگر دسترسی موقت ندارند.

---

### 4️⃣ **[MEDIUM] null/undefined در canAccessScreen**

**قبل از رفع:**
```javascript
const canAccessScreen = useCallback((screenName) => {
  if (userType !== 'organization') {
    return true; // ❌ اگر userType === null، true میشه
  }
  //...
```

**بعد از رفع:**
```javascript
const canAccessScreen = useCallback((screenName) => {
  // 🔒 اگر userType مشخص نیست، دسترسی ندهیم
  if (!userType || userType === null) return false;
  
  if (userType === 'individual') return true;
  
  if (userType !== 'organization') return false;
  //...
```

**تأثیر**: جلوگیری از دسترسی زودهنگام به صفحات.

---

### 5️⃣ **[MEDIUM] دکمه فعال قبل از چک دسترسی**

**فایل**: `ProtectedOrderButton.js`

**قبل از رفع:**
```javascript
const handlePress = () => {
  if (!isOrganizationUser || canPlaceOrder()) {
    // اجرا میشه ❌
  }
```

**بعد از رفع:**
```javascript
const handlePress = () => {
  // 🔒 اگر userType مشخص نیست، اجازه ندهیم
  if (!userType || userType === null) {
    showAlert('لطفا صبر کنید', 'در حال بررسی وضعیت کاربر...');
    return;
  }
  
  if (userType === 'individual' || canPlaceOrder()) {
    // ✅ فقط با userType مشخص
  }
```

**تأثیر**: دکمه در حالت loading غیرفعال است.

---

### 6️⃣ **[MEDIUM] withOrganizationAccess بدون چک userType**

**فایل**: `withOrganizationAccess.js`

**قبل از رفع:**
```javascript
if (!isOrganizationUser) {
  return <WrappedComponent {...props} />; // ❌ اگر userType === null
}
```

**بعد از رفع:**
```javascript
// 🔒 اگر userType مشخص نیست، منتظر بمانیم
if (isAuthenticated && (!userType || userType === null)) {
  return <Loader />;
}

// فقط برای individual صریح
if (userType === 'individual') {
  return <WrappedComponent {...props} />;
}
```

**تأثیر**: نمایش loader تا زمان مشخص شدن نوع کاربر.

---

### 7️⃣ **[LOW] بهبود UI - محدودیت طول پیام rejection**

**فایل**: `AccessRestrictedScreen.js`

```javascript
// اضافه شد numberOfLines={3}
<Text style={styles.rejectionReason} numberOfLines={3}>
  دلیل رد: {profileRejectionReason}
</Text>
```

**تأثیر**: پیام‌های طولانی UI را نمی‌شکنند.

---

### 8️⃣ **[LOW] بهبود organizationSlice - کامنت اضافه**

**فایل**: `organizationSlice.js`

```javascript
// 🔒 Update complete access based on both statuses
// فقط اگر هر دو approved باشند، دسترسی کامل بده
state.hasCompleteAccess = 
  action.payload === 'approved' && 
  state.contractStatus === 'approved';
```

**تأثیر**: کد واضح‌تر و قابل نگهداری‌تر.

---

## 📝 فایل‌های تغییر یافته

| فایل | تعداد تغییرات | نوع |
|------|---------------|-----|
| `hooks/useOrganizationAccess.js` | Major | 🔴 Critical |
| `components/withOrganizationAccess.js` | Major | 🔴 Critical |
| `components/ProtectedOrderButton.js` | Medium | 🟠 High |
| `slices/organizationSlice.js` | Minor | 🟡 Medium |
| `components/AccessRestrictedScreen.js` | Minor | 🟢 Low |

---

## ✅ سناریوهای تست شده

### ✅ سناریو 1: کاربر logout شده
- **قبل**: دسترسی آزاد داشت ❌
- **بعد**: هیچ دسترسی ندارد ✅

### ✅ سناریو 2: Cold start (اپلیکیشن تازه باز شده)
- **قبل**: دسترسی موقت تا لود userType ❌
- **بعد**: نمایش loader تا مشخص شدن نوع کاربر ✅

### ✅ سناریو 3: کاربر سازمانی تایید نشده
- **قبل**: ممکن بود دسترسی موقت بگیرد ❌
- **بعد**: محدود تا زمان تایید کامل ✅

### ✅ سناریو 4: Network error
- **قبل**: ممکن بود دسترسی بده ❌
- **بعد**: دسترسی محدود می‌ماند ✅

### ✅ سناریو 5: کاربر فردی
- **قبل**: کار می‌کرد ✅
- **بعد**: همچنان کار می‌کند ✅

---

## 🔐 اصول امنیتی اعمال شده

### 1. **Principle of Least Privilege**
```javascript
// پیش‌فرض: دسترسی محدود
// تنها پس از تایید: دسترسی آزاد
if (!isAuthenticated || !token) return false;
if (!userType || userType === null) return false;
```

### 2. **Explicit is better than Implicit**
```javascript
// ✅ صریح و واضح
if (userType === 'individual') return true;
if (userType === 'organization') return hasCompleteAccess === true;

// ❌ نه این (ضمنی و خطرناک)
if (userType !== 'organization') return true;
```

### 3. **Fail Secure**
```javascript
// در هر حالت نامشخص یا خطا، دسترسی محدود
return false; // default
```

### 4. **Defense in Depth**
```javascript
// چند لایه چک:
// 1. useOrganizationAccess hook
// 2. withOrganizationAccess HOC
// 3. ProtectedOrderButton component
// 4. canAccessScreen / canPlaceOrder functions
```

---

## 🚀 مراحل بعدی (پیشنهادی)

### اولویت بالا:
1. ✅ تست دستی همه سناریوها
2. ⏳ اضافه کردن unit tests
3. ⏳ اضافه کردن integration tests

### اولویت متوسط:
4. ⏳ بررسی performance (بخصوص useCallback dependencies)
5. ⏳ اضافه کردن logging برای monitoring

### اولویت پایین:
6. ⏳ بهبود error messages
7. ⏳ اضافه کردن i18n برای پیام‌های خطا

---

## 📞 سوالات متداول

**Q: آیا این تغییرات breaking change هستند؟**  
A: خیر، فقط رفتار امنیتی را بهبود می‌دهند. کاربران عادی تفاوتی احساس نمی‌کنند.

**Q: آیا نیاز به migration دیتابیس است؟**  
A: خیر، فقط تغییرات frontend است.

**Q: آیا باید کش پاک شود؟**  
A: پیشنهاد می‌شود کاربران logout/login کنند برای اطمینان.

---

## ✍️ نویسنده

GitHub Copilot - Security & Code Quality Team  
تاریخ: ۲۰ آبان ۱۴۰۴ (November 10, 2025)

---

## 🏷️ Tags

`security` `critical-fix` `access-control` `authentication` `bug-fix` `organization-users`
