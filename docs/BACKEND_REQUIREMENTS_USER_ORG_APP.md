# نیازمندی‌های بک‌اند — اپ کاربر / سازمانی / شرکتی

> مبنا: سه سند مشتری — «توضیحات اپ کاربر»، «فیلد امنیت حساب در اپ کاربر. سازمانی» و «حریم خصوصی اپلیکیشن کاربران و سازمانی» (۱۴۰۵/۰۷). همه‌ی محتوای لازمِ آن‌ها در همین سند و در کد آمده است.
> سمت اپ همه‌ی موارد زیر **پیاده و آماده** است و فقط منتظر این endpointها و فیلدهاست.
> تا وقتی endpointی وجود نداشته باشد (پاسخ 404 / 405 / 501)، بخش مربوطه در اپ «به‌زودی فعال می‌شود» نشان می‌دهد و خطا نمی‌دهد. پس می‌توانید بخش‌ها را **تک‌تک** منتشر کنید.

---

## ۰. قراردادهای مشترک

| موضوع | قرارداد |
|---|---|
| احراز هویت | `Authorization: Bearer <token>`. endpointهای `/account/*` باید با **هر دو** نوع توکن (کاربر عادی و سازمانی/شرکتی) کار کنند. |
| پاکت پاسخ | `{ "success": true/false, "message": "...", "data": {...}, "error_code": "..." }` |
| خطای کسب‌وکاری | `success:false` + `message` فارسی + `error_code`. برای خطای اعتبارسنجی 422 با `message` فارسی. اپ همان `message` را به کاربر نشان می‌دهد. |
| endpoint پیاده‌نشده | 404 کافی است؛ اپ آن را «به‌زودی» نشان می‌دهد. |
| تاریخ‌ها | ISO-8601 با منطقه‌ی زمانی، مثل `"2026-10-03T14:25:00+03:30"`. اپ خودش به شمسی تبدیل می‌کند. |
| مبالغ | تومان، عدد صحیح. |
| شناسه‌ی دستگاه | اپ برای هر نصب یک `device_id` تصادفی و ثابت می‌سازد (همانی که `POST /notifications/device-token` هم می‌گیرد). |

---

## ۱. سفارش — آدرس و پیش‌نویس (بند ۱) ✅ بدون نیاز به بک‌اند

- در مسیر سفارش سازمانی (سیستماتیک و جامع) بعد از «بازه زمانی / رزرو» مرحله‌ی **«آدرس‌های منتخب»** اضافه شد. حالا `address_id` در `POST /orders/submit` همیشه همان آدرسی است که کاربر انتخاب کرده. قرارداد قبلی تغییری نکرده است.
- سفارش نیمه‌کاره **روی خود دستگاه** به‌عنوان پیش‌نویس ذخیره می‌شود و در «سفارشات» با «ادامه / حذف» نمایش داده می‌شود.
- **اختیاری (برای بعد):** اگر خواستید پیش‌نویس بین دستگاه‌ها همگام شود، این سه endpoint کافی است: `GET/PUT/DELETE /orders/drafts/{id}`، با بدنه‌ی `{ source, title, data(JSON آزاد), updated_at }`. فعلاً لازم نیست.

---

## ۲. کد معرف با درصد جداگانه (بند ۳)

اپ همین الان درصد هر کد را از پاسخ `/referral-codes/check` می‌خواند (`data.discount_percent`). **تغییری در اپ لازم نیست.** کارهای بک‌اند و پنل ادمین:

1. در پنل ادمین برای هر کد معرف (یا هر کاربرِ صاحب کد، مثل مأمور خرید شرکتی) دو مقدار جدا قابل تنظیم باشد:
   - `discount_percent`: تخفیفی که خریدار می‌گیرد.
   - `commission_percent`: پورسانتی که صاحب کد می‌گیرد.
2. `/referral-codes/check` و محاسبه‌ی سفارش از درصدِ **همان کد** استفاده کنند، نه یک درصد ثابت سراسری.

---

## ۳. اطلاعات حساب سازمانی / شرکتی / نیمه‌دولتی (بند ۴)

### ۳-۱. فیلدهای تازه در `GET /organization/profile`

```json
{
  "status": "success",
  "data": {
    "organization_name": "...",
    "melicode": "10101234567",
    "registration_number": "123456",
    "economic_code": "411111111111",
    "verification_status": "pending",
    "verification_reason": "مدارک ناقص است",
    "...": "سایر فیلدهای فعلی بدون تغییر"
  }
}
```

