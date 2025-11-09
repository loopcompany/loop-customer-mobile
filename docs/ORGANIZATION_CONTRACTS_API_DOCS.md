# مستندات API مدیریت قراردادهای سازمان‌ها

این مستندات شامل APIهای مربوط به مدیریت قراردادهای عمومی و قراردادهای امضا شده توسط سازمان‌ها می‌باشد.

---

## فهرست

1. [دریافت آخرین قرارداد عمومی](#1-دریافت-آخرین-قرارداد-عمومی)
2. [دریافت لیست قراردادهای سازمان](#2-دریافت-لیست-قراردادهای-سازمان)
3. [آپلود قرارداد امضا شده](#3-آپلود-قرارداد-امضا-شده)

---

## 1. دریافت آخرین قرارداد عمومی

این API برای دریافت آخرین قرارداد عمومی که توسط ادمین در پنل بارگذاری شده است استفاده می‌شود. فقط کاربران سازمانی می‌توانند از این API استفاده کنند.

### Endpoint
```
GET /api/contracts/latest
```

### احراز هویت
- **نوع**: Bearer Token (Sanctum)
- **نیازمند**: بله
- **محدودیت**: فقط کاربران با `account_type = 'organization'`

### Headers
```
Authorization: Bearer {access_token}
Accept: application/json
```

### پاسخ موفق (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "قرارداد همکاری سازمان‌ها - نسخه 1.2",
    "description": "قرارداد عمومی همکاری برای سازمان‌ها شامل شرایط و ضوابط",
    "pdf_path": "contracts/2025/11/contract-general-v1.2.pdf",
    "pdf_url": "https://example.com/storage/contracts/2025/11/contract-general-v1.2.pdf",
    "is_active": true,
    "created_at": "2025-11-08T10:30:00.000000Z",
    "creator_name": "ادمین سیستم"
  }
}
```

### پاسخ در صورت نبود قرارداد (404 Not Found)
```json
{
  "success": false,
  "message": "هیچ قرارداد فعالی یافت نشد."
}
```

### پاسخ خطا - کاربر عادی (403 Forbidden)
```json
{
  "success": false,
  "message": "فقط کاربران سازمانی می‌توانند قراردادها را مشاهده کنند."
}
```

### نمونه درخواست (cURL)
```bash
curl -X GET "https://example.com/api/contracts/latest" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

### نمونه درخواست (JavaScript/Fetch)
```javascript
fetch('https://example.com/api/contracts/latest', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Accept': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Contract PDF URL:', data.data.pdf_url);
    // Download or display the contract
  }
})
.catch(error => console.error('Error:', error));
```

### نمونه درخواست (PHP/Laravel)
```php
use Illuminate\Support\Facades\Http;

$response = Http::withToken($accessToken)
    ->get('https://example.com/api/contracts/latest');

if ($response->successful() && $response->json('success')) {
    $contract = $response->json('data');
    $pdfUrl = $contract['pdf_url'];
    // دانلود یا نمایش قرارداد
}
```

---

## 2. دریافت لیست قراردادهای سازمان

این API تمام قراردادهای امضا شده توسط سازمان را به همراه وضعیت و تاریخچه برمی‌گرداند.

### Endpoint
```
GET /api/organization/contracts
```

### احراز هویت
- **نوع**: Bearer Token (Sanctum)
- **نیازمند**: بله
- **محدودیت**: فقط کاربران سازمانی که پروفایل سازمانی دارند

### Headers
```
Authorization: Bearer {access_token}
Accept: application/json
```

### پاسخ موفق (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "organization_id": 12,
      "contract_file_path": "organization_contracts/12/contract-signed-2025-11-08-15-30.pdf",
      "contract_url": "https://example.com/storage/organization_contracts/12/contract-signed-2025-11-08-15-30.pdf",
      "status": "approved",
      "status_label": "تایید شده",
      "rejection_reason": null,
      "uploaded_at": "2025-11-08T15:30:00.000000Z",
      "reviewed_at": "2025-11-08T16:00:00.000000Z",
      "can_edit": false
    },
    {
      "id": 4,
      "organization_id": 12,
      "contract_file_path": "organization_contracts/12/contract-signed-2025-11-05-10-15.pdf",
      "contract_url": "https://example.com/storage/organization_contracts/12/contract-signed-2025-11-05-10-15.pdf",
      "status": "rejected",
      "status_label": "رد شده",
      "rejection_reason": "امضا نامشخص است. لطفاً مجدداً با مهر و امضای معتبر بارگذاری کنید.",
      "uploaded_at": "2025-11-05T10:15:00.000000Z",
      "reviewed_at": "2025-11-05T14:20:00.000000Z",
      "can_edit": true
    },
    {
      "id": 3,
      "organization_id": 12,
      "contract_file_path": "organization_contracts/12/contract-signed-2025-11-01-09-00.pdf",
      "contract_url": "https://example.com/storage/organization_contracts/12/contract-signed-2025-11-01-09-00.pdf",
      "status": "pending",
      "status_label": "در انتظار بررسی",
      "rejection_reason": null,
      "uploaded_at": "2025-11-01T09:00:00.000000Z",
      "reviewed_at": null,
      "can_edit": true
    }
  ]
}
```

### توضیحات فیلدها

| فیلد | نوع | توضیحات |
|------|-----|---------|
| `id` | integer | شناسه یکتای قرارداد |
| `organization_id` | integer | شناسه سازمان |
| `contract_file_path` | string | مسیر فایل در storage |
| `contract_url` | string | URL کامل برای دانلود فایل PDF |
| `status` | string | وضعیت: `pending`, `approved`, `rejected` |
| `status_label` | string | برچسب فارسی وضعیت |
| `rejection_reason` | string\|null | دلیل رد (فقط در صورت رد شدن) |
| `uploaded_at` | datetime | تاریخ و زمان آپلود |
| `reviewed_at` | datetime\|null | تاریخ و زمان بررسی توسط ادمین |
| `can_edit` | boolean | آیا امکان آپلود مجدد وجود دارد؟ |

### پاسخ خطا - سازمان یافت نشد (404 Not Found)
```json
{
  "success": false,
  "message": "اطلاعات سازمان یافت نشد."
}
```

### نمونه درخواست (cURL)
```bash
curl -X GET "https://example.com/api/organization/contracts" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

