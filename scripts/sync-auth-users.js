/**
 * سكريبت لمزامنة مستخدمي Firebase Auth إلى Firestore
 * 
 * الاستخدام:
 * 1. تأكد من تثبيت firebase-admin: npm install firebase-admin
 * 2. ضع ملف serviceAccountKey.json في مجلد المشروع
 * 3. نفذ السكريبت: node scripts/sync-auth-users.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function syncAuthUsersToFirestore() {
  try {
    console.log('🔄 بدء مزامنة المستخدمين من Auth إلى Firestore...\n');
    
    let synced = 0;
    let skipped = 0;
    let errors = 0;
    
    // جلب جميع المستخدمين من Auth
    const listUsersResult = await auth.listUsers();
    const authUsers = listUsersResult.users;
    
    console.log(`📊 إجمالي المستخدمين في Auth: ${authUsers.length}\n`);
    
    for (const authUser of authUsers) {
      try {
        const userDocRef = db.collection('users').doc(authUser.uid);
        const userDoc = await userDocRef.get();
        
        if (userDoc.exists) {
          console.log(`⏭️  المستخدم ${authUser.email} موجود بالفعل - تخطي`);
          skipped++;
          continue;
        }
        
        // إنشاء مستند جديد
        const userData = {
          uid: authUser.uid,
          email: authUser.email || '',
          displayName: authUser.displayName || authUser.email?.split('@')[0] || 'مستخدم',
          name: authUser.displayName || authUser.email?.split('@')[0] || 'مستخدم',
          role: 'employee',
          status: 'active',
          createdAt: admin.firestore.Timestamp.fromDate(new Date(authUser.metadata.creationTime)),
          emailVerified: authUser.emailVerified,
          isActive: true,
          homeDepartmentId: '',
          employeeId: '',
          syncedFromAuth: true,
          syncedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await userDocRef.set(userData);
        console.log(`✅ تم مزامنة المستخدم: ${authUser.email}`);
        synced++;
        
      } catch (error) {
        console.error(`❌ خطأ في مزامنة ${authUser.email}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 نتائج المزامنة:');
    console.log(`   ✅ تم المزامنة: ${synced}`);
    console.log(`   ⏭️  تم التخطي: ${skipped}`);
    console.log(`   ❌ أخطاء: ${errors}`);
    console.log(`   📝 المجموع: ${authUsers.length}`);
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل السكريبت
syncAuthUsersToFirestore();



