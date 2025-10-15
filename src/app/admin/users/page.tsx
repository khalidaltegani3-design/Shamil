"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { withSystemAdminAuth } from '@/lib/system-admin-auth';
import { collection, doc, updateDoc, onSnapshot, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { allDepartments } from '@/lib/departments';
import { ArrowLeft, Crown, User, UserCog, Shield, ShieldCheck, UserPlus, TrendingUp, TrendingDown, Trash2, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { generateEmployeeId, validateEmployeeId, isEmployeeIdUnique } from '@/lib/employee-utils';
import { getSupervisorData } from '@/lib/supervisor-management';
import { promoteToSupervisor, promoteToAdmin, demoteToEmployee, demoteToSupervisor, getUserCurrentRole, updateSupervisorDepartments } from '@/lib/role-management';
import { ExpandableCell } from '@/components/ui/expandable-cell';
import AppHeader from '@/components/AppHeader';
import { createUserWithEmailAndPassword, updateProfile, fetchSignInMethodsForEmail, signOut } from 'firebase/auth';
import { setDoc, serverTimestamp } from 'firebase/firestore';

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
  
  // متغيرات نموذج إضافة مستخدم جديد
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'employee' | 'supervisor' | 'admin',
    homeDepartmentId: '',
    employeeId: ''
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();
  const { t, language } = useLanguage();

  // دالة للتحقق من وجود المستخدم في Firebase Auth
  const checkUserExistsInAuth = async (email: string): Promise<boolean> => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.length > 0;
    } catch (error) {
      console.error('خطأ في التحقق من وجود المستخدم:', error);
      return false;
    }
  };

  // دالة إنشاء مستخدم جديد
  const handleCreateUser = async () => {
    // التحقق من صحة البيانات
    if (!newUserData.displayName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب إدخال اسم المستخدم"
      });
      return;
    }

    if (!newUserData.email.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب إدخال البريد الإلكتروني"
      });
      return;
    }

    if (!newUserData.password.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب إدخال كلمة المرور"
      });
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقين"
      });
      return;
    }

    if (newUserData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
      });
      return;
    }

    // التحقق من الرقم الوظيفي إذا تم إدخاله
    if (newUserData.employeeId.trim()) {
      if (!validateEmployeeId(newUserData.employeeId)) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "تنسيق الرقم الوظيفي غير صحيح (يجب أن يكون EMPxxxxxxxxx)"
        });
        return;
      }

      if (!isEmployeeIdUnique(users, newUserData.employeeId)) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "هذا الرقم الوظيفي مستخدم بالفعل"
        });
        return;
      }
    }

    // التحقق من وجود المستخدم في Firebase Auth
    const userExistsInAuth = await checkUserExistsInAuth(newUserData.email.trim());
    if (userExistsInAuth) {
      toast({
        variant: "destructive",
        title: "البريد الإلكتروني مستخدم في Firebase Auth",
        description: "هذا البريد الإلكتروني موجود بالفعل في Firebase Auth. إذا كان المستخدم محذوفاً من Firestore، يجب حذفه من Firebase Auth أولاً أو استخدام بريد إلكتروني آخر.",
        duration: 10000
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      console.log('🔄 إنشاء مستخدم جديد:', newUserData.email);
      
      // إنشاء المستخدم في Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUserData.email.trim(),
        newUserData.password
      );

      const user = userCredential.user;
      console.log('✅ تم إنشاء المستخدم في Auth:', user.uid);

      // تحديث الملف الشخصي
      await updateProfile(user, {
        displayName: newUserData.displayName.trim()
      });

      // تسجيل خروج المستخدم الجديد فوراً لعدم تداخل الجلسات
      await signOut(auth);
      console.log('✅ تم تسجيل خروج المستخدم الجديد');

      // إنشاء بيانات المستخدم في Firestore
      const userData = {
        uid: user.uid,
        displayName: newUserData.displayName.trim(),
        email: newUserData.email.trim().toLowerCase(),
        role: newUserData.role,
        homeDepartmentId: newUserData.homeDepartmentId === 'none' ? null : newUserData.homeDepartmentId || null,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(newUserData.employeeId.trim() && { employeeId: newUserData.employeeId.trim() })
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ تم إنشاء بيانات المستخدم في Firestore');

      // إذا كان المشرف، إضافة إلى مجموعة supervisors
      if (newUserData.role === 'supervisor') {
        const supervisorData = {
          userId: user.uid,
          assignedDepartments: (newUserData.homeDepartmentId && newUserData.homeDepartmentId !== 'none') ? [newUserData.homeDepartmentId] : [],
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'supervisors', user.uid), supervisorData);
        console.log('✅ تم إنشاء بيانات المشرف');
      }

      // إذا كان الرقم الوظيفي موجود، إضافته إلى مجموعة employeeIds
      if (newUserData.employeeId.trim()) {
        await setDoc(doc(db, 'employeeIds', newUserData.employeeId.trim()), {
          userId: user.uid,
          assignedAt: serverTimestamp()
        });
        console.log('✅ تم إنشاء الرقم الوظيفي في مجموعة employeeIds');
      }

      toast({
        title: "تم إنشاء المستخدم بنجاح! ✅",
        description: `تم إنشاء المستخدم ${newUserData.displayName} بنجاح. تم تسجيل خروج المستخدم الجديد تلقائياً.`,
        duration: 5000
      });

      // إعادة تعيين النموذج وإغلاق الحوار
      setNewUserData({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        homeDepartmentId: '',
        employeeId: ''
      });
      setAddUserDialogOpen(false);

    } catch (error: any) {
      console.error('❌ خطأ في إنشاء المستخدم:', error);
      
      let errorMessage = "فشل في إنشاء المستخدم";
      let errorTitle = "خطأ";
      
      if (error.code === 'auth/email-already-in-use') {
        errorTitle = "البريد الإلكتروني مستخدم بالفعل";
        errorMessage = "هذا البريد الإلكتروني مستخدم في Firebase Auth. إذا كان المستخدم محذوفاً من Firestore، فقد يحتاج البريد الإلكتروني إلى وقت لإعادة الاستخدام أو يجب حذف المستخدم من Firebase Auth أولاً.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "البريد الإلكتروني غير صحيح";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "كلمة المرور ضعيفة";
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
        duration: 8000
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  // إعادة تعيين نموذج إضافة المستخدم
  const resetAddUserForm = () => {
    setNewUserData({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
      homeDepartmentId: '',
      employeeId: ''
    });
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
      
      // حذف الرقم الوظيفي من مجموعة employeeIds إذا كان موجوداً
      if (user.employeeId) {
        try {
          const employeeIdRef = doc(db, 'employeeIds', user.employeeId);
          await deleteDoc(employeeIdRef);
          console.log('✅ تم حذف الرقم الوظيفي');
        } catch (error) {
          console.log('⚠️ لم يتم العثور على رقم وظيفي');
        }
      }
      
      // ملاحظة: لا يمكن حذف المستخدم من Firebase Auth من جانب العميل
      // يجب أن يتم ذلك من خلال Cloud Functions أو Admin SDK
      // لكن يمكننا إضافة تحقق في إنشاء المستخدم الجديد
      
      toast({
        title: "تم الحذف بنجاح! ✅",
        description: `تم حذف المستخدم ${user.displayName || user.email} من قاعدة البيانات. ملاحظة: إذا واجهت مشكلة في إعادة استخدام البريد الإلكتروني، يجب حذف المستخدم من Firebase Auth أولاً من خلال Firebase Console.`,
        duration: 8000
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                إدارة المستخدمين والأدوار
              </div>
              {/* زر إضافة مستخدم جديد - فقط لمدير النظام */}
              {auth.currentUser?.email?.toLowerCase().trim() === "sweetdream711711@gmail.com" && (
                <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => resetAddUserForm()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      إضافة مستخدم جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        إضافة مستخدم جديد
                      </DialogTitle>
                      <DialogDescription>
                        إنشاء حساب مستخدم جديد في النظام
                      </DialogDescription>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-2">
                        <p className="text-sm text-yellow-800">
                          ⚠️ <strong>تنبيه:</strong> بعد إنشاء المستخدم، سيتم تسجيل خروج المستخدم الجديد تلقائياً. قد تحتاج لإعادة تسجيل الدخول كمدير النظام.
                        </p>
                      </div>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div className="md:col-span-2 space-y-2">
                        <label htmlFor="displayName" className="text-sm font-medium">اسم المستخدم *</label>
                        <Input
                          id="displayName"
                          placeholder="أدخل اسم المستخدم"
                          value={newUserData.displayName}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, displayName: e.target.value }))}
                          disabled={isCreatingUser}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني *</label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@domain.com"
                          value={newUserData.email}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={isCreatingUser}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">كلمة المرور *</label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="أدخل كلمة المرور"
                          value={newUserData.password}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                          disabled={isCreatingUser}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">تأكيد كلمة المرور *</label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="أعد إدخال كلمة المرور"
                          value={newUserData.confirmPassword}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          disabled={isCreatingUser}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium">الدور</label>
                        <Select
                          value={newUserData.role}
                          onValueChange={(value: 'employee' | 'supervisor' | 'admin') => 
                            setNewUserData(prev => ({ ...prev, role: value }))
                          }
                          disabled={isCreatingUser}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الدور" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">موظف</SelectItem>
                            <SelectItem value="supervisor">مشرف</SelectItem>
                            <SelectItem value="admin">مدير عام</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="department" className="text-sm font-medium">القسم</label>
                        <Select
                          value={newUserData.homeDepartmentId}
                          onValueChange={(value) => 
                            setNewUserData(prev => ({ ...prev, homeDepartmentId: value }))
                          }
                          disabled={isCreatingUser}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر القسم" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">بدون قسم</SelectItem>
                            {allDepartments.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label htmlFor="employeeId" className="text-sm font-medium">الرقم الوظيفي (اختياري)</label>
                        <Input
                          id="employeeId"
                          placeholder="EMP123456789 (اختياري)"
                          value={newUserData.employeeId}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, employeeId: e.target.value }))}
                          disabled={isCreatingUser}
                        />
                        <p className="text-xs text-muted-foreground">
                          تنسيق الرقم الوظيفي: EMP متبوع بـ 9 أرقام (مثل: EMP123456789)
                        </p>
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setAddUserDialogOpen(false)}
                        disabled={isCreatingUser}
                      >
                        إلغاء
                      </Button>
                      <Button 
                        onClick={handleCreateUser}
                        disabled={isCreatingUser}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isCreatingUser ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            جاري الإنشاء...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            إنشاء المستخدم
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
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