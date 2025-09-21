/**
 * نظام إدارة الأدوار الديناميكي
 * يتيح رفع وتنزيل المستخدمين بين الأدوار بشكل فوري
 */

import { db } from '@/lib/firebase';
import { doc, updateDoc, setDoc, deleteDoc, getDoc, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';

export interface UserRole {
  uid: string;
  email: string;
  displayName?: string;
  role: 'employee' | 'supervisor' | 'admin' | 'system_admin';
  homeDepartmentId?: string;
  assignedDepartments?: string[];
  isActive: boolean;
}

/**
 * رفع مستخدم من موظف إلى مشرف
 * @param userId معرف المستخدم
 * @param assignedDepartments الأقسام التي سيشرف عليها
 * @param promotedBy معرف من قام بالترقية
 */
export async function promoteToSupervisor(
  userId: string, 
  assignedDepartments: string[] = ['general-monitoring'],
  promotedBy: string = 'system_admin'
): Promise<boolean> {
  try {
    console.log('🔼 ترقية إلى مشرف:', userId, 'الأقسام:', assignedDepartments);

    const batch = writeBatch(db);
    
    // 1. تحديث دور المستخدم في مجموعة users
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      role: 'supervisor',
      homeDepartmentId: assignedDepartments[0] || 'general-monitoring',
      updatedAt: serverTimestamp(),
      updatedBy: promotedBy
    });

    // 2. إنشاء/تحديث سجل في مجموعة supervisors
    const supervisorRef = doc(db, 'supervisors', userId);
    batch.set(supervisorRef, {
      userId: userId,
      assignedDepartments: assignedDepartments,
      homeDepartmentId: assignedDepartments[0] || 'general-monitoring',
      isActive: true,
      promotedAt: serverTimestamp(),
      promotedBy: promotedBy,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // 3. إضافة صلاحيات في أقسام محددة
    for (const deptId of assignedDepartments) {
      const deptSupervisorRef = doc(db, 'departments', deptId, 'supervisors', userId);
      batch.set(deptSupervisorRef, {
        assignedAt: serverTimestamp(),
        assignedBy: promotedBy,
        active: true,
        permissions: ['read', 'write', 'manage_reports']
      });
    }

    await batch.commit();
    console.log('✅ تم ترقية المستخدم إلى مشرف بنجاح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في ترقية المستخدم إلى مشرف:', error);
    return false;
  }
}

/**
 * رفع مستخدم من مشرف إلى مدير
 * @param userId معرف المستخدم
 * @param promotedBy معرف من قام بالترقية
 */
export async function promoteToAdmin(
  userId: string,
  promotedBy: string = 'system_admin'
): Promise<boolean> {
  try {
    console.log('🔼 ترقية إلى مدير:', userId);

    const batch = writeBatch(db);
    
    // 1. تحديث دور المستخدم
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      role: 'admin',
      updatedAt: serverTimestamp(),
      updatedBy: promotedBy
    });

    // 2. الاحتفاظ بسجل الإشراف (تعطيله)
    const supervisorRef = doc(db, 'supervisors', userId);
    const supervisorDoc = await getDoc(supervisorRef);
    if (supervisorDoc.exists()) {
      batch.update(supervisorRef, {
        isActive: false,
        deactivatedAt: serverTimestamp(),
        deactivatedBy: promotedBy,
        reason: 'promoted_to_admin'
      });
    }

    await batch.commit();
    console.log('✅ تم ترقية المستخدم إلى مدير بنجاح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في ترقية المستخدم إلى مدير:', error);
    return false;
  }
}

/**
 * تنزيل مستخدم من مشرف إلى موظف
 * @param userId معرف المستخدم
 * @param demotedBy معرف من قام بالتنزيل
 */
export async function demoteToEmployee(
  userId: string,
  demotedBy: string = 'system_admin'
): Promise<boolean> {
  try {
    console.log('🔽 تنزيل إلى موظف:', userId);

    const batch = writeBatch(db);
    
    // 1. تحديث دور المستخدم
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      role: 'employee',
      homeDepartmentId: 'general-monitoring',
      updatedAt: serverTimestamp(),
      updatedBy: demotedBy
    });

    // 2. تعطيل سجل الإشراف
    const supervisorRef = doc(db, 'supervisors', userId);
    const supervisorDoc = await getDoc(supervisorRef);
    if (supervisorDoc.exists()) {
      batch.update(supervisorRef, {
        isActive: false,
        demotedAt: serverTimestamp(),
        demotedBy: demotedBy,
        lastUpdated: serverTimestamp()
      });
    }

    // 3. إزالة صلاحيات الإشراف من جميع الأقسام
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));
    for (const deptDoc of departmentsSnapshot.docs) {
      const deptSupervisorRef = doc(db, 'departments', deptDoc.id, 'supervisors', userId);
      const deptSupervisorDoc = await getDoc(deptSupervisorRef);
      if (deptSupervisorDoc.exists()) {
        batch.delete(deptSupervisorRef);
      }
    }

    await batch.commit();
    console.log('✅ تم تنزيل المستخدم إلى موظف بنجاح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في تنزيل المستخدم إلى موظف:', error);
    return false;
  }
}

