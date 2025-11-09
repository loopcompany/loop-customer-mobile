# 📄 مستندات API قراردادنامه سازمانی

## نمای کلی

این مستندات API‌های مورد نیاز برای صفحه **قراردادنامه سازمانی** را توضیح می‌دهد. این صفحه به کاربران سازمانی اجازه می‌دهد تا قرارداد بارگذاری شده توسط ادمین را مشاهده و دانلود کنند، و قرارداد امضا شده خود را آپلود نمایند.

---

## 🔑 Authentication

تمام API‌های این بخش نیاز به توکن احراز هویت دارند:

```http
Authorization: Bearer {token}
```

**نکته:** فقط کاربران سازمانی (`userType: 'organization'`) به این API‌ها دسترسی دارند.

---

## 📋 API Endpoints

### 1️⃣ دریافت اطلاعات قرارداد

**Endpoint:** `GET /organization/contract`

**توضیح:** دریافت اطلاعات قرارداد بارگذاری شده توسط ادمین و قرارداد آپلود شده توسط سازمان

**Headers:**
```http
Authorization: Bearer {token}
Accept: application/json
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "اطلاعات قرارداد با موفقیت دریافت شد",
  "data": {
    "admin_contract": {
      "id": 1,
      "file_url": "https://example.com/storage/contracts/contract_123.pdf",
      "file_name": "قرارداد_همکاری_سازمانی.pdf",
      "file_size": 2048576,
      "mime_type": "application/pdf",
      "uploaded_at": "1403/08/17",
      "description": "قرارداد همکاری سازمانی با شرکت لوپ"
    },
    "user_contract": {
      "id": 5,
      "file_url": "https://example.com/storage/user_contracts/signed_contract_456.pdf",
      "file_name": "قرارداد_امضا_شده.pdf",
      "file_size": 3145728,
      "mime_type": "application/pdf",
      "uploaded_at": "1403/08/18",
      "status": "pending",
      "status_label": "در انتظار بررسی",
      "reviewed_at": null,
      "admin_note": null
    }
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `admin_contract` | Object/null | قرارداد بارگذاری شده توسط ادمین (null اگر هنوز بارگذاری نشده) |
| `admin_contract.id` | Integer | شناسه قرارداد |
| `admin_contract.file_url` | String | URL کامل فایل قرارداد |
| `admin_contract.file_name` | String | نام فایل |
| `admin_contract.file_size` | Integer | حجم فایل به بایت |
| `admin_contract.mime_type` | String | نوع فایل (application/pdf, image/jpeg, etc.) |
| `admin_contract.uploaded_at` | String | تاریخ شمسی بارگذاری |
| `admin_contract.description` | String | توضیحات قرارداد |
| `user_contract` | Object/null | قرارداد آپلود شده توسط کاربر (null اگر هنوز آپلود نشده) |
| `user_contract.status` | String | وضعیت: `pending`, `approved`, `rejected` |
| `user_contract.status_label` | String | برچسب فارسی وضعیت |
| `user_contract.reviewed_at` | String/null | تاریخ بررسی توسط ادمین |
| `user_contract.admin_note` | String/null | یادداشت ادمین (در صورت رد شدن) |

**Response Error (404):**
```json
{
  "status": "error",
  "message": "هیچ قراردادی یافت نشد"
}
```

**Response Error (403):**
```json
{
  "status": "error",
  "message": "فقط کاربران سازمانی به این بخش دسترسی دارند"
}
```

---

### 2️⃣ آپلود قرارداد امضا شده

**Endpoint:** `POST /organization/contract/upload`

**توضیح:** آپلود فایل قرارداد امضا شده توسط سازمان

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: multipart/form-data
Accept: application/json
```

**Request Body (FormData):**
```javascript
{
  "contract": File // فایل قرارداد (PDF, JPG, PNG)
}
```

