/**
 * سكريبت إعداد مدير النظام للبيئة الإنتاجية
 * يضمن وجود مدير النظام بالصلاحيات الصحيحة
 */

import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { SYSTEM_ADMIN_EMAIL } from '@/lib/auth-config';

const ADMIN_CONFIG = {
  email: SYSTEM_ADMIN_EMAIL,
  password: 'Admin123!', // يجب تغيير كلمة المرور في البيئة الإنتاجية
  displayName: 'خالد التقاني - مدير النظام',
  role: 'system_admin',
  isSystemAdmin: true,
  department: 'IT'
};

async function setupSystemAdmin() {
  try {
    console.log('🚀 بدء إعداد مدير النظام...');

    // محاولة تسجيل الدخول
    try {
      const userCredential = await signInWithEmailAndPassword(auth, ADMIN_CONFIG.email, ADMIN_CONFIG.password);
      console.log('✅ تم تسجيل الدخول لمدير النظام:', userCredential.user.uid);

      // التحقق من وجود بيانات المستخدم في قاعدة البيانات
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        console.log('📝 إنشاء بيانات مدير النظام في قاعدة البيانات...');
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: ADMIN_CONFIG.email,
          displayName: ADMIN_CONFIG.displayName,
          role: ADMIN_CONFIG.role,
          isSystemAdmin: ADMIN_CONFIG.isSystemAdmin,
          homeDepartmentId: ADMIN_CONFIG.department,
          status: 'active',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          updatedAt: new Date()
        });

        console.log('✅ تم إنشاء بيانات مدير النظام بنجاح');
      } else {
        console.log('✅ بيانات مدير النظام موجودة بالفعل');
        
        // تحديث البيانات للتأكد من الصلاحيات
        const currentData = userDoc.data();
        if (currentData.role !== 'system_admin' || !currentData.isSystemAdmin) {
          console.log('🔧 تحديث صلاحيات مدير النظام...');
          
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            ...currentData,
            role: ADMIN_CONFIG.role,
            isSystemAdmin: ADMIN_CONFIG.isSystemAdmin,
            updatedAt: new Date()
          }, { merge: true });

          console.log('✅ تم تحديث صلاحيات مدير النظام');
        }
      }

      console.log('🎉 إعداد مدير النظام مكتمل بنجاح!');
      
      return {
        success: true,
        message: 'تم إعداد مدير النظام بنجاح',
        uid: userCredential.user.uid
      };

    } catch (authError: any) {
      console.error('❌ خطأ في المصادقة:', authError.message);
      
      if (authError.code === 'auth/user-not-found') {
        console.log('ℹ️ المستخدم غير موجود. يرجى إنشاء الحساب أولاً من خلال واجهة التسجيل.');
      } else if (authError.code === 'auth/wrong-password') {
        console.log('ℹ️ كلمة المرور غير صحيحة. يرجى التحقق من كلمة المرور.');
      }
      
      return {
        success: false,
        message: `خطأ في المصادقة: ${authError.message}`,
        code: authError.code
      };
    }

  } catch (error: any) {
    console.error('💥 خطأ عام في إعداد مدير النظام:', error);
    return {
      success: false,
      message: `خطأ عام: ${error.message}`
    };
  }
}

// تصدير الدالة للاستخدام في الصفحات أو API routes
export { setupSystemAdmin, ADMIN_CONFIG };

// تشغيل الإعداد إذا تم استدعاء الملف مباشرة
if (typeof window === 'undefined') {
  // في بيئة Node.js (server-side)
  console.log('📋 إعداد مدير النظام جاهز للتشغيل');
}