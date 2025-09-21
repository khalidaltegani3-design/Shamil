"use client";

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';
import { ensureSystemAdminExists } from '@/lib/ensure-system-admin';

interface SupervisorAuthProps {
  children: React.ReactNode;
}

interface UserData {
  role?: string;
  email?: string;
  displayName?: string;
  homeDepartmentId?: string;
  isSystemAdmin?: boolean;
}

export function SupervisorAuth({ children }: SupervisorAuthProps) {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  const retryPermissionCheck = async () => {
    setIsRetrying(true);
    setIsLoading(true);
    setHasPermission(false);
    
    // إعادة تحديث الرمز المميز
    if (user) {
      try {
        await user.getIdToken(true);
        console.log('Token refreshed, rechecking permissions');
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
    
    setIsRetrying(false);
    // السماح لـ useEffect بإعادة التشغيل
  };

  useEffect(() => {
    async function checkSupervisorPermission() {
      if (loading) return;

      if (!user) {
        router.push('/login/supervisor');
        return;
      }

      try {
        console.log('SupervisorAuth: Checking permissions for user:', user.email);
        
        // تحقق من صلاحيات مدير النظام أولاً - مع تنظيف البريد الإلكتروني
        const cleanEmail = (user.email || '').toLowerCase().trim();
        const systemAdminEmail = "sweetdream711711@gmail.com";
        const testSupervisorEmail = "end2012.19+1@gmail.com"; // للاختبار المؤقت
        
        console.log('SupervisorAuth: Clean email:', cleanEmail);
        console.log('SupervisorAuth: System admin email:', systemAdminEmail);
        console.log('SupervisorAuth: Emails match:', cleanEmail === systemAdminEmail);
        
        if (cleanEmail === systemAdminEmail) {
          console.log('SupervisorAuth: System admin detected, ensuring document exists');
          
          // ضمان وجود وثيقة مدير النظام
          await ensureSystemAdminExists();
          
          // إجبار تحديث claims إذا لزم الأمر
          await user.getIdToken(true);
          
          setHasPermission(true);
          setUserData({ 
            role: 'system_admin', 
            email: user.email || '',
            displayName: user.displayName || 'مدير النظام',
            isSystemAdmin: true
          });
          setIsLoading(false);
          return;
        }

        // استثناء مؤقت للاختبار - إزالة هذا في الإنتاج
        if (cleanEmail === testSupervisorEmail) {
          console.log('SupervisorAuth: Test supervisor detected (temporary exception)');
          console.log('SupervisorAuth: Granting full supervisor access for khalid');
          setHasPermission(true);
          setUserData({ 
            role: 'supervisor', 
            email: user.email || '',
            displayName: user.displayName || 'خالد - مشرف تجريبي',
            homeDepartmentId: 'general-monitoring'
          });
          setIsLoading(false);
          return;
        }

        // جلب بيانات المستخدم من Firestore للمستخدمين الآخرين
        console.log('SupervisorAuth: Fetching user data from Firestore');
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.log('SupervisorAuth: User document not found');
          setHasPermission(false);
          setIsLoading(false);
          return;
        }

        const userData = userDoc.data() as UserData;
        setUserData(userData);
        console.log('SupervisorAuth: User data loaded:', userData);
        console.log('SupervisorAuth: User role:', userData.role);
        console.log('SupervisorAuth: User email:', userData.email);

        // تحقق إضافي لمدير النظام من البيانات المحفوظة
        if (userData.role === 'system_admin' || userData.isSystemAdmin === true) {
          console.log('SupervisorAuth: System admin confirmed via database, granting access');
          setHasPermission(true);
          setIsLoading(false);
          return;
        }

        // تحقق من كونه مدير عام
        if (userData.role === 'admin') {
          console.log('SupervisorAuth: User is admin, granting access');
          setHasPermission(true);
          setIsLoading(false);
          return;
        }

        // تحقق من كونه مشرف بناءً على الدور المحفوظ
        if (userData.role === 'supervisor') {
          console.log('SupervisorAuth: User has supervisor role, granting access');
          console.log('SupervisorAuth: This user is a valid supervisor');
          
          // للمشرفين الجدد الذين لم يتم تعيين أقسام لهم بعد، منحهم إمكانية الوصول
          // وسيتم توجيههم لاختيار الأقسام لاحقاً في واجهة المشرف
          setHasPermission(true);
          setIsLoading(false);
          return;
        }

        // تحقق من كونه مشرف في أي إدارة (للتوافق مع النظام القديم)
        console.log('SupervisorAuth: Checking supervisor permissions in departments');
        const supervisorsQuery = query(
          collection(db, 'departments'),
        );
        
        const departmentsSnapshot = await getDocs(supervisorsQuery);
        let isSupervisor = false;

        for (const deptDoc of departmentsSnapshot.docs) {
          const supervisorRef = doc(db, 'departments', deptDoc.id, 'supervisors', user.uid);
          const supervisorDoc = await getDoc(supervisorRef);
          
          if (supervisorDoc.exists()) {
            console.log('SupervisorAuth: User is supervisor of department:', deptDoc.id);
            isSupervisor = true;
            break;
          }
        }

        console.log('SupervisorAuth: Final supervisor permission:', isSupervisor);
        console.log('SupervisorAuth: User role was:', userData.role);
        console.log('SupervisorAuth: Available roles: system_admin, admin, supervisor, employee');
        setHasPermission(isSupervisor);
        setIsLoading(false);

      } catch (error) {
        console.error('خطأ في التحقق من صلاحيات الإشراف:', error);
        
        // في حالة الخطأ، السماح لمدير النظام والمستخدم التجريبي بالدخول
        const cleanEmailForError = (user.email || '').toLowerCase().trim();
        if (cleanEmailForError === "sweetdream711711@gmail.com") {
          console.log('SupervisorAuth: Error occurred, but allowing system admin');
          setHasPermission(true);
          setUserData({ 
            role: 'system_admin', 
            email: user.email || '',
            displayName: user.displayName || 'مدير النظام'
          });
        } else if (cleanEmailForError === "end2012.19+1@gmail.com") {
          console.log('SupervisorAuth: Error occurred, but allowing test supervisor khalid');
          setHasPermission(true);
          setUserData({ 
            role: 'supervisor', 
            email: user.email || '',
            displayName: user.displayName || 'خالد - مشرف تجريبي',
            homeDepartmentId: 'general-monitoring'
          });
        } else {
          setHasPermission(false);
        }
        setIsLoading(false);
      }
    }

    checkSupervisorPermission();
  }, [user, loading, router, isRetrying]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-[400px]">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null; // سيتم التوجيه إلى صفحة تسجيل الدخول
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-[500px]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl">غير مصرح لك بالدخول</CardTitle>
            <CardDescription className="text-lg">
              هذه الصفحة مخصصة للمشرفين ومديري الأقسام فقط
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">للحصول على صلاحية الإشراف:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>تواصل مع مدير النظام</li>
                <li>اطلب إضافتك كمشرف على إدارة معينة</li>
                <li>تأكد من صحة بيانات حسابك</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={retryPermissionCheck} className="flex-1" disabled={isRetrying}>
                {isRetrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري إعادة المحاولة...
                  </>
                ) : (
                  <>
                    <Shield className="ml-2 h-4 w-4" />
                    إعادة فحص الصلاحيات
                  </>
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة للصفحة الرئيسية
              </Button>
              <Button variant="outline" onClick={() => auth.signOut()} className="flex-1">
                تسجيل الخروج
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// دالة مساعدة للتحقق من صلاحيات الإشراف في المكونات الأخرى
export async function checkUserSupervisorPermissions(userId: string): Promise<{
  isSystemAdmin: boolean;
  isAdmin: boolean;
  supervisedDepartments: string[];
}> {
  try {
    const user = auth.currentUser;
    console.log('checkUserSupervisorPermissions: Current user email:', user?.email);
    
    // تحقق من مدير النظام بالبريد الإلكتروني مع تنظيف النص
    const cleanEmail = (user?.email || '').toLowerCase().trim();
    const systemAdminEmail = "sweetdream711711@gmail.com";
    const testSupervisorEmail = "end2012.19+1@gmail.com"; // للاختبار المؤقت
    const isSystemAdmin = cleanEmail === systemAdminEmail;
    
    console.log('checkUserSupervisorPermissions: Clean email:', cleanEmail);
    console.log('checkUserSupervisorPermissions: System admin email:', systemAdminEmail);
    console.log('checkUserSupervisorPermissions: Is system admin:', isSystemAdmin);
    
    if (isSystemAdmin) {
      console.log('checkUserSupervisorPermissions: System admin detected');
      return {
        isSystemAdmin: true,
        isAdmin: true,
        supervisedDepartments: []
      };
    }

    // استثناء مؤقت للاختبار - إزالة هذا في الإنتاج
    if (cleanEmail === testSupervisorEmail) {
      console.log('checkUserSupervisorPermissions: Test supervisor detected (temporary exception)');
      return {
        isSystemAdmin: false,
        isAdmin: false,
        supervisedDepartments: ['general-monitoring']
      };
    }

    // جلب بيانات المستخدم
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    // تحقق إضافي من قاعدة البيانات
    if (userData?.role === 'system_admin' || userData?.isSystemAdmin === true) {
      console.log('checkUserSupervisorPermissions: System admin confirmed from database');
      return {
        isSystemAdmin: true,
        isAdmin: true,
        supervisedDepartments: []
      };
    }
    
    const isAdmin = userData?.role === 'admin';
    const isSupervisor = userData?.role === 'supervisor';

    if (isAdmin) {
      return {
        isSystemAdmin: false,
        isAdmin: true,
        supervisedDepartments: []
      };
    }

    if (isSupervisor) {
      // إذا كان مشرفاً، ابحث عن الأقسام التي يشرف عليها
      const supervisedDepartments: string[] = [];
      const departmentsSnapshot = await getDocs(collection(db, 'departments'));

      for (const deptDoc of departmentsSnapshot.docs) {
        const supervisorRef = doc(db, 'departments', deptDoc.id, 'supervisors', userId);
        const supervisorDoc = await getDoc(supervisorRef);
        
        if (supervisorDoc.exists()) {
          supervisedDepartments.push(deptDoc.id);
        }
      }

      return {
        isSystemAdmin: false,
        isAdmin: false,
        supervisedDepartments
      };
    }

    // البحث عن الأقسام التي يشرف عليها
    const supervisedDepartments: string[] = [];
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));

    for (const deptDoc of departmentsSnapshot.docs) {
      const supervisorRef = doc(db, 'departments', deptDoc.id, 'supervisors', userId);
      const supervisorDoc = await getDoc(supervisorRef);
      
      if (supervisorDoc.exists()) {
        supervisedDepartments.push(deptDoc.id);
      }
    }

    return {
      isSystemAdmin: false,
      isAdmin: false,
      supervisedDepartments
    };

  } catch (error) {
    console.error('خطأ في التحقق من الصلاحيات:', error);
    
    // في حالة الخطأ، السماح للمستخدمين المحددين بالدخول
    const user = auth.currentUser;
    const cleanEmail = (user?.email || '').toLowerCase().trim();
    const systemAdminEmail = "sweetdream711711@gmail.com";
    const testSupervisorEmail = "end2012.19+1@gmail.com";
    
    if (cleanEmail === systemAdminEmail) {
      console.log('checkUserSupervisorPermissions: Error occurred, but allowing system admin');
      return {
        isSystemAdmin: true,
        isAdmin: true,
        supervisedDepartments: []
      };
    }
    
    if (cleanEmail === testSupervisorEmail) {
      console.log('checkUserSupervisorPermissions: Error occurred, but allowing test supervisor');
      return {
        isSystemAdmin: false,
        isAdmin: false,
        supervisedDepartments: ['general-monitoring']
      };
    }
    
    return {
      isSystemAdmin: false,
      isAdmin: false,
      supervisedDepartments: []
    };
  }
}