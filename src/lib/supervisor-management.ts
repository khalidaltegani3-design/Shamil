import { db, auth } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

export interface SupervisorData {
  id: string;
  email: string;
  displayName: string;
  role: 'supervisor' | 'employee';
  homeDepartmentId?: string;
  assignedDepartments: string[];
  isActive: boolean;
  assignedAt?: Date;
  assignedBy?: string;
}

/**
 * إضافة مشرف جديد إلى النظام
 * @param userId معرف المستخدم
 * @param departmentIds مصفوفة معرفات الأقسام التي سيشرف عليها
 * @param assignedBy معرف مدير النظام الذي قام بالإضافة
 * @returns Promise<boolean> نجاح العملية
 */
export async function addSupervisor(
  userId: string, 
  departmentIds: string[], 
  assignedBy: string = 'system_admin'
): Promise<boolean> {
  try {
    console.log('🔄 بدء إضافة مشرف جديد:', userId);
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('❌ المستخدم غير موجود:', userId);
      return false;
    }

    const userData = userDoc.data();
    console.log('📋 بيانات المستخدم:', userData);

    // تحديث دور المستخدم إلى مشرف
    await updateDoc(userRef, {
      role: 'supervisor',
      homeDepartmentId: departmentIds[0] || 'general-monitoring',
      updatedAt: new Date(),
      updatedBy: assignedBy
    });

    console.log('✅ تم تحديث دور المستخدم إلى مشرف');

    // إضافة المستخدم كمشرف في كل قسم محدد
    for (const deptId of departmentIds) {
      const supervisorRef = doc(db, 'departments', deptId, 'supervisors', userId);
      await setDoc(supervisorRef, {
        assignedAt: new Date(),
        assignedBy: assignedBy,
        active: true,
        permissions: ['read', 'write', 'manage_reports']
      });
      
      console.log(`✅ تم إضافة صلاحيات الإشراف على قسم: ${deptId}`);
    }

    // إنشاء سجل في مجموعة المشرفين العامة
    const supervisorsRef = doc(db, 'supervisors', userId);
    await setDoc(supervisorsRef, {
      userId: userId,
      email: userData.email,
      displayName: userData.displayName,
      assignedDepartments: departmentIds,
      homeDepartmentId: departmentIds[0] || 'general-monitoring',
      isActive: true,
      assignedAt: new Date(),
      assignedBy: assignedBy,
      lastUpdated: new Date()
    });

    console.log('✅ تم إنشاء سجل في مجموعة المشرفين');
    return true;

  } catch (error) {
    console.error('❌ خطأ في إضافة المشرف:', error);
    return false;
  }
}

/**
 * إزالة مشرف وإعادته إلى موظف عادي
 * @param userId معرف المستخدم
 * @param removedBy معرف مدير النظام الذي قام بالإزالة
 * @returns Promise<boolean> نجاح العملية
 */
export async function removeSupervisor(
  userId: string, 
  removedBy: string = 'system_admin'
): Promise<boolean> {
  try {
    console.log('🔄 بدء إزالة المشرف:', userId);

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('❌ المستخدم غير موجود:', userId);
      return false;
    }

    // تحديث دور المستخدم إلى موظف
    await updateDoc(userRef, {
      role: 'employee',
      homeDepartmentId: 'general-monitoring',
      updatedAt: new Date(),
      updatedBy: removedBy
    });

    console.log('✅ تم تحديث دور المستخدم إلى موظف');

    // إزالة صلاحيات الإشراف من جميع الأقسام
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));
    
    for (const deptDoc of departmentsSnapshot.docs) {
      const supervisorRef = doc(db, 'departments', deptDoc.id, 'supervisors', userId);
      const supervisorDoc = await getDoc(supervisorRef);
      
      if (supervisorDoc.exists()) {
        await deleteDoc(supervisorRef);
        console.log(`✅ تم إزالة صلاحيات الإشراف من قسم: ${deptDoc.id}`);
      }
    }

    // حذف أو تعطيل السجل من مجموعة المشرفين
    const supervisorsRef = doc(db, 'supervisors', userId);
    const supervisorDoc = await getDoc(supervisorsRef);
    
    if (supervisorDoc.exists()) {
      await updateDoc(supervisorsRef, {
        isActive: false,
        removedAt: new Date(),
        removedBy: removedBy,
        lastUpdated: new Date()
      });
      console.log('✅ تم تعطيل السجل في مجموعة المشرفين');
    }

    return true;

  } catch (error) {
    console.error('❌ خطأ في إزالة المشرف:', error);
    return false;
  }
}

