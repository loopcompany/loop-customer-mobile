# 🐛 رفع خطای AsyncStorage و بهبود OTP Verification

## ❌ مشکلات یافت شده

### 1. خطای AsyncStorage: null value
```
ERROR Verification error: [Error: [AsyncStorage] Passing null/undefined as value is not supported.
Passed value: null
Passed key: userToken
```

**علت:**
- سرور در مرحله verify فقط `status: success` برمی‌گرداند
- `response.data.data.token` وجود ندارد (null است)
- کد سعی می‌کرد `null` را در AsyncStorage ذخیره کند

### 2. ترتیب اینپوت‌ها برعکس بود
- `flexDirection: 'row-reverse'` باعث می‌شد اینپوت‌ها از راست به چپ باشند
- باید از چپ به راست باشند (مثل شماره تلفن)

### 3. باگ در handleResendCode
- پاک کردن اینپوت‌ها: 5 خانه خالی → باید 6 خانه باشد

---

## ✅ راه‌حل‌ها

### 1️⃣ اصلاح منطق ذخیره‌سازی

**قبل:**
```javascript
// همیشه سعی می‌کرد token را ذخیره کند (حتی اگر null بود)
await AsyncStorage.setItem('userToken', response.data.data.token); // ❌ Error
await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
```

**بعد:**
```javascript
// فقط اگر token وجود داشت ذخیره می‌کند
if (response.data.data?.token) {
  await AsyncStorage.setItem('userToken', response.data.data.token);
}

// فقط اگر user data وجود داشت ذخیره می‌کند
if (response.data.data?.user) {
  await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
}

// ذخیره اطلاعاتی که قطعا داریم
await AsyncStorage.setItem('accountType', 'organization');
await AsyncStorage.setItem('organizationCode', organizationCode);

if (userId) {
  await AsyncStorage.setItem('userId', userId.toString());
}
if (organizationId) {
  await AsyncStorage.setItem('organizationId', organizationId.toString());
}
```

### 2️⃣ تغییر فلوی کاربر

**قبل:**
```javascript
// بعد از verify مستقیم به FolderScreen می‌رفت
navigation.reset({
  index: 0,
  routes: [{ name: 'FolderScreen' }],
});
```

**بعد:**
```javascript
// بعد از verify به صفحه Login می‌رود تا با کد سازمانی وارد شود
Alert.alert(
  'موفق',
  `شماره موبایل با موفقیت تایید شد.\nکد سازمانی شما: ${organizationCode}\n\nلطفا با این کد وارد شوید.`,
  [
    {
      text: 'ورود',
      onPress: () => {
        navigation.navigate('Login');
      },
    },
  ]
);
```

### 3️⃣ اصلاح ترتیب اینپوت‌ها

```javascript
// قبل - از راست به چپ
flexDirection: 'row-reverse'

// بعد - از چپ به راست (طبیعی برای اعداد)
flexDirection: 'row'
```

### 4️⃣ اصلاح handleResendCode

```javascript
// قبل
setCode(['', '', '', '', '']); // 5 خانه ❌

// بعد
setCode(['', '', '', '', '', '']); // 6 خانه ✅
```

### 5️⃣ بهبود مدیریت خطا

```javascript
try {
  // ...
} catch (error) {
  console.error('❌ Verification error:', error);
  
  if (error.response) {
    console.error('Response error:', error.response.data);
    Alert.alert(
      'خطا در تایید',
      error.response.data.message || 'کد تایید اشتباه است. لطفا مجددا تلاش کنید.'
    );
  } else if (error.request) {
    console.error('Request error:', error.request);
    Alert.alert('خطا', 'سرور پاسخگو نیست. لطفا اتصال اینترنت را بررسی کنید.');
  } else {
    console.error('Unknown error:', error.message);
    Alert.alert('خطا', error.message || 'خطای نامشخص رخ داد');
  }
}
```

---

## 🔄 فلوی جدید ثبت‌نام

