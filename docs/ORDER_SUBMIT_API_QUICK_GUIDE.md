# 🚀 خلاصه سریع API ثبت سفارش

## ✅ آدرس صحیح

```
POST /api/orders/
```

⚠️ **توجه:** آدرس به `/` ختم می‌شود، نه `/submit`

---

## 📋 مثال سریع

### کاربر عادی

```javascript
const response = await fetch('http://your-api.com/api/orders/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    address_id: 1,
    category_id: 2,
    total_price: 500000,
    date: '2025-11-10',
    time: '14:00-16:00',
    male_count: 1
  })
});
```

### کاربر سازمانی (با service_schedule)

```javascript
const response = await fetch('http://your-api.com/api/orders/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    address_id: 3,
    category_id: 2,
    total_price: 2000000,
    date: '2025-11-15',
    time: '08:00-10:00',
    male_count: 2,
    service_schedule: {
      type: 'long_term',
      long_term: {
        duration: 'monthly',
        date: '2025-11-01',
        time: '09:00-11:00',
        file: 'uploads/contract.pdf'
      }
    }
  })
});
```

---

## 📝 فیلدهای الزامی

| فیلد | نوع | مثال |
|------|-----|------|
| `address_id` | integer | `1` |
| `category_id` | integer | `2` |
| `total_price` | number | `500000` |
| `date` | string (YYYY-MM-DD) | `"2025-11-10"` |
| `time` | string | `"14:00-16:00"` |

---

## 🏢 Service Schedule (فقط سازمان‌ها)

**شرط:** `account_type` باید `organization` یا `company` باشد

### Long-term (بلندمدت)

```json
{
  "service_schedule": {
    "type": "long_term",
    "long_term": {
      "duration": "monthly",
      "date": "2025-11-01",
      "time": "09:00-11:00",
      "file": "uploads/contract.pdf"
    }
  }
}
```

### Short-term (کوتاه‌مدت)

```json
{
  "service_schedule": {
    "type": "short_term",
    "short_term": {
      "date": "2025-11-05",
      "time": "14:00-16:00",
      "file": "uploads/contract.pdf"
    }
  }
}
```

---

## ✅ Response موفق

```json
{
  "success": true,
  "message": "سفارش با موفقیت ثبت شد.",
  "order": {
    "id": 123,
    "user_id": 9,
    "status": "pending",
    "pakar_price": 500000,
    "date": "2025-11-10",
    "time": "14:00-16:00",
    "service_schedule_type": "long_term",
    ...
  }
}
```

---

## ❌ Response خطا

```json
{
  "success": false,
  "message": "خطا در اعتبارسنجی داده‌ها",
  "errors": {
    "date": ["فرمت تاریخ صحیح نیست (Y-m-d)."],
    "total_price": ["قیمت کل باید عدد باشد."]
  }
}
```

---

## 🧪 تست سریع با cURL

```bash
# کاربر عادی
curl -X POST "http://192.168.21.107:8000/api/orders/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address_id":1,"category_id":2,"total_price":500000,"date":"2025-11-10","time":"14:00-16:00","male_count":1}'

# کاربر سازمانی
curl -X POST "http://192.168.21.107:8000/api/orders/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address_id":3,"category_id":2,"total_price":2000000,"date":"2025-11-15","time":"08:00-10:00","male_count":2,"service_schedule":{"type":"long_term","long_term":{"duration":"monthly","date":"2025-11-01","time":"09:00-11:00"}}}'
```

---

## 📚 مستندات کامل

برای جزئیات بیشتر به فایل **`ORDER_SUBMIT_API_COMPLETE_DOCS.md`** مراجعه کنید.

---

## 🔗 API‌های مرتبط

| API | توضیح |
|-----|-------|
| `GET /api/profile` | دریافت account_type کاربر |
| `GET /api/addresses` | لیست آدرس‌ها |
| `GET /api/categories` | لیست دسته‌بندی‌ها |
| `POST /api/steps/fetch` | دریافت مراحل (شامل service_schedule) |
| `GET /api/orders/{id}` | جزئیات سفارش |

---

## ⚡ نکات مهم

1. ✅ آدرس: `POST /api/orders/` (با `/` در انتها)
2. ✅ تاریخ: فرمت `YYYY-MM-DD` (مثال: `2025-11-10`)
3. ✅ Service Schedule: فقط برای `organization` و `company`
4. ✅ Token: همیشه در header `Authorization: Bearer {token}`
5. ✅ فیلد `type` در service_schedule اجباری: `long_term` یا `short_term`

---

**تاریخ:** 2025-11-08  
**محیط تست:** http://192.168.21.107:8000  
**نسخه:** 1.0.0
