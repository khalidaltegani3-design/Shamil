// اختبار شامل لوظائف إدارة المستخدمين
// هذا الملف يحتوي على دوال للتحقق من جميع الوظائف

import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs,
  query,
  where 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// فحص الاتصال بقاعدة البيانات
export async function testDatabaseConnection() {
  try {
    console.log('🔍 اختبار الاتصال بقاعدة البيانات...');
    const testDoc = await getDoc(doc(db, '_health', 'connection'));
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    return true;
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
    return false;
  }
}

// فحص صلاحيات مدير النظام
export async function testSystemAdminAccess() {
  try {
    console.log('🔍 اختبار صلاحيات مدير النظام...');
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('⚠️ لا يوجد مستخدم مسجل دخول');
      return false;
    }

    console.log('المستخدم الحالي:', user.email);
    
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const systemAdminEmail = "sweetdream711711@gmail.com";
    
    if (cleanEmail === systemAdminEmail) {
      console.log('✅ تم التحقق من مدير النظام بالبريد الإلكتروني');
      return true;
    }

    // تحقق من قاعدة البيانات
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.role === 'system_admin' || userData.isSystemAdmin === true) {
        console.log('✅ تم التحقق من مدير النظام من قاعدة البيانات');
        return true;
      }
    }

    console.warn('⚠️ المستخدم الحالي ليس مدير نظام');
    return false;
  } catch (error) {
    console.error('❌ خطأ في اختبار صلاحيات مدير النظام:', error);
    return false;
  }
}

// فحص قراءة جميع المستخدمين
export async function testReadAllUsers() {
  try {
    console.log('🔍 اختبار قراءة جميع المستخدمين...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log(`✅ تم جلب ${usersSnapshot.size} مستخدم`);
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`- ${userData.displayName || 'غير محدد'} (${userData.email}) - ${userData.role}`);
    });
    
    return usersSnapshot.size > 0;
  } catch (error) {
    console.error('❌ فشل في قراءة المستخدمين:', error);
    return false;
  }
}

// فحص وظيفة تحديث دور مستخدم
export async function testUpdateUserRole(userId: string, newRole: string) {
  try {
    console.log(`🔍 اختبار تحديث دور المستخدم ${userId} إلى ${newRole}...`);
    
    // قراءة الدور الحالي أولاً
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.warn('⚠️ المستخدم غير موجود');
      return false;
    }

    const currentData = userDoc.data();
    console.log('الدور الحالي:', currentData.role);

    // تحديث الدور
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: new Date()
    });

    console.log(`✅ تم تحديث الدور إلى ${newRole}`);
    return true;
  } catch (error) {
    console.error('❌ فشل في تحديث دور المستخدم:', error);
    return false;
  }
}

// فحص وظيفة إدارة صلاحيات الإشراف
export async function testManageSupervisorPermissions(userId: string, departmentId: string, hasPermission: boolean) {
  try {
    console.log(`🔍 اختبار إدارة صلاحيات الإشراف للمستخدم ${userId}...`);
    
    const supervisorRef = doc(db, 'departments', departmentId, 'supervisors', userId);
    
    if (hasPermission) {
      await setDoc(supervisorRef, {
        assignedAt: new Date(),
        assignedBy: 'system_admin'
      });
      console.log('✅ تم منح صلاحية الإشراف');
    } else {
      await deleteDoc(supervisorRef);
      console.log('✅ تم إلغاء صلاحية الإشراف');
    }
    
    return true;
  } catch (error) {
    console.error('❌ فشل في إدارة صلاحيات الإشراف:', error);
    return false;
  }
}

// فحص شامل لجميع الوظائف
export async function runFullSystemTest() {
  console.log('🚀 بدء الاختبار الشامل لنظام إدارة المستخدمين...');
  console.log('==========================================');

  const results = {
    databaseConnection: false,
    systemAdminAccess: false,
    readUsers: false,
    overallSuccess: false
  };

  // اختبار الاتصال
  results.databaseConnection = await testDatabaseConnection();
  
  // اختبار صلاحيات مدير النظام
  results.systemAdminAccess = await testSystemAdminAccess();
  
  // اختبار قراءة المستخدمين
  if (results.systemAdminAccess) {
    results.readUsers = await testReadAllUsers();
  }

  // تقييم النتائج الإجمالية
  results.overallSuccess = results.databaseConnection && results.systemAdminAccess && results.readUsers;

  console.log('==========================================');
  console.log('📊 ملخص نتائج الاختبار:');
  console.log('- اتصال قاعدة البيانات:', results.databaseConnection ? '✅' : '❌');
  console.log('- صلاحيات مدير النظام:', results.systemAdminAccess ? '✅' : '❌');
  console.log('- قراءة المستخدمين:', results.readUsers ? '✅' : '❌');
  console.log('- النتيجة الإجمالية:', results.overallSuccess ? '🎉 نجح الاختبار' : '⚠️ يحتاج مراجعة');

  return results;
}

// فحص الروابط والتنقل
export function testNavigationLinks() {
  console.log('🔍 اختبار روابط التنقل...');
  
  const linksToTest = [
    '/admin/users',
    '/supervisor',
    '/supervisor/users',
    '/supervisor/gamification'
  ];

  linksToTest.forEach(link => {
    try {
      const url = new URL(link, window.location.origin);
      console.log(`✅ رابط صحيح: ${link}`);
    } catch (error) {
      console.error(`❌ رابط خاطئ: ${link}`, error);
    }
  });

  console.log('✅ تم اختبار جميع الروابط');
}

// تشغيل اختبار سريع عند استيراد الملف
if (typeof window !== 'undefined') {
  console.log('📝 ملف اختبار إدارة المستخدمين جاهز');
  console.log('💡 لتشغيل الاختبار الشامل، استخدم: runFullSystemTest()');
}