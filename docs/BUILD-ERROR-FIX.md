# 🚨 حل خطأ البناء في Firebase App Hosting

## الخطأ المواجه:
```
ERROR: build step 1 "us-central1-docker.pkg.dev/serverless-runtimes/utilities/preparer:base_20250817_18_04_RC00" failed: step exited with non-zero status
```

## الأسباب المحتملة والحلول:

### 1. 🔧 تحديث apphosting.yaml (الحل الأكثر احتمالاً)

المشكلة: تكوين `apphosting.yaml` قد يحتوي على معاملات غير متوافقة.

**الحل:**
```yaml
# apphosting.yaml (النسخة المحدثة)
runConfig:
  cpu: 1
  memoryMiB: 512
  maxInstances: 1
  minInstances: 0
  concurrency: 80

# Environment variables (only essential ones)
env:
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8"
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "zoliapp-lite.firebaseapp.com"
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "zoliapp-lite"
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "zoliapp-lite.firebasestorage.app"
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "476068628948"
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:476068628948:web:55c0eaf993de1cc553ee41"
  NEXT_PUBLIC_QNAS_API_BASE_URL: "https://qnas.qa"
  NODE_ENV: "production"
```

### 2. 🎯 تحديث next.config.ts

المشكلة: إعدادات Next.js قد تسبب مشاكل في البناء.

**الحل:**
```typescript
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,  // تغيير من true
  },
  eslint: {
    ignoreDuringBuilds: false,  // تغيير من true
  },
  output: 'standalone',  // إضافة للـ deployment
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'firebase-admin': false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

export default nextConfig;
```

### 3. 📦 تحديث package.json

المشكلة: Scripts البناء قد تحتاج تحسين.

**الحل:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

### 4. 🚫 إزالة الملفات التي قد تسبب مشاكل

```bash
# حذف cache و node_modules
rm -rf .next
rm -rf node_modules
rm -rf .genkit

# إعادة تثبيت
npm install
```

### 5. 🔍 التحقق من أخطاء TypeScript

```bash
# تشغيل TypeScript checker محلياً
npm run typecheck

# إصلاح أخطاء ESLint
npm run lint --fix
```

## 🛠️ الحل السريع (خطوة بخطوة):

### الخطوة 1: تبسيط apphosting.yaml
```yaml
runConfig:
  cpu: 1
  memoryMiB: 512
  maxInstances: 1

env:
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8"
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "zoliapp-lite.firebaseapp.com"
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "zoliapp-lite"
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "zoliapp-lite.firebasestorage.app"
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "476068628948"
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:476068628948:web:55c0eaf993de1cc553ee41"
```

### الخطوة 2: تبسيط next.config.ts
```typescript
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
```

### الخطوة 3: Push والاختبار
```bash
git add .
git commit -m "fix: simplify apphosting config"
git push
```

## 🔍 طرق التشخيص:

### 1. فحص Build Logs
- اذهب إلى Firebase Console
- App Hosting > Deployments
- اضغط على آخر deployment فاشل
- تحقق من التفاصيل في Logs

### 2. اختبار البناء محلياً
```bash
npm run build
```

### 3. التحقق من أخطاء الكود
```bash
npm run lint
npm run typecheck
```

## ⚡ الحلول الطارئة:

### إذا استمر الخطأ:
1. **إزالة secrets مؤقتاً** من `apphosting.yaml`
2. **استخدام minimum config**
3. **Deploy مع أقل إعدادات ممكنة**
4. **إضافة المعالم تدريجياً**

### إعداد minimum apphosting.yaml:
```yaml
runConfig:
  maxInstances: 1

env:
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "zoliapp-lite"
```

## 📊 معلومات إضافية:

- **الخطأ**: يحدث في مرحلة "preparer" من البناء
- **السبب الأكثر شيوعاً**: تعارض في إعدادات التكوين
- **الحل الأسرع**: تبسيط التكوين ثم إضافة المعالم تدريجياً

هل تريد أن أطبق هذه التغييرات الآن؟