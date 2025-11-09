# Location Picker Implementation

## تاریخ پیاده‌سازی
2025-11-09

## خلاصه تغییرات

به فرم‌های ثبت‌نام کاربر عادی و سازمانی، انتخابگر استان، شهر و منطقه اضافه شد که از API های جدید Location استفاده می‌کند.

---

## 📁 فایل‌های ایجاد شده

### 1. `components/LocationPicker.js`
یک کامپوننت قابل استفاده مجدد برای انتخاب استان، شهر و منطقه

**ویژگی‌ها:**
- ✅ دریافت خودکار لیست استان‌ها از API
- ✅ دریافت خودکار شهرها بر اساس استان انتخابی
- ✅ دریافت خودکار مناطق بر اساس شهر انتخابی
- ✅ قابلیت جستجو در لیست‌ها
- ✅ نمایش خطاهای validation
- ✅ Modal های زیبا و کاربرپسند
- ✅ پشتیبانی کامل از Web و Native
- ✅ غیرفعال کردن شهر تا زمان انتخاب استان
- ✅ غیرفعال کردن منطقه تا زمان انتخاب شهر
- ✅ ریست خودکار فیلدهای وابسته هنگام تغییر

**نحوه استفاده:**
```jsx
import LocationPicker from '../components/LocationPicker';

<LocationPicker
  selectedProvince={selectedProvince}
  selectedCity={selectedCity}
  selectedRegion={selectedRegion}
  onProvinceChange={(province) => setSelectedProvince(province)}
  onCityChange={(city) => setSelectedCity(city)}
  onRegionChange={(region) => setSelectedRegion(region)}
  errors={{
    province: errors.province,
    city: errors.city,
    region: errors.region
  }}
  required={true}
/>
```

---

## 📝 فایل‌های ویرایش شده

### 2. `screens/auth/MainSignIn.js` - ثبت‌نام کاربر عادی

**تغییرات:**

#### Import ها:
```javascript
import LocationPicker from "../../components/LocationPicker";
```

#### State اضافه شده:
```javascript
const initialState = {
    // ... other fields
    province: null,
    city: null,
    region: null,
    // ...
};
```

#### Validation:
```javascript
// Location validation
if (!state.province) {
    errors.province = 'انتخاب استان الزامی است';
}
if (!state.city) {
    errors.city = 'انتخاب شهر الزامی است';
}
if (!state.region) {
    errors.region = 'انتخاب منطقه الزامی است';
}
```

#### API Request:
```javascript
const userData = {
    melicode: state.melicode,
    phone: state.phone,
    email: state.email,
    province_id: state.province?.id,
    city_id: state.city?.id,
    region_id: state.region?.id,
    other_referral_code: state.otherReferralCode ? `${inviteLetter}${state.otherReferralCode}` : null,
};
```

#### UI Component:
```jsx
{/* Location Picker - Province, City, Region */}
<View style={styles.inputContainer}>
    <LocationPicker
        selectedProvince={state.province}
        selectedCity={state.city}
        selectedRegion={state.region}
        onProvinceChange={(province) => dispatch({ type: 'SET_FIELD', field: 'province', value: province })}
        onCityChange={(city) => dispatch({ type: 'SET_FIELD', field: 'city', value: city })}
        onRegionChange={(region) => dispatch({ type: 'SET_FIELD', field: 'region', value: region })}
        errors={{
            province: state.errors.province,
            city: state.errors.city,
            region: state.errors.region
        }}
        required={true}
    />
</View>
```

---

### 3. `org/logreg/Register.js` - ثبت‌نام سازمانی

**تغییرات:**

#### Import ها:
```javascript
import LocationPicker from '../../components/LocationPicker';
```

#### State اضافه شده:
```javascript
// Location states
const [selectedProvince, setSelectedProvince] = useState(null);
const [selectedCity, setSelectedCity] = useState(null);
const [selectedRegion, setSelectedRegion] = useState(null);
```

#### Validation:
```javascript
// Location validation
if (!selectedProvince) {
    newErrors.province = 'انتخاب استان الزامی است';
}
if (!selectedCity) {
    newErrors.city = 'انتخاب شهر الزامی است';
}
if (!selectedRegion) {
    newErrors.region = 'انتخاب منطقه الزامی است';
}
```

#### FormData (API Request):
```javascript
// Add location IDs
if (selectedProvince) {
    formData.append('province_id', selectedProvince.id);
}
if (selectedCity) {
    formData.append('city_id', selectedCity.id);
}
if (selectedRegion) {
    formData.append('region_id', selectedRegion.id);
}
```

#### UI Component:
```jsx
{/* استان، شهر و منطقه با LocationPicker */}
<View style={{ marginBottom: 8 }}>
    <LocationPicker
        selectedProvince={selectedProvince}
        selectedCity={selectedCity}
        selectedRegion={selectedRegion}
        onProvinceChange={setSelectedProvince}
        onCityChange={setSelectedCity}
        onRegionChange={setSelectedRegion}
        errors={{
            province: errors.province,
            city: errors.city,
            region: errors.region
        }}
        required={true}
    />
</View>
```

