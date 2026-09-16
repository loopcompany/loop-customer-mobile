# بازبینی پیام‌های خطا — لیست کارها

## مشکل

در ثبت سفارشِ «انتخاب جامع»، با اینکه همه‌ی فیلدهای «اطلاعات اپراتور» پر بود، پیام
«لطفاً اطلاعات اپراتور را کامل کنید.» نمایش داده می‌شد. علت: کد ملیِ واردشده در بررسی
رقم کنترل رد می‌شد، ولی برای *هر* نوع خطا فقط همین یک پیام کلی نمایش داده می‌شد. کاربر
راهی نداشت بفهمد کدام فیلد و چه مشکلی دارد.

در همین بررسی یک باگ دیگر هم پیدا شد: `validateMelicode` و `validatePhone` در
`helpers/Common.js` با `replace(/\D/g, '')` ارقام فارسی (۰-۹) را هم حذف می‌کردند؛ یعنی
اگر عدد با کیبورد فارسی وارد می‌شد، همیشه خطای «باید ۱۰ رقم باشد» برمی‌گشت.

## قواعد پیام خطا

1. **دقیق باشد:** پیام باید بگوید *کدام فیلد* و *چه مشکلی* دارد. اگر فیلد پر است ولی
   نامعتبر است، پیغام «کامل کنید» غلط است.
2. **فقط یک خطا در هر بار:** اولین خطا را نشان بده و بخش/فیلد مربوط را باز کن.
3. **خطای API:** از `describeApiError` در `utils/apiErrorHandler.js` استفاده شود (خطای
   ۴۲۲ لاراول، `message` سرور، خطای شبکه، و کد وضعیت). هیچ‌وقت هشدار خالی یا
   `undefined` نمایش داده نشود.
4. **خطای ۴۰۱ دوباره نشان داده نشود:** interceptor خودش کشوی «نشست منقضی شد» را نشان
   می‌دهد.
5. **ارقام فارسی/عربی:** قبل از اعتبارسنجی با `convertToEnglish` یکسان شوند.
6. **ترجمه:** صفحه‌های `org/` از `L()` (فایل `org/orgI18n.js`) استفاده می‌کنند و بقیه
   از `t()` با کلید در `assets/locales/{en,fa}.json`.
7. **نحوه نمایش:** فقط `showAlert` / `showToastOrAlert`، نه `Alert.alert`.

## لیست کارها

### مرحله ۰ — helperهای مشترک
- [x] `helpers/Common.js` — ارقام فارسی در `validateMelicode` / `validatePhone` پشتیبانی شوند
- [x] `helpers/Common.js` — پیام‌های `validateMelicode` / `validatePhone` / `validateEmail` ترجمه‌پذیر شوند
- [ ] `helpers/Common.js` — `handleError`: خطای ۴۲۲ / ۵۰۰ / شبکه تفکیک شوند (الان هر خطای بدون `response` هم «خطای غیرمنتظره» می‌گیرد)

### مرحله ۱ — ثبت سفارش سازمانی ⚠️ (باگ گزارش‌شده)
- [x] `org/ComprehensiveSelectionScreen.js` — خطای مخصوص هر فیلد اپراتور (عنوان شغلی، نام، کد ملی، موبایل)
- [x] `org/SystematicDeviceScreen.js` — بررسی شد؛ پیام از قبل نام مرحله‌ی ناقص را نشان می‌دهد
- [x] `org/SystematicCategoryScreen.js` — علت خطا کنار «خطا در دریافت دسته‌ها»؛ خطای `fetchSteps` دیگر بی‌صدا نیست
- [x] `screens/orders/OrderSummaryScreen.js` — بررسی شد؛ پیامک «بهترین-تلاش» است و پیام‌ها درست‌اند
- [x] `components/OrgSelectionKit.js` — بررسی شد؛ پیام‌های دسترسی دوربین/گالری درست‌اند
- [x] `org/DiscountCodeScreen.js` — بررسی شد؛ صفحه‌ی نمایشی است و اعتبارسنجی ندارد

