# دليل حذف المستخدمين من Firebase Auth

## المشكلة
عند حذف مستخدم من Firestore، يبقى المستخدم موجوداً في Firebase Auth، مما يمنع إعادة استخدام البريد الإلكتروني.

## الحلول

### الحل الأول: حذف من Firebase Console
1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر المشروع: `zoliapp-lite`
3. اذهب إلى **Authentication** > **Users**
4. ابحث عن المستخدم بالبريد الإلكتروني
5. اضغط على **Delete user**

### الحل الثاني: استخدام Firebase CLI
```bash
# تثبيت Firebase Admin SDK
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# حذف المستخدم (يتطلب Admin SDK)
firebase auth:export users.json
# ثم حذف المستخدم من الملف
```

### الحل الثالث: إنشاء Cloud Function
```javascript
const admin = require('firebase-admin');

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // التحقق من الصلاحيات
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Must be admin');
  }

  try {
    await admin.auth().deleteUser(data.uid);
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

## التحسينات المضافة للنظام

### 1. التحقق المسبق من وجود المستخدم
- يتم التحقق من وجود البريد الإلكتروني في Firebase Auth قبل إنشاء المستخدم
- رسالة خطأ واضحة تشرح المشكلة

### 2. تحسين رسائل الخطأ
- رسائل مفصلة تشرح سبب الخطأ
- إرشادات لحل المشكلة
- مدة أطول لعرض الرسائل

### 3. حذف شامل من Firestore
- حذف بيانات المستخدم من مجموعة `users`
- حذف بيانات المشرف من مجموعة `supervisors` (إذا كان مشرفاً)
- حذف الرقم الوظيفي من مجموعة `employeeIds`

## التوصيات

1. **للمطورين**: استخدم Firebase Admin SDK لحذف شامل من Auth و Firestore
2. **للمديرين**: استخدم Firebase Console لحذف المستخدمين من Auth
3. **للنظام**: تم إضافة تحقق مسبق لمنع الأخطاء

## ملاحظات مهمة

- حذف المستخدم من Firestore فقط لا يكفي
- البريد الإلكتروني يبقى محجوزاً في Firebase Auth
- يجب حذف المستخدم من كلا النظامين لإعادة استخدام البريد الإلكتروني

