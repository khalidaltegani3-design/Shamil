# دليل نشر Firebase App Hosting

## التحديثات المطبقة لإصلاح مشاكل الصلاحيات

### المشكلة الأصلية
- التطبيق يعمل محليًا مع الصلاحيات بشكل صحيح
- بعد النشر على Firebase App Hosting، الصلاحيات لا تعمل بشكل صحيح

### الإصلاحات المطبقة

#### 1. تحديث `next.config.ts`
```typescript
- إضافة output: 'standalone' للإنتاج
- تحسين إعدادات webpack للتوافق مع Firebase
- إضافة متغيرات البيئة الصريحة
- تحسين إعدادات الصور والضغط
```

#### 2. تحديث `apphosting.yaml`
```yaml
- زيادة الذاكرة إلى 1024MB لأداء أفضل
- إضافة متغيرات البيئة المطلوبة
- تحديد إصدار Node.js 18
- إعدادات بناء محسنة
```

#### 3. تحديث `middleware.ts`
```typescript
- إضافة headers الأمان
- تحسين معالجة المسارات الثابتة
- تحسين التوافق مع App Hosting
```

#### 4. تحديث `firebase.ts`
```typescript
- معالجة أفضل للأخطاء في البيئة المباشرة
- تحسين التهيئة للخادم والعميل
- إضافة متغير FIREBASE_PROJECT_ID البديل
- تحسين التوافق مع App Hosting
```

## خطوات النشر

1. **التأكد من الإعدادات المحلية:**
   ```bash
   npm run build  # للتأكد من عدم وجود أخطاء
   ```

2. **رفع التحديثات:**
   ```bash
   git add .
   git commit -m "تحديث إعدادات App Hosting"
   git push origin V3.1
   ```

3. **النشر على App Hosting:**
   - الذهاب إلى Firebase Console
   - اختيار App Hosting
   - ربط الفرع V3.1
   - بدء عملية النشر

## متغيرات البيئة المطلوبة في App Hosting

### متغيرات Firebase (عامة):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### متغيرات النظام:
- `NODE_ENV=production`
- `FIREBASE_PROJECT_ID=zoliapp-lite`

### متغيرات سرية (Secrets):
- `QNAS_API_TOKEN`
- `QNAS_API_DOMAIN`
- `GOOGLE_MAPS_API_KEY`
- `GEMINI_API_KEY`

## التحقق من نجاح النشر

1. **اختبار تسجيل الدخول:**
   - موظف: `/login/employee`
   - مشرف: `/login/supervisor`

2. **اختبار الصلاحيات:**
   - الوصول لصفحات المشرف
   - الوصول لصفحات الموظف
   - التأكد من عدم قدرة الموظف على الوصول لصفحات المشرف

3. **اختبار الوظائف:**
   - إنشاء تقرير
   - عرض الخرائط
   - نظام الجيوكودنغ

## ملاحظات مهمة

- تم زيادة الذاكرة إلى 1024MB لتحسين الأداء
- تم تحسين معالجة الأخطاء لبيئة الإنتاج
- middleware محدث للتوافق الأمثل مع App Hosting
- Firebase config محسن للعمل في البيئات المختلفة

## في حالة استمرار المشاكل

1. التحقق من logs في Firebase Console
2. التأكد من ضبط جميع متغيرات البيئة
3. التحقق من Firestore rules
4. مراجعة إعدادات Firebase Authentication

---
آخر تحديث: 22 سبتمبر 2025
الفرع: V3.1
الحالة: جاهز للنشر ✅