**Validation Rules:**
- فایل الزامی است
- فرمت‌های مجاز: `pdf`, `jpg`, `jpeg`, `png`
- حداکثر حجم: `10 MB`

**Response Success (200):**
```json
{
  "status": "success",
  "message": "قرارداد با موفقیت آپلود شد و در انتظار بررسی است",
  "data": {
    "contract": {
      "id": 5,
      "file_url": "https://example.com/storage/user_contracts/signed_contract_456.pdf",
      "file_name": "قرارداد_امضا_شده.pdf",
      "file_size": 3145728,
      "mime_type": "application/pdf",
      "uploaded_at": "1403/08/18",
      "status": "pending",
      "status_label": "در انتظار بررسی"
    }
  }
}
```

**Response Error (422):**
```json
{
  "status": "error",
  "message": "خطای اعتبارسنجی",
  "errors": {
    "contract": [
      "فایل قرارداد الزامی است",
      "فرمت فایل باید PDF یا تصویر باشد",
      "حجم فایل نباید بیشتر از 10 مگابایت باشد"
    ]
  }
}
```

**Response Error (409):**
```json
{
  "status": "error",
  "message": "قرارداد شما در حال حاضر در انتظار بررسی است. لطفا منتظر تایید ادمین بمانید."
}
```

---

### 3️⃣ دانلود قرارداد ادمین (Optional)

**Endpoint:** `GET /organization/contract/download/{contract_id}`

**توضیح:** دانلود مستقیم فایل قرارداد (اگر سرور نیاز به لاگ دانلود دارد)

**Headers:**
```http
Authorization: Bearer {token}
```

**Response:**
- فایل PDF یا تصویر به صورت مستقیم

**Response Error (404):**
```json
{
  "status": "error",
  "message": "فایل قرارداد یافت نشد"
}
```

---

### 4️⃣ حذف قرارداد آپلود شده (Optional)

**Endpoint:** `DELETE /organization/contract/{contract_id}`

**توضیح:** حذف قرارداد آپلود شده توسط کاربر (فقط اگر هنوز تایید نشده)

**Headers:**
```http
Authorization: Bearer {token}
Accept: application/json
```

**Response Success (200):**
```json
{
  "status": "success",
  "message": "قرارداد با موفقیت حذف شد"
}
```

**Response Error (403):**
```json
{
  "status": "error",
  "message": "امکان حذف قرارداد تایید شده وجود ندارد"
}
```

---

## 📊 Contract Status Values

| Status | Label | Description |
|--------|-------|-------------|
| `pending` | در انتظار بررسی | قرارداد آپلود شده و منتظر تایید ادمین |
| `approved` | تایید شده ✓ | قرارداد توسط ادمین تایید شده |
| `rejected` | رد شده ✗ | قرارداد رد شده (نیاز به آپلود مجدد) |

---

## 🎨 Frontend Implementation

### مثال: دریافت اطلاعات قرارداد

```javascript
const loadContractData = async () => {
  try {
    setLoadingContract(true);
    const token = await AsyncStorage.getItem('userToken');
    
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
  } catch (error) {
    console.error('Error loading contract:', error);
    Alert.alert('خطا', error.response?.data?.message || 'خطا در بارگذاری اطلاعات قرارداد');
  } finally {
    setLoadingContract(false);
  }
};
```

### مثال: آپلود قرارداد

```javascript
const handleUploadContract = async () => {
  try {
    if (!selectedFile) {
      Alert.alert('خطا', 'لطفا ابتدا فایل قرارداد را انتخاب کنید');
      return;
    }

    setUploadingContract(true);
    const token = await AsyncStorage.getItem('userToken');
    
    const formData = new FormData();
    formData.append('contract', {
      uri: selectedFile.uri,
      type: selectedFile.mimeType || 'application/pdf',
      name: selectedFile.name || 'contract.pdf',
    });

    const response = await axios.post(
      `${uri}/organization/contract/upload`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        }
      }
    );

    if (response.data.status === 'success') {
      Alert.alert('موفق', response.data.message, [
        { text: 'باشه', onPress: () => {
          setSelectedFile(null);
          loadContractData(); // Reload data
        }}
      ]);
    }
  } catch (error) {
    console.error('Error uploading contract:', error);
    Alert.alert('خطا', error.response?.data?.message || 'خطا در آپلود قرارداد');
  } finally {
    setUploadingContract(false);
  }
};
```

