# دليل مزامنة المستخدمين من Auth إلى Firestore

## المشكلة
المستخدمون موجودون في Firebase Auth لكن لا يظهرون في صفحة إدارة المستخدمين لأنهم ليس لديهم مستندات في Firestore.

## الحل

### الطريقة 1: استخدام سكريبت Node.js (موصى به)

1. **الحصول على مفتاح الخدمة (Service Account Key)**:
   - افتح [Firebase Console](https://console.firebase.google.com)
   - اختر مشروعك `zoliapp-lite`
   - اذهب إلى **Project Settings** > **Service Accounts**
   - اضغط على **Generate New Private Key**
   - احفظ الملف باسم `serviceAccountKey.json` في مجلد المشروع الرئيسي

2. **تثبيت Firebase Admin SDK**:
   ```bash
   npm install firebase-admin
   ```

3. **تشغيل سكريبت المزامنة**:
   ```bash
   node scripts/sync-auth-users.js
   ```

4. **التحقق من النتائج**:
   - افتح Firebase Console > Firestore Database
   - تحقق من مجموعة `users`
   - يجب أن ترى المستخدمين الجدد مع حقل `syncedFromAuth: true`

---

### الطريقة 2: يدوياً من Firebase Console

إذا لم تتمكن من استخدام السكريبت:

1. افتح [Firebase Console](https://console.firebase.google.com)
2. اذهب إلى **Authentication** > **Users**
3. انسخ قائمة المستخدمين (UID, Email, Display Name)
4. اذهب إلى **Firestore Database** > **users collection**
5. لكل مستخدم مفقود، أنشئ مستند جديد:
   - **Document ID**: UID من Auth
   - **الحقول**:
     ```json
     {
       "uid": "UID_FROM_AUTH",
       "email": "user@example.com",
       "displayName": "User Name",
       "name": "User Name",
       "role": "employee",
       "status": "active",
       "isActive": true,
       "emailVerified": false,
       "createdAt": "TIMESTAMP",
       "homeDepartmentId": "",
       "employeeId": "",
       "syncedFromAuth": true
     }
     ```

---

### الطريقة 3: استخدام Cloud Function (للمستقبل)

يمكن إنشاء Cloud Function تعمل تلقائياً عند تسجيل مستخدم جديد:

```javascript
exports.createUserDocument = functions.auth.user().onCreate(async (user) => {
  await admin.firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0],
    // ... باقي الحقول
  });
});
```

---

## التحقق من نجاح المزامنة

1. سجل دخول كمدير نظام
2. اذهب إلى **إدارة المستخدمين**
3. يجب أن ترى جميع المستخدمين الآن
4. المستخدمون المزامنون سيكون لديهم حقل `syncedFromAuth: true`

---

## ملاحظات مهمة

- ⚠️ **لا تشارك ملف `serviceAccountKey.json` مع أحد**
- ⚠️ أضف `serviceAccountKey.json` إلى `.gitignore`
- ✅ بعد المزامنة، سيحتاج المستخدمون إلى:
  - تحديد القسم الرئيسي (homeDepartmentId)
  - إضافة رقم وظيفي (employeeId)
- ✅ يمكن للمدير تحديث هذه المعلومات من صفحة إدارة المستخدمين

---

## استكشاف الأخطاء

### خطأ: "PERMISSION_DENIED"
- تأكد من أن قواعد Firestore تسمح للمدير بالكتابة
- تحقق من صلاحيات Service Account

### خطأ: "Module not found: firebase-admin"
- قم بتثبيت الحزمة: `npm install firebase-admin`

### المستخدمون لا يزالون لا يظهرون
- تحقق من Console في المتصفح (F12)
- تأكد من تسجيل الدخول كمدير نظام
- تحقق من قواعد Firestore




