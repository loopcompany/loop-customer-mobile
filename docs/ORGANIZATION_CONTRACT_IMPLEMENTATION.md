# ✅ پیاده‌سازی صفحه قراردادنامه سازمانی

## 📋 خلاصه پروژه

یک صفحه کامل برای مدیریت قراردادنامه سازمانی پیاده‌سازی شد که به کاربران سازمانی اجازه می‌دهد:
- قرارداد بارگذاری شده توسط ادمین را مشاهده و دانلود کنند
- قرارداد امضا شده خود را آپلود کنند
- وضعیت قرارداد آپلود شده را پیگیری کنند

---

## 🎯 ویژگی‌های پیاده‌سازی شده

### ✅ صفحه OrganizationContract

**مسیر فایل:** `screens/organization/OrganizationContract.js`

#### قابلیت‌ها:

1. **مشاهده قرارداد ادمین:**
   - نمایش اطلاعات فایل (نام، تاریخ، حجم)
   - دکمه دانلود و مشاهده قرارداد
   - پیام مناسب در صورت نبود فایل

2. **آپلود قرارداد امضا شده:**
   - انتخاب فایل از دستگاه (PDF, JPG, PNG)
   - نمایش پیش‌نمایش فایل انتخاب شده
   - بررسی حجم فایل (حداکثر 10MB)
   - آپلود فایل به سرور
   - نمایش وضعیت آپلود

3. **نمایش قرارداد آپلود شده قبلی:**
   - نمایش اطلاعات فایل آپلود شده
   - وضعیت قرارداد (در انتظار بررسی / تایید شده / رد شده)
   - تاریخ آپلود و بررسی

4. **راهنمایی کاربر:**
   - مراحل استفاده از صفحه
   - فرمت‌های مجاز
   - محدودیت‌های حجم فایل

#### UI/UX:
- طراحی مدرن و کاربرپسند
- آیکن‌های Ionicons
- رنگ‌بندی تم‌دار
- پیام‌های راهنما
- وضعیت‌های loading
- مدیریت خطا

---

## 🔧 تغییرات فایل‌ها

### 1️⃣ فایل جدید: `OrganizationContract.js`

```
screens/organization/OrganizationContract.js
```

**Dependencies:**
```javascript
- React Native core components
- @expo/vector-icons (Ionicons)
- expo-document-picker
- axios
- AsyncStorage
```

**Key Functions:**
- `loadContractData()` - بارگذاری اطلاعات قرارداد از سرور
- `handleDownloadAdminContract()` - دانلود قرارداد ادمین
- `handlePickDocument()` - انتخاب فایل
- `handleUploadContract()` - آپلود قرارداد امضا شده
- `handleRemoveSelectedFile()` - حذف فایل انتخاب شده

---

### 2️⃣ تغییرات `App.js`

**Import اضافه شده:**
```javascript
import OrganizationContract from "./screens/organization/OrganizationContract";
```

**Screen اضافه شده:**
```javascript
<Stack.Screen
  component={OrganizationContract}
  name="OrganizationContract"
  options={{ headerShown: false }}
/>
```

---

### 3️⃣ تغییرات `MenuContext.js`

**Import‌های اضافه شده:**
```javascript
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
```

**تغییرات منو:**
- اضافه شدن `useMemo` برای بهینه‌سازی
- استفاده از Redux برای دریافت `userType`
- آیتم جدید با `id: 8` و `organizationOnly: true`
- فیلتر کردن منو بر اساس نوع کاربر

**آیتم منو:**
```javascript
{ 
  id: 8, 
  title: "قراردادنامه", 
  screen: "OrganizationContract", 
  organizationOnly: true 
}
```

**منطق نمایش:**
```javascript
const menuItems = useMemo(() => {
  if (userType === 'organization') {
    return baseMenuItems; // All items
  } else {
    return baseMenuItems.filter(item => !item.organizationOnly);
  }
}, [userType]);
```

---

## 📁 ساختار پروژه

```
loop-user-app/
├── screens/
│   └── organization/
│       └── OrganizationContract.js ✨ جدید
├── contexts/
│   └── MenuContext.js ✏️ ویرایش شده
├── App.js ✏️ ویرایش شده
└── docs/
    └── ORGANIZATION_CONTRACT_API.md ✨ جدید
```

---

## 🎨 UI Structure

```
┌──────────────────────────────────────┐
│      قراردادنامه سازمانی           │ ← Header
├──────────────────────────────────────┤
│  ℹ️ توضیحات                         │ ← Info Box
├──────────────────────────────────────┤
│  📄 قرارداد همکاری                 │
│  ┌────────────────────────────────┐ │
│  │ 📄 قرارداد_همکاری.pdf         │ │
│  │ تاریخ: 1403/08/17              │ │
│  │ [دانلود و مشاهده]              │ │
│  └────────────────────────────────┘ │
├──────────────────────────────────────┤
│  ☁️ بارگذاری قرارداد امضا شده     │
│  ┌────────────────────────────────┐ │
│  │ 📎 فایل انتخاب شده            │ │
│  │ contract.pdf - 2.5 MB          │ │
│  └────────────────────────────────┘ │
│  [انتخاب فایل] [آپلود قرارداد]    │
│                                      │
│  ✅ قرارداد آپلود شده قبلی:       │
│  ┌────────────────────────────────┐ │
│  │ ✓ قرارداد_امضا_شده.pdf        │ │
│  │ تاریخ: 1403/08/18              │ │
│  │ وضعیت: در انتظار بررسی        │ │
│  └────────────────────────────────┘ │
│                                      │
│  💡 راهنما:                         │
│  • ابتدا قرارداد را دانلود کنید   │
│  • قرارداد را امضا کنید            │
│  • فایل امضا شده را آپلود کنید    │
└──────────────────────────────────────┘
```