/**
 * تحديث أقسام المشرف
 * @param userId معرف المستخدم
 * @param newDepartmentIds مصفوفة جديدة لمعرفات الأقسام
 * @param updatedBy معرف مدير النظام الذي قام بالتحديث
 * @returns Promise<boolean> نجاح العملية
 */
export async function updateSupervisorDepartments(
  userId: string, 
  newDepartmentIds: string[], 
  updatedBy: string = 'system_admin'
): Promise<boolean> {
  try {
    console.log('🔄 بدء تحديث أقسام المشرف:', userId);

    // 1. إزالة صلاحيات الإشراف الحالية
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));
    
    for (const deptDoc of departmentsSnapshot.docs) {
      const supervisorRef = doc(db, 'departments', deptDoc.id, 'supervisors', userId);
      const supervisorDoc = await getDoc(supervisorRef);
      
      if (supervisorDoc.exists()) {
        await deleteDoc(supervisorRef);
      }
    }

    // 2. إضافة صلاحيات الإشراف الجديدة
    for (const deptId of newDepartmentIds) {
      const supervisorRef = doc(db, 'departments', deptId, 'supervisors', userId);
      await setDoc(supervisorRef, {
        assignedAt: new Date(),
        assignedBy: updatedBy,
        active: true,
        permissions: ['read', 'write', 'manage_reports']
      });
    }

    // 3. تحديث القسم الأساسي للمستخدم
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      homeDepartmentId: newDepartmentIds[0] || 'general-monitoring',
      updatedAt: new Date(),
      updatedBy: updatedBy
    });

    // 4. تحديث سجل المشرف
    const supervisorsRef = doc(db, 'supervisors', userId);
    await updateDoc(supervisorsRef, {
      assignedDepartments: newDepartmentIds,
      homeDepartmentId: newDepartmentIds[0] || 'general-monitoring',
      lastUpdated: new Date(),
      updatedBy: updatedBy
    });

    console.log('✅ تم تحديث أقسام المشرف بنجاح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في تحديث أقسام المشرف:', error);
    return false;
  }
}

/**
 * جلب بيانات المشرف
 * @param userId معرف المستخدم
 * @returns Promise<SupervisorData | null> بيانات المشرف
 */
export async function getSupervisorData(userId: string): Promise<SupervisorData | null> {
  try {
    console.log('getSupervisorData: Fetching supervisor data for:', userId);
    
    const supervisorsRef = doc(db, 'supervisors', userId);
    const supervisorDoc = await getDoc(supervisorsRef);
    
    if (!supervisorDoc.exists()) {
      console.log('getSupervisorData: No supervisor document found for:', userId);
      return null;
    }
    
    const data = supervisorDoc.data();
    if (!data.isActive) {
      console.log('getSupervisorData: Supervisor is inactive:', userId);
      return null;
    }

    return {
      id: userId,
      ...data
    } as SupervisorData;

  } catch (error) {
    console.error('❌ خطأ في جلب بيانات المشرف:', error);
    return null;
  }
}

/**
 * جلب قائمة جميع المشرفين النشطين
 * @returns Promise<SupervisorData[]> قائمة المشرفين
 */
export async function getAllActiveSupervisors(): Promise<SupervisorData[]> {
  try {
    const supervisorsQuery = query(
      collection(db, 'supervisors'),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(supervisorsQuery);
    const supervisors: SupervisorData[] = [];

    querySnapshot.forEach((doc) => {
      supervisors.push({
        id: doc.id,
        ...doc.data()
      } as SupervisorData);
    });

    return supervisors;

  } catch (error) {
    console.error('❌ خطأ في جلب قائمة المشرفين:', error);
    return [];
  }
}

/**
 * البحث عن المستخدمين الذين يمكن ترقيتهم إلى مشرفين
 * @returns Promise<any[]> قائمة الموظفين المؤهلين
 */
export async function getEligibleEmployees(): Promise<any[]> {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'employee')
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const employees: any[] = [];

    querySnapshot.forEach((doc) => {
      employees.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return employees;

  } catch (error) {
    console.error('❌ خطأ في جلب قائمة الموظفين:', error);
    return [];
  }
}