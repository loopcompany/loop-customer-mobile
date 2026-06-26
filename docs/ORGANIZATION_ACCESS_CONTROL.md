# سیستم کنترل دسترسی کاربران سازمانی
**تاریخ آپدیت:** ۱۸ آبان ۱۴۰۴  
**نسخه:** ۱.۰.۰

## 📋 فهرست مطالب
1. [نیازمندی‌ها](#نیازمندی‌ها)
2. [API های Backend](#api-های-backend)
3. [Frontend Implementation](#frontend-implementation)
4. [Business Logic](#business-logic)
5. [User Stories](#user-stories)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## 🎯 نیازمندی‌ها

### هدف اصلی:
کاربر سازمانی تا زمانی که **هم پروفایلش** و **هم توافق نامهش** توسط ادمین تایید نشده، فقط به صفحات محدود دسترسی داشته باشد.

### صفحات مجاز (قبل از تایید):
- ✅ ویرایش حساب کاربری (`OrganizationProfile`)
- ✅ توافق نامه (`OrganizationContract`) 
- ✅ تنظیمات حساب (`AccountSettings`)

### صفحات غیرمجاز (قبل از تایید):
- ❌ داشبورد (`Dashboard`)
- ❌ ثبت سفارش (`Orders`)
- ❌ مشاهده خدمات (`Services`)
- ❌ تکنسین‌ها (`Technicians`)
- ❌ سابقه سفارشات (`OrderHistory`)

---

## 🔧 API های Backend

### 1. **GET /organization/profile/status**
**توضیح:** دریافت وضعیت تایید پروفایل و توافق نامه

**Request:**
```http
GET /api/organization/profile/status
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile_status": "pending|approved|rejected",
    "contract_status": "pending|approved|rejected|not_uploaded",
    "has_complete_access": false,
    "profile_approved_at": "2024-01-15T10:30:00Z",
    "contract_approved_at": null,
    "profile_rejection_reason": null,
    "contract_rejection_reason": "فایل توافق نامه خوانا نیست",
    "blocked_message": "لطفا منتظر تایید ادمین باشید",
    "next_steps": [
      "upload_contract",
      "wait_for_approval"
    ]
  }
}
```

**Status Codes:**
- `200`: موفقیت‌آمیز
- `401`: عدم احراز هویت
- `403`: دسترسی غیرمجاز (کاربر فردی)

---

### 2. **GET /organization/profile** 
**توضیح:** دریافت اطلاعات کامل پروفایل سازمان

**Request:**
```http
GET /api/organization/profile
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "organization_name": "شرکت نمونه",
    "organization_code": "ORG-001",
    "status": "pending|approved|rejected",
    "rejection_reason": "اطلاعات ناقص ارائه شده",
    "phone": "09123456789",
    "email": "info@company.com",
    "address": "تهران، خیابان ولیعصر",
    "manager_name": "علی احمدی",
    "national_id": "1234567890",
    "registration_number": "12345",
    "created_at": "2024-01-01T08:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### 3. **PUT /organization/profile**
**توضیح:** ویرایش اطلاعات پروفایل سازمان

**Request:**
```http
PUT /api/organization/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "organization_name": "نام جدید شرکت",
  "organization_code": "ORG-002", 
  "phone": "09123456789",
  "email": "new@company.com",
  "address": "آدرس جدید",
  "manager_name": "نام مدیر جدید",
  "national_id": "0987654321",
  "registration_number": "54321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "اطلاعات با موفقیت به‌روزرسانی شد",
  "data": {
    "id": 123,
    "organization_name": "نام جدید شرکت",
    // ... سایر فیلدهای به‌روز شده
    "status": "pending", // وضعیت به pending تغییر می‌کند
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

---

### 4. **GET /organization/contracts**
**توضیح:** دریافت لیست توافق نامههای آپلود شده (موجود)

**Request:**
```http
GET /api/organization/contracts
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "contract_url": "https://domain.com/storage/contracts/contract_123.pdf",
      "file_name": "توافق نامه امضا شده",
      "status": "pending|approved|rejected",
      "status_label": "در انتظار تایید",
      "rejection_reason": "امضا واضح نیست",
      "uploaded_at": "2024-01-10T12:00:00Z",
      "reviewed_at": "2024-01-12T15:30:00Z",
      "can_edit": true
    }
  ]
}
```

---

### 5. **POST /organization/contracts/upload**
**توضیح:** آپلود توافق نامه امضا شده (موجود)

---

### 6. **Middleware: Access Control**
**توضیح:** میدل‌ور برای چک کردن دسترسی کامل

**API های محدود شده:**
```php
// Protected Routes - نیاز به has_complete_access = true
Route::middleware(['auth', 'organization.approved'])->group(function () {
    // Orders
    Route::post('/orders/create', [OrderController::class, 'create']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    
    // Services
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    
    // Technicians
    Route::get('/technicians', [TechnicianController::class, 'index']);
    Route::get('/technicians/{id}', [TechnicianController::class, 'show']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-orders', [DashboardController::class, 'recentOrders']);
});
```

**Middleware Logic:**
```php
public function handle($request, Closure $next)
{
    $user = Auth::user();
    
    if ($user->user_type !== 'organization') {
        return response()->json([
            'success' => false,
            'message' => 'دسترسی محدود به کاربران سازمانی',
            'error_code' => 'INVALID_USER_TYPE'
        ], 403);
    }
    
    $organization = $user->organization;
    
    $hasCompleteAccess = (
        $organization->profile_status === 'approved' && 
        $organization->contract_status === 'approved'
    );
    
    if (!$hasCompleteAccess) {
        return response()->json([
            'success' => false,
            'message' => 'دسترسی محدود: لطفا منتظر تایید ادمین باشید',
            'error_code' => 'ACCESS_RESTRICTED',
            'data' => [
                'profile_status' => $organization->profile_status,
                'contract_status' => $organization->contract_status,
                'allowed_screens' => ['OrganizationProfile', 'OrganizationContract']
            ]
        ], 403);
    }
    
    return $next($request);
}
```

---

## 💻 Frontend Implementation

### 1. **Hook: useOrganizationAccess**
```javascript
// hooks/useOrganizationAccess.js
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { uri } from '../services/URL';

export const useOrganizationAccess = () => {
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userType, token } = useSelector(state => state.auth);
  
  const fetchAccessStatus = async () => {
    if (userType !== 'organization' || !token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${uri}/organization/profile/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAccessStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching access status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAccessStatus();
  }, [userType, token]);
  
  return {
    accessStatus,
    loading,
    hasCompleteAccess: accessStatus?.has_complete_access || false,
    isOrganizationUser: userType === 'organization',
    refetch: fetchAccessStatus
  };
};
```

### 2. **HOC: withOrganizationAccess**
```javascript
// hoc/withOrganizationAccess.js
import React from 'react';
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';
import AccessRestrictedScreen from '../components/AccessRestrictedScreen';

export const withOrganizationAccess = (WrappedComponent, options = {}) => {
  const { allowedScreens = [], requireCompleteAccess = true } = options;
  
  return function WithOrganizationAccessComponent(props) {
    const { hasCompleteAccess, isOrganizationUser, accessStatus, loading } = useOrganizationAccess();
    
    // اگر کاربر فردی است، دسترسی آزاد
    if (!isOrganizationUser) {
      return <WrappedComponent {...props} />;
    }
    
    // در حال بارگذاری
    if (loading) {
      return <LoadingScreen />;
    }
    
    // چک دسترسی کامل
    if (requireCompleteAccess && !hasCompleteAccess) {
      return (
        <AccessRestrictedScreen 
          accessStatus={accessStatus}
          allowedScreens={allowedScreens}
        />
      );
    }
    
    return <WrappedComponent {...props} />;
  };
};
```

### 3. **Component: AccessRestrictedScreen**
```javascript
// components/AccessRestrictedScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AccessRestrictedScreen = ({ accessStatus, allowedScreens = [] }) => {
  const navigation = useNavigation();
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return { name: 'checkmark-circle', color: '#4caf50' };
      case 'rejected': return { name: 'close-circle', color: '#f44336' };
      case 'pending': return { name: 'time-outline', color: '#ff9800' };
      default: return { name: 'help-circle-outline', color: '#999' };
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'تایید شده';
      case 'rejected': return 'رد شده';
      case 'pending': return 'در انتظار تایید';
      case 'not_uploaded': return 'آپلود نشده';
      default: return 'نامشخص';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={80} color="#ff9800" />
        
        <Text style={styles.title}>دسترسی محدود</Text>
        <Text style={styles.message}>
          {accessStatus?.blocked_message || 'لطفا منتظر تایید ادمین باشید'}
        </Text>
        
        {/* وضعیت پروفایل */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>وضعیت اطلاعات:</Text>
          <View style={styles.statusRow}>
            <Ionicons 
              name={getStatusIcon(accessStatus?.profile_status).name} 
              size={24} 
              color={getStatusIcon(accessStatus?.profile_status).color}
            />
            <Text style={styles.statusText}>
              {getStatusText(accessStatus?.profile_status)}
            </Text>
          </View>
          {accessStatus?.profile_rejection_reason && (
            <Text style={styles.rejectionReason}>
              دلیل رد: {accessStatus.profile_rejection_reason}
            </Text>
          )}
        </View>
        
        {/* وضعیت توافق نامه */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>وضعیت توافق نامه:</Text>
          <View style={styles.statusRow}>
            <Ionicons 
              name={getStatusIcon(accessStatus?.contract_status).name} 
              size={24} 
              color={getStatusIcon(accessStatus?.contract_status).color}
            />
            <Text style={styles.statusText}>
              {getStatusText(accessStatus?.contract_status)}
            </Text>
          </View>
          {accessStatus?.contract_rejection_reason && (
            <Text style={styles.rejectionReason}>
              دلیل رد: {accessStatus.contract_rejection_reason}
            </Text>
          )}
        </View>
        
        {/* دکمه‌های دسترسی */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>صفحات قابل دسترس:</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrganizationProfile')}
          >
            <Ionicons name="person-outline" size={20} color="#2196f3" />
            <Text style={styles.actionButtonText}>ویرایش اطلاعات</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrganizationContract')}
          >
            <Ionicons name="document-text-outline" size={20} color="#2196f3" />
            <Text style={styles.actionButtonText}>توافق نامه</Text>
          </TouchableOpacity>
        </View>
        
        {/* مراحل بعدی */}
        {accessStatus?.next_steps && accessStatus.next_steps.length > 0 && (
          <View style={styles.nextStepsContainer}>
            <Text style={styles.nextStepsTitle}>مراحل بعدی:</Text>
            {accessStatus.next_steps.map((step, index) => (
              <Text key={index} style={styles.nextStepItem}>
                • {getStepText(step)}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const getStepText = (step) => {
  switch (step) {
    case 'upload_contract': return 'آپلود توافق نامه امضا شده';
    case 'wait_for_approval': return 'انتظار برای تایید ادمین';
    case 'complete_profile': return 'تکمیل اطلاعات پروفایل';
    default: return step;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'VazirBold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'VazirLight',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  statusContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
    marginRight: 8,
  },
  rejectionReason: {
    fontSize: 12,
    fontFamily: 'VazirLight',
    color: '#f44336',
    marginTop: 8,
    textAlign: 'right',
  },
  actionsContainer: {
    width: '100%',
    marginTop: 10,
  },
  actionsTitle: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'VazirBold',
    color: '#2196f3',
    marginRight: 10,
  },
  nextStepsContainer: {
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff3e0',
    borderRadius: 10,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontFamily: 'VazirBold',
    color: '#e65100',
    marginBottom: 10,
    textAlign: 'right',
  },
  nextStepItem: {
    fontSize: 12,
    fontFamily: 'VazirLight',
    color: '#bf360c',
    marginBottom: 5,
    textAlign: 'right',
  },
});

export default AccessRestrictedScreen;
```

### 4. **Navigation Guard در App.js**
```javascript
// اضافه کردن به screens در App.js
import { withOrganizationAccess } from './hoc/withOrganizationAccess';

// Protected Screens
const DashboardScreen = withOrganizationAccess(Dashboard, { requireCompleteAccess: true });
const ServicesScreen = withOrganizationAccess(Services, { requireCompleteAccess: true });
const OrdersScreen = withOrganizationAccess(Orders, { requireCompleteAccess: true });

// در Stack.Navigator
<Stack.Screen name="Dashboard" component={DashboardScreen} />
<Stack.Screen name="Services" component={ServicesScreen} />
<Stack.Screen name="Orders" component={OrdersScreen} />
```

---

## 🎭 Business Logic

### حالت‌های مختلف کاربر سازمانی:

#### 1. **تازه ثبت‌نام شده**
- `profile_status`: `pending`
- `contract_status`: `not_uploaded`
- `has_complete_access`: `false`
- **دسترسی:** فقط ویرایش پروفایل و آپلود توافق نامه

#### 2. **توافق نامه آپلود شده**
- `profile_status`: `pending`
- `contract_status`: `pending`
- `has_complete_access`: `false`
- **دسترسی:** فقط ویرایش پروفایل و مشاهده وضعیت توافق نامه

#### 3. **پروفایل تایید، توافق نامه رد شده**
- `profile_status`: `approved`
- `contract_status`: `rejected`
- `has_complete_access`: `false`
- **دسترسی:** ویرایش پروفایل + آپلود مجدد توافق نامه

#### 4. **پروفایل رد، توافق نامه تایید شده**
- `profile_status`: `rejected`
- `contract_status`: `approved`
- `has_complete_access`: `false`
- **دسترسی:** فقط ویرایش پروفایل

#### 5. **هر دو تایید شده**
- `profile_status`: `approved`
- `contract_status`: `approved`
- `has_complete_access`: `true`
- **دسترسی:** کامل به همه بخش‌های اپ

#### 6. **هر دو رد شده**
- `profile_status`: `rejected`
- `contract_status`: `rejected`
- `has_complete_access`: `false`
- **دسترسی:** ویرایش پروفایل + آپلود مجدد توافق نامه

---

## 📝 User Stories

### 👤 کاربر سازمانی جدید:
```
به عنوان کاربر سازمانی جدید
می‌خواهم بتوانم اطلاعات خود را تکمیل کنم
تا بتوانم مراحل تایید را آغاز کنم

تعریف آماده:
- ✅ فرم ویرایش پروفایل در دسترس باشد
- ✅ امکان آپلود توافق نامه وجود داشته باشد  
- ✅ وضعیت تایید نمایش داده شود
- ✅ از سایر بخش‌ها محروم باشم
```

### 👤 کاربر در انتظار تایید:
```
به عنوان کاربر سازمانی در انتظار تایید
می‌خواهم وضعیت درخواست‌هایم را مشاهده کنم
تا بدانم در چه مرحله‌ای از تایید هستم

تعریف آماده:
- ✅ وضعیت پروفایل نمایش داده شود
- ✅ وضعیت توافق نامه نمایش داده شود
- ✅ دلایل رد (در صورت وجود) نمایش داده شود
- ✅ مراحل بعدی مشخص باشد
```

### 👤 کاربر تایید شده:
```
به عنوان کاربر سازمانی تایید شده
می‌خواهم به تمام امکانات اپلیکیشن دسترسی داشته باشم
تا بتوانم سفارش ثبت کنم و خدمات را مشاهده کنم

تعریف آماده:
- ✅ دسترسی کامل به داشبورد
- ✅ امکان ثبت سفارش
- ✅ مشاهده خدمات و تکنسین‌ها
- ✅ مشاهده سابقه سفارشات
```

---

## ⚠️ Error Handling

### 1. **خطای دسترسی (403)**
```javascript
// در axios interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.error_code === 'ACCESS_RESTRICTED') {
      // نمایش پیام محدودیت دسترسی
      // هدایت به صفحه AccessRestricted
      navigation.navigate('AccessRestricted');
    }
    return Promise.reject(error);
  }
);
```

### 2. **خطای شبکه**
```javascript
// در useOrganizationAccess hook
const [error, setError] = useState(null);

try {
  // API call
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    setError('خطای اتصال به شبکه');
  } else {
    setError('خطای غیرمنتظره');
  }
}
```

### 3. **Session Expired**
```javascript
// چک کردن انقضای session
if (error.response?.status === 401) {
  // پاک کردن token و هدایت به login
  dispatch(setToken(null));
  navigation.replace('Welcome');
}
```

---

## 🧪 Testing

### Unit Tests:
```javascript
// __tests__/hooks/useOrganizationAccess.test.js
describe('useOrganizationAccess', () => {
  test('should return hasCompleteAccess=true when both approved', () => {
    // Mock API response
    // Assert hasCompleteAccess === true
  });
  
  test('should return hasCompleteAccess=false when profile pending', () => {
    // Mock API response
    // Assert hasCompleteAccess === false
  });
});
```

### Integration Tests:
```javascript
// __tests__/screens/ProtectedScreens.test.js
describe('Protected Screens', () => {
  test('should show AccessRestrictedScreen for unapproved organization', () => {
    // Mock unapproved user
    // Navigate to protected screen
    // Assert AccessRestrictedScreen is displayed
  });
});
```

### API Tests:
```javascript
// __tests__/api/organizationAccess.test.js
describe('Organization Access API', () => {
  test('GET /organization/profile/status', async () => {
    const response = await request(app)
      .get('/api/organization/profile/status')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('has_complete_access');
  });
});
```

---

## 📋 Checklist Implementation

### Backend:
- [ ] ایجاد API `/organization/profile/status`
- [ ] ایجاد API `/organization/profile` (GET/PUT)
- [ ] پیاده‌سازی Middleware کنترل دسترسی
- [ ] آپدیت API های موجود با middleware
- [ ] تست API ها
- [ ] مستندسازی Postman

### Frontend:
- [ ] ایجاد Hook `useOrganizationAccess`
- [ ] ایجاد HOC `withOrganizationAccess`
- [ ] ایجاد Component `AccessRestrictedScreen`
- [ ] اعمال HOC به صفحات محافظت شده
- [ ] پیاده‌سازی Error Handling
- [ ] تست عملکرد در حالت‌های مختلف

### Testing:
- [ ] Unit Tests برای Hook
- [ ] Integration Tests برای HOC
- [ ] E2E Tests برای User Journey
- [ ] API Tests

---

## 📞 Support & Contact

**توسعه‌دهندگان:**
- Frontend: Loop Development Team
- Backend: Loop Development Team

**آپدیت‌های بعدی:**
- نسخه ۱.۱: اضافه کردن نوتیفیکیشن برای تایید/رد
- نسخه ۱.۲: Dashboard مخصوص وضعیت تایید
- نسخه ۱.۳: چت پشتیبانی برای کاربران در انتظار

---

*این مستند در تاریخ ۱۸ آبان ۱۴۰۴ تهیه شده و باید به‌روزرسانی شود.*