# 📱 راهنمای پیاده‌سازی محدودیت دسترسی کاربران سازمانی برای تیم اپلیکیشن

**نسخه:** 1.0  
**تاریخ:** ۲۱ آبان ۱۴۰۴  
**مخاطب:** تیم توسعه اپلیکیشن موبایل  

---

## 🎯 هدف و نیازمندی

کاربران سازمانی تا زمانی که **هم پروفایل** و **هم قرارداد** آن‌ها توسط ادمین تایید نشود، فقط به بخش‌های محدودی از اپلیکیشن دسترسی دارند.

### تفاوت کاربران:
- **کاربران فردی:** دسترسی کامل و فوری ✅
- **کاربران سازمانی:** دسترسی محدود تا تایید نهایی ⏳

---

## 🔑 تشخیص نوع کاربر

### در Response های API:
```json
{
  "user": {
    "id": 123,
    "name": "احمد احمدی",
    "account_type": "organization", // یا "individual"
    "phone": "09123456789"
  }
}
```

### در Local Storage:
```javascript
// ذخیره نوع کاربر پس از لاگین
const userType = response.data.user.account_type;
localStorage.setItem('userType', userType);
```

---

## 🛡️ API های مربوط به کنترل دسترسی

### 1️⃣ **API بررسی وضعیت دسترسی**

**Endpoint:** `GET /api/organization/profile/status`  
**Headers:** `Authorization: Bearer {token}`

#### Response موفق:
```json
{
  "success": true,
  "message": "وضعیت دسترسی سازمان دریافت شد",
  "data": {
    "has_complete_access": false,
    "profile_status": "pending",
    "contract_status": "pending",
    "profile_status_label": "در انتظار تایید",
    "contract_status_label": "در انتظار تایید",
    "profile_rejection_reason": null,
    "contract_rejection_reason": null,
    "next_steps": [
      "لطفا منتظر تایید پروفایل باشید",
      "لطفا منتظر تایید قرارداد باشید"
    ],
    "blocked_message": "اطلاعات شما در حال بررسی توسط ادمین است. لطفا منتظر بمانید.",
    "allowed_screens": [
      "OrganizationProfile",
      "OrganizationContract",
      "AccountSettings"
    ]
  }
}
```

#### Response خطا (کاربر فردی):
```json
{
  "success": false,
  "message": "این API فقط برای کاربران سازمانی است",
  "error_code": "INVALID_USER_TYPE"
}
```

### 2️⃣ **API های محافظت شده**

تمام API های زیر برای کاربران سازمانی محدود هستند:

#### مسیرهای محافظت شده:
```
POST   /api/orders/submit
GET    /api/orders
GET    /api/orders/summary
POST   /api/orders/detail
POST   /api/orders/upload
POST   /api/orders/check-discount
POST   /api/orders/cancel
POST   /api/orders/verify-technician
POST   /api/orders/extra-services
POST   /api/orders/{orderId}/initial-accept
POST   /api/orders/{orderId}/decision
POST   /api/orders/{orderId}/return-followup
POST   /api/orders/{orderId}/final-description
GET    /api/orders/{orderId}/delivery-report
POST   /api/orders/{orderId}/delivery-report/verify
POST   /api/orders/gateway-payment
```

#### Response محدودیت (403 Forbidden):
```json
{
  "success": false,
  "message": "دسترسی محدود: لطفا منتظر تایید ادمین باشید",
  "error_code": "ACCESS_RESTRICTED",
  "data": {
    "profile_status": "pending",
    "contract_status": "pending",
    "profile_status_label": "در انتظار تایید",
    "contract_status_label": "در انتظار تایید",
    "profile_rejection_reason": null,
    "contract_rejection_reason": null,
    "allowed_screens": [
      "OrganizationProfile",
      "OrganizationContract",
      "AccountSettings"
    ],
    "blocked_message": "اطلاعات شما در حال بررسی توسط ادمین است. لطفا منتظر بمانید."
  }
}
```

---

## 📱 نحوه پیاده‌سازی در اپلیکیشن

