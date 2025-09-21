"use client";

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';
import { ensureSystemAdminExists } from '@/lib/ensure-system-admin';
import { getSupervisorData } from '@/lib/supervisor-management';

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

// دالة لإنشاء وثيقة المستخدم تلقائياً
async function ensureUserDocumentExists(user: any): Promise<UserData> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      console.log('User document exists:', userDoc.data());
      return userDoc.data() as UserData;
    }

    // إنشاء وثيقة المستخدم إذا لم تكن موجودة
    console.log('Creating user document for:', user.email);
    
    const cleanEmail = (user.email || '').toLowerCase().trim();
    let userRole = 'employee'; // الدور الافتراضي
    let isSystemAdmin = false;
    
    // تحديد الدور بناءً على البريد الإلكتروني
    if (cleanEmail === "sweetdream711711@gmail.com") {
      userRole = 'system_admin';
      isSystemAdmin = true;
      console.log('Assigning system_admin role to:', cleanEmail);
    } else if (cleanEmail === "end2012.19+1@gmail.com") {
      userRole = 'supervisor';
    } else if (cleanEmail.endsWith('.admin@gmail.com') || cleanEmail.includes('.admin')) {
      userRole = 'admin';
    }

    const userData: UserData = {
      role: userRole,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'مستخدم',
      homeDepartmentId: userRole === 'supervisor' ? 'general-monitoring' : 'general-monitoring',
      isSystemAdmin: isSystemAdmin
    };

    // إنشاء وثيقة المستخدم
    await setDoc(userDocRef, {
      uid: user.uid,
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      createdBy: 'auto_registration',
      employeeId: `EMP-${Date.now().toString().slice(-6)}`
    });

    console.log('✅ User document created successfully:', userData);
    return userData;

  } catch (error) {
    console.error('❌ Error ensuring user document exists:', error);
    
    // في حالة الخطأ، إرجاع بيانات بناءً على الإيميل
    const cleanEmail = (user.email || '').toLowerCase().trim();
    let role = 'employee';
    let isSystemAdmin = false;
    
    if (cleanEmail === "sweetdream711711@gmail.com") {
      role = 'system_admin';
      isSystemAdmin = true;
    } else if (cleanEmail === "end2012.19+1@gmail.com") {
      role = 'supervisor';
    }
    
    return {
      role: role,
      email: user.email || '',
      displayName: user.displayName || 'مستخدم',
      homeDepartmentId: 'general-monitoring',
      isSystemAdmin: isSystemAdmin
    };
  }
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
        console.log('🔍 SupervisorAuth: Checking permissions for user:', user.email);
        
        // فحص مباشر بناءً على الإيميل أولاً (للمدراء المعروفين)
        const cleanEmail = (user.email || '').toLowerCase().trim();
        if (cleanEmail === "sweetdream711711@gmail.com") {
          console.log('✅ SupervisorAuth: System admin access granted via email');
          setHasPermission(true);
          setIsLoading(false);
          
          // إنشاء وثيقة المستخدم في الخلفية
          ensureUserDocumentExists(user).then(userData => {
            setUserData(userData);
          }).catch(err => {
            console.error('Background user document creation failed:', err);
          });
          
          return;
        }
        
        // ضمان وجود وثيقة المستخدم وجلب البيانات
        const userData = await ensureUserDocumentExists(user);
        setUserData(userData);
        
        console.log('📋 SupervisorAuth: User data:', userData);
        console.log('🎭 SupervisorAuth: User role:', userData.role);

        // تحقق من مدير النظام
        if (userData.role === 'system_admin' || userData.isSystemAdmin === true) {
          console.log('✅ SupervisorAuth: System admin access granted');
          setHasPermission(true);
          setIsLoading(false);
          return;
        }

        // تحقق من المدير العام
        if (userData.role === 'admin') {
          console.log('✅ SupervisorAuth: Admin access granted');
          setHasPermission(true);
          setIsLoading(false);
          return;
        }

        // تحقق من المشرف
        if (userData.role === 'supervisor') {
          console.log('✅ SupervisorAuth: Supervisor access granted');
          setHasPermission(true);
          setIsLoading(false);
          return;
        }

        // إذا كان الدور غير مخول، منع الوصول
        console.log('❌ SupervisorAuth: Access denied - insufficient role:', userData.role);
        setHasPermission(false);
        setIsLoading(false);

      } catch (error) {
        console.error('❌ خطأ في التحقق من صلاحيات الإشراف:', error);
        
        // في حالة الخطأ، فحص الإيميل مباشرة
        const cleanEmail = (user.email || '').toLowerCase().trim();
        if (cleanEmail === "sweetdream711711@gmail.com") {
          console.log('✅ SupervisorAuth: Emergency access granted via email for system admin');
          setHasPermission(true);
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
    if (!user) {
      return {
        isSystemAdmin: false,
        isAdmin: false,
        supervisedDepartments: []
      };
    }

    console.log('🔍 checkUserSupervisorPermissions: Checking for user ID:', userId);
    
    // فحص مباشر بناءً على الإيميل أولاً
    const cleanEmail = (user.email || '').toLowerCase().trim();
    if (cleanEmail === "sweetdream711711@gmail.com") {
      console.log('✅ checkUserSupervisorPermissions: System admin detected via email');
      return {
        isSystemAdmin: true,
        isAdmin: true,
        supervisedDepartments: []
      };
    }
    
    // ضمان وجود وثيقة المستخدم
    const userData = await ensureUserDocumentExists(user);
    
    console.log('📋 checkUserSupervisorPermissions: User data:', userData);
    
    // تحقق من مدير النظام
    if (userData.role === 'system_admin' || userData.isSystemAdmin === true) {
      console.log('✅ checkUserSupervisorPermissions: System admin detected');
      return {
        isSystemAdmin: true,
        isAdmin: true,
        supervisedDepartments: []
      };
    }

    // تحقق من المدير العام
    if (userData.role === 'admin') {
      console.log('✅ checkUserSupervisorPermissions: Admin detected');
      return {
        isSystemAdmin: false,
        isAdmin: true,
        supervisedDepartments: []
      };
    }

    // تحقق من المشرف
    if (userData.role === 'supervisor') {
      console.log('✅ checkUserSupervisorPermissions: Supervisor detected');
      
      // محاولة جلب الأقسام المشرف عليها
      try {
        const supervisorData = await getSupervisorData(userId);
        if (supervisorData && supervisorData.assignedDepartments) {
          return {
            isSystemAdmin: false,
            isAdmin: false,
            supervisedDepartments: supervisorData.assignedDepartments
          };
        }
      } catch (error) {
        console.log('checkUserSupervisorPermissions: Error getting supervisor data, using default department');
      }
      
      // إذا لم نجد أقسام محددة، إعطاء قسم افتراضي
      return {
        isSystemAdmin: false,
        isAdmin: false,
        supervisedDepartments: ['general-monitoring']
      };
    }

    // موظف عادي - لا توجد صلاحيات خاصة
    return {
      isSystemAdmin: false,
      isAdmin: false,
      supervisedDepartments: []
    };

  } catch (error) {
    console.error('❌ خطأ في التحقق من الصلاحيات:', error);
    
    // في حالة الخطأ، فحص الإيميل مباشرة
    const user = auth.currentUser;
    if (user) {
      const cleanEmail = (user.email || '').toLowerCase().trim();
      if (cleanEmail === "sweetdream711711@gmail.com") {
        console.log('✅ checkUserSupervisorPermissions: Emergency system admin access via email');
        return {
          isSystemAdmin: true,
          isAdmin: true,
          supervisedDepartments: []
        };
      }
    }
    
    return {
      isSystemAdmin: false,
      isAdmin: false,
      supervisedDepartments: []
    };
  }
}