### نمونه درخواست (JavaScript/Fetch)
```javascript
fetch('https://example.com/api/organization/contracts', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Accept': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    const contracts = data.data;
    
    // نمایش آخرین قرارداد
    const latestContract = contracts[0];
    console.log('Latest status:', latestContract.status_label);
    
    // چک کردن امکان آپلود مجدد
    if (latestContract.can_edit) {
      console.log('You can upload a new version');
    }
    
    // نمایش دلیل رد
    if (latestContract.status === 'rejected') {
      console.log('Rejection reason:', latestContract.rejection_reason);
    }
  }
})
.catch(error => console.error('Error:', error));
```

---

## 3. آپلود قرارداد امضا شده

این API برای آپلود قرارداد امضا شده توسط سازمان استفاده می‌شود. سازمان می‌تواند در صورت رد شدن یا در انتظار بررسی بودن، مجدداً آپلود کند.

### Endpoint
```
POST /api/organization/contracts/upload
```

### احراز هویت
- **نوع**: Bearer Token (Sanctum)
- **نیازمند**: بله
- **محدودیت**: فقط کاربران سازمانی

### Headers
```
Authorization: Bearer {access_token}
Accept: application/json
Content-Type: multipart/form-data
```

### پارامترها

| پارامتر | نوع | ضروری | توضیحات |
|---------|-----|-------|---------|
| `contract_file` | file | بله | فایل PDF قرارداد امضا شده (حداکثر 500MB) |

### محدودیت‌ها
- **فرمت**: فقط PDF
- **حجم**: حداکثر 500 مگابایت
- **محدودیت آپلود**: اگر قرارداد فعلی `approved` باشد، امکان آپلود مجدد وجود ندارد

