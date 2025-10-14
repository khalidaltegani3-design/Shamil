"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { withSystemAdminAuth } from '@/lib/system-admin-auth';
import { collection, query, getDocs, doc, updateDoc, onSnapshot, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { allDepartments } from '@/lib/departments';
import { ArrowLeft, Crown, User, UserCog, Shield, ShieldCheck, UserPlus, TrendingUp, TrendingDown, Trash2, Search, Filter, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { checkUserSupervisorPermissions } from '@/lib/supervisor-auth';
import { generateEmployeeId, validateEmployeeId, isEmployeeIdUnique } from '@/lib/employee-utils';
import { getSupervisorData, getAllActiveSupervisors } from '@/lib/supervisor-management';
import { promoteToSupervisor, promoteToAdmin, demoteToEmployee, demoteToSupervisor, getUserCurrentRole, updateSupervisorDepartments } from '@/lib/role-management';
import { ExpandableCell } from '@/components/ui/expandable-cell';
import Logo from '@/components/Logo';
import AppHeader from '@/components/AppHeader';

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  employeeId?: string; // الرقم الوظيفي
  role: 'employee' | 'supervisor' | 'admin' | 'system_admin';
  homeDepartmentId?: string;
  status: 'active' | 'inactive';
  createdAt: any;
  lastLoginAt?: any;
  isSystemAdmin?: boolean;
}

interface UserStats {
  totalUsers: number;
  employees: number;
  supervisors: number;
  admins: number;
  activeUsers: number;
  inactiveUsers: number;
}

function SystemAdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [supervisorDialogOpen, setSupervisorDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userSupervisorDepartments, setUserSupervisorDepartments] = useState<string[]>([]);
  const [tempSelectedDepartments, setTempSelectedDepartments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    employees: 0,
    supervisors: 0,
    admins: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const { toast } = useToast();
  const router = useRouter();
  const { t, language } = useLanguage();

  // دالة لإضافة أرقام وظيفية لجميع المستخدمين الموجودين
  const addEmployeeIdsToAllUsers = async () => {
    try {
      console.log('🔄 بدء عملية إضافة الأرقام الوظيفية لجميع المستخدمين...');
      
      // جمع الأرقام الوظيفية الموجودة
      const existingIds = new Set<string>();
      users.forEach(user => {
        if (user.employeeId) {
          existingIds.add(user.employeeId);
        }
      });
      
      // تحديد المستخدمين الذين يحتاجون أرقام وظيفية
      const usersNeedingIds = users.filter(user => 
        !user.employeeId && user.role !== 'system_admin'
      );
      
      if (usersNeedingIds.length === 0) {
        toast({
          title: "لا توجد حاجة للتحديث",
          description: "جميع المستخدمين لديهم أرقام وظيفية بالفعل"
        });
        return;
      }
      
      console.log(`🎯 سيتم إضافة أرقام وظيفية لـ ${usersNeedingIds.length} مستخدم`);
      
      // استخدام batch للتحديث المجمع
      const batch = writeBatch(db);
      let addedCount = 0;
      
      for (const user of usersNeedingIds) {
        try {
          let newEmployeeId: string;
          let attempts = 0;
          
          // إنشاء رقم فريد
          do {
            newEmployeeId = generateEmployeeId();
            attempts++;
          } while (existingIds.has(newEmployeeId) && attempts < 10);
          
          if (attempts >= 10) {
            console.error(`❌ فشل في إنشاء رقم فريد للمستخدم ${user.displayName}`);
            continue;
          }
          
          existingIds.add(newEmployeeId);
          
          const userRef = doc(db, 'users', user.uid);
          batch.update(userRef, {
            employeeId: newEmployeeId,
            updatedAt: new Date()
          });
          
          addedCount++;
          console.log(`➕ ${user.displayName || user.email}: ${newEmployeeId}`);
          
        } catch (error) {
          console.error(`❌ خطأ في معالجة المستخدم ${user.displayName}:`, error);
        }
      }
      
      // تنفيذ التحديثات
      await batch.commit();
      
      toast({
        title: "✅ تم إضافة الأرقام الوظيفية",
        description: `تم إضافة أرقام وظيفية لـ ${addedCount} مستخدم بنجاح`
      });
      
      console.log(`✅ تم الانتهاء! أضيفت أرقام وظيفية لـ ${addedCount} مستخدم`);
      
    } catch (error) {
      console.error('❌ خطأ في عملية إضافة الأرقام الوظيفية:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في إضافة الأرقام الوظيفية"
      });
    }
  };

  // دالة لإضافة رقم وظيفي للمستخدمين الذين لا يملكون واحد
  const ensureEmployeeId = async (user: UserData) => {
    if (!user.employeeId && user.role !== 'system_admin') {
      // جمع الأرقام الموجودة لتجنب التكرار
      const existingIds = new Set(users.map(u => u.employeeId).filter(Boolean));
      
      let newEmployeeId: string;
      let attempts = 0;
      
      // إنشاء رقم فريد
      do {
        newEmployeeId = generateEmployeeId();
        attempts++;
      } while (existingIds.has(newEmployeeId) && attempts < 10);
      
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          employeeId: newEmployeeId
        });
        console.log(`تم إنشاء رقم وظيفي للمستخدم ${user.displayName}: ${newEmployeeId}`);
        toast({
          title: "تم إنشاء الرقم الوظيفي",
          description: `الرقم الوظيفي الجديد: ${newEmployeeId}`
        });
      } catch (error) {
        console.error('خطأ في إنشاء الرقم الوظيفي:', error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في إنشاء الرقم الوظيفي"
        });
      }
    }
  };

  // دالة لتحديث الرقم الوظيفي
  const updateEmployeeId = async (uid: string, newEmployeeId: string) => {
    if (!newEmployeeId.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب إدخال رقم وظيفي صحيح"
      });
      return;
    }

    // التحقق من صحة تنسيق الرقم الوظيفي
    if (!validateEmployeeId(newEmployeeId)) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "تنسيق الرقم الوظيفي غير صحيح (يجب أن يكون EMPxxxxxxxxx)"
      });
      return;
    }

    // التحقق من عدم وجود هذا الرقم مسبقاً
    if (!isEmployeeIdUnique(users, newEmployeeId, uid)) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "هذا الرقم الوظيفي مستخدم بالفعل"
      });
      return;
    }

    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        employeeId: newEmployeeId,
        updatedAt: new Date()
      });

      toast({
        title: "تم التحديث",
        description: "تم تحديث الرقم الوظيفي بنجاح"
      });
    } catch (error) {
      console.error('خطأ في تحديث الرقم الوظيفي:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث الرقم الوظيفي"
      });
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserData[];
        
        // ترتيب المستخدمين حسب تاريخ التسجيل
        const sortedUsers = usersData.sort((a, b) => 
          new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime()
        );
        
        setUsers(sortedUsers);
        calculateUserStats(sortedUsers);
        setLoading(false);
      },
      (error) => {
        console.error('خطأ في تحميل بيانات المستخدمين:', error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في تحميل بيانات المستخدمين"
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  // حساب إحصائيات المستخدمين
  const calculateUserStats = (usersData: UserData[]) => {
    const stats: UserStats = {
      totalUsers: usersData.length,
      employees: usersData.filter(user => user.role === 'employee').length,
      supervisors: usersData.filter(user => user.role === 'supervisor').length,
      admins: usersData.filter(user => user.role === 'admin' || user.role === 'system_admin').length,
      activeUsers: usersData.filter(user => user.status === 'active').length,
      inactiveUsers: usersData.filter(user => user.status === 'inactive').length,
    };
    setUserStats(stats);
  };

  // تصفية المستخدمين حسب البحث والفلاتر
  useEffect(() => {
    let filtered = users;

    // تصفية حسب النص المدخل
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, departmentFilter]);

  // جلب الأقسام التي يشرف عليها مستخدم معين
  const loadUserSupervisorDepartments = async (userId: string) => {
    try {
      console.log('🔄 جلب أقسام المشرف:', userId);
      
      // استخدام النظام الجديد
      const supervisorData = await getSupervisorData(userId);
      
      if (supervisorData && supervisorData.isActive) {
        console.log('📋 أقسام المشرف:', supervisorData.assignedDepartments);
        setUserSupervisorDepartments(supervisorData.assignedDepartments);
        setTempSelectedDepartments(supervisorData.assignedDepartments);
      } else {
        console.log('📋 لا توجد أقسام مشرف');
        setUserSupervisorDepartments([]);
        setTempSelectedDepartments([]);
      }
    } catch (error) {
      console.error('Error loading supervisor departments:', error);
      setUserSupervisorDepartments([]);
      setTempSelectedDepartments([]);
    }
  };

  // إدارة صلاحيات الإشراف (تحديد مؤقت)
  const manageSupervisorPermissions = async (userId: string, departmentId: string, isChecked: boolean) => {
    // تحديث الحالة المؤقتة فقط، لا نحفظ في قاعدة البيانات بعد
    if (isChecked) {
      setTempSelectedDepartments(prev => [...prev.filter(id => id !== departmentId), departmentId]);
    } else {
      setTempSelectedDepartments(prev => prev.filter(id => id !== departmentId));
    }
  };

  // حفظ تغييرات المشرف
  const saveSupervisorChanges = async () => {
    if (!selectedUser) return;
    
    try {
      console.log('🔄 حفظ تغييرات المشرف:', selectedUser.displayName, tempSelectedDepartments);
      
      let success = false;
      
      if (tempSelectedDepartments.length > 0) {
        // إضافة مشرف جديد أو تحديث أقسامه
        if (selectedUser.role === 'employee') {
          // ترقية الموظف إلى مشرف
          success = await promoteToSupervisor(selectedUser.uid, tempSelectedDepartments);
        } else {
          // تحديث الأقسام للمشرف الموجود
          success = await updateSupervisorDepartments(selectedUser.uid, tempSelectedDepartments);
        }
        
        if (success) {
          toast({
            title: "تمت العملية بنجاح",
            description: `تم ${selectedUser.role === 'employee' ? 'ترقية' : 'تحديث'} ${selectedUser.displayName} كمشرف على الأقسام المحددة`,
          });
        }
      } else {
        // إزالة جميع صلاحيات الإشراف (تنزيل إلى موظف)
        success = await demoteToEmployee(selectedUser.uid);
        
        if (success) {
          toast({
            title: "تم تنزيل المشرف",
            description: `تم تنزيل ${selectedUser.displayName} إلى موظف`,
          });
        }
      }
      
      if (success) {
        setSupervisorDialogOpen(false);
        setSelectedUser(null);
        setTempSelectedDepartments([]);
        // البيانات ستحدث تلقائياً عبر onSnapshot
      } else {
        toast({
          title: "خطأ",
          description: "فشل في حفظ التغييرات. حاول مرة أخرى.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ خطأ في حفظ تغييرات المشرف:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التغييرات"
      });
    }
  };

  // فتح حوار إدارة صلاحيات الإشراف
  const openSupervisorDialog = async (user: UserData) => {
    setSelectedUser(user);
    await loadUserSupervisorDepartments(user.uid);
    setSupervisorDialogOpen(true);
  };

  const updateUserRole = async (uid: string, newRole: 'employee' | 'supervisor' | 'admin') => {
    setUpdating(uid);
    try {
      console.log('🔄 محاولة تحديث دور المستخدم:', uid, 'إلى:', newRole);
      
      const currentUserId = auth.currentUser?.uid || 'system';
      let success = false;

      // الحصول على الدور الحالي
      const currentRole = await getUserCurrentRole(uid);
      const currentRoleType = currentRole?.role || 'employee';

      console.log('🔍 الدور الحالي:', currentRoleType, 'الدور الجديد:', newRole);

      // تطبيق التغيير حسب الدور الجديد
      if (newRole === 'supervisor') {
        if (currentRoleType === 'employee') {
          success = await promoteToSupervisor(uid, ['general-monitoring'], currentUserId);
        } else if (currentRoleType === 'admin') {
          success = await demoteToSupervisor(uid, ['general-monitoring'], currentUserId);
        }
      } else if (newRole === 'admin') {
        if (currentRoleType !== 'admin') {
          success = await promoteToAdmin(uid, currentUserId);
        }
      } else if (newRole === 'employee') {
        if (currentRoleType !== 'employee') {
          success = await demoteToEmployee(uid, currentUserId);
        }
      }

      if (success) {
        console.log('✅ تم تحديث دور المستخدم بنجاح');
        toast({
          title: "تم التحديث",
          description: `تم تحديث دور المستخدم إلى ${getRoleDisplayName(newRole)} فورياً`
        });
      } else {
        throw new Error('فشل في تحديث الدور');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث دور المستخدم:', error);
      
      // تفاصيل أكثر عن الخطأ
      let errorMessage = "فشل في تحديث دور المستخدم";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        variant: "destructive",
        title: "خطأ",
        description: errorMessage
      });
    } finally {
      setUpdating(null);
    }
  };

  // ترقية المستخدم إلى مشرف
  const handlePromoteToSupervisor = async (user: UserData) => {
    if (user.role === 'employee') {
      console.log('🔄 ترقية إلى مشرف:', user.displayName);
      
      // فتح نافذة تحديد الأقسام
      setSelectedUser(user);
      await loadUserSupervisorDepartments(user.uid);
      setSupervisorDialogOpen(true);
    }
  };

  // ترقية إلى مدير عام
  const handlePromoteToAdmin = async (user: UserData) => {
    if (user.role === 'supervisor' || user.role === 'employee') {
      console.log('🔄 ترقية إلى مدير عام:', user.displayName);
      
      try {
        const success = await promoteToAdmin(user.uid, auth.currentUser?.uid || 'system_admin');
        
        if (success) {
          toast({
            title: "تمت الترقية",
            description: `تم ترقية ${user.displayName} إلى مدير عام فورياً`,
          });
        } else {
          throw new Error('فشل في ترقية المستخدم');
        }
      } catch (error) {
        console.error('خطأ في ترقية المستخدم:', error);
        toast({
          title: "خطأ",
          description: "فشل في ترقية المستخدم إلى مدير عام",
          variant: "destructive",
        });
      } finally {
        setUpdating(null);
      }
    }
  };

  // تنزيل إلى موظف
  const handleDemoteToEmployee = async (user: UserData) => {
    setUpdating(user.uid);
    try {
      console.log('🔄 تنزيل إلى موظف:', user.displayName);
      
      const success = await demoteToEmployee(user.uid);
      
      if (success) {
        toast({
          title: "تم التنزيل",
          description: `تم تنزيل ${user.displayName} إلى موظف`,
        });
      } else {
        throw new Error('فشل في تنزيل المستخدم');
      }
    } catch (error) {
      console.error('خطأ في تنزيل المستخدم:', error);
      toast({
        title: "خطأ",
        description: "فشل في تنزيل المستخدم إلى موظف",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  // ترقية إلى مدير نظام
  const promoteToSystemAdmin = async (user: UserData) => {
    if (user.role === 'admin') {
      setUpdating(user.uid);
      try {
        console.log('🔄 ترقية إلى مدير نظام:', user.displayName);
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          role: 'system_admin',
          isSystemAdmin: true,
          updatedAt: new Date()
        });
        
        console.log('✅ تم ترقية المستخدم إلى مدير نظام');
        
        toast({
          title: "تمت الترقية",
          description: `تم ترقية ${user.displayName} إلى مدير نظام`,
        });
      } catch (error) {
        console.error('❌ خطأ في ترقية المستخدم إلى مدير نظام:', error);
        
        let errorMessage = "فشل في ترقية المستخدم إلى مدير نظام";
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        }
        
        toast({
          variant: "destructive",
          title: "خطأ",
          description: errorMessage
        });
      } finally {
        setUpdating(null);
      }
    }
  };

  // تنزيل من مدير عام
  const demoteFromAdmin = async (user: UserData) => {
    if (user.role === 'admin') {
      console.log('🔄 تنزيل من مدير عام:', user.displayName);
      await updateUserRole(user.uid, 'employee');
      toast({
        title: "تم التنزيل",
        description: `تم تنزيل ${user.displayName} من مدير عام إلى موظف`,
      });
    }
  };

  // تغيير حالة المستخدم (تفعيل/إلغاء تفعيل)
  const toggleUserStatus = async (uid: string, currentStatus: string) => {
    setUpdating(uid);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      console.log('🔄 تحديث حالة المستخدم:', uid, 'إلى:', newStatus);
      
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      console.log('✅ تم تحديث حالة المستخدم بنجاح');

      toast({
        title: "تم التحديث",
        description: `تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم`
      });
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة المستخدم:', error);
      
      let errorMessage = "فشل في تحديث حالة المستخدم";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        variant: "destructive",
        title: "خطأ",
        description: errorMessage
      });
    } finally {
      setUpdating(null);
    }
  };

  const updateUserDepartment = async (uid: string, departmentId: string) => {
    setUpdating(uid);
    try {
      console.log('🔄 تحديث قسم المستخدم:', uid, 'إلى:', departmentId);
      
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        homeDepartmentId: departmentId,
        updatedAt: new Date()
      });

      console.log('✅ تم تحديث قسم المستخدم بنجاح');

      toast({
        title: "تم التحديث",
        description: "تم تحديث قسم المستخدم بنجاح"
      });
    } catch (error) {
      console.error('❌ خطأ في تحديث قسم المستخدم:', error);
      
      let errorMessage = "فشل في تحديث قسم المستخدم";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        variant: "destructive",
        title: "خطأ",
        description: errorMessage
      });
    } finally {
      setUpdating(null);
    }
  };

  // حذف مستخدم نهائياً
  const handleDeleteUser = async (user: UserData) => {
    setUpdating(user.uid);
    try {
      console.log('🗑️ بدء حذف المستخدم:', user.displayName || user.email);
      
      // حذف من Firestore أولاً
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);
      console.log('✅ تم حذف بيانات المستخدم من Firestore');
      
      // حذف من مجموعة supervisors إذا كان مشرفاً
      if (user.role === 'supervisor') {
        try {
          const supervisorRef = doc(db, 'supervisors', user.uid);
          await deleteDoc(supervisorRef);
          console.log('✅ تم حذف بيانات المشرف');
        } catch (error) {
          console.log('⚠️ لم يتم العثور على بيانات مشرف');
        }
      }
      
      // ملاحظة: لا يمكن حذف المستخدم من Firebase Auth من جانب العميل
      // يجب أن يتم ذلك من خلال Cloud Functions أو Admin SDK
      
      toast({
        title: "تم الحذف بنجاح! ✅",
        description: `تم حذف المستخدم ${user.displayName || user.email} من قاعدة البيانات`,
      });
      
      console.log('✅ تم حذف المستخدم بنجاح');
      
    } catch (error) {
      console.error('❌ خطأ في حذف المستخدم:', error);
      
      let errorMessage = "فشل في حذف المستخدم";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        variant: "destructive",
        title: "خطأ",
        description: errorMessage
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير عام';
      case 'supervisor': return 'مشرف';
      case 'employee': return 'موظف';
      case 'system_admin': return 'مدير النظام';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'system_admin': return 'destructive' as const;
      case 'admin': return 'default' as const;
      case 'supervisor': return 'secondary' as const;
      case 'employee': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'system_admin': return <Crown className="h-4 w-4 text-red-600" />;
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'supervisor': return <UserCog className="h-4 w-4" />;
      case 'employee': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return t('not_specified');
    const dept = allDepartments.find(d => d.id === departmentId);
    return dept?.name || t('unknown');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('loading_users')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${language === 'ar' ? 'dir-rtl' : 'dir-ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <AppHeader title={t('user_management')}>
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <LanguageSwitcher />
      </AppHeader>

      {/* Main Content */}
      <main className="container mx-auto p-6 space-y-6">
        
        {/* إحصائيات المستخدمين */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{users.filter(u => {
                  const createdAt = u.createdAt?.toDate();
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  return createdAt && createdAt > lastWeek;
                }).length} في الأسبوع الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الموظفون</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.employees}</div>
              <p className="text-xs text-muted-foreground">
                {((userStats.employees / userStats.totalUsers) * 100 || 0).toFixed(1)}% من المجموع
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشرفون</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.supervisors}</div>
              <p className="text-xs text-muted-foreground">
                {((userStats.supervisors / userStats.totalUsers) * 100 || 0).toFixed(1)}% من المجموع
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المديرون</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.admins}</div>
              <p className="text-xs text-muted-foreground">
                {((userStats.admins / userStats.totalUsers) * 100 || 0).toFixed(1)}% من المجموع
              </p>
            </CardContent>
          </Card>
        </div>

        {/* أدوات البحث والتصفية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">البحث</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="البحث بالاسم، البريد الإلكتروني، أو الرقم الوظيفي..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="role-filter" className="text-sm font-medium">تصفية حسب الدور</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger id="role-filter">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="supervisor">مشرف</SelectItem>
                    <SelectItem value="admin">مدير عام</SelectItem>
                    <SelectItem value="system_admin">مدير نظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="dept-filter" className="text-sm font-medium">تصفية حسب القسم</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger id="dept-filter">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأقسام</SelectItem>
                    {allDepartments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              إدارة المستخدمين والأدوار
            </CardTitle>
            <CardDescription>
              عدد النتائج: {filteredUsers.length} من أصل {users.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">الاسم</TableHead>
                    <TableHead className="min-w-[100px]">الرقم الوظيفي</TableHead>
                    <TableHead className="min-w-[200px]">البريد الإلكتروني</TableHead>
                    <TableHead className="min-w-[100px]">الدور الحالي</TableHead>
                    <TableHead className="min-w-[120px]">القسم</TableHead>
                    <TableHead className="min-w-[80px]">الحالة</TableHead>
                    <TableHead className="min-w-[100px] hidden md:table-cell">تاريخ التسجيل</TableHead>
                    <TableHead className="min-w-[150px]">إجراءات سريعة</TableHead>
                    <TableHead className="min-w-[120px] hidden lg:table-cell">صلاحيات الإشراف</TableHead>
                    <TableHead className="min-w-[80px]">حذف</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium max-w-[180px]">
                      <ExpandableCell 
                        content={user.displayName || 'غير محدد'}
                        maxWidth="160px"
                        label="اسم المستخدم"
                        showCopyButton={false}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.employeeId ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {user.employeeId}
                          </Badge>
                        ) : (
                          user.role === 'system_admin' ? (
                            <span className="text-xs text-muted-foreground">مدير النظام</span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => ensureEmployeeId(user)}
                              className="text-xs"
                            >
                              إنشاء رقم
                            </Button>
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <ExpandableCell 
                          content={user.email}
                          maxWidth="150px"
                          label="البريد الإلكتروني"
                          showCopyButton={true}
                        />
                        {((user.email?.toLowerCase().trim() === "sweetdream711711@gmail.com") || 
                          user.role === 'system_admin' || 
                          user.isSystemAdmin) && (
                          <Badge variant="destructive" className="text-xs flex-shrink-0">
                            مدير النظام
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(user.role)}
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[120px]">
                        {((user.email?.toLowerCase().trim() === "sweetdream711711@gmail.com") || 
                          user.role === 'system_admin' || 
                          user.isSystemAdmin) ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <Select
                            value={user.homeDepartmentId || ""}
                            onValueChange={(value: string) => updateUserDepartment(user.uid, value)}
                            disabled={updating === user.uid}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="القسم" />
                            </SelectTrigger>
                            <SelectContent>
                              {allDepartments.map(dept => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {((user.email?.toLowerCase().trim() === "sweetdream711711@gmail.com") || 
                        user.role === 'system_admin' || 
                        user.isSystemAdmin) ? (
                        <Badge variant="default">نشط</Badge>
                      ) : (
                        <Button
                          variant={user.status === 'active' ? 'default' : 'destructive'}
                          size="sm"
                          onClick={() => toggleUserStatus(user.uid, user.status || 'active')}
                          disabled={updating === user.uid}
                          className="text-xs"
                        >
                          {user.status === 'active' ? 'نشط' : 'معطل'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {user.createdAt?.toDate()?.toLocaleDateString('ar-SA') || 'غير محدد'}
                    </TableCell>
                    <TableCell>
                      {((user.email?.toLowerCase().trim() === "sweetdream711711@gmail.com") || 
                        user.role === 'system_admin' || 
                        user.isSystemAdmin) ? (
                        <span className="text-xs text-muted-foreground">مدير النظام</span>
                      ) : (
                        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-1">
                          {user.role === 'employee' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromoteToSupervisor(user)}
                              disabled={updating === user.uid}
                              className="text-xs"
                            >
                              <TrendingUp className="h-3 w-3 ml-1" />
                              <span className="hidden sm:inline">ترقية لمشرف</span>
                              <span className="sm:hidden">مشرف</span>
                            </Button>
                          )}
                          
                          {user.role === 'supervisor' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePromoteToAdmin(user)}
                                disabled={updating === user.uid}
                                className="text-xs"
                              >
                                <TrendingUp className="h-3 w-3 ml-1" />
                                <span className="hidden sm:inline">ترقية لمدير</span>
                                <span className="sm:hidden">مدير</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDemoteToEmployee(user)}
                                disabled={updating === user.uid}
                                className="text-xs"
                              >
                                <TrendingDown className="h-3 w-3 ml-1" />
                                <span className="hidden sm:inline">تنزيل لموظف</span>
                                <span className="sm:hidden">موظف</span>
                              </Button>
                            </>
                          )}
                          
                          {user.role === 'admin' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => promoteToSystemAdmin(user)}
                                disabled={updating === user.uid}
                                className="text-xs bg-red-50 hover:bg-red-100 border-red-200"
                              >
                                <Crown className="h-3 w-3 ml-1" />
                                <span className="hidden sm:inline">ترقية لمدير نظام</span>
                                <span className="sm:hidden">نظام</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => demoteFromAdmin(user)}
                                disabled={updating === user.uid}
                                className="text-xs"
                              >
                                <TrendingDown className="h-3 w-3 ml-1" />
                                <span className="hidden sm:inline">تنزيل لموظف</span>
                                <span className="sm:hidden">موظف</span>
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {((user.email?.toLowerCase().trim() === "sweetdream711711@gmail.com") || 
                        user.role === 'system_admin' || 
                        user.isSystemAdmin) ? (
                        <span className="text-xs text-muted-foreground">مدير النظام</span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSupervisorDialog(user)}
                          className="text-xs"
                        >
                          <Shield className="h-3 w-3 ml-1" />
                          <span className="hidden xl:inline">إدارة الصلاحيات</span>
                          <span className="xl:hidden">صلاحيات</span>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {((user.email?.toLowerCase().trim() === "sweetdream711711@gmail.com") || 
                        user.role === 'system_admin' || 
                        user.isSystemAdmin) ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updating === user.uid}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد حذف المستخدم</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف المستخدم <strong>{user.displayName || user.email}</strong>؟
                                <br /><br />
                                <span className="text-red-600 font-semibold">⚠️ تحذير:</span> هذا الإجراء لا يمكن التراجع عنه!
                                <br />
                                سيتم حذف:
                                <ul className="list-disc list-inside mt-2 text-sm">
                                  <li>حساب المستخدم من نظام AWG</li>
                                  <li>جميع بيانات المستخدم من قاعدة البيانات</li>
                                  <li>جميع الصلاحيات والأدوار المرتبطة</li>
                                </ul>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                حذف نهائياً
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || roleFilter !== 'all' || departmentFilter !== 'all' 
                  ? 'لا توجد نتائج تطابق معايير البحث'
                  : 'لا توجد بيانات مستخدمين'
                }
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog إدارة صلاحيات الإشراف */}
      <Dialog open={supervisorDialogOpen} onOpenChange={setSupervisorDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              إدارة صلاحيات الإشراف - {selectedUser?.displayName}
            </DialogTitle>
            <DialogDescription>
              اختر الأقسام التي تريد منح المستخدم صلاحية الإشراف عليها
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {allDepartments.map((department) => (
              <div key={department.id} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={department.id}
                  checked={tempSelectedDepartments.includes(department.id)}
                  onCheckedChange={(checked: boolean) => 
                    manageSupervisorPermissions(selectedUser?.uid || '', department.id, checked)
                  }
                />
                <label
                  htmlFor={department.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {department.name}
                </label>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              ⚠️ ملاحظة: التغييرات لن تُحفظ حتى تضغط على "حفظ التغييرات"
            </p>
            <p className="text-sm">
              الأقسام المحددة: {tempSelectedDepartments.length > 0 
                ? tempSelectedDepartments.map(id => allDepartments.find(d => d.id === id)?.name).join(', ')
                : 'لا توجد أقسام محددة'}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setSupervisorDialogOpen(false);
              setTempSelectedDepartments(userSupervisorDepartments); // إعادة تعيين التغييرات
            }}>
              إلغاء
            </Button>
            <Button onClick={saveSupervisorChanges} className="bg-green-600 hover:bg-green-700">
              <Shield className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withSystemAdminAuth(SystemAdminDashboard);