### مثال: دانلود قرارداد

```javascript
const handleDownloadAdminContract = async () => {
  try {
    if (!adminContract || !adminContract.file_url) {
      Alert.alert('خطا', 'فایل قرارداد موجود نیست');
      return;
    }

    const supported = await Linking.canOpenURL(adminContract.file_url);
    
    if (supported) {
      await Linking.openURL(adminContract.file_url);
    } else {
      Alert.alert('خطا', 'امکان باز کردن لینک وجود ندارد');
    }
  } catch (error) {
    console.error('Error downloading contract:', error);
    Alert.alert('خطا', 'خطا در دانلود قرارداد');
  }
};
```

---

## 🔒 Security Notes

1. **Authentication:** همه endpoint‌ها نیاز به Bearer token دارند
2. **Authorization:** فقط کاربران با `userType: 'organization'` دسترسی دارند
3. **File Validation:** سرور باید تایپ و حجم فایل را بررسی کند
4. **File Storage:** فایل‌ها باید در مسیر امن ذخیره شوند
5. **URL Signing:** برای امنیت بیشتر می‌توان از signed URLs استفاده کرد

---

## 📱 UI/UX Considerations

### صفحه نمایش قرارداد شامل:

1. **قسمت قرارداد ادمین:**
   - نمایش اطلاعات فایل (نام، تاریخ، حجم)
   - دکمه دانلود/مشاهده
   - پیام "هنوز بارگذاری نشده" اگر فایلی وجود ندارد

2. **قسمت آپلود قرارداد:**
   - دکمه انتخاب فایل
   - نمایش فایل انتخاب شده
   - دکمه آپلود
   - نمایش وضعیت آپلود (در حال آپلود...)
   - نمایش قرارداد آپلود شده قبلی با وضعیت

3. **راهنمایی:**
   - توضیح مراحل
   - فرمت‌های مجاز
   - محدودیت حجم

---

## 🧪 Testing Checklist

- [ ] دریافت قرارداد زمانی که ادمین فایل بارگذاری کرده
- [ ] دریافت قرارداد زمانی که هیچ فایلی بارگذاری نشده
- [ ] دانلود فایل قرارداد ادمین
- [ ] انتخاب فایل با فرمت‌های مختلف (PDF, JPG, PNG)
- [ ] انتخاب فایل با حجم بیش از حد مجاز
- [ ] آپلود قرارداد با موفقیت
- [ ] آپلود مجدد زمانی که قرارداد pending است
- [ ] نمایش صحیح وضعیت قرارداد (pending, approved, rejected)
- [ ] دسترسی محدود به کاربران سازمانی
- [ ] نمایش خطاهای validation

---

## 📝 Database Schema (Suggestion)

```sql
-- جدول قراردادهای ادمین
CREATE TABLE admin_contracts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول قراردادهای آپلود شده توسط سازمان‌ها
CREATE TABLE organization_contracts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_id BIGINT NOT NULL,
    admin_contract_id BIGINT,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP NULL,
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_contract_id) REFERENCES admin_contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL
);
```

---

## 🚀 Next Steps

1. Backend team implement کند API endpoints را
2. تست کامل API‌ها
3. اتصال Frontend به Backend
4. تست end-to-end
5. Deploy

---

**تاریخ آماده‌سازی:** 1403/08/18  
**نسخه مستندات:** 1.0  
**وضعیت:** آماده برای پیاده‌سازی Backend
