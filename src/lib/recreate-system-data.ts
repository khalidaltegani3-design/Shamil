import { auth, db } from '@/lib/firebase';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { generateEmployeeId } from '@/lib/employee-utils';

/**
 * إعادة إنشاء بيانات مدير النظام والمستخدمين التجريبيين
 */
export async function recreateSystemData() {
  try {
    console.log('🔄 بدء إعادة إنشاء بيانات النظام...');
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error('لا يوجد مستخدم مسجل دخول');
    }

    const batch = writeBatch(db);

    // 1. إنشاء وثيقة مدير النظام
    console.log('1️⃣ إنشاء وثيقة مدير النظام...');
    const adminDocRef = doc(db, 'users', user.uid);
    batch.set(adminDocRef, {
      email: user.email,
      displayName: user.displayName || 'مدير النظام',
      role: 'system_admin',
      isSystemAdmin: true,
      employeeId: 'EMP000000001',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    });

    // 2. إنشاء بعض المستخدمين التجريبيين
    console.log('2️⃣ إنشاء مستخدمين تجريبيين...');
    
    const testUsers = [
      {
        uid: 'test-employee-1',
        email: 'employee1@test.com',
        displayName: 'موظف تجريبي 1',
        role: 'employee',
        homeDepartmentId: 'maintenance'
      },
      {
        uid: 'test-employee-2', 
        email: 'employee2@test.com',
        displayName: 'موظف تجريبي 2',
        role: 'employee',
        homeDepartmentId: 'security'
      },
      {
        uid: 'test-supervisor-1',
        email: 'supervisor1@test.com', 
        displayName: 'مشرف تجريبي 1',
        role: 'supervisor',
        homeDepartmentId: 'cleaning'
      }
    ];

    testUsers.forEach((userData, index) => {
      const userRef = doc(db, 'users', userData.uid);
      batch.set(userRef, {
        ...userData,
        employeeId: generateEmployeeId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      });
    });

    // 3. تنفيذ العمليات
    console.log('3️⃣ حفظ البيانات...');
    await batch.commit();

    console.log('✅ تم إنشاء بيانات النظام بنجاح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في إعادة إنشاء بيانات النظام:', error);
    throw error;
  }
}

/**
 * إنشاء مستخدم جديد
 */
export async function createTestUser(userData: {
  email: string;
  displayName: string;
  role: 'employee' | 'supervisor' | 'admin';
  homeDepartmentId?: string;
}) {
  try {
    console.log('🔄 إنشاء مستخدم جديد:', userData.displayName);
    
    const uid = `test-${Date.now()}`;
    const userRef = doc(db, 'users', uid);
    
    await setDoc(userRef, {
      uid,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      homeDepartmentId: userData.homeDepartmentId,
      employeeId: generateEmployeeId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    });

    console.log('✅ تم إنشاء المستخدم بنجاح');
    return uid;

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error);
    throw error;
  }
}