### 1️⃣ **ایجاد Hook برای مدیریت دسترسی**

```javascript
// hooks/useOrganizationAccess.js
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const useOrganizationAccess = () => {
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { userType, token } = useSelector(state => state.auth);
  
  const fetchAccessStatus = async () => {
    // اگر کاربر فردی است، دسترسی آزاد
    if (userType !== 'organization' || !token) {
      setAccessStatus({
        has_complete_access: true,
        is_organization_user: false
      });
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/organization/profile/status`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setAccessStatus({
          ...response.data.data,
          is_organization_user: true
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('خطا در دریافت وضعیت دسترسی:', error);
      setError('خطا در دریافت وضعیت دسترسی');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAccessStatus();
  }, [userType, token]);
  
  const refetch = () => {
    setLoading(true);
    setError(null);
    fetchAccessStatus();
  };
  
  return {
    accessStatus,
    loading,
    error,
    refetch,
    hasCompleteAccess: accessStatus?.has_complete_access || false,
    isOrganizationUser: accessStatus?.is_organization_user || false
  };
};
```

### 2️⃣ **ایجاد HOC برای محافظت از صفحات**

```javascript
// hoc/withOrganizationAccess.js
import React from 'react';
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';
import AccessRestrictedScreen from '../components/AccessRestrictedScreen';
import LoadingScreen from '../components/LoadingScreen';

