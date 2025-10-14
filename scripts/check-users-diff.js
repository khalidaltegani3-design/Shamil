/**
 * سكريبت للتحقق من الفرق بين Auth و Firestore
 * هذا السكريبت يعرض فقط المستخدمين المفقودين بدون إجراء أي تغييرات
 */

const admin = require('firebase-admin');

// تحقق من وجود ملف المفاتيح
try {
  const serviceAccount = require('../serviceAccountKey.json');
  
  // تهيئة Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  const db = admin.firestore();
  const auth = admin.auth();
  
  async function checkUsersDifference() {
    try {
      console.log('🔍 التحقق من الفرق بين Auth و Firestore...\n');
      
      // جلب المستخدمين من Auth
      const listUsersResult = await auth.listUsers();
      const authUsers = listUsersResult.users;
      console.log(`📊 إجمالي المستخدمين في Auth: ${authUsers.length}`);
      
      // جلب المستخدمين من Firestore
      const usersSnapshot = await db.collection('users').get();
      const firestoreUserIds = new Set(usersSnapshot.docs.map(doc => doc.id));
      console.log(`📊 إجمالي المستخدمين في Firestore: ${firestoreUserIds.size}\n`);
      
      // البحث عن المستخدمين المفقودين
      const missingUsers = authUsers.filter(user => !firestoreUserIds.has(user.uid));
      
      if (missingUsers.length === 0) {
        console.log('✅ جميع المستخدمين موجودون في Firestore!');
      } else {
        console.log(`⚠️  وُجد ${missingUsers.length} مستخدم في Auth لكن ليس في Firestore:\n`);
        missingUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email || 'بدون بريد'}`);
          console.log(`   UID: ${user.uid}`);
          console.log(`   الاسم: ${user.displayName || 'غير محدد'}`);
          console.log(`   تاريخ التسجيل: ${user.metadata.creationTime}`);
          console.log('');
        });
        
        console.log(`\n💡 لمزامنة هؤلاء المستخدمين، شغّل: node scripts/sync-auth-users.js`);
      }
      
    } catch (error) {
      console.error('❌ خطأ:', error.message);
    } finally {
      process.exit(0);
    }
  }
  
  checkUsersDifference();
  
} catch (error) {
  console.error('\n❌ خطأ: لم يتم العثور على ملف serviceAccountKey.json');
  console.log('\n📝 للحصول على المفتاح:');
  console.log('1. افتح https://console.firebase.google.com');
  console.log('2. اختر مشروع zoliapp-lite');
  console.log('3. اذهب إلى Project Settings > Service Accounts');
  console.log('4. اضغط "Generate New Private Key"');
  console.log('5. احفظ الملف باسم serviceAccountKey.json في المجلد الرئيسي\n');
  process.exit(1);
}



