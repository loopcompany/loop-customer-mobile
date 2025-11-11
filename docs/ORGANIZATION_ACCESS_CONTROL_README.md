# Organization Access Control System

سیستم کنترل دسترسی سازمانی برای محدود کردن دسترسی کاربران سازمانی تا زمان تایید پروفایل و قرارداد آن‌ها.

## معماری سیستم

### 1. Hook اصلی: `useOrganizationAccess`

```javascript
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';

const {
  // وضعیت کاربر
  isOrganizationUser,
  hasCompleteAccess,
  profileStatus,
  contractStatus,
  
  // توابع کنترل
  canAccessScreen,
  canPlaceOrder,
  
  // مدیریت داده
  refetch,
  clearAccess,
  
  // وضعیت‌های loading/error
  loading,
  error
} = useOrganizationAccess();
```

### 2. Higher-Order Component: `withOrganizationAccess`

```javascript
import { withOrganizationAccess, ACCESS_PRESETS } from '../components/withOrganizationAccess';

// استفاده ساده
const ProtectedComponent = withOrganizationAccess(MyComponent, {
  screenName: 'FolderScreen',
  requireCompleteAccess: true
});

// با preset تعریف شده
const OrderScreen = withOrganizationAccess(MyOrderScreen, ACCESS_PRESETS.ORDER_RELATED);

// با تنظیمات سفارشی
const CustomScreen = withOrganizationAccess(MyScreen, {
  customAccessCheck: ({ isOrganizationUser, hasCompleteAccess }) => ({
    allowed: !isOrganizationUser || hasCompleteAccess,
    title: "دسترسی محدود",
    message: "شما نیاز به تایید دارید"
  })
});
```

## نحوه پیاده‌سازی

### مرحله ۱: محافظت از صفحات

```javascript
// در فایل صفحه مورد نظر
import { withOrganizationAccess, ACCESS_PRESETS } from '../components/withOrganizationAccess';

const FolderScreen = ({ navigation }) => {
  // کدهای صفحه...
};

// اعمال محافظت
export default withOrganizationAccess(FolderScreen, ACCESS_PRESETS.ORDER_RELATED);
```

### مرحله ۲: چک کردن دسترسی در کامپوننت‌ها

```javascript
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';

const OrderButton = () => {
  const { canPlaceOrder, getBlockedMessage } = useOrganizationAccess();
  
  if (!canPlaceOrder()) {
    return (
      <View>
        <Text>{getBlockedMessage()}</Text>
        <Button title="مشاهده وضعیت" onPress={() => navigation.navigate('AccessRestrictedScreen')} />
      </View>
    );
  }
  
  return <Button title="ثبت سفارش" onPress={handleOrder} />;
};
```

## صفحات محافظت شده

### صفحات Order Flow (نیاز به تایید کامل):
- `FolderScreen` - انتخاب دسته خدمات
- `SubCategories` - زیردسته‌ها
- `Steps` - مراحل سفارش
- `Preview` - پیش‌نمایش سفارش
- `Details` - جزئیات سفارش
- `OrdersScreen` - لیست سفارش‌ها
- `Invoice` - فاکتور
- `OrderMenuScreen` - منوی سفارش
- `CanceledOrdersScreen` - سفارش‌های لغو شده

### صفحات مجاز (بدون محدودیت):
- `OrganizationProfile` - پروفایل سازمان
- `OrganizationContract` - قرارداد سازمان  
- `Profile` - پروفایل کاربری
- `AddressScreen` - آدرس‌ها
- `PaymentScreen` - پرداخت
- تمام صفحات احراز هویت

## وضعیت‌های کاربر

### کاربر فردی (Individual):
- دسترسی آزاد به تمام صفحات
- بدون محدودیت

### کاربر سازمانی (Organization):
#### حالت‌های Profile:
- `pending`: در انتظار تایید
- `approved`: تایید شده
- `rejected`: رد شده

#### حالت‌های Contract:
- `pending`: در انتظار تایید
- `approved`: تایید شده  
- `rejected`: رد شده

#### دسترسی کامل:
فقط زمانی که هم Profile و هم Contract در وضعیت `approved` باشند.