| فیلد | توضیح |
|---|---|
| `melicode` | **شناسه‌ی ملی سازمان/شرکت.** همان کلیدی است که فرم ثبت‌نام سازمانی امروز می‌فرستد. اگر در دیتابیس نام دیگری دارد، در پاسخ با همین نام برگردانید. اپ `organization_national_id` و `national_id` را هم می‌خواند. |
| `registration_number` | شماره ثبت شرکت |
| `economic_code` | شماره اقتصادی (اختیاری، ممکن است `null` باشد) |
| `verification_status` | یکی از `pending` (در حال بررسی توسط پنل مدیریت)، `approved`، `suspended` (معلق)، `deleted`، `rejected`. تا وقتی این فیلد نیاید، اپ از `profile_status` در `/organization/profile/status` استفاده می‌کند که فقط pending/approved/rejected دارد. |
| `verification_reason` | (اختیاری) دلیل تعلیق یا رد، برای نمایش به کاربر |

### ۳-۲. ویرایش: `POST /organization/update-profile`

علاوه بر فیلدهای فعلی، این‌ها را هم بپذیرد و مثل بقیه وارد «درخواست ویرایش» (`edited_organization`) کند تا ادمین تأیید کند:
`melicode`، `registration_number`، `economic_code` (اختیاری، ممکن است رشته‌ی خالی بیاید).
این فیلدها هم در بدنه‌ی JSON و هم در multipart (وقتی عکس جدید دارد) می‌آیند. `edited_organization` در پاسخ GET هم باید همین سه فیلد را داشته باشد.

### ۳-۳. مدارک سازمان (اختیاری)

| متد | مسیر | بدنه / پاسخ |
|---|---|---|
| GET | `/organization/documents` | `data: [{ id, title, url, status, status_label, uploaded_at }]` |
| POST | `/organization/documents` | multipart: `file` (PDF یا تصویر، پیشنهاد حداکثر 10MB)، `title` (اختیاری). پاسخ: همان آیتم. |
| DELETE | `/organization/documents/{id}` | `success:true` |

`status` اختیاری است، مثلاً `pending | approved | rejected` با `status_label` فارسی. `url` باید برای کاربر قابل باز شدن باشد (لینک امضاشده یا لینکی که توکن را می‌پذیرد).

### ۳-۴. کاربران مجاز سازمان

| متد | مسیر | بدنه / پاسخ |
|---|---|---|
| GET | `/organization/users` | `data: [{ id, full_name, mobile, role }]` |
| POST | `/organization/users` | `{ full_name, mobile (09xxxxxxxxx), role? }` |
| DELETE | `/organization/users/{id}` | `success:true` |

نحوه‌ی ورود این کاربران و سطح دسترسی‌شان تصمیم بک‌اند است (مثلاً ورود با OTP روی همان شماره و ثبت سفارش به نام سازمان). اپ فعلاً فقط مدیریت فهرست را دارد.

### ۳-۵. بروزرسانی اپلیکیشن

`GET /app/version?platform=android|ios|web&current_version=2.74.3`

```json
{ "success": true, "data": {
  "latest_version": "2.75.0",
  "min_supported_version": "2.70.0",
  "update_available": true,
  "force": false,
  "update_url": "https://..."
}}
```

`force:true` یعنی دکمه‌ی «بعداً» نمایش داده نشود. این درخواست بی‌صداست و شکستش به کاربر پیغام نمی‌دهد.

> خروج از حساب، تغییر رمز عبور و حذف حساب در همین صفحه به endpointهای بخش ۷ وصل‌اند.

---

## ۴. عیوب سرویس / محصول (بند ۵)

اپ حالا شماره سفارش را هم از لیست و هم با **تایپ مستقیم** می‌گیرد و همه‌ی فیلدها جز «توضیحات» از خود سفارش پر می‌شوند. کارهای بک‌اند:

