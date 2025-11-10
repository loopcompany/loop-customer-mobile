# 🔧 رفع مشکل دکمه بارگذاری قرارداد

**تاریخ**: 2025-11-10  
**فایل**: `screens/organization/OrganizationContractScreen.js`

---

## 🐛 مشکل

کاربر فایل رو انتخاب می‌کنه ولی **دکمه بارگذاری نمایش داده نمیشه**.

---

## 🔍 علت مشکل

### کد قبلی:
```javascript
{/* دکمه فقط اگر فایل انتخاب شده بود نمایش داده میشد */}
{selectedFile && (
  <Button title="آپلود قرارداد" ... />
)}
```

**مشکلات احتمالی:**
1. ❌ `selectedFile` set نمیشه (به خاطر mimeType نامعتبر یا سایز زیاد)
2. ❌ کاربر نمیفهمه چرا دکمه نیست
3. ❌ هیچ feedback واضحی به کاربر داده نمیشه

---

## ✅ راه‌حل

### 1. اضافه کردن console.log برای debug:
```javascript
const selectFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync(...);
    
    console.log('📁 Document Picker Result:', result);
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      
      console.log('📄 Selected file:', {
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        uri: file.uri
      });
      
      // ... validation
    } else {
      console.log('⚠️ File selection canceled or no file selected');
    }
  } catch (error) {
    console.error('Error selecting file:', error);
  }
};
```

### 2. نمایش همیشگی دکمه (با حالت disabled):
```javascript
{/* دکمه همیشه نمایش داده میشه */}
<Button
  title={
    uploading ? 'در حال آپلود...' : 
    selectedFile ? 'آپلود قرارداد' : 
    'ابتدا فایل را انتخاب کنید'  // ← پیام واضح
  }
  onPress={uploadContract}
  loading={uploading}
  disabled={uploading || !selectedFile}  // ← disabled اگه فایل نیست
  backgroundColor={
    selectedFile ? 
    themeColor0.bgColor(1) :   // ← سبز اگه فایل هست
    themeColor5.bgColor(1)     // ← خاکستری اگه فایل نیست
  }
  textColor={themeColor4.bgColor(1)}
  style={styles.uploadButton}
/>
```

### 3. پیام خطای بهتر برای mimeType:
```javascript
if (!allowedTypes.includes(file.mimeType)) {
  showAlert('خطا', `فقط فایل‌های PDF و تصاویر مجاز هستند\n\nنوع فایل شما: ${file.mimeType}`);
  return;
}
```

---

## 📋 رفتار جدید

| حالت | قبل | بعد |
|------|-----|-----|
| فایل انتخاب نشده | ❌ دکمه نیست | ✅ دکمه هست (disabled، خاکستری) |
| فایل انتخاب شده | ✅ دکمه فعال | ✅ دکمه فعال (سبز) |
| در حال آپلود | ✅ دکمه disabled | ✅ دکمه disabled با متن "در حال آپلود..." |
| mimeType نامعتبر | ❌ پیام مبهم | ✅ پیام واضح با نوع فایل |

---

## 🎨 حالات مختلف دکمه

### 1️⃣ فایل انتخاب نشده:
```
┌──────────────────────────────┐
│  ابتدا فایل را انتخاب کنید   │  ← disabled, خاکستری
└──────────────────────────────┘
```

### 2️⃣ فایل انتخاب شده:
```
┌──────────────────────────────┐
│      آپلود قرارداد           │  ← enabled, سبز
└──────────────────────────────┘
```

### 3️⃣ در حال آپلود:
```
┌──────────────────────────────┐
│   در حال آپلود... ⏳         │  ← disabled, loading
└──────────────────────────────┘
```

---

## 🧪 Debug کردن مشکلات احتمالی

با console.log های اضافه شده، حالا میتونیم ببینیم:

### 1. چک کردن result:
```javascript
📁 Document Picker Result: {
  canceled: false,
  assets: [...]
}
```

### 2. چک کردن file info:
```javascript
📄 Selected file: {
  name: "contract.pdf",
  size: 2048576,
  mimeType: "application/pdf",  // ← اینو چک کن!
  uri: "file://..."
}
```

### 3. اگر cancel شد:
```javascript
⚠️ File selection canceled or no file selected
```

---

## 🔍 مشکلات احتمالی و راه‌حل

### مشکل 1: mimeType اشتباه
**علامت:** فایل انتخاب میشه ولی Alert میده "فقط PDF و تصاویر مجاز هستند"

**راه‌حل:**
```javascript
// فایل‌های مجاز:
const allowedTypes = [
  'application/pdf',       // PDF
  'image/jpeg',           // JPG
  'image/jpg',            // JPG (alternative)
  'image/png'             // PNG
];
```

اگه mimeType متفاوته، باید بهش اضافه بشه.

### مشکل 2: سایز زیاد
**علامت:** Alert میده "حجم فایل نباید از 10 مگابایت بیشتر باشد"

**راه‌حل:** فایل رو کوچکتر کن یا limit رو افزایش بده:
```javascript
if (file.size > 10 * 1024 * 1024) {  // ← اینجا میتونی تغییر بدی
  showAlert('خطا', 'حجم فایل نباید از 10 مگابایت بیشتر باشد');
  return;
}
```

### مشکل 3: DocumentPicker کار نمی‌کنه
**راه‌حل:** چک کن که `expo-document-picker` نصب باشه:
```bash
npx expo install expo-document-picker
```

---

## 💡 بهبودهای اضافه شده

1. ✅ **UX بهتر**: کاربر همیشه دکمه رو می‌بینه
2. ✅ **Feedback واضح**: متن دکمه میگه چیکار باید بکنه
3. ✅ **Visual indicator**: رنگ دکمه (سبز/خاکستری) وضعیت رو نشون میده
4. ✅ **Debug آسان**: console.log ها کمک می‌کنن مشکل رو پیدا کنیم
5. ✅ **پیام خطای بهتر**: نوع فایل رو نشون میده

---

## 📝 تغییرات

### فایل: `screens/organization/OrganizationContractScreen.js`

**اضافه شد:**
- ✅ console.log برای debug
- ✅ پیام بهتر برای mimeType نامعتبر
- ✅ نمایش همیشگی دکمه بارگذاری
- ✅ متن پویا برای دکمه
- ✅ رنگ پویا بر اساس وضعیت

---

## ✍️ نویسنده

GitHub Copilot  
تاریخ: ۲۰ آبان ۱۴۰۴