### پاسخ موفق (201 Created)
```json
{
  "success": true,
  "message": "قرارداد با موفقیت بارگذاری شد و در انتظار تایید است.",
  "data": {
    "id": 6,
    "organization_id": 12,
    "contract_file_path": "organization_contracts/12/contract-signed-2025-11-08-17-45.pdf",
    "contract_url": "https://example.com/storage/organization_contracts/12/contract-signed-2025-11-08-17-45.pdf",
    "status": "pending",
    "status_label": "در انتظار بررسی",
    "rejection_reason": null,
    "uploaded_at": "2025-11-08T17:45:00.000000Z",
    "reviewed_at": null,
    "can_edit": true
  }
}
```

### پاسخ خطا - قرارداد تایید شده وجود دارد (400 Bad Request)
```json
{
  "success": false,
  "message": "شما یک قرارداد تایید شده دارید و امکان بارگذاری مجدد وجود ندارد."
}
```

### پاسخ خطا - اعتبارسنجی (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "خطاهای اعتبارسنجی",
  "errors": {
    "contract_file": [
      "فایل قرارداد الزامی است.",
      "فایل باید از نوع PDF باشد.",
      "حجم فایل نباید بیشتر از 500 مگابایت باشد."
    ]
  }
}
```

### پاسخ خطا - سازمان یافت نشد (404 Not Found)
```json
{
  "success": false,
  "message": "اطلاعات سازمان یافت نشد."
}
```

### نمونه درخواست (cURL)
```bash
curl -X POST "https://example.com/api/organization/contracts/upload" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json" \
  -F "contract_file=@/path/to/signed-contract.pdf"
```

### نمونه درخواست (JavaScript/Fetch)
```javascript
// فرض کنید input file با id="contractFile" داریم
const fileInput = document.getElementById('contractFile');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('contract_file', file);

fetch('https://example.com/api/organization/contracts/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Accept': 'application/json'
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Contract uploaded successfully');
    console.log('Status:', data.data.status_label);
  } else {
    console.error('Upload failed:', data.message);
  }
})
.catch(error => console.error('Error:', error));
```

### نمونه درخواست (PHP/Laravel)
```php
use Illuminate\Support\Facades\Http;

$response = Http::withToken($accessToken)
    ->attach('contract_file', file_get_contents($pdfPath), 'contract.pdf')
    ->post('https://example.com/api/organization/contracts/upload');

if ($response->successful() && $response->json('success')) {
    $contract = $response->json('data');
    echo "قرارداد با موفقیت آپلود شد. وضعیت: " . $contract['status_label'];
} else {
    echo "خطا: " . $response->json('message');
}
```

### نمونه درخواست (React Native/Axios)
```javascript
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker';