1. **`GET /orders/summary`** برای هر سفارش `product_name` را برگرداند. اگر سفارش محصول مشخصی ندارد، `category_title` را بفرستد. قبلاً وقتی `product_name` خالی بود، فیلد قفلِ «نام محصول/خدمت» خالی می‌ماند و ثبت گزارش ممکن نبود. اپ حالا در این حالت فیلد را قابل ویرایش می‌کند، ولی مقدار درست باید از سرور بیاید.
2. گزارش‌های ثبت‌شده از `POST` همان endpoint فعلی گزارش خرابی (`faultReportAPI.create`) در **پنل ادمین** با همه‌ی فیلدها نمایش داده شوند: `order_id`، `product_name`، `ordered_at`، `delivered_at`، `technician_code`، `paid_price`، `description`.
3. عنوان این بخش در پنل ادمین هم «**عیوب سرویس / محصول**» باشد، نه «خرابی خدمات».

---

## ۵. اطلاعات تکنسین و حذف شماره پس از پایان سفارش (بند ۶)

کارت تکنسین در اپ حالا همیشه چهار دکمه دارد: تماس، پیام، ارسال به دوستان و QR. «تماس» و «پیام» فقط تا وقتی سفارش جاری است (`status` 0 یا 1) فعال‌اند. **کار بک‌اند (الزامی، امنیتی):**

- در `GET /orders/{id}`، لیست سفارش‌ها و هر پاسخ دیگری که `technician` دارد: وقتی `status` سفارش **۲ (انجام‌شده) یا ۳ (لغوشده)** است، `technician.phone` را **اصلاً نفرستید** (یا `null`). حذف واقعی از سوابق کاربر سمت سرور است و پنهان کردن در اپ به‌تنهایی کافی نیست.
- برای نمایش کارت لازم است: `technician.name`، `technician_type` (مثلاً «تکنسین جامع میدانی»)، `referral_code` (کد تکنسین)، `created_at` (شروع فعالیت)، `profile_photo_path`.

---

## ۶. روش و کانال پرداخت (بند ۷)

اپ آماده است این سه فیلد را روی رسید، جزئیات سفارش و فهرست تراکنش‌ها نشان دهد. آن‌ها را به `GET /orders/{id}`، لیست سفارش‌ها و `GET /wallet/transactions` (و هر لیست تراکنش دیگر) اضافه کنید:

| فیلد | مقادیر مجاز |
|---|---|
| `payment_method` | `cash` (نقدی)، `card_to_card` (کارت به کارت)، `sheba` (شبا)، `bank_transfer` (پرداخت درون‌بانکی)، `in_app` (پرداخت درون برنامه لوپ، شامل درگاه و کیف پول)، `unpaid` (پرداخت نشده)، `remaining` (مانده) |
| `payment_channel` | `app`، `site`، `in_person` (حضوری) |
| `remaining_amount` | عدد (تومان). فقط وقتی بخشی از مبلغ مانده است. |

تا وقتی این فیلدها نیایند، اپ رفتار فعلی را نگه می‌دارد («پرداخت آنلاین» / «در انتظار پرداخت»). پرداخت‌های حضوری و سایت هم باید با همین سه فیلد ثبت شوند تا در اپ درست دیده شوند.

---

## ۷. امنیت حساب (سند «فیلد امنیت حساب»)

همه‌ی مسیرها زیر `/account` هستند و برای **هر دو نوع حساب** با توکن خودشان کار می‌کنند.

### ۷-۰. خلاصه: `GET /account/security`

```json
{ "success": true, "data": {
  "two_factor": { "enabled": true, "method": "sms", "verified_mobile": "09120000000" },
  "mobile": { "number": "09120000000", "verified": true },
  "active_devices_count": 3,
  "unread_alerts_count": 2,
  "sessions_supported": true
}}
```

`sessions_supported:false` یعنی بک‌اند Session/Token را جدا از دستگاه‌ها مدیریت نمی‌کند. در این حالت اپ ردیف «مدیریت نشست‌ها» را حذف می‌کند (طبق خود سند).

### ۷-۱. تأیید دومرحله‌ای

| متد | مسیر | بدنه | پاسخ `data` |
|---|---|---|---|
| POST | `/account/security/two-factor/send-code` | `{ purpose: "enable"\|"disable"\|"recovery_codes", method: "sms"\|"app" }` | برای `enable` + `app`: `{ secret, otpauth_url }`. در بقیه‌ی حالت‌ها کد پیامک می‌شود: `{ expires_in, resend_in }` |
| POST | `/account/security/two-factor/enable` | `{ method, code }` | `{ recovery_codes: ["XXXX-XXXX", ...] }` (پیشنهاد: ۸ کد یک‌بارمصرف) |
| POST | `/account/security/two-factor/disable` | `{ code }` | — |
| POST | `/account/security/two-factor/recovery-codes` | `{ code }` | `{ recovery_codes: [...] }` (کدهای قبلی باطل می‌شوند) |

