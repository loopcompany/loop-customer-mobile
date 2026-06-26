# تبدیل تاریخ میلادی به شمسی در OrganizationContract

## مشکل:
تاریخ آپلود توافق نامه به صورت میلادی نمایش داده می‌شد بجای تاریخ شمسی.

## راه‌حل پیاده‌سازی شده:

### 1. Import کتابخانه‌های مورد نیاز:
```javascript
import moment from 'moment';
import jalaali from 'jalaali-js';
```

### 2. Helper Function برای تبدیل تاریخ:
```javascript
const toJalaliDate = (dateString) => {
  try {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // بررسی اعتبار تاریخ
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return dateString;
    }
    
    const jalaaliDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    
    // فرمت: ۱۴۰۳/۰۸/۲۱ (اعداد فارسی)
    const year = jalaaliDate.jy.toString();
    const month = jalaaliDate.jm.toString().padStart(2, '0');
    const day = jalaaliDate.jd.toString().padStart(2, '0');
    
    // تبدیل اعداد انگلیسی به فارسی
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const jalaliDateStr = `${year}/${month}/${day}`;
    
    return jalaliDateStr.replace(/[0-9]/g, (digit) => persianNumbers[parseInt(digit)]);
  } catch (error) {
    console.error('Error converting date to Jalaali:', error);
    return dateString;
  }
};
```

### 3. استفاده در Admin Contract:
```javascript
// قبل:
uploaded_at: new Date(contract.created_at).toLocaleDateString('fa-IR'),

// بعد:
uploaded_at: toJalaliDate(contract.created_at),
```

### 4. استفاده در Uploaded Contract:
```javascript
// قبل:
uploaded_at: new Date(latestUpload.uploaded_at).toLocaleDateString('fa-IR'),
reviewed_at: latestUpload.reviewed_at ? new Date(latestUpload.reviewed_at).toLocaleDateString('fa-IR') : null,

// بعد:
uploaded_at: toJalaliDate(latestUpload.uploaded_at),
reviewed_at: latestUpload.reviewed_at ? toJalaliDate(latestUpload.reviewed_at) : null,
```

## ویژگی‌های پیاده‌سازی:

1. **تبدیل دقیق**: استفاده از کتابخانه jalaali-js برای تبدیل صحیح تاریخ میلادی به شمسی
2. **اعداد فارسی**: نمایش تاریخ با اعداد فارسی (۱۴۰۳/۰۸/۲۱)
3. **Error Handling**: مدیریت خطاها و نمایش تاریخ اصلی در صورت بروز مشکل
4. **Validation**: بررسی اعتبار تاریخ قبل از تبدیل
5. **Debug Logs**: لاگ‌هایی برای بررسی صحت تبدیل

## نتیجه:
حالا تمام تاریخ‌ها در صفحه OrganizationContract به صورت شمسی با اعداد فارسی نمایش داده می‌شوند:

- **تاریخ بارگذاری توافق نامه ادمین**: ۱۴۰۳/۰۸/۲۱
- **تاریخ آپلود توافق نامه کاربر**: ۱۴۰۳/۰۸/۲۱  
- **تاریخ بررسی توافق نامه**: ۱۴۰۳/۰۸/۲۲

## تست:
برای تست صحت عملکرد، console logs اضافه شده که نشان می‌دهد:
```
📅 Date conversion test: {
  original_uploaded_at: "2024-11-11T10:30:00.000Z",
  converted_uploaded_at: "۱۴۰۳/۰۸/۲۱",
  original_reviewed_at: "2024-11-12T14:15:00.000Z", 
  converted_reviewed_at: "۱۴۰۳/۰۸/۲۲"
}
```