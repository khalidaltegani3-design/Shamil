# دليل النشر على Firebase App Hosting

## المشكلة
عند نشر التطبيق على Firebase App Hosting، متغيرات البيئة (.env) لا تُرفع تلقائياً لأسباب أمنية.

## الحل الآمن

### 1. إعداد متغيرات البيئة في Firebase Console

#### الطريقة الأولى: عبر Firebase Console
1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك
3. اذهب إلى **App Hosting** من القائمة الجانبية
4. اختر التطبيق الخاص بك
5. اذهب إلى تبويب **Environment Variables**
6. أضف المتغيرات التالية:

```bash
# متغيرات Firebase (عامة - يمكن رؤيتها في المتصفح)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zoliapp-lite.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zoliapp-lite
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zoliapp-lite.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=476068628948
NEXT_PUBLIC_FIREBASE_APP_ID=1:476068628948:web:55c0eaf993de1cc553ee41

# متغيرات QNAS (الحساسة - تبقى في الخادم فقط)
NEXT_PUBLIC_QNAS_API_BASE_URL=https://qnas.qa
QNAS_API_TOKEN=7450ea7803c946b6afbf4bafc414a9d9
QNAS_API_DOMAIN=socialtech.qa

# Google APIs (حساسة)
GOOGLE_MAPS_API_KEY=AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8
GEMINI_API_KEY=AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8
GOOGLE_API_KEY=AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8
```

#### الطريقة الثانية: عبر Firebase CLI
```bash
# تسجيل الدخول
firebase login

# تعيين المشروع
firebase use zoliapp-lite

# إضافة متغيرات البيئة
firebase apphosting:secrets:set QNAS_API_TOKEN --data "7450ea7803c946b6afbf4bafc414a9d9"
firebase apphosting:secrets:set GOOGLE_MAPS_API_KEY --data "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8"
firebase apphosting:secrets:set GEMINI_API_KEY --data "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8"
```

### 2. تحديث ملف apphosting.yaml

تأكد من أن ملف `apphosting.yaml` يتضمن متغيرات البيئة:

```yaml
# apphosting.yaml
runConfig:
  cpu: 1
  memoryMiB: 512
  minInstances: 0
  maxInstances: 1000
  concurrency: 1000

env:
  # متغيرات عامة (NEXT_PUBLIC_*)
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8"
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "zoliapp-lite.firebaseapp.com"
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "zoliapp-lite"
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "zoliapp-lite.firebasestorage.app"
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "476068628948"
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:476068628948:web:55c0eaf993de1cc553ee41"
  NEXT_PUBLIC_QNAS_API_BASE_URL: "https://qnas.qa"

# المتغيرات الحساسة تُعرّف كـ secrets
secrets:
  - variable: QNAS_API_TOKEN
    secret: QNAS_API_TOKEN
  - variable: GOOGLE_MAPS_API_KEY
    secret: GOOGLE_MAPS_API_KEY
  - variable: GEMINI_API_KEY
    secret: GEMINI_API_KEY
```

### 3. التحقق من النشر

بعد إضافة المتغيرات:
1. ادفع الكود إلى GitHub
2. سيتم إعادة بناء التطبيق تلقائياً
3. تحقق من الـ logs في Firebase Console

### 4. أفضل الممارسات الأمنية

#### ✅ آمن:
- **متغيرات عامة (NEXT_PUBLIC_*)**: يمكن أن تكون مرئية في المتصفح
- **Firebase Config**: عادة آمن لأنه محمي بقواعد Firestore
- **APIs عامة**: مثل QNAS Base URL

#### ⚠️ حساس:
- **API Tokens**: يجب حفظها كـ secrets
- **Private Keys**: لا تضعها أبداً في الكود
- **Database URLs**: إذا كانت تحتوي على credentials

### 5. حل سريع للاختبار

إذا كنت تريد حل سريع للاختبار فقط:

```bash
# في terminal
cd "c:\Users\dell 5420\Shamil\Shamil"

# إنشاء ملف apphosting.yaml محدث
# (سنقوم بهذا في الخطوة التالية)
```

### 6. التشخيص

إذا لم يعمل التطبيق، تحقق من:
1. **Logs** في Firebase Console > App Hosting > Logs
2. **Environment Variables** في تبويب التطبيق
3. **Build Logs** للتأكد من عدم وجود أخطاء

### خطوات النشر الآمن:

1. احذف `.env.local` من git (إذا كان موجود)
2. أضف المتغيرات في Firebase Console
3. حدث `apphosting.yaml`
4. ادفع إلى GitHub
5. راقب الـ deployment

هذا يضمن عدم تسريب أي بيانات حساسة في الكود المصدري!