const uploadContract = async () => {
  try {
    // انتخاب فایل
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf],
    });

    // ایجاد FormData
    const formData = new FormData();
    formData.append('contract_file', {
      uri: result[0].uri,
      type: 'application/pdf',
      name: result[0].name,
    });

    // ارسال درخواست
    const response = await axios.post(
      'https://example.com/api/organization/contracts/upload',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      console.log('Success:', response.data.message);
      console.log('Contract ID:', response.data.data.id);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## جریان کار (Workflow)

### برای سازمان:

1. **دانلود قرارداد عمومی**:
   - فراخوانی `GET /api/contracts/latest`
   - دانلود فایل PDF از `pdf_url`

2. **امضا و آپلود**:
   - امضای فیزیکی قرارداد
   - اسکن و تبدیل به PDF
   - آپلود از طریق `POST /api/organization/contracts/upload`

3. **پیگیری وضعیت**:
   - فراخوانی `GET /api/organization/contracts`
   - بررسی `status` آخرین قرارداد

4. **در صورت رد شدن**:
   - مطالعه `rejection_reason`
   - اصلاح و آپلود مجدد از طریق `POST /api/organization/contracts/upload`

### برای ادمین (در پنل Filament):

1. ورود به بخش سازمان‌ها
2. انتخاب سازمان و رفتن به صفحه ویرایش
3. مشاهده تب "قراردادهای سازمان"
4. دانلود و بررسی فایل PDF
5. تایید یا رد قرارداد (با ذکر دلیل در صورت رد)

---

## نکات مهم

### محدودیت‌های امنیتی:
- تمام APIها نیازمند احراز هویت با Sanctum هستند
- فقط کاربران سازمانی می‌توانند به قراردادها دسترسی داشته باشند
- هر سازمان فقط قراردادهای خود را می‌بیند

### مدیریت فایل‌ها:
- فایل‌های قرارداد در `storage/app/public/organization_contracts/{organization_id}/` ذخیره می‌شوند
- حجم مجاز: حداکثر 500 مگابایت برای قراردادهای سازمان
- فرمت مجاز: فقط PDF

### وضعیت‌های قرارداد:
- **pending**: در انتظار بررسی توسط ادمین
- **approved**: تایید شده - امکان آپلود مجدد وجود ندارد
- **rejected**: رد شده - سازمان می‌تواند مجدداً آپلود کند

### تاریخچه:
- تمام نسخه‌های قرارداد در پایگاه داده حفظ می‌شوند
- سازمان می‌تواند تاریخچه کامل را مشاهده کند
- استفاده از Soft Delete برای نگهداری تاریخچه

---

## کدهای خطا (Error Codes)

| کد HTTP | معنی | دلیل |
|---------|------|------|
| 200 | OK | درخواست موفق |
| 201 | Created | قرارداد با موفقیت ایجاد شد |
| 400 | Bad Request | قرارداد تایید شده وجود دارد |
| 401 | Unauthorized | توکن نامعتبر یا منقضی |
| 403 | Forbidden | کاربر سازمانی نیست |
| 404 | Not Found | سازمان یا قرارداد یافت نشد |
| 422 | Unprocessable Entity | خطای اعتبارسنجی |
| 500 | Internal Server Error | خطای سرور |

---

## تست API

### با Postman:

1. **Setup Environment**:
   ```
   BASE_URL: https://example.com/api
   ACCESS_TOKEN: your_token_here
   ```

2. **Test GET Latest Contract**:
   - Method: GET
   - URL: `{{BASE_URL}}/contracts/latest`
   - Headers: `Authorization: Bearer {{ACCESS_TOKEN}}`

3. **Test GET Organization Contracts**:
   - Method: GET
   - URL: `{{BASE_URL}}/organization/contracts`
   - Headers: `Authorization: Bearer {{ACCESS_TOKEN}}`

4. **Test Upload Contract**:
   - Method: POST
   - URL: `{{BASE_URL}}/organization/contracts/upload`
   - Headers: `Authorization: Bearer {{ACCESS_TOKEN}}`
   - Body: form-data
   - Key: `contract_file`, Type: File

---

## پشتیبانی و سوالات متداول

### Q: آیا می‌توانم قرارداد تایید شده را ویرایش کنم؟
**A**: خیر. پس از تایید، قرارداد قفل می‌شود و امکان ویرایش یا آپلود مجدد وجود ندارد.

### Q: اگر قرارداد رد شود چه باید کنم؟
**A**: دلیل رد را در فیلد `rejection_reason` مطالعه کنید، مشکل را برطرف کنید و مجدداً آپلود کنید.

### Q: آیا می‌توانم چندین قرارداد در انتظار داشته باشم؟
**A**: بله، اما فقط آخرین قرارداد قابل ویرایش است.

### Q: چرا نمی‌توانم قرارداد آپلود کنم؟
**A**: احتمالاً یک قرارداد تایید شده دارید. هر سازمان فقط می‌تواند یک قرارداد تایید شده داشته باشد.

---

**تاریخ بروزرسانی**: 8 نوامبر 2025  
**نسخه API**: 1.0