> **مهم — ورود با دومرحله‌ای:** وقتی 2FA فعال است، `POST /auth/login` و `POST /organization/login` نباید مستقیم توکن بدهند. پیشنهاد قرارداد:
> `{ success:true, requires_two_factor:true, two_factor_token:"...", method:"sms" }` و سپس
> `POST /auth/two-factor/verify { two_factor_token, code }` (کد بازیابی هم قبول شود) که توکن نهایی را می‌دهد.
> **صفحه‌ی وارد کردن این کد هنگام ورود هنوز در اپ اضافه نشده.** بعد از نهایی شدن این قرارداد، یک صفحه‌ی کوچک است و اضافه می‌شود.

### ۷-۲. دستگاه‌های واردشده

**ثبت دستگاه.** اپ بعد از هر ورود این را بی‌صدا صدا می‌زند:

`POST /account/devices/register`
```json
{ "device_id": "uuid", "platform": "android", "device_type": "phone|tablet|browser",
  "device_model": "Samsung Galaxy A25", "os_name": "Android", "os_version": "14", "app_version": "2.74.3" }
```
سرور این دستگاه را به **توکن جاری** گره بزند تا بتواند `is_current` و «خروج از این دستگاه» را درست انجام دهد. IP و زمان آخرین فعالیت را خود سرور از درخواست‌ها ثبت کند.

| متد | مسیر | پاسخ / رفتار |
|---|---|---|
| GET | `/account/devices` | `data: [{ id, device_id, device_type, device_model, os_name, os_version, app_version, last_ip, approx_location, last_activity_at, is_current }]` |
| DELETE | `/account/devices/{id}` | توکن(های) آن دستگاه باطل شود. دستگاه فعلی را با این مسیر حذف نکنید (اپ دکمه‌اش را نشان نمی‌دهد). |

`approx_location` اختیاری است (مثلاً «تهران» از روی IP).

### ۷-۳. خروج از سایر دستگاه‌ها

`POST /account/devices/logout-others` با بدنه‌ی `{ current_device_id }`.
همه‌ی توکن‌ها **به‌جز توکن همین درخواست** باطل شوند.
⚠️ `/auth/logout-all` و `/organization/logout-all` فعلی به این کار نمی‌آیند، چون کاربر را از دستگاه فعلی هم بیرون می‌کنند.

### ۷-۴. فعالیت‌های اخیر حساب

`GET /account/activities?page=1` → `data: [{ id, type, title, created_at, device, os, ip, result: "success"|"failed", approx_location }]` (جدیدترین اول، صفحه‌بندی ۲۰تایی).

`type`های قابل‌شناسایی در اپ: `login_success`، `login_failed`، `two_factor_enabled`، `two_factor_disabled`، `mobile_changed`، `device_logout`، `logout_other_devices`، `password_changed`، `security_info_changed`، `session_ended`، `deletion_requested`. برای `type` ناشناخته، اپ `title` را نمایش می‌دهد.

سرور باید این رویدادها را **خودش** در همان لحظه ثبت کند (ورود، تغییر رمز، ...).

### ۷-۵. مدیریت نشست‌ها (اختیاری)

| متد | مسیر | پاسخ |
|---|---|---|
| GET | `/account/sessions` | `data: [{ id, device, os, app_version, ip, created_at, last_activity_at, expires_at, status: "active"\|"expired", is_current }]` |
| DELETE | `/account/sessions/{id}` | توکن آن نشست باطل شود |

اگر پیاده نمی‌کنید، در `/account/security` مقدار `sessions_supported:false` بفرستید.

### ۷-۶. تأیید و تغییر شماره موبایل

| متد | مسیر | بدنه | پاسخ `data` |
|---|---|---|---|
| POST | `/account/mobile/send-code` | `{}` برای تأیید شماره‌ی فعلی، یا `{ mobile }` برای تغییر شماره | `{ expires_in: 120, resend_in: 60, remaining_attempts: 4 }` |
| POST | `/account/mobile/verify` | `{ code }` یا `{ code, mobile }` | — |

محدودیت تعداد درخواست را سرور اعمال کند (پیشنهاد: ۵ بار در ساعت؛ وقتی تمام شد 429 با `message`). تغییر شماره یک رویداد فعالیت و یک هشدار امنیتی ثبت کند. شماره‌ی جدید نباید متعلق به حساب دیگری باشد (422).

