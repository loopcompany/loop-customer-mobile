# کنترل دسترسی کاربران سازمانی - راهنمای استفاده

## 📖 مقدمه

سیستم کنترل دسترسی کاربران سازمانی امکان محدود کردن دسترسی کاربران سازمانی تا زمان تایید اطلاعات پروفایل و قرارداد آن‌ها توسط ادمین را فراهم می‌کند.

## 🎯 هدف

کاربران سازمانی تا زمانی که هم پروفایل و هم قرارداد آن‌ها تایید نشده، فقط به صفحات محدودی دسترسی دارند:
- صفحه ویرایش پروفایل سازمانی
- صفحه مدیریت قرارداد
- صفحات اکانت عمومی

## 🏗️ معماری سیستم

### 1. Hook: `useOrganizationAccess`

Hook اصلی برای مدیریت وضعیت دسترسی کاربران سازمانی.

```javascript
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';

function MyComponent() {
  const {
    hasCompleteAccess,
    isOrganizationUser,
    canAccessScreen,
    canPlaceOrder,
    profileStatus,
    contractStatus,
    loading,
    refetch
  } = useOrganizationAccess();

  if (isOrganizationUser && !hasCompleteAccess) {
    return <div>دسترسی محدود</div>;
  }

  return <div>محتوای اصلی</div>;
}
```

#### ویژگی‌های Hook:

- **hasCompleteAccess**: آیا کاربر دسترسی کامل دارد؟
- **isOrganizationUser**: آیا کاربر سازمانی است؟
- **canAccessScreen(screenName)**: چک دسترسی به صفحه خاص
- **canPlaceOrder()**: امکان ثبت سفارش
- **profileStatus**: وضعیت پروفایل ('pending', 'approved', 'rejected')
- **contractStatus**: وضعیت قرارداد ('not_uploaded', 'pending', 'approved', 'rejected')

### 2. HOC: `withOrganizationAccess`

Higher-Order Component برای محافظت خودکار از صفحات.

```javascript
import { withOrganizationAccess, ACCESS_PRESETS } from '../components/withOrganizationAccess';

// محافظت از صفحه سفارش
const ProtectedOrderScreen = withOrganizationAccess(OrderScreen, {
  ...ACCESS_PRESETS.ORDER_RELATED,
  screenName: 'OrderScreen'
});

// صفحه همیشه مجاز
const AlwaysAllowedProfile = withOrganizationAccess(ProfileScreen, {
  ...ACCESS_PRESETS.ORGANIZATION_ALWAYS_ALLOWED,
  screenName: 'ProfileScreen'
});
```

#### تنظیمات HOC:

```javascript
const options = {
  screenName: 'OrderScreen',                // نام صفحه برای چک دسترسی
  allowOrganizationAccess: true,           // آیا کاربران سازمانی مجاز باشند؟
  requireCompleteAccess: true,             // نیاز به تایید کامل؟
  customAccessCheck: (context) => {},     // تابع سفارشی چک دسترسی
  loadingComponent: <CustomLoader />,      // کامپوننت loading سفارشی
  restrictedComponent: <CustomRestricted /> // کامپوننت محدودیت سفارشی
};
```

### 3. Component: `AccessRestrictedScreen`

کامپوننت نمایش صفحه محدودیت دسترسی.

```javascript
<AccessRestrictedScreen
  type="access_denied"
  title="دسترسی محدود"
  message="شما مجوز دسترسی به این بخش را ندارید"
  nextSteps={['تکمیل پروفایل', 'آپلود قرارداد']}
  profileStatus="pending"
  contractStatus="rejected"
  onRetry={() => refetch()}
/>
```

### 4. Component: `ProtectedOrderButton`

دکمه محافظت شده برای عملیات سفارش.

```javascript
<ProtectedOrderButton
  title="ثبت سفارش جدید"
  targetScreen="OrderMenuScreen"
  iconName="add-circle"
  onPress={() => navigation.navigate('OrderMenuScreen')}
/>
```

## 🚀 نحوه استفاده

### 1. محافظت از صفحه با HOC

```javascript
// در App.js
import { withOrganizationAccess, ACCESS_PRESETS } from './components/withOrganizationAccess';
import OrderScreen from './screens/OrderScreen';

const ProtectedOrderScreen = withOrganizationAccess(OrderScreen, {
  ...ACCESS_PRESETS.ORDER_RELATED,
  screenName: 'OrderScreen'
});

// در Stack Navigator
<Stack.Screen component={ProtectedOrderScreen} name="OrderScreen" />
```

### 2. چک دسترسی دستی در کامپوننت

```javascript
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';

function OrderButton() {
  const { canPlaceOrder, isOrganizationUser, getNextSteps } = useOrganizationAccess();

  const handlePress = () => {
    if (!canPlaceOrder()) {
      const steps = getNextSteps();
      Alert.alert('دسترسی محدود', `مراحل لازم: ${steps.join(', ')}`);
      return;
    }
    
    // ادامه فرآیند سفارش
    navigation.navigate('OrderScreen');
  };

  return (
    <Button 
      title="ثبت سفارش" 
      onPress={handlePress}
      disabled={isOrganizationUser && !canPlaceOrder()}
    />
  );
}
```

### 3. استفاده از دکمه محافظت شده

```javascript
import ProtectedOrderButton from '../components/ProtectedOrderButton';

function HomeScreen() {
  return (
    <View>
      <ProtectedOrderButton
        title="سفارش خدمات فنی"
        subtitle="انتخاب و ثبت خدمات مورد نیاز"
        targetScreen="OrderMenuScreen"
        iconName="build"
      />
    </View>
  );
}
```

