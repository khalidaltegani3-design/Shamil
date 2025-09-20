import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// قراءة متغيرات البيئة
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// تكوين Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupUsers() {
  try {
    console.log('🔥 بدء عملية تنظيف المستخدمين...');
    
    // جلب جميع المستخدمين
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let deletedCount = 0;
    let systemAdminCount = 0;
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      // التحقق من أن المستخدم ليس مدير نظام
      if (userData.role === 'system-admin') {
        console.log(`✅ الاحتفاظ بمدير النظام: ${userData.displayName || userData.email}`);
        systemAdminCount++;
        continue;
      }
      
      // حذف المستخدم
      await deleteDoc(doc(db, 'users', userDoc.id));
      console.log(`🗑️ تم حذف المستخدم: ${userData.displayName || userData.email} (${userData.role || 'لا يوجد دور'})`);
      deletedCount++;
    }
    
    console.log('\n📊 ملخص العملية:');
    console.log(`✅ تم الاحتفاظ بـ ${systemAdminCount} مدير نظام`);
    console.log(`🗑️ تم حذف ${deletedCount} مستخدم`);
    console.log('✨ تم تنظيف قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف المستخدمين:', error);
  }
}

// تشغيل السكريبت
cleanupUsers().then(() => {
  console.log('🎉 انتهت عملية التنظيف');
  process.exit(0);
}).catch((error) => {
  console.error('💥 فشل في تنظيف المستخدمين:', error);
  process.exit(1);
});