**توجه:** فیلدهای قدیمی `city` و `region` (TextInput) حذف شدند و با LocationPicker جایگزین شدند.

---

## 🔌 API Endpoints مورد استفاده

### 1. دریافت لیست استان‌ها
```
GET /api/locations/provinces
```

### 2. دریافت لیست شهرها
```
GET /api/locations/provinces/{provinceId}/cities
```

### 3. دریافت لیست مناطق
```
GET /api/locations/cities/{cityId}/regions
```

---

## 📤 Data Format ارسالی به Backend

### برای کاربر عادی (MainSignIn.js):
```json
{
  "melicode": "1234567890",
  "phone": "09123456789",
  "email": "user@example.com",
  "province_id": 1,
  "city_id": 10,
  "region_id": 25,
  "other_referral_code": "L123456"
}
```

### برای سازمان (Register.js):
```javascript
FormData {
  "organization_name": "شرکت نمونه",
  "manager_mobile": "09123456789",
  "province_id": 1,
  "city_id": 10,
  "region_id": 25,
  // ... other fields
}
```

---

## ✨ ویژگی‌های کلیدی

### 1. **Cascading Selection (انتخاب آبشاری)**
- وقتی استان انتخاب می‌شود، لیست شهرها لود می‌شود
- وقتی شهر انتخاب می‌شود، لیست مناطق لود می‌شود
- تغییر استان، شهر و منطقه قبلی را ریست می‌کند
- تغییر شهر، منطقه قبلی را ریست می‌کند

### 2. **Search Functionality**
- جستجوی آنی در لیست استان‌ها، شهرها و مناطق
- فیلتر case-insensitive

### 3. **Error Handling**
- نمایش خطاهای validation زیر هر فیلد
- رنگ قرمز برای فیلدهای دارای خطا
- پیام‌های خطای فارسی و واضح

### 4. **Loading States**
- نمایش ActivityIndicator هنگام لود داده‌ها
- غیرفعال کردن دکمه‌ها هنگام لود

### 5. **Cross-Platform Support**
- کار می‌کند در Web، iOS و Android
- استفاده از `window.alert` در Web و `Alert.alert` در Native

---

## 🧪 نحوه تست

### تست در Web:
```bash
npm start
# یا
npx expo start --web
```

### تست در Android/iOS:
```bash
npx expo start
# سپس Scan QR code با Expo Go
```

### سناریوهای تست:

1. ✅ **انتخاب استان**
   - باز کردن modal استان‌ها
   - جستجو در لیست
   - انتخاب یک استان
   - بررسی لود شدن شهرها

2. ✅ **انتخاب شهر**
   - انتخاب شهر از لیست
   - بررسی لود شدن مناطق

3. ✅ **انتخاب منطقه**
   - انتخاب منطقه از لیست

4. ✅ **Validation**
   - سعی در submit بدون انتخاب استان
   - بررسی نمایش خطا

5. ✅ **Cascading Reset**
   - انتخاب استان، شهر و منطقه
   - تغییر استان
   - بررسی ریست شدن شهر و منطقه

6. ✅ **Submit Form**
   - پر کردن کامل فرم
   - submit و بررسی data ارسالی در console/network

---

## 🐛 نکات مهم و Troubleshooting

### 1. اگر لیست استان‌ها لود نمی‌شود:
- بررسی کنید API در دسترس است: `GET /api/locations/provinces`
- بررسی کنید `uri` در `services/URL.js` درست تنظیم شده
- Console را برای خطاهای network بررسی کنید

### 2. اگر Modal در Web باز نمی‌شود:
- بررسی کنید z-index مناسب است
- بررسی کنید استایل‌های CSS تداخل ندارند

### 3. اگر فونت‌های فارسی نمایش داده نمی‌شوند:
- بررسی کنید فونت‌های Vazir در App.js لود شده‌اند
- منتظر بمانید تا فونت‌ها لود شوند

---

## 📚 مستندات مرتبط

- [LOCATION_API_DOCS.md](./LOCATION_API_DOCS.md) - مستندات کامل API های Location
- [Backend Location API Implementation] - پیاده‌سازی سمت Backend

---

## 🎯 کارهای آینده (اختیاری)

- [ ] اضافه کردن Autocomplete برای جستجوی سریع
- [ ] Cache کردن لیست استان‌ها در AsyncStorage
- [ ] افزودن animation های بهتر برای Modal
- [ ] پشتیبانی از RTL layout بهتر
- [ ] افزودن unit tests برای LocationPicker

---

## 👨‍💻 Developer Notes

- کامپوننت LocationPicker کاملاً reusable است و می‌تواند در هر فرم دیگری استفاده شود
- از axios برای API calls استفاده شده (نه fetch)
- State management با useState/useReducer انجام شده
- Validation در هر دو فرم به صورت یکسان پیاده‌سازی شده
- هیچ کتابخانه third-party اضافی نیاز نیست

---

**✅ Implementation Complete!**