### ۷-۷. هشدارهای امنیتی

| متد | مسیر | توضیح |
|---|---|---|
| GET | `/account/security-alerts` | `data: [{ id, type, title, message, created_at, device, ip, is_read, severity: "low"\|"medium"\|"high"\|"critical", suggested_action }]` |
| POST | `/account/security-alerts/{id}/read` | خوانده شد |
| POST | `/account/security-alerts/read-all` | همه خوانده شد |
| GET / PUT | `/account/security-alerts/settings` | `{ notifications_enabled: true/false }` |

`type`ها: `new_device_login`، `multiple_failed_logins`، `password_changed`، `mobile_changed`، `two_factor_changed`، `unusual_activity`.
اگر کاربر اعلان‌ها را خاموش کند، هشدارهای `critical` باز هم باید ارسال شوند (طبق سند). ارسال push برای هشدارها از همان مسیر FCM فعلی (`FIREBASE_NOTIFICATIONS.md`) با `data.type: "security_alert"` پیشنهاد می‌شود.

### ۷-۸. حذف حساب کاربری

| متد | مسیر | بدنه | پاسخ `data` |
|---|---|---|---|
| GET | `/account/deletion-request` | — | درخواست جاری یا `null`: `{ status, requested_at, scheduled_at, executed_at, reason }` |
| POST | `/account/deletion-request/send-code` | — | کد پیامکی به شماره‌ی حساب |
| POST | `/account/deletion-request` | `{ code, reason? }` | همان شیء درخواست |
| POST | `/account/deletion-request/cancel` | — | — |

`status`: `pending` (در انتظار)، `approved` (تأیید شده)، `done` (انجام شده)، `canceled` (لغو شده)، `rejected`.

- **حساب سازمانی / شرکتی:** درخواست فقط ثبت می‌شود (`pending`) و **پس از تأیید پنل ادمین** اجرا می‌شود. پنل ادمین برای این درخواست‌ها صف تأیید/رد لازم دارد.
- **حساب عادی:** می‌توانید مستقیم `approved` با `scheduled_at` (مثلاً ۱۴ روز بعد برای امکان انصراف) برگردانید.
- حذف حساب **به معنی حذف فوری سوابق سفارش و خدمات نیست** (بند ۱۳ حریم خصوصی). سوابق مالی و خدماتی طبق الزامات قانونی نگهداری یا ناشناس‌سازی شوند.

---

## ۸. حریم خصوصی ✅ بدون نیاز به بک‌اند

متن کامل سیاست حریم خصوصی (نسخه 1.0، 1405/07/20، سند LIT-UP-001) داخل اپ است. اگر روی سایت هم نمایش داده می‌شود، همین نسخه را منتشر کنید.

---

## چک‌لیست خلاصه برای تیم بک‌اند

| # | کار | اولویت |
|---|---|---|
| 1 | حذف `technician.phone` از پاسخ‌ها پس از پایان یا لغو سفارش | **بالا (امنیتی)** |
| 2 | `product_name` / `category_title` در `/orders/summary` و نمایش گزارش «عیوب سرویس / محصول» در پنل | بالا |
| 3 | `payment_method` / `payment_channel` / `remaining_amount` روی سفارش و تراکنش | بالا |
| 4 | `melicode`، `registration_number`، `economic_code`، `verification_status` در پروفایل سازمان + پذیرش در ویرایش | بالا |
| 5 | `/account/security`، دستگاه‌ها (ثبت، فهرست، خروج، خروج از سایرین) | متوسط |
| 6 | حذف حساب + صف تأیید ادمین برای حساب سازمانی | متوسط |
| 7 | تأیید/تغییر شماره موبایل | متوسط |
| 8 | تأیید دومرحله‌ای + مرحله‌ی دوم در login | متوسط |
| 9 | فعالیت‌ها و هشدارهای امنیتی (ثبت رویدادها در سرور) | متوسط |
| 10 | مدارک و کاربران مجاز سازمان | پایین |
| 11 | `/app/version` | پایین |
| 12 | درصد جداگانه‌ی کد معرف در پنل (`discount_percent` / `commission_percent` برای هر کد) | طبق نیاز کسب‌وکار |
| 13 | نشست‌ها (یا `sessions_supported:false`) | پایین |
