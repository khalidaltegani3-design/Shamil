# حل سريع لمشكلة متغيرات البيئة في Firebase App Hosting

## المشكلة 🚨
التطبيق لا يعمل على Firebase App Hosting لأن متغيرات البيئة غير موجودة.

## الحل السريع ⚡

### الخيار 1: استخدام Firebase Console (الأسهل)
1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر مشروع `zoliapp-lite`
3. اذهب إلى **App Hosting**
4. اختر تطبيقك
5. اذهب إلى **Settings** > **Environment Variables**
6. أضف المتغيرات التالية:

```
# متغيرات عامة (Environment Variables)
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = zoliapp-lite.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = zoliapp-lite
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = zoliapp-lite.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 476068628948
NEXT_PUBLIC_FIREBASE_APP_ID = 1:476068628948:web:55c0eaf993de1cc553ee41
NEXT_PUBLIC_QNAS_API_BASE_URL = https://qnas.qa

# متغيرات حساسة (Secrets)
QNAS_API_TOKEN = 7450ea7803c946b6afbf4bafc414a9d9
QNAS_API_DOMAIN = socialtech.qa
GOOGLE_MAPS_API_KEY = AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8
GEMINI_API_KEY = AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8
GOOGLE_API_KEY = AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8
```

### الخيار 2: استخدام Firebase CLI
```bash
# تسجيل الدخول
firebase login

# تعيين المشروع
firebase use zoliapp-lite

# تشغيل السكريبت (Windows)
.\scripts\setup-firebase-secrets.bat

# أو (Linux/Mac)
chmod +x ./scripts/setup-firebase-secrets.sh
./scripts/setup-firebase-secrets.sh
```

### الخيار 3: الطريقة اليدوية
```bash
firebase apphosting:secrets:set QNAS_API_TOKEN --data "7450ea7803c946b6afbf4bafc414a9d9"
firebase apphosting:secrets:set QNAS_API_DOMAIN --data "socialtech.qa"
firebase apphosting:secrets:set GOOGLE_MAPS_API_KEY --data "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8"
firebase apphosting:secrets:set GEMINI_API_KEY --data "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8"
firebase apphosting:secrets:set GOOGLE_API_KEY --data "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8"
```

## بعد إضافة المتغيرات:
1. ادفع الكود إلى GitHub: `git push`
2. Firebase App Hosting سيعيد بناء التطبيق تلقائياً
3. راقب العملية في Firebase Console > App Hosting > Deployments
4. تحقق من الـ Logs إذا كان هناك أخطاء

## التحقق من النجاح:
- اذهب إلى رابط التطبيق
- تأكد من عمل تسجيل الدخول
- تأكد من عمل العناوين (QNAS API)
- تحقق من عدم وجود أخطاء في Console

## ملاحظات مهمة:
- ✅ **آمن**: متغيرات البيئة لن تظهر في الكود المصدري
- ✅ **محمي**: Firebase يحفظ الـ secrets بشكل مشفر
- ✅ **سريع**: التحديث يتم تلقائياً مع كل push

## إذا لم يعمل:
1. تحقق من الـ Build Logs في Firebase Console
2. تأكد من أن جميع المتغيرات تم إضافتها صحيحاً
3. تحقق من أن `apphosting.yaml` محدث
4. جرب إعادة النشر: `git push --force`