/**
 * تنزيل مستخدم من مدير إلى مشرف
 * @param userId معرف المستخدم
 * @param assignedDepartments الأقسام التي سيشرف عليها
 * @param demotedBy معرف من قام بالتنزيل
 */
export async function demoteToSupervisor(
  userId: string,
  assignedDepartments: string[] = ['general-monitoring'],
  demotedBy: string = 'system_admin'
): Promise<boolean> {
  try {
    console.log('🔽 تنزيل إلى مشرف:', userId);

    const batch = writeBatch(db);
    
    // 1. تحديث دور المستخدم
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      role: 'supervisor',
      homeDepartmentId: assignedDepartments[0] || 'general-monitoring',
      updatedAt: serverTimestamp(),
      updatedBy: demotedBy
    });

    // 2. إعادة تفعيل أو إنشاء سجل الإشراف
    const supervisorRef = doc(db, 'supervisors', userId);
    batch.set(supervisorRef, {
      userId: userId,
      assignedDepartments: assignedDepartments,
      homeDepartmentId: assignedDepartments[0] || 'general-monitoring',
      isActive: true,
      demotedFromAdminAt: serverTimestamp(),
      demotedBy: demotedBy,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // 3. إضافة صلاحيات في أقسام محددة
    for (const deptId of assignedDepartments) {
      const deptSupervisorRef = doc(db, 'departments', deptId, 'supervisors', userId);
      batch.set(deptSupervisorRef, {
        assignedAt: serverTimestamp(),
        assignedBy: demotedBy,
        active: true,
        permissions: ['read', 'write', 'manage_reports']
      });
    }

    await batch.commit();
    console.log('✅ تم تنزيل المستخدم إلى مشرف بنجاح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في تنزيل المستخدم إلى مشرف:', error);
    return false;
  }
}

/**
 * الحصول على دور المستخدم الحالي
 * @param userId معرف المستخدم
 */
export async function getUserCurrentRole(userId: string): Promise<UserRole | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    
    // إذا كان مشرفاً، جلب معلومات الإشراف
    let assignedDepartments: string[] = [];
    if (userData.role === 'supervisor') {
      const supervisorRef = doc(db, 'supervisors', userId);
      const supervisorDoc = await getDoc(supervisorRef);
      if (supervisorDoc.exists()) {
        assignedDepartments = supervisorDoc.data().assignedDepartments || [];
      }
    }

    return {
      uid: userId,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      homeDepartmentId: userData.homeDepartmentId,
      assignedDepartments: assignedDepartments,
      isActive: userData.status === 'active'
    };

  } catch (error) {
    console.error('خطأ في جلب دور المستخدم:', error);
    return null;
  }
}

/**
 * تحديث أقسام المشرف
 * @param userId معرف المستخدم
 * @param newDepartments الأقسام الجديدة
 * @param updatedBy معرف من قام بالتحديث
 */
export async function updateSupervisorDepartments(
  userId: string,
  newDepartments: string[],
  updatedBy: string = 'system_admin'
): Promise<boolean> {
  try {
    console.log('🔄 تحديث أقسام المشرف:', userId, 'الأقسام الجديدة:', newDepartments);

    const batch = writeBatch(db);

    // 1. تحديث القسم الأساسي للمستخدم
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      homeDepartmentId: newDepartments[0] || 'general-monitoring',
      updatedAt: serverTimestamp(),
      updatedBy: updatedBy
    });

    // 2. تحديث سجل المشرف
    const supervisorRef = doc(db, 'supervisors', userId);
    batch.update(supervisorRef, {
      assignedDepartments: newDepartments,
      homeDepartmentId: newDepartments[0] || 'general-monitoring',
      lastUpdated: serverTimestamp(),
      updatedBy: updatedBy
    });

    // 3. إزالة صلاحيات الإشراف القديمة
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));
    for (const deptDoc of departmentsSnapshot.docs) {
      const deptSupervisorRef = doc(db, 'departments', deptDoc.id, 'supervisors', userId);
      const deptSupervisorDoc = await getDoc(deptSupervisorRef);
      if (deptSupervisorDoc.exists()) {
        batch.delete(deptSupervisorRef);
      }
    }

    // 4. إضافة صلاحيات الإشراف الجديدة
    for (const deptId of newDepartments) {
      const deptSupervisorRef = doc(db, 'departments', deptId, 'supervisors', userId);
      batch.set(deptSupervisorRef, {
        assignedAt: serverTimestamp(),
        assignedBy: updatedBy,
        active: true,
        permissions: ['read', 'write', 'manage_reports']
      });
    }

    await batch.commit();
    console.log('✅ تم تحديث أقسام المشرف بنجاح');
    return true;

  } catch (error) {
    console.error('❌ خطأ في تحديث أقسام المشرف:', error);
    return false;
  }
}