```
[Register Screen]
    ↓ پر کردن فرم و ثبت‌نام
    ↓
[API: /organization/register]
    ↓ برگشت: organizationCode, userId, organizationId
    ↓
[OTP Verification Screen]
    ↓ وارد کردن کد 6 رقمی
    ↓
[API: /organization/verify-phone]
    ↓ برگشت: status: success (بدون token)
    ↓
[Alert: "کد سازمانی شما: XXXXXX"]
    ↓ کلیک روی دکمه "ورود"
    ↓
[Login Screen]
    ↓ وارد کردن کد سازمانی + رمز عبور
    ↓
[API: /organization/login]
    ↓ برگشت: token, user data
    ↓
[FolderScreen / Dashboard]
```

---

## 📊 مقایسه قبل و بعد

| مورد | قبل | بعد |
|------|-----|-----|
| ذخیره token | همیشه (حتی null) | فقط اگر وجود داشته باشد |
| ذخیره user data | همیشه (حتی null) | فقط اگر وجود داشته باشد |
| بعد از verify | FolderScreen | Login Screen |
| ترتیب اینپوت | راست→چپ | چپ→راست ✅ |
| پاک کردن در resend | 5 خانه | 6 خانه ✅ |
| مدیریت خطا | ساده | کامل با دسته‌بندی ✅ |
| Console logs | کم | جامع برای debugging ✅ |

---

## 🎯 دیتای ذخیره شده در AsyncStorage

### بعد از Registration:
```javascript
// هیچی - فقط اطلاعات route params
```

### بعد از OTP Verification:
```javascript
accountType: 'organization'
organizationCode: '194244'
userId: '8'
organizationId: '3'
// token و userData هنوز ذخیره نشده
```

### بعد از Login:
```javascript
accountType: 'organization'
organizationCode: '194244'
userId: '8'
organizationId: '3'
userToken: 'eyJ0eXAiOiJKV1QiLCJh...' // ✅ از login
userData: '{"id":8,"name":"..."}' // ✅ از login
```

---

## 🐛 خطاهای برطرف شده

| # | خطا | علت | راه‌حل |
|---|-----|-----|--------|
| 1 | AsyncStorage null error | token در verify نیست | چک کردن وجود قبل از ذخیره |
| 2 | اینپوت‌ها برعکس | row-reverse | تغییر به row |
| 3 | resend 5 خانه پاک می‌کرد | باگ | تغییر به 6 خانه |
| 4 | پیام خطای بد | مدیریت ساده | دسته‌بندی کامل خطاها |

---

## 🧪 تست

### سناریوی موفق:
1. ✅ ثبت‌نام → دریافت organizationCode
2. ✅ وارد کردن OTP 6 رقمی
3. ✅ تایید موفق → انتقال به Login
4. ✅ ورود با organizationCode + password
5. ✅ دریافت token و ورود به سیستم

### سناریوهای خطا:
- ❌ کد اشتباه → پیام: "کد تایید اشتباه است"
- ❌ سرور down → پیام: "سرور پاسخگو نیست"
- ❌ هر خطای دیگر → نمایش message خطا

---

## 📝 نکات مهم

1. **Token فقط در Login داده می‌شود** نه در Verify
2. **Verify فقط شماره موبایل را تایید می‌کند**
3. **کاربر باید با Login وارد شود** تا token بگیرد
4. **organizationCode باید نگه داری شود** برای Login
5. **Optional chaining (?.)** از خطاهای null جلوگیری می‌کند

---

## ✅ فایل‌های تغییر یافته

- `org/logreg/OTPVerification.js`
  - اصلاح handleVerify (safe AsyncStorage)
  - تغییر navigation بعد از verify
  - اصلاح handleResendCode (6 خانه)
  - بهبود error handling
  - اصلاح flexDirection
  - اضافه کردن console logs

---

**تاریخ**: 2025-11-08  
**وضعیت**: ✅ تمام مشکلات برطرف شد  
**تست**: آماده تست با سرور واقعی
