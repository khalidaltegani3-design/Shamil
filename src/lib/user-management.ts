import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { allDepartments } from '@/lib/departments';
import { isValidSystemAdmin } from '@/lib/auth-config';

export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  role: 'employee' | 'supervisor' | 'admin' | 'system_admin';
  homeDepartmentId?: string;
  status: 'active' | 'inactive';
  createdAt: any;
  lastLoginAt?: any;
  isSystemAdmin?: boolean;
}

export interface UserStats {
  totalUsers: number;
  employees: number;
  supervisors: number;
  admins: number;
  activeUsers: number;
  inactiveUsers: number;
}

/**
 * خدمة ترقية المستخدم إلى مشرف
 */
export const promoteUserToSupervisor = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    role: 'supervisor',
    updatedAt: new Date()
  });
};

/**
 * خدمة تنزيل المشرف إلى موظف مع إزالة جميع صلاحيات الإشراف
 */
export const demoteSupervisorToEmployee = async (userId: string): Promise<void> => {
  // تحديث دور المستخدم
  await updateDoc(doc(db, 'users', userId), {
    role: 'employee',
    updatedAt: new Date()
  });

  // إزالة جميع صلاحيات الإشراف
  for (const dept of allDepartments) {
    try {
      const supervisorRef = doc(db, 'departments', dept.id, 'supervisors', userId);
      await deleteDoc(supervisorRef);
    } catch (error) {
      // تجاهل الأخطاء إذا لم تكن الوثيقة موجودة
      console.log(`Supervisor permission not found for ${dept.id}:`, error);
    }
  }
};

/**
 * خدمة ترقية المستخدم إلى مدير عام
 */
export const promoteUserToAdmin = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    role: 'admin',
    updatedAt: new Date()
  });
};

/**
 * خدمة تنزيل المدير العام إلى موظف
 */
export const demoteAdminToEmployee = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    role: 'employee',
    updatedAt: new Date()
  });
};

/**
 * خدمة تغيير حالة المستخدم (تفعيل/إلغاء تفعيل)
 */
export const toggleUserStatus = async (userId: string, currentStatus: string): Promise<string> => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  
  await updateDoc(doc(db, 'users', userId), {
    status: newStatus,
    updatedAt: new Date()
  });

  return newStatus;
};

/**
 * خدمة تحديث قسم المستخدم
 */
export const updateUserDepartment = async (userId: string, departmentId: string): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    homeDepartmentId: departmentId,
    updatedAt: new Date()
  });
};

/**
 * خدمة إدارة صلاحيات الإشراف
 */
export const manageSupervisorPermission = async (
  userId: string, 
  departmentId: string, 
  hasPermission: boolean
): Promise<void> => {
  const supervisorRef = doc(db, 'departments', departmentId, 'supervisors', userId);
  
  if (hasPermission) {
    await setDoc(supervisorRef, {
      assignedAt: new Date(),
      assignedBy: 'system_admin'
    });
  } else {
    await deleteDoc(supervisorRef);
  }
};

/**
 * خدمة جلب صلاحيات الإشراف للمستخدم
 */
export const getUserSupervisorDepartments = async (userId: string): Promise<string[]> => {
  const supervisedDepts: string[] = [];
  
  for (const dept of allDepartments) {
    try {
      const supervisorDocs = await getDocs(
        collection(db, 'departments', dept.id, 'supervisors')
      );
      
      supervisorDocs.forEach(doc => {
        if (doc.id === userId) {
          supervisedDepts.push(dept.id);
        }
      });
    } catch (error) {
      console.error(`Error checking supervisor permissions for ${dept.id}:`, error);
    }
  }
  
  return supervisedDepts;
};

/**
 * خدمة حساب إحصائيات المستخدمين
 */
export const calculateUserStats = (users: UserData[]): UserStats => {
  return {
    totalUsers: users.length,
    employees: users.filter(user => user.role === 'employee').length,
    supervisors: users.filter(user => user.role === 'supervisor').length,
    admins: users.filter(user => user.role === 'admin' || user.role === 'system_admin').length,
    activeUsers: users.filter(user => user.status === 'active').length,
    inactiveUsers: users.filter(user => user.status === 'inactive').length,
  };
};

/**
 * خدمة تصفية المستخدمين
 */
export const filterUsers = (
  users: UserData[],
  searchTerm: string,
  roleFilter: string,
  departmentFilter: string
): UserData[] => {
  let filtered = users;

  // تصفية حسب النص المدخل
  if (searchTerm) {
    filtered = filtered.filter(user => 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // تصفية حسب الدور
  if (roleFilter !== 'all') {
    filtered = filtered.filter(user => user.role === roleFilter);
  }

  // تصفية حسب القسم
  if (departmentFilter !== 'all') {
    filtered = filtered.filter(user => user.homeDepartmentId === departmentFilter);
  }

  return filtered;
};

/**
 * خدمة التحقق من كون المستخدم مدير نظام
 */
export const isSystemAdmin = (email: string): boolean => {
  return isValidSystemAdmin(email);
};

/**
 * خدمة الحصول على اسم الدور للعرض
 */
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin': return 'مدير عام';
    case 'supervisor': return 'مشرف';
    case 'employee': return 'موظف';
    case 'system_admin': return 'مدير النظام';
    default: return role;
  }
};

/**
 * خدمة الحصول على نوع الشارة للدور
 */
export const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin': 
    case 'system_admin': 
      return 'destructive' as const;
    case 'supervisor': 
      return 'default' as const;
    case 'employee': 
      return 'secondary' as const;
    default: 
      return 'outline' as const;
  }
};