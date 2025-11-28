# 📸 راهنمای آپلود عکس پروفایل

## ✅ چیزهایی که اضافه شد

### 1. State های جدید
```javascript
const [profileImage, setProfileImage] = useState(null);
const [profileImagePreview, setProfileImagePreview] = useState(null);
```

- **`profileImage`**: فایل واقعی که آماده ارسال به بک‌اند است
- **`profileImagePreview`**: URI برای نمایش preview عکس

### 2. تابع `pickProfileImage`
این تابع:
- ✅ Permission گالری رو درخواست می‌کنه
- ✅ Image Picker باز می‌کنه
- ✅ Crop دایره‌ای (1:1) فعال داره
- ✅ کیفیت رو 80% تنظیم می‌کنه
- ✅ فایل رو با فرمت صحیح آماده می‌کنه

### 3. UI Component
```javascript
<View style={styles.profileImageContainer}>
    <TouchableOpacity onPress={pickProfileImage}>
        {/* عکس یا placeholder */}
        <View style={styles.cameraIconOverlay}>
            <Ionicons name="camera" />
        </View>
    </TouchableOpacity>
    <Text>افزودن عکس پروفایل</Text>
</View>
```

---

## 🚀 نحوه ارسال به بک‌اند

### روش 1: FormData (توصیه می‌شه)
```javascript
const updateProfile = async () => {
    try {
        setIsLoading(true);

        const formData = new FormData();
        
        // اضافه کردن فیلدهای معمولی
        formData.append('name', profileData.name);
        formData.append('last_name', profileData.last_name);
        formData.append('email', profileData.email);
        // ... بقیه فیلدها
        
        // اضافه کردن عکس پروفایل با نام profile_image
        if (profileImage) {
            formData.append('profile_image', {
                uri: profileImage.uri,
                type: profileImage.type,
                name: profileImage.name,
            });
        }

        // ارسال با axios
        const token = await TokenManager.getToken();
        const response = await axios.post(
            `${uri}/user/update-profile`,
            formData,
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            }
        );

        if (response.data.success) {
            showToastOrAlert('پروفایل با موفقیت بروزرسانی شد');
            
            // اگر سرور URL عکس جدید رو برگردوند
            if (response.data.data?.user?.profile_image_url) {
                setProfileImagePreview(response.data.data.user.profile_image_url);
            }
        }

    } catch (error) {
        console.error('خطا در بروزرسانی پروفایل:', error);
        showToastOrAlert('خطا در بروزرسانی پروفایل');
    } finally {
        setIsLoading(false);
    }
};
```

### روش 2: ارسال جداگانه (اگر API جدا باشه)
```javascript
const uploadProfileImage = async () => {
    if (!profileImage) return;

    try {
        const formData = new FormData();
        formData.append('profile_image', {
            uri: profileImage.uri,
            type: profileImage.type,
            name: profileImage.name,
        });

        const token = await TokenManager.getToken();
        const response = await axios.post(
            `${uri}/user/upload-profile-image`,
            formData,
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            }
        );

        if (response.data.success) {
            showToastOrAlert('عکس پروفایل با موفقیت آپلود شد');
            setProfileImagePreview(response.data.data.profile_image_url);
        }

    } catch (error) {
        console.error('خطا در آپلود عکس:', error);
        showToastOrAlert('خطا در آپلود عکس');
    }
};
```

---

## 📦 ساختار فایل `profileImage`

```javascript
{
    uri: 'file:///path/to/image.jpg',     // مسیر فایل
    type: 'image/jpeg',                    // نوع MIME
    name: 'profile_1732637890123.jpg'     // نام فایل
}
```

---

## 🎨 ویژگی‌های UI

### 1. طراحی
- ✅ دایره‌ای با shadow زیبا
- ✅ Border با رنگ theme
- ✅ آیکن دوربین در گوشه پایین راست
- ✅ Placeholder زمانی که عکس نیست

### 2. تجربه کاربری
- ✅ کلیک روی عکس → انتخاب عکس جدید
- ✅ Preview فوری بعد از انتخاب
- ✅ Label متنی که تغییر می‌کنه ("افزودن" یا "تغییر")

### 3. Responsive
- ✅ سایز ثابت 120x120
- ✅ در تمام صفحه‌نمایش‌ها خوب به نظر می‌رسه

---

## 🔧 تنظیمات Image Picker

```javascript
await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,  // فقط عکس
    allowsEditing: true,                              // crop فعال
    aspect: [1, 1],                                   // نسبت مربع
    quality: 0.8,                                     // کیفیت 80%
});
```

---

## 📝 نکات مهم

### 1. Permission
```javascript
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
if (status !== 'granted') {
    // کاربر permission نداد
}
```

### 2. Web Platform
برای web باید از `input type="file"` استفاده کنی یا از پکیج دیگری

### 3. فرمت نام فایل
```javascript
name: `profile_${Date.now()}.jpg`  // اسم یکتا با timestamp
```

### 4. بررسی حجم فایل
```javascript
if (selectedImage.fileSize > 5 * 1024 * 1024) {
    showToastOrAlert('حجم فایل نباید بیشتر از 5 مگابایت باشد');
    return;
}
```

---

## 🐛 Troubleshooting

### خطا: "Cannot read property 'uri'"
```javascript
// قبل از استفاده بررسی کن
if (result.canceled || !result.assets || result.assets.length === 0) {
    return;
}
```

### خطا: "Network request failed"
```javascript
// مطمئن شو Content-Type درست تنظیم شده
headers: {
    'Content-Type': 'multipart/form-data',
}
```

### عکس آپلود نمی‌شه
```javascript
// Console log کن ببین چی داره ارسال میشه
console.log('FormData:', formData);
console.log('Profile Image:', profileImage);
```

---

## 📱 نمونه کامل استفاده

```javascript
// 1. کاربر روی عکس کلیک می‌کنه
<TouchableOpacity onPress={pickProfileImage}>
    ...
</TouchableOpacity>

// 2. عکس انتخاب می‌شه و در state ذخیره میشه
const pickProfileImage = async () => {
    // ... کد موجود
    setProfileImage(imageFile);
    setProfileImagePreview(selectedImage.uri);
};

// 3. کاربر روی دکمه ذخیره می‌زنه
<Button onPress={updateProfile} />

// 4. عکس همراه با اطلاعات دیگه ارسال میشه
const updateProfile = async () => {
    const formData = new FormData();
    formData.append('name', profileData.name);
    
    if (profileImage) {
        formData.append('profile_image', profileImage);
    }
    
    await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
```

---

## ✅ چک لیست

- [x] Import `expo-image-picker`
- [x] State های `profileImage` و `profileImagePreview`
- [x] تابع `pickProfileImage`
- [x] UI Component با استایل
- [x] آیکن دوربین
- [ ] اتصال به تابع `updateProfile`
- [ ] Handle کردن response از سرور
- [ ] بررسی حجم فایل
- [ ] Support برای web (در صورت نیاز)

---

**نکته**: فعلاً فقط UI و انتخاب عکس پیاده‌سازی شده. برای ارسال به بک‌اند کافیه کد بالا رو در تابع `updateProfile` اضافه کنی! 🚀
