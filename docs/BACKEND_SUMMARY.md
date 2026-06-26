# 🎯 خلاصه برای تیم Backend - توافق نامه سازمانی

## نیازمندی‌های API

### 1. Endpoint: دریافت اطلاعات توافق نامه
```
GET /organization/contract
```

**Response مورد نیاز:**
```json
{
  "status": "success",
  "data": {
    "admin_contract": {
      "id": 1,
      "file_url": "https://example.com/storage/contracts/contract.pdf",
      "file_name": "توافق نامه_همکاری_سازمانی.pdf",
      "file_size": 2048576,
      "mime_type": "application/pdf",
      "uploaded_at": "1403/08/17"
    },
    "user_contract": {
      "id": 5,
      "file_url": "https://example.com/storage/user_contracts/signed.pdf",
      "file_name": "توافق نامه_امضا_شده.pdf",
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

### 2. Endpoint: آپلود توافق نامه
```
POST /organization/contract/upload
Content-Type: multipart/form-data

FormData:
- contract: File
```

**Validation:**
- فایل الزامی
- فرمت: pdf, jpg, jpeg, png
- حداکثر حجم: 10 MB

**Response مورد نیاز:**
```json
{
  "status": "success",
  "message": "توافق نامه با موفقیت آپلود شد",
  "data": {
    "contract": {
      "id": 5,
      "file_url": "...",
      "file_name": "...",
      "status": "pending"
    }
  }
}
```

## وضعیت‌های توافق نامه (Contract Status)

| Status | Label | توضیح |
|--------|-------|-------|
| `pending` | در انتظار بررسی | منتظر تایید ادمین |
| `approved` | تایید شده ✓ | تایید شده |
| `rejected` | رد شده ✗ | نیاز به آپلود مجدد |

## Authorization

- فقط کاربران با `userType: 'organization'` دسترسی دارند
- نیاز به Bearer Token

## مستندات کامل

📄 فایل کامل: `docs/ORGANIZATION_CONTRACT_API.md`