---

## 🔐 نکات امنیتی

1. **Authentication:** بررسی توکن کاربر
2. **Authorization:** فقط کاربران سازمانی دسترسی دارند
3. **File Validation:** 
   - بررسی نوع فایل (PDF, JPG, PNG)
   - بررسی حجم فایل (max 10MB)
4. **Error Handling:** مدیریت خطاهای شبکه و سرور

---

## 🚀 نحوه استفاده

### برای کاربر سازمانی:

1. وارد حساب کاربری سازمانی شوید
2. از منو گزینه **"قراردادنامه"** را انتخاب کنید
3. قرارداد بارگذاری شده توسط ادمین را دانلود کنید
4. قرارداد را مطالعه و امضا کنید
5. فایل امضا شده را از گزینه **"انتخاب فایل"** انتخاب کنید
6. روی **"آپلود قرارداد"** کلیک کنید
7. منتظر بررسی و تایید ادمین باشید

### برای کاربر عادی:

- آیتم "قراردادنامه" در منو **نمایش داده نمی‌شود**

---

## 📊 Mock Data

در حال حاضر، صفحه با **Mock Data** کار می‌کند:

```javascript
// Mock admin contract
setAdminContract({
  id: 1,
  file_url: 'https://example.com/contract.pdf',
  file_name: 'قرارداد_همکاری_سازمانی.pdf',
  uploaded_at: '1403/08/17',
});
```

**نکته:** خطوط مربوط به API کامنت شده‌اند و باید بعد از آماده شدن Backend فعال شوند.

---

## 🔌 اتصال API

### گام‌های اتصال به Backend:

1. **فایل مستندات API را به تیم Backend بدهید:**
   ```
   docs/ORGANIZATION_CONTRACT_API.md
   ```

2. **در فایل `OrganizationContract.js` کامنت‌ها را برداشته و Mock data را حذف کنید:**

   ```javascript
   // Uncomment این قسمت:
   const response = await axios.get(`${uri}/organization/contract`, {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Accept': 'application/json',
     }
   });

   if (response.data.status === 'success') {
     setAdminContract(response.data.data.admin_contract);
     setUploadedContract(response.data.data.user_contract);
   }

   // حذف کنید Mock data را:
   // setAdminContract({ ... });
   ```

3. **همین کار را برای تابع `handleUploadContract` انجام دهید**

4. **تست کامل صفحه با API واقعی**

---

## 🧪 تست‌های مورد نیاز

### Frontend (قبل از اتصال API):
- ✅ نمایش صحیح UI
- ✅ انتخاب فایل
- ✅ بررسی حجم فایل
- ✅ نمایش پیام‌های خطا
- ✅ Loading states
- ✅ نمایش/عدم نمایش در منو بر اساس userType

### Backend (بعد از پیاده‌سازی API):
- [ ] دریافت اطلاعات قرارداد
- [ ] آپلود فایل
- [ ] دانلود فایل
- [ ] Authorization (فقط کاربران سازمانی)
- [ ] Validation (نوع و حجم فایل)

### Integration:
- [ ] اتصال صحیح Frontend به Backend
- [ ] تست end-to-end کامل

---

## 📝 API Endpoints Summary

| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | `/organization/contract` | دریافت اطلاعات قرارداد |
| POST | `/organization/contract/upload` | آپلود قرارداد امضا شده |
| GET | `/organization/contract/download/{id}` | دانلود فایل (اختیاری) |
| DELETE | `/organization/contract/{id}` | حذف قرارداد (اختیاری) |

مستندات کامل در: `docs/ORGANIZATION_CONTRACT_API.md`

---

## 🎯 وضعیت فعلی

### ✅ تکمیل شده:
- ✅ طراحی و پیاده‌سازی UI کامل
- ✅ منطق Frontend
- ✅ اضافه کردن به منو (با شرط سازمانی)
- ✅ اضافه کردن route به App.js
- ✅ مستندات API کامل
- ✅ Mock data برای تست

### ⏳ در انتظار:
- ⏳ پیاده‌سازی API توسط Backend
- ⏳ اتصال به Backend
- ⏳ تست end-to-end

---

## 📞 پشتیبانی

در صورت نیاز به توضیحات بیشتر:
- مستندات API: `docs/ORGANIZATION_CONTRACT_API.md`
- کد صفحه: `screens/organization/OrganizationContract.js`
- تغییرات منو: `contexts/MenuContext.js`

---

**تاریخ پیاده‌سازی:** 1403/08/18  
**نسخه:** 1.0  
**وضعیت:** ✅ آماده برای اتصال به Backend
