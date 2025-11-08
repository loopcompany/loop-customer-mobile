# Review System Implementation - سیستم ثبت نظر

## 📝 نمای کلی

سیستم ثبت نظر برای سفارشات تکمیل شده پیاده‌سازی شد. کاربران می‌توانند پس از تکمیل سفارش (status=2 و finished_at پر باشد) نظر خود را درباره اپلیکیشن، تکنسین و پشتیبانی ثبت کنند.

## 📁 فایل‌های ایجاد/ویرایش شده

### فایل‌های جدید:
1. **`screens/orders/OrderReviewRatingSection.js`**
   - کامپوننت اصلی ثبت نظر
   - شامل فرم امتیازدهی و نمایش نظرات ثبت شده
   - مشابه طراحی `FeedbackSurveyScreen.js`

2. **`services/ReviewApi.js`**
   - سرویس API برای مدیریت نظرات
   - شامل توابع: submitReview, getTechnicianReviews, getMyReviews, checkReviewForOrder

### فایل‌های ویرایش شده:
1. **`screens/orders/Details.js`**
   - افزودن import برای `OrderReviewRatingSection`
   - افزودن state برای `showReviewRating`
   - افزودن بخش ثبت نظر به عنوان آخرین accordion

## 🎯 نحوه کار

### شرایط فعال شدن:
```javascript
data?.status == 2 && data?.finished_at
```

- `status == 2`: سفارش تکمیل شده باشد
- `finished_at`: تاریخ پایان سفارش پر باشد

### جریان کاری:

1. **بررسی نظر قبلی**:
   ```javascript
   checkExistingReview() → GET /api/reviews/my-reviews
   ```
   - اگر نظر قبلی وجود داشت: نمایش نظر ثبت شده
   - اگر نظر وجود نداشت: نمایش فرم ثبت نظر

2. **ثبت نظر جدید**:
   ```javascript
   submitReview(reviewData, token) → POST /api/reviews
   ```
   
   **Request Body:**
   ```json
   {
     "technician_id": 5,
     "order_id": 123,
     "application_rate": 5,    // خوب: 5, متوسط: 3, ضعیف: 1
     "technician_rate": 3,
     "support_rate": 5,
     "description": "توضیحات اختیاری"
   }
   ```

3. **تبدیل امتیازات**:
   ```javascript
   const ratingMap = {
     'خوب': 5,
     'متوسط': 3,
     'ضعیف': 1
   };
   ```

## 🎨 طراحی UI

### حالت فرم ثبت نظر:
```
┌─────────────────────────────────┐
│  کاربر گرامی، لطفاً نظر خود را │
│  درباره این سفارش ثبت کنید.    │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │    اپلیکیشن لوپ          │ │
│  └───────────────────────────┘ │
│  [ خوب ] [ متوسط ] [ ضعیف ]  │
│                                 │
│  ┌───────────────────────────┐ │
│  │    تکنسین لوپ            │ │
│  └───────────────────────────┘ │
│  [ خوب ] [ متوسط ] [ ضعیف ]  │
│                                 │
│  ┌───────────────────────────┐ │
│  │    پشتیبانی لوپ          │ │
│  └───────────────────────────┘ │
│  [ خوب ] [ متوسط ] [ ضعیف ]  │
│                                 │
│  توضیح بیشتری دارید؟          │
│  ┌─────────────────────────┐   │
│  │ توضیحات (اختیاری)...   │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│       [ ثبت نظر ]               │
└─────────────────────────────────┘
```

### حالت نمایش نظر ثبت شده:
```
┌─────────────────────────────────┐
│         ✓ نماد تیک سبز          │
│  شما قبلاً نظر خود را ثبت       │
│      کرده‌اید                   │
├─────────────────────────────────┤
│  امتیاز اپلیکیشن:      خوب     │
│  امتیاز تکنسین:         متوسط   │
│  امتیاز پشتیبانی:      خوب     │
│                                 │
│  نظر شما:                       │
│  تکنسین بسیار خوبی بود...       │
└─────────────────────────────────┘
```

## 📋 API Endpoints

### 1. ثبت نظر (POST)
```
POST /api/reviews
Authorization: Bearer {token}

Body: {
  technician_id: number,
  order_id: number,
  application_rate: 1-5,
  technician_rate: 1-5,
  support_rate: 1-5,
  description?: string (max 1000 chars)
}

Response (201): {
  success: true,
  message: "نظر شما با موفقیت ثبت شد.",
  data: { review: {...} }
}
```

### 2. نظرات من (GET)
```
GET /api/reviews/my-reviews?per_page=20
Authorization: Bearer {token}

Response (200): {
  success: true,
  data: {
    reviews: [...],
    pagination: {...}
  }
}
```

### 3. نظرات تکنسین (GET - Public)
```
GET /api/reviews/technician/{id}?per_page=20

Response (200): {
  success: true,
  data: {
    reviews: [...],
    averages: {
      application_avg: 4.75,
      technician_avg: 4.50,
      support_avg: 4.80,
      overall_avg: 4.68
    }
  }
}
```