export const withOrganizationAccess = (WrappedComponent, options = {}) => {
  const { 
    allowedScreens = [], 
    requireCompleteAccess = true,
    showLoadingScreen = true
  } = options;
  
  return function WithOrganizationAccessComponent(props) {
    const { 
      hasCompleteAccess, 
      isOrganizationUser, 
      accessStatus, 
      loading,
      error 
    } = useOrganizationAccess();
    
    // اگر کاربر فردی است، دسترسی آزاد
    if (!isOrganizationUser) {
      return <WrappedComponent {...props} />;
    }
    
    // در حال بارگذاری
    if (loading && showLoadingScreen) {
      return <LoadingScreen message="بررسی دسترسی..." />;
    }
    
    // خطا در دریافت وضعیت
    if (error) {
      return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;
    }
    
    // چک کردن دسترسی
    if (requireCompleteAccess && !hasCompleteAccess) {
      return <AccessRestrictedScreen accessStatus={accessStatus} />;
    }
    
    // دسترسی آزاد
    return <WrappedComponent {...props} />;
  };
};
```

### 3️⃣ **صفحه نمایش محدودیت دسترسی**

```javascript
// components/AccessRestrictedScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AccessRestrictedScreen = ({ accessStatus }) => {
  const navigation = useNavigation();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'pending': return 'time';
      default: return 'help-circle';
    }
  };
  
  const showRejectionReason = (reason, type) => {
    if (reason) {
      Alert.alert(
        `دلیل رد ${type}`,
        reason,
        [{ text: 'متوجه شدم', style: 'default' }]
      );
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-outline" size={60} color="#FF9800" />
        <Text style={styles.title}>دسترسی محدود</Text>
        <Text style={styles.message}>
          {accessStatus?.blocked_message || 'حساب شما در حال بررسی است'}
        </Text>
      </View>
      
      {/* وضعیت پروفایل */}
      <View style={styles.statusSection}>
        <View style={styles.statusHeader}>
          <Ionicons name="person-outline" size={24} color="#2196F3" />
          <Text style={styles.statusTitle}>وضعیت پروفایل</Text>
        </View>
        
        <View style={styles.statusItem}>
          <View style={styles.statusLeft}>
            <Ionicons 
              name={getStatusIcon(accessStatus?.profile_status)} 
              size={20} 
              color={getStatusColor(accessStatus?.profile_status)} 
            />
            <Text style={[
              styles.statusText, 
              { color: getStatusColor(accessStatus?.profile_status) }
            ]}>
              {accessStatus?.profile_status_label}
            </Text>
          </View>
          
          {accessStatus?.profile_status === 'rejected' && (
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => showRejectionReason(
                accessStatus?.profile_rejection_reason, 
                'پروفایل'
              )}
            >
              <Ionicons name="information-circle" size={20} color="#2196F3" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* وضعیت قرارداد */}
      <View style={styles.statusSection}>
        <View style={styles.statusHeader}>
          <Ionicons name="document-text-outline" size={24} color="#2196F3" />
          <Text style={styles.statusTitle}>وضعیت قرارداد</Text>
        </View>
        
        <View style={styles.statusItem}>
          <View style={styles.statusLeft}>
            <Ionicons 
              name={getStatusIcon(accessStatus?.contract_status)} 
              size={20} 
              color={getStatusColor(accessStatus?.contract_status)} 
            />
            <Text style={[
              styles.statusText, 
              { color: getStatusColor(accessStatus?.contract_status) }
            ]}>
              {accessStatus?.contract_status_label}
            </Text>
          </View>
          
          {accessStatus?.contract_status === 'rejected' && (
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => showRejectionReason(
                accessStatus?.contract_rejection_reason, 
                'قرارداد'
              )}
            >
              <Ionicons name="information-circle" size={20} color="#2196F3" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* مراحل بعدی */}
      {accessStatus?.next_steps && accessStatus.next_steps.length > 0 && (
        <View style={styles.nextStepsSection}>
          <Text style={styles.nextStepsTitle}>مراحل بعدی:</Text>
          {accessStatus.next_steps.map((step, index) => (
            <View key={index} style={styles.nextStepItem}>
              <Ionicons name="arrow-forward" size={16} color="#666" />
              <Text style={styles.nextStepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* اقدامات قابل انجام */}
      <View style={styles.actionsSection}>
        <Text style={styles.actionsTitle}>صفحات قابل دسترس:</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('OrganizationProfile')}
        >
          <Ionicons name="person-outline" size={20} color="#2196F3" />
          <Text style={styles.actionButtonText}>ویرایش اطلاعات سازمان</Text>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('OrganizationContract')}
        >
          <Ionicons name="document-text-outline" size={20} color="#2196F3" />
          <Text style={styles.actionButtonText}>مدیریت قراردادها</Text>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('AccountSettings')}
        >
          <Ionicons name="settings-outline" size={20} color="#2196F3" />
          <Text style={styles.actionButtonText}>تنظیمات حساب</Text>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </TouchableOpacity>
      </View>
      
      {/* دکمه تماس با پشتیبانی */}
      <TouchableOpacity 
        style={styles.supportButton}
        onPress={() => navigation.navigate('Support')}
      >
        <Ionicons name="headset-outline" size={20} color="#FFF" />
        <Text style={styles.supportButtonText}>تماس با پشتیبانی</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  statusSection: {
    backgroundColor: '#FFF',
    marginBottom: 10,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: '500',
  },
  infoButton: {
    padding: 5,
  },
  nextStepsSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 10,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextStepText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  actionsSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 10,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  supportButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    borderRadius: 8,
  },
  supportButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default AccessRestrictedScreen;
```

### 4️⃣ **اعمال محدودیت به صفحات**

#### صفحات محافظت شده:
```javascript
// screens/OrderScreen.js
import { withOrganizationAccess } from '../hoc/withOrganizationAccess';

const OrderScreen = () => {
  return (
    <View>
      <Text>صفحه سفارشات</Text>
      {/* محتوای صفحه */}
    </View>
  );
};

// اعمال محافظت
export default withOrganizationAccess(OrderScreen, {
  requireCompleteAccess: true
});
```

#### صفحات آزاد:
```javascript
// screens/OrganizationProfileScreen.js
import { withOrganizationAccess } from '../hoc/withOrganizationAccess';

const OrganizationProfileScreen = () => {
  return (
    <View>
      <Text>ویرایش پروفایل سازمان</Text>
      {/* محتوای صفحه */}
    </View>
  );
};

// بدون محدودیت برای این صفحه
export default OrganizationProfileScreen;
```

### 5️⃣ **مدیریت خطاهای API**

```javascript
// utils/apiErrorHandler.js
import { Alert } from 'react-native';
import { navigationRef } from '../navigation/RootNavigation';

export const handleApiError = (error, navigation) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 403:
        if (data.error_code === 'ACCESS_RESTRICTED') {
          // هدایت به صفحه محدودیت دسترسی
          navigation.navigate('AccessRestricted', { 
            accessStatus: data.data 
          });
          return true; // خطا handle شد
        }
        break;
        
      case 401:
        // خروج از حساب کاربری
        Alert.alert(
          'خطای احراز هویت',
          'لطفا مجددا وارد شوید',
          [
            {
              text: 'ورود',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        return true;
    }
  }
  
  // سایر خطاها
  Alert.alert('خطا', 'مشکلی پیش آمده است. لطفا مجددا تلاش کنید.');
  return false;
};
```

### 6️⃣ **Axios Interceptor**

```javascript
// services/axiosConfig.js
import axios from 'axios';
import { Alert } from 'react-native';
import { navigationRef } from '../navigation/RootNavigation';
import { handleApiError } from '../utils/apiErrorHandler';

// تنظیم interceptor برای response ها
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const navigation = navigationRef.current;
    
    if (navigation && handleApiError(error, navigation)) {
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default axios;
```

---

## 🧪 تست و بررسی

### 1️⃣ **سناریوهای تست**

#### سناریو 1: کاربر فردی
```javascript
// کاربر فردی باید به همه صفحات دسترسی داشته باشد
const testIndividualUser = async () => {
  // Login به عنوان کاربر فردی
  const loginResponse = await login('09123456789', 'password');
  
  // درخواست به API محافظت شده
  const orderResponse = await axios.get('/api/orders');
  
  expect(orderResponse.status).toBe(200);
};
```

#### سناریو 2: کاربر سازمانی تایید نشده
```javascript
const testUnApprovedOrgUser = async () => {
  // Login به عنوان کاربر سازمانی
  const loginResponse = await loginOrganization('09187654321', 'password');
  
  try {
    // درخواست به API محافظت شده
    await axios.get('/api/orders');
  } catch (error) {
    expect(error.response.status).toBe(403);
    expect(error.response.data.error_code).toBe('ACCESS_RESTRICTED');
  }
};
```

#### سناریو 3: کاربر سازمانی تایید شده
```javascript
const testApprovedOrgUser = async () => {
  // Login به عنوان کاربر سازمانی تایید شده
  const loginResponse = await loginApprovedOrganization('09111111111', 'password');
  
  // درخواست به API محافظت شده
  const orderResponse = await axios.get('/api/orders');
  
  expect(orderResponse.status).toBe(200);
};
```

### 2️⃣ **بررسی وضعیت‌های مختلف**

```javascript
// utils/testAccessStatus.js
export const testAccessScenarios = [
  {
    name: 'پروفایل و قرارداد در انتظار',
    status: {
      profile_status: 'pending',
      contract_status: 'pending',
      has_complete_access: false
    },
    expectedMessage: 'اطلاعات شما در حال بررسی توسط ادمین است'
  },
  {
    name: 'پروفایل تایید، قرارداد در انتظار',
    status: {
      profile_status: 'approved',
      contract_status: 'pending',
      has_complete_access: false
    },
    expectedMessage: 'لطفا منتظر تایید قرارداد باشید'
  },
  {
    name: 'پروفایل رد شده',
    status: {
      profile_status: 'rejected',
      contract_status: 'pending',
      has_complete_access: false,
      profile_rejection_reason: 'اطلاعات ناقص'
    },
    expectedMessage: 'پروفایل شما رد شده است'
  },
  {
    name: 'هر دو تایید شده',
    status: {
      profile_status: 'approved',
      contract_status: 'approved',
      has_complete_access: true
    },
    expectedAccess: true
  }
];
```

---

## ⚠️ نکات مهم و احتیاطات

### 1️⃣ **کش کردن وضعیت**
```javascript
// Cache وضعیت دسترسی برای کاهش درخواست‌ها
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقیقه

const getCachedAccessStatus = () => {
  const cached = localStorage.getItem('accessStatus');
  const timestamp = localStorage.getItem('accessStatusTimestamp');
  
  if (cached && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age < CACHE_DURATION) {
      return JSON.parse(cached);
    }
  }
  
  return null;
};

const setCachedAccessStatus = (status) => {
  localStorage.setItem('accessStatus', JSON.stringify(status));
  localStorage.setItem('accessStatusTimestamp', Date.now().toString());
};
```

### 2️⃣ **Refresh وضعیت**
```javascript
// اضافه کردن قابلیت refresh دستی
const RefreshButton = ({ onRefresh }) => (
  <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
    <Ionicons name="refresh" size={20} color="#2196F3" />
    <Text style={styles.refreshText}>بروزرسانی وضعیت</Text>
  </TouchableOpacity>
);
```

### 3️⃣ **Offline Handling**
```javascript
// مدیریت حالت آفلاین
import NetInfo from '@react-native-async-storage/async-storage';

const checkNetworkAndFetch = async () => {
  const networkState = await NetInfo.fetch();
  
  if (!networkState.isConnected) {
    // استفاده از داده‌های کش شده
    const cachedStatus = getCachedAccessStatus();
    if (cachedStatus) {
      setAccessStatus(cachedStatus);
    }
    return;
  }
  
  // درخواست جدید
  await fetchAccessStatus();
};
```

### 4️⃣ **Performance Optimization**
```javascript
// تأخیر در بررسی وضعیت برای بهبود UX
import { debounce } from 'lodash';

const debouncedFetchStatus = debounce(fetchAccessStatus, 1000);

useEffect(() => {
  if (userType === 'organization') {
    debouncedFetchStatus();
  }
}, [userType]);
```

---

## 🔄 فلوچارت تصمیم‌گیری

```
کاربر لاگین کرد
        ↓
    نوع کاربر چیست؟
        ↓
   ┌─────────┴─────────┐
   │                   │
Individual         Organization
   │                   │
   ▼                   ▼
دسترسی کامل      بررسی وضعیت تایید
                      │
                      ▼
              Profile + Contract تایید شده؟
                      │
                ┌─────┴─────┐
                │           │
               بله         خیر
                │           │
                ▼           ▼
           دسترسی کامل   نمایش صفحه محدودیت
```

---

## 📋 چک‌لیست پیاده‌سازی

### Frontend:
- [ ] پیاده‌سازی `useOrganizationAccess` hook
- [ ] ایجاد `withOrganizationAccess` HOC  
- [ ] طراحی صفحه `AccessRestrictedScreen`
- [ ] اعمال محدودیت به صفحات مربوطه
- [ ] مدیریت خطاهای 403 در axios interceptor
- [ ] تست تمام سناریوهای مختلف
- [ ] پیاده‌سازی قابلیت refresh وضعیت
- [ ] مدیریت کش و حالت آفلاین

### Backend Integration:
- [ ] تست API `/organization/profile/status`
- [ ] تست محدودیت روی API های `/orders/*`
- [ ] بررسی Response های مختلف
- [ ] تست با انواع مختلف کاربران

### UX/UI:
- [ ] طراحی صفحه محدودیت دسترسی
- [ ] پیام‌های مناسب برای هر وضعیت
- [ ] نمایش مراحل بعدی به کاربر
- [ ] دکمه‌های دسترسی به صفحات مجاز

---

## 📞 پشتیبانی و تماس

در صورت بروز هرگونه مشکل یا سوال در پیاده‌سازی:

**تیم Backend:** Loop Backend Team  
**مستندات کامل:** `ORGANIZATION_ACCESS_CONTROL_IMPLEMENTATION.md`  
**تاریخ آخرین بروزرسانی:** ۲۱ آبان ۱۴۰۴

---

**نکته نهایی:** این سیستم فقط برای کاربران سازمانی اعمال می‌شود و کاربران فردی همچنان دسترسی کامل و فوری دارند.