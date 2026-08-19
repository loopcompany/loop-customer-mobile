# 📦 راهنمای Build و Deploy وب اپلیکیشن لوپ

## ✅ Build موفق انجام شد!

خروجی وب اپلیکیشن در پوشه `dist/` آماده است.

---

## 🚀 نحوه Deploy

### گزینه 1️⃣: استفاده از Netlify (پیشنهادی)

```bash
# نصب Netlify CLI
npm install -g netlify-cli

# Deploy کردن
cd dist
netlify deploy --prod
```

**مراحل:**
1. در Netlify ثبت‌نام کنید: https://app.netlify.com
2. دستور بالا را اجرا کنید
3. وارد اکانت شوید و پروژه را انتخاب کنید
4. لینک سایت آماده است! 🎉

---

### گزینه 2️⃣: استفاده از Vercel

```bash
# نصب Vercel CLI
npm install -g vercel

# Deploy کردن
cd dist
vercel --prod
```

**مراحل:**
1. در Vercel ثبت‌نام کنید: https://vercel.com
2. دستور بالا را اجرا کنید
3. لینک سایت آماده است! 🎉

---

### گزینه 3️⃣: استفاده از سرور شخصی (Apache/Nginx)

#### Apache:
```bash
# کپی فایل‌ها به پوشه public
cp -r dist/* /var/www/html/

# تنظیمات .htaccess برای React Router
cat > /var/www/html/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
EOF
```

#### Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|ttf|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

### گزینه 4️⃣: GitHub Pages

```bash
# نصب gh-pages
npm install --save-dev gh-pages

# اضافه کردن اسکریپت به package.json
# "deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

---

## 📁 محتویات پوشه dist/

```
dist/
├── assets/              # تصاویر، فونت‌ها و فایل‌های استاتیک
├── _expo/               # فایل‌های JavaScript bundle شده
│   └── static/
│       └── js/
│           └── web/
├── favicon.ico          # آیکون سایت
├── index.html           # صفحه اصلی
└── metadata.json        # متادیتای پروژه
```

---

## 🔍 تست محلی Build

```bash
# نصب serve (اگر نصب نیست)
npm install -g serve

# اجرای سرور
serve dist -p 3000

# باز کردن در مرورگر
# http://localhost:3000
```

---

## ⚙️ تنظیمات مهم

### 1. Base URL برای Production
اگر می‌خواهید در subdirectory دیپلوی کنید، در `app.json` تغییر دهید:

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static",
      "baseUrl": "/subfolder"
    }
  }
}
```

### 2. Environment Variables
برای production باید متغیرهای محیطی را تنظیم کنید:

```bash
# ایجاد فایل .env.production
EXPO_PUBLIC_API_URL=https://narchino.com/api
EXPO_PUBLIC_IMAGE_URL=https://narchino.com/storage
```

---

## 🐛 رفع مشکلات متداول

### مشکل 1: صفحه سفید بعد از deploy
**علت:** مسیرهای نسبی اشتباه
**راه‌حل:** 
- مطمئن شوید که `baseUrl` در `app.json` درست است
- از مسیرهای مطلق استفاده کنید

### مشکل 2: 404 در صفحات داخلی
**علت:** سرور نمی‌تواند routing سمت کلاینت را مدیریت کند
**راه‌حل:**
- برای Netlify: فایل `_redirects` اضافه کنید
- برای Apache: `.htaccess` مناسب
- برای Nginx: تنظیمات `try_files`

### مشکل 3: فونت‌ها لود نمی‌شوند
**علت:** CORS یا مسیرهای اشتباه
**راه‌حل:**
```nginx
# در Nginx
add_header Access-Control-Allow-Origin *;
```

---

## 📊 بهینه‌سازی Performance

### 1. Compression
```bash
# در سرور Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
```

### 2. CDN
از Cloudflare یا CDN دیگری برای سرعت بهتر استفاده کنید.

### 3. Lazy Loading
تصاویر و کامپوننت‌های سنگین به صورت lazy load شوند.

---

## 📝 دستورات مفید

```bash
# Build گرفتن
npx expo export -p web

# پاک کردن cache و build مجدد
npx expo export -p web --clear

# تست محلی
serve dist -p 3000

# چک کردن حجم bundle
npx vite-bundle-analyzer dist/_expo/static/js/web/
```

---

## 🔗 لینک‌های مفید

- **Expo Docs**: https://docs.expo.dev/distribution/publishing-websites/
- **React Navigation Web**: https://reactnavigation.org/docs/web-support/
- **Netlify Deploy**: https://docs.netlify.com/cli/get-started/
- **Vercel Deploy**: https://vercel.com/docs

---

## ✅ چک‌لیست قبل از Deploy

- [ ] تست کامل روی localhost
- [ ] بررسی console برای خطاها
- [ ] تست responsive در موبایل
- [ ] چک کردن API endpoints
- [ ] تنظیم متغیرهای محیطی
- [ ] فعال‌سازی HTTPS
- [ ] تنظیم DNS و domain
- [ ] فعال‌سازی compression و caching

---

## 🎉 وب اپلیکیشن شما آماده است!

پوشه `dist/` حاوی تمام فایل‌های لازم برای deploy است.
فقط کافیست محتویات آن را روی هاست یا CDN خود آپلود کنید.

**موفق باشید! 🚀**