## 🔧 استفاده در Details.js

```javascript
// Import
import OrderReviewRatingSection from './OrderReviewRatingSection';

// State
const [showReviewRating, setShowReviewRating] = useState(false);

// در ScrollView - آخرین accordion
<AccordionHeader
  title={"ثبت نظر"}
  isActive={data?.status == 2 && data?.finished_at}
  isOpen={showReviewRating}
  onPress={() => {
    if (data?.status == 2 && data?.finished_at) {
      setShowReviewRating(!showReviewRating)
    } else {
      showToastOrAlert('این بخش بعد از تکمیل سفارش فعال می‌شود.')
    }
  }}
/>
{showReviewRating && data?.status == 2 && data?.finished_at && (
  <OrderReviewRatingSection
    orderId={orderId}
    technicianId={data?.technician?.id}
    orderStatus={data?.status}
    finishedAt={data?.finished_at}
  />
)}
```

## ⚠️ Error Handling

### خطاهای احتمالی:

1. **404 - سفارش یافت نشد**
   ```json
   {
     "success": false,
     "message": "سفارش یافت نشد یا متعلق به شما نیست.",
     "error_code": "ORDER_NOT_FOUND"
   }
   ```

2. **400 - سفارش تکمیل نشده**
   ```json
   {
     "success": false,
     "message": "فقط می‌توانید برای سفارشات تکمیل شده نظر ثبت کنید.",
     "error_code": "ORDER_NOT_COMPLETED"
   }
   ```

3. **409 - نظر تکراری**
   ```json
   {
     "success": false,
     "message": "شما قبلاً برای این سفارش نظر ثبت کرده‌اید.",
     "error_code": "REVIEW_ALREADY_EXISTS"
   }
   ```

4. **422 - Validation Error**
   ```json
   {
     "message": "The application rate field is required.",
     "errors": {
       "application_rate": ["امتیاز اپلیکیشن الزامی است."]
     }
   }
   ```

## 🧪 نحوه تست

### 1. تست فرم ثبت نظر:
```javascript
// در Details.js
// 1. باز کردن یک سفارش با status=2 و finished_at پر
// 2. باز کردن accordion "ثبت نظر"
// 3. انتخاب امتیازات: خوب، متوسط، ضعیف
// 4. وارد کردن توضیحات (اختیاری)
// 5. کلیک روی "ثبت نظر"
// 6. بررسی پیام موفقیت
```

### 2. تست نمایش نظر قبلی:
```javascript
// 1. ثبت یک نظر
// 2. بستن و باز کردن مجدد accordion
// 3. باید نظر ثبت شده نمایش داده شود
// 4. دکمه ثبت نظر نباید وجود داشته باشد
```

### 3. تست محدودیت‌ها:
```javascript
// 1. باز کردن سفارش با status != 2
//    → باید پیام "این بخش بعد از تکمیل سفارش فعال می‌شود" نمایش داده شود
// 2. باز کردن سفارش با finished_at خالی
//    → accordion باید غیرفعال باشد
```

## 📊 State Management

```javascript
// Local State در OrderReviewRatingSection
const [scores, setScores] = useState({
  application: '',
  technician: '',
  support: '',
});
const [description, setDescription] = useState('');
const [loading, setLoading] = useState(true);
const [hasReview, setHasReview] = useState(false);
const [reviewData, setReviewData] = useState(null);
const [submitLoading, setSubmitLoading] = useState(false);
```

## 🎯 ویژگی‌های کلیدی

✅ **طراحی مشابه FeedbackSurveyScreen**
✅ **فعال شدن فقط برای سفارشات تکمیل شده**
✅ **بررسی نظر قبلی**
✅ **تبدیل خودکار امتیازات فارسی به عددی**
✅ **مدیریت خطاها**
✅ **نمایش لودینگ**
✅ **استفاده از Service Layer**
✅ **Validation کامل**
✅ **توضیحات اختیاری با محدودیت 1000 کاراکتر**

## 🔍 دیباگ

برای بررسی مشکلات:

```javascript
// در OrderReviewRatingSection.js
console.log('Order Status:', orderStatus);
console.log('Finished At:', finishedAt);
console.log('Is Enabled:', isEnabled);
console.log('Submitting review:', reviewPayload);
```

## 📝 توضیحات تکمیلی

- کامپوننت فقط زمانی render می‌شود که `status=2` و `finished_at` موجود باشد
- نظرات با GET /reviews/my-reviews بررسی می‌شوند
- هر کاربر فقط یک بار می‌تواند برای هر سفارش نظر ثبت کند
- امتیازات فارسی (خوب/متوسط/ضعیف) به عدد (5/3/1) تبدیل می‌شوند
- توضیحات اختیاری هستند اما حداکثر 1000 کاراکتر

## 🚀 آماده برای استفاده!

سیستم ثبت نظر به صورت کامل پیاده‌سازی شده و آماده تست و استفاده در production است.