## 🎛️ تنظیمات پیش‌فرض

### ACCESS_PRESETS

```javascript
// صفحات عمومی - همه کاربران
ACCESS_PRESETS.PUBLIC

// صفحات سفارش - نیاز به تایید کامل
ACCESS_PRESETS.ORDER_RELATED

// فقط کاربران فردی
ACCESS_PRESETS.INDIVIDUAL_ONLY

// همیشه مجاز برای سازمانی
ACCESS_PRESETS.ORGANIZATION_ALWAYS_ALLOWED
```

## 🔄 مدیریت State با Redux

### organizationSlice

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { setAccessStatus, updateProfileStatus } from '../slices/organizationSlice';

// خواندن state
const { accessStatus, profileStatus, hasCompleteAccess } = useSelector(state => state.organization);

// بروزرسانی state
dispatch(setAccessStatus(newStatus));
dispatch(updateProfileStatus('approved'));
```

## 📱 صفحات سازمانی

### 1. صفحه پروفایل سازمانی

مسیر: `screens/organization/OrganizationProfileScreen.js`

```javascript
// ناوبری به صفحه
navigation.navigate('OrganizationProfile');
```

ویژگی‌ها:
- ✅ فرم کامل اطلاعات شرکت و مدیر
- ✅ اعتبارسنجی داده‌ها
- ✅ نمایش وضعیت تایید
- ✅ مدیریت خطاها

### 2. صفحه مدیریت قرارداد

مسیر: `screens/organization/OrganizationContractScreen.js`

```javascript
// ناوبری به صفحه
navigation.navigate('OrganizationContract');
```

ویژگی‌ها:
- ✅ دانلود فایل نمونه قرارداد
- ✅ آپلود قرارداد (PDF, تصاویر)
- ✅ نمایش وضعیت بررسی
- ✅ مشاهده قرارداد آپلود شده

## 🔧 API Integration

### وضعیت دسترسی

```javascript
// درخواست
GET /organization/profile/status

// پاسخ
{
  "success": true,
  "data": {
    "profile_status": "approved|pending|rejected|not_uploaded",
    "contract_status": "approved|pending|rejected|not_uploaded", 
    "has_complete_access": true|false,
    "blocked_message": "پیام محدودیت",
    "profile_rejection_reason": "دلیل رد پروفایل",
    "contract_rejection_reason": "دلیل رد قرارداد"
  }
}
```

### مدیریت پروفایل

```javascript
// دریافت پروفایل
GET /organization/profile

// بروزرسانی پروفایل
PUT /organization/profile
{
  "company_name": "نام شرکت",
  "manager_name": "نام مدیر",
  // سایر فیلدها
}
```

### مدیریت قرارداد

```javascript
// دریافت اطلاعات قرارداد
GET /organization/contract

// آپلود قرارداد
POST /organization/contract
// FormData با فایل

// دانلود نمونه قرارداد
GET /organization/contract/template
```

## ⚡ بهینه‌سازی

### Cache Management

```javascript
// Hook خود cache مدیریت می‌کند (5 دقیقه)
const { refetch } = useOrganizationAccess();

// بارگذاری اجباری
refetch(); // force refresh = true
```

### Redux Integration

وضعیت‌ها در Redux ذخیره می‌شوند و بین کامپوننت‌ها مشترک هستند.

## 🧪 Testing

### تست کردن وضعیت‌های مختلف

```javascript
// Mock کردن وضعیت‌ها برای تست
const mockAccessStatus = {
  profile_status: 'rejected',
  contract_status: 'pending',
  has_complete_access: false
};

// تست HOC
const TestComponent = withOrganizationAccess(MyComponent, options);
```

## 🐛 عیب‌یابی

### مشکلات متداول

1. **صفحه محدود نمی‌شود**:
   - بررسی کنید HOC اعمال شده باشد
   - userType درست set شده باشد

2. **API فراخوانی نمی‌شود**:
   - Token معتبر باشد
   - userType === 'organization' باشد

3. **Redux state بروز نمی‌شود**:
   - organizationSlice در store اضافه شده باشد
   - dispatch صحیح باشد

### Debug Tools

```javascript
// لاگ وضعیت فعلی
console.log('Access Status:', useOrganizationAccess());

// Force refresh
const { refetch } = useOrganizationAccess();
refetch();
```

## 📋 Checklist پیاده‌سازی

### Frontend
- ✅ useOrganizationAccess Hook
- ✅ withOrganizationAccess HOC  
- ✅ AccessRestrictedScreen Component
- ✅ ProtectedOrderButton Component
- ✅ OrganizationProfileScreen
- ✅ OrganizationContractScreen
- ✅ Redux organizationSlice بروزرسانی
- ✅ App.js محافظت صفحات
- ✅ مستندات کامل

### Backend (نیاز به پیاده‌سازی)
- ❌ GET /organization/profile/status
- ❌ GET/PUT /organization/profile  
- ❌ GET/POST /organization/contract
- ❌ GET /organization/contract/template
- ❌ Middleware کنترل دسترسی

### Testing
- ❌ تست وضعیت‌های مختلف کاربر
- ❌ تست API integration
- ❌ تست محافظت صفحات
- ❌ تست UI components

## 🚀 آماده برای Production

سیستم کنترل دسترسی کاربران سازمانی به طور کامل پیاده‌سازی شده و آماده استفاده است. تنها کافیست API های backend پیاده‌سازی شوند.

### مراحل بعدی:
1. پیاده‌سازی backend APIs
2. تست کامل سیستم
3. Deploy و monitoring