## مدیریت Performance

### Caching System:
```javascript
import { organizationAccessCache, PERFORMANCE_CONFIGS } from '../utils/performanceOptimization';

// Manual cache management
organizationAccessCache.set('key', data, PERFORMANCE_CONFIGS.CACHE_TTL);
const cachedData = organizationAccessCache.get('key');
organizationAccessCache.delete('key');
```

### Debouncing:
```javascript
import { useDebouncedCallback } from '../utils/performanceOptimization';

const debouncedFunction = useDebouncedCallback(
  () => console.log('Called after delay'),
  500,
  [dependency]
);
```

## تست و دیباگ

### Integration Test:
```javascript
import { runIntegrationTest, runSmokeTest } from '../utils/organizationAccessTests';

// تست کامل سیستم
await runIntegrationTest();

// تست سریع
runSmokeTest();
```

### Performance Monitoring:
```javascript
import { performanceMonitor } from '../utils/organizationAccessDebug';

// مشاهده آمار performance
console.log(performanceMonitor.getStats());

// ریست کردن آمار
performanceMonitor.reset();
```

### دیباگ سیستم:
```javascript
import { debugOrganizationAccess, testScreenAccess } from '../utils/organizationAccessDebug';

// وضعیت فعلی سیستم
const status = debugOrganizationAccess();

// تست دسترسی صفحات
const results = testScreenAccess(['FolderScreen', 'Profile']);
```

## مدیریت خطا

### API Error Handling:
سیستم به‌طور خودکار خطاهای API را handle می‌کند:

```javascript
// خطاهای مدیریت شده:
// 401: Token منقضی شده - redirect به login
// 403: کاربر سازمانی بدون دسترسی - redirect به AccessRestrictedScreen
// 500: خطای سرور - نمایش پیام خطا
```

### Axios Interceptors:
```javascript
// در services/axiosConfig.js
axios.interceptors.response.use(
  response => response,
  error => handleOrganizationApiError(error, navigation)
);
```

## نکات مهم

### ۱. Security:
- دسترسی پیش‌فرض همیشه محدود است
- فقط بعد از تایید صریح، دسترسی داده می‌شود
- تمام چک‌های دسترسی در سمت کلاینت و سرور انجام شود

### ۲. Performance:
- Cache با TTL 5 دقیقه
- Debouncing برای API calls
- Lazy loading برای کامپوننت‌های سنگین

### ۳. UX:
- Loading states مناسب
- پیام‌های خطای واضح
- راهنمایی برای مراحل بعدی

### ۴. Development:
- Debug utilities موجود
- Integration tests آماده
- Performance monitoring فعال

## مثال کامل

```javascript
// MyProtectedScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import { withOrganizationAccess, ACCESS_PRESETS } from '../components/withOrganizationAccess';
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';

const MyScreen = ({ navigation }) => {
  const { canPlaceOrder, profileStatus, contractStatus } = useOrganizationAccess();
  
  return (
    <View>
      <Text>صفحه محافظت شده</Text>
      <Text>وضعیت پروفایل: {profileStatus}</Text>
      <Text>وضعیت قرارداد: {contractStatus}</Text>
      
      {canPlaceOrder() ? (
        <Button title="ثبت سفارش" onPress={() => {}} />
      ) : (
        <Button 
          title="تکمیل اطلاعات" 
          onPress={() => navigation.navigate('OrganizationProfile')} 
        />
      )}
    </View>
  );
};

export default withOrganizationAccess(MyScreen, ACCESS_PRESETS.ORDER_RELATED);
```

## Troubleshooting

### مشکلات رایج:

1. **صفحه همیشه AccessRestricted نشان می‌دهد:**
   - بررسی کنید API endpoint `/api/organization/profile/status` کار می‌کند
   - Token معتبر و موجود باشد
   - Redux state به درستی update شود

2. **Performance کند:**
   - Cache TTL را بررسی کنید
   - Debounce settings را تنظیم کنید
   - Network requests را monitor کنید

3. **Navigation مشکل دارد:**
   - AccessRestrictedScreen در App.js اضافه شده باشد
   - Navigation reference در axios config درست باشد