### مرحله ۲ — ثبت سفارش مشتری
- [x] `screens/category/Steps.js` — پیام با نام فیلدِ خالی؛ قبلاً دکمه‌ی «بعدی» بی‌پیام کار نمی‌کرد. در حالت «فوری» تاریخ/ساعتِ مخفی دیگر الزامی نیستند
- [x] `screens/category/Preview.js` — پیام‌های فارسیِ ثابت ترجمه‌پذیر شدند
- [x] `screens/category/SubCategories.js` / `screens/FolderScreen.js` — علت خطا در پیام؛ خطای `fetchSteps` (`slices/stepSlice.js`) با `rejectWithValue` + `describeApiError` نمایش داده می‌شود

### مرحله ۳ — جزئیات و پیگیری سفارش
- [ ] `screens/orders/Details.js`
- [ ] `screens/orders/Invoice.js`
- [ ] `screens/orders/OrderLoopSendSection.js`
- [ ] `screens/orders/OrderLoopDispatchSection.js`
- [ ] `screens/orders/OrderReturnTimeSection.js`
- [ ] `screens/orders/OrderReviewSection.js` / `OrderReviewRatingSection.js`
- [ ] `screens/orders/OrderExtraServices.js`
- [ ] `screens/orders/OrderReceiptScreen.js`
- [ ] `components/OrderItem.js` / `components/OrderDropdown.js` / `components/RateModal.js`

### مرحله ۴ — ورود و ثبت‌نام مشتری
- [ ] `screens/auth/MainSignIn.js`
- [ ] `screens/auth/LoginScreen.js`
- [ ] `screens/auth/ForgotPassword.js`
- [ ] `screens/auth/ResetPasswordScreen.js`
- [ ] `screens/auth/RegistrationVerificationScreen.js`

### مرحله ۵ — ورود و ثبت‌نام سازمان
- [ ] `org/logreg/Register.js`
- [ ] `org/logreg/Login.js`
- [ ] `org/logreg/OTPVerification.js`
- [ ] `org/logreg/OrganizationForgotPassword.js`
- [ ] `org/logreg/OrganizationResetPassword.js`

### مرحله ۶ — حساب کاربری، کیف پول و آدرس
- [ ] `screens/account/Profile.js`
- [ ] `screens/account/OrganizationProfile.js`
- [ ] `screens/organization/OrganizationContract.js`
- [ ] `screens/account/Increase.js` (کیف پول)
- [ ] `screens/TransactionsScreen.js`
- [ ] `screens/account/AddressScreen.js` / `screens/address/AddNewAddress.js`
- [ ] `screens/address/Map.js` / `Map.web.js` / `NeshanMap.js` / `components/LocationPicker.js` / `components/MapView.web.js`

### مرحله ۷ — باشگاه مشتریان
- [ ] `screens/club/Club.js`
- [ ] `screens/club/DiscountDetail.js` / `DiscountModal.js`
- [ ] `screens/club/UserDiscounts.js` / `UserDiscountItem.js` / `GemTransactions.js`

### مرحله ۸ — پشتیبانی و ارتباط
- [ ] `screens/contact/FeedbackSurveyScreen.js`
- [ ] `screens/contact/ViolationReportScreen.js` / `screens/ViolationReportsListScreen.js`
- [ ] `screens/ProductIssueScreen.js`
- [ ] `screens/MessageScreen.js` / `screens/chat/ChatRoom.js`

### مرحله ۹ — یادداشت‌ها و سایر
- [ ] `screens/NotesScreen.js` / `screens/notes/AddEditNoteScreen.js` / `screens/FolderScreen.js`
- [ ] `screens/TrainingRegistrationScreen.js`
- [ ] `screens/resources/*` (About, Privacy, Warranty, LearnMore, OrganizationTerms)
- [ ] `components/TechnicianDetailsComponent.js`
