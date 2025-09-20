import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

async function cleanupUsers() {
  try {
    console.log('🔥 بدء عملية تنظيف المستخدمين...');
    
    // جلب جميع المستخدمين
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let deletedCount = 0;
    let systemAdminCount = 0;
    let usersToDelete = [];
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      // التحقق من أن المستخدم ليس مدير نظام
      if (userData.role === 'system-admin') {
        console.log(`✅ الاحتفاظ بمدير النظام: ${userData.displayName || userData.email}`);
        systemAdminCount++;
        continue;
      }
      
      usersToDelete.push({
        id: userDoc.id,
        name: userData.displayName || userData.email,
        role: userData.role || 'لا يوجد دور'
      });
    }
    
    console.log(`📋 سيتم حذف ${usersToDelete.length} مستخدم:`);
    
    // حذف المستخدمين
    for (const user of usersToDelete) {
      try {
        await deleteDoc(doc(db, 'users', user.id));
        console.log(`🗑️ تم حذف المستخدم: ${user.name} (${user.role})`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ فشل في حذف المستخدم ${user.name}:`, error);
      }
    }
    
    console.log('\n📊 ملخص العملية:');
    console.log(`✅ تم الاحتفاظ بـ ${systemAdminCount} مدير نظام`);
    console.log(`🗑️ تم حذف ${deletedCount} مستخدم`);
    console.log('✨ تم تنظيف قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف المستخدمين:', error);
  }
}

export default cleanupUsers;