# Fix: AccessRestrictedScreen showing for unauthenticated users

## مشکل قبلی:
کاربران که هنوز لاگین نکرده بودند، AccessRestrictedScreen می‌دیدند که اشتباه بود.

## تغییرات انجام شده:

### 1. withOrganizationAccess.js
```javascript
// اضافه شد: چک کردن authentication قبل از نمایش AccessRestrictedScreen
if (!isAuthenticated) {
  console.log(`🔓 User not authenticated for ${screenName}, allowing access to original component`);
  return <WrappedComponent {...props} />;
}
```

### 2. useOrganizationAccess.js

#### تغییر در canAccessScreen:
```javascript
// قبل:
if (!userType || userType === null) {
  return false;
}

// بعد:
if (!isAuthenticated || !token) {
  return true; // اجازه دسترسی برای کاربران غیرمعرف
}

if (!userType || userType === null) {
  return false;
}
```

#### تغییر در canPlaceOrder:
```javascript
// اضافه شد:
if (!isAuthenticated || !token) {
  return true; // اجازه دسترسی برای کاربران غیرمعرف
}
```

#### تغییر در isOrganizationUser:
```javascript
// قبل:
isOrganizationUser: userType === 'organization'

// بعد:
isOrganizationUser: isAuthenticated && token && userType === 'organization'
```

## منطق جدید:

### برای کاربران غیرمعرف (unauthenticated):
- ✅ دسترسی آزاد به همه صفحات
- ✅ عدم نمایش AccessRestrictedScreen
- ✅ اجازه دسترسی به flow طبیعی اپلیکیشن
- ✅ صفحات خودشان بررسی می‌کنند که کاربر لاگین کرده یا نه

### برای کاربران معرف (authenticated):
- Individual users: دسترسی آزاد
- Organization users: بررسی وضعیت تایید

## نتیجه:
حالا کاربران غیرمعرف AccessRestrictedScreen نمی‌بینند و می‌توانند به طور طبیعی در اپلیکیشن navigate کنند تا برسند به صفحه لاگین.