import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * تحديث Claims في Firebase Auth بناءً على دور المستخدم في قاعدة البيانات
 */
export async function updateUserAuthClaims(uid: string) {
  try {
    console.log('🔄 محاولة تحديث Auth Claims للمستخدم:', uid);
    
    // جلب دور المستخدم من قاعدة البيانات
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      console.log('❌ لم يتم العثور على المستخدم في قاعدة البيانات');
      return false;
    }
    
    const userData = userDoc.data();
    const userRole = userData.role || 'employee';
    
    console.log('👤 دور المستخدم الحالي:', userRole);
    
    // ملاحظة: هذه الدالة تحتاج إلى Cloud Function لتعمل بشكل صحيح
    // لأن تحديث Custom Claims يتطلب Admin SDK
    
    // في الوقت الحالي، نحن نعتمد على Firestore Rules فقط
    console.log('ℹ️ تحديث Claims يتطلب Cloud Function');
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في تحديث Auth Claims:', error);
    return false;
  }
}

/**
 * فرض تحديث token للمستخدم الحالي
 */
export async function refreshUserToken() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ لا يوجد مستخدم مسجل دخول');
      return false;
    }
    
    console.log('🔄 تحديث token المستخدم...');
    await user.getIdToken(true); // فرض تحديث
    
    console.log('✅ تم تحديث token بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في تحديث token:', error);
    return false;
  }
}

/**
 * التحقق من صلاحيات المستخدم الحالي
 */
export async function checkCurrentUserPermissions() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ لا يوجد مستخدم مسجل دخول');
      return null;
    }
    
    console.log('🔍 فحص صلاحيات المستخدم...');
    
    // جلب token مع claims
    const tokenResult = await user.getIdTokenResult();
    console.log('🎫 Token Claims:', tokenResult.claims);
    
    // جلب دور المستخدم من قاعدة البيانات
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('📄 بيانات المستخدم من قاعدة البيانات:', {
        role: userData.role,
        isSystemAdmin: userData.isSystemAdmin
      });
      
      return {
        email: user.email,
        tokenClaims: tokenResult.claims,
        databaseRole: userData.role,
        isSystemAdmin: userData.isSystemAdmin || user.email === 'sweetdream711711@gmail.com'
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ خطأ في فحص الصلاحيات:', error);
    return null;
  }
}