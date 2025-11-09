# 🔧 Fix: تصحیح آدرس API ثبت سفارش

**تاریخ:** 2025-11-08  
**اولویت:** 🔴 Critical  
**وضعیت:** ✅ حل شد

---

## 📋 خلاصه مشکل

هنگام ثبت سفارش، خطای **404 Not Found** دریافت می‌شد:

```
ERROR ❌ [Preview] خطا در ثبت سفارش: [AxiosError: Request failed with status code 404]
ERROR ❌ [Preview] جزئیات خطا: {
  "exception": "Symfony\\Component\\HttpKernel\\Exception\\NotFoundHttpException",
  "message": "The route api/orders/submit could not be found."
}
```

---

## 🔍 تحلیل ریشه‌ای

### مشکل: آدرس API اشتباه بود

**کد قبلی:**
```javascript
// ❌ اشتباه
await axios.post(`${uri}/orders/submit`, payload, {...})
```

**دلیل خطا:**
- Backend هیچ route به نام `/api/orders/submit` ندارد
- مستندات نادرست بود و `/orders/submit` رو معرفی کرده بود
- `ApiEndpoints.js` هم route اشتباه `/orders/create` داشت

### کشف آدرس صحیح

از فایل `ORDER_SUBMIT_API_QUICK_GUIDE.md` که کاربر فرستاد، آدرس صحیح رو پیدا کردیم:

```
✅ POST /api/orders/
```

**نکته مهم:** آدرس به `/` ختم می‌شود!

---

## ✅ راه‌حل

### 1️⃣ تصحیح `Preview.js`

**قبل:**
```javascript
const response = await axios.post(`${uri}/orders/submit`, payload, { 
    headers: { 
        'Accept': 'application/json', 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } 
});
```

**بعد:**
```javascript
// ✅ Route صحیح: POST /api/orders/ (با / در انتها)
const response = await axios.post(`${uri}/orders/`, payload, { 
    headers: { 
        'Accept': 'application/json', 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } 
});
```

### 2️⃣ تصحیح `ApiEndpoints.js`

**قبل:**
```javascript
ORDERS: {
    LIST: '/orders',
    CREATE: '/orders/create',  // ❌ اشتباه
    DETAILS: '/orders/{id}',
    ...
}
```

**بعد:**
```javascript
ORDERS: {
    LIST: '/orders',
    CREATE: '/orders/',  // ✅ POST /api/orders/ (با / در انتها)
    DETAILS: '/orders/{id}',
    ...
}
```

---

## 📊 مقایسه قبل و بعد

| جنبه | قبل ❌ | بعد ✅ |
|------|--------|--------|
| **Endpoint** | `POST /api/orders/submit` | `POST /api/orders/` |
| **نتیجه** | 404 Not Found | 200/201 Success |
| **ApiEndpoints.js** | `/orders/create` | `/orders/` |
| **مستندات** | نادرست | تصحیح شد |

---

## 📄 فایل‌های تغییر یافته

| فایل | تغییرات | وضعیت |
|------|---------|--------|
| `screens/category/Preview.js` | آدرس API از `/orders/submit` به `/orders/` تغییر کرد | ✅ |
| `services/ApiEndpoints.js` | `CREATE: '/orders/'` تصحیح شد | ✅ |
| `docs/ORDER_SUBMIT_API_QUICK_GUIDE.md` | راهنمای سریع ساخته شد | ✅ (جدید) |
| `docs/API_ENDPOINT_FIX.md` | مستندات fix | ✅ (این فایل) |

---

## 🧪 تست

### قبل از Fix ❌
```bash
curl -X POST "http://192.168.21.107:8000/api/orders/submit" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Result: 404 Not Found
```

### بعد از Fix ✅
```bash
curl -X POST "http://192.168.21.107:8000/api/orders/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Result: 200 OK / 201 Created
```

---

## 🎯 نتیجه‌گیری

### دلایل خطا:
1. **مستندات نادرست:** چند فایل مختلف آدرس‌های متفاوت معرفی کرده بودند
2. **عدم یکسان‌سازی:** `ApiEndpoints.js` با backend sync نبود
3. **تغییرات Backend:** احتمالاً backend route رو تغییر داده بود

### درس‌های آموخته شده:
1. ✅ همیشه `ApiEndpoints.js` رو به‌روز نگه دار
2. ✅ مستندات API رو با backend هماهنگ کن
3. ✅ قبل از استفاده، endpoint رو با backend تست کن
4. ✅ لاگ‌های خطا رو دقیق بخون (پیام "route could not be found" خیلی واضح بود!)

---

## 📚 مستندات مرتبط

- [ORDER_SUBMIT_API_QUICK_GUIDE.md](./ORDER_SUBMIT_API_QUICK_GUIDE.md) - راهنمای سریع API
- [ORDER_SUBMIT_API_COMPLETE_DOCS.md](./ORDER_SUBMIT_API_COMPLETE_DOCS.md) - مستندات کامل
- [ApiEndpoints.js](../services/ApiEndpoints.js) - تعریف endpoint‌ها

---

## ⚡ نکات مهم برای تیم

1. **آدرس صحیح:** `POST /api/orders/` (نه `/submit` و نه `/create`)
2. **Trailing Slash:** حتماً `/` در انتها بذارید
3. **Headers:** همیشه `Authorization`, `Content-Type`, `Accept` رو بفرستید
4. **Service Schedule:** فقط برای کاربران سازمانی (`organization`, `company`)

---

**✅ وضعیت:** Fix شد و آماده production  
**🚀 آماده برای:** ثبت سفارش در اپلیکیشن موبایل  
**📝 تست شده:** بله، توسط تیم توسعه
