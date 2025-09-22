/**
 * مكون محسن لحماية الصفحات بناءً على دور المستخدم
 * يتعامل مع حالات مختلفة من المصادقة والأذونات
 */
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { isValidSystemAdmin, validateAuthEnvironment, AUTH_TIMEOUTS } from '@/lib/auth-config';

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRole?: 'employee' | 'supervisor' | 'admin' | 'system_admin';
  fallbackPath?: string;
  showLoader?: boolean;
}

export function ProtectedPage({ 
  children, 
  requiredRole = 'employee', 
  fallbackPath = '/login/employee',
  showLoader = true 
}: ProtectedPageProps) {
  const [user, loading, error] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    validateAuthEnvironment();
    
    const checkUserAccess = async () => {
      try {
        // إذا كان Firebase Auth لا يزال يحمل
        if (loading) return;

        // إذا لم يكن هناك مستخدم مصادق عليه
        if (!user) {
          console.log('🚫 No authenticated user, redirecting to:', fallbackPath);
          router.push(fallbackPath);
          setIsLoading(false);
          return;
        }

        console.log('🔍 Checking access for user:', {
          uid: user.uid,
          email: user.email,
          requiredRole
        });

        let userRoleFromDb = 'employee'; // الدور الافتراضي

        // تحقق خاص لمدير النظام
        if (isValidSystemAdmin(user.email)) {
          userRoleFromDb = 'system_admin';
          console.log('✅ System admin confirmed via email');
        } else {
          // جلب دور المستخدم من قاعدة البيانات
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Database timeout')), AUTH_TIMEOUTS.documentLoad)
            );

            const docPromise = getDoc(doc(db, 'users', user.uid));
            const userDoc = await Promise.race([docPromise, timeoutPromise]) as any;

            if (userDoc && userDoc.exists()) {
              const userData = userDoc.data();
              userRoleFromDb = userData.role || 'employee';
              
              // تحقق إضافي لمدير النظام من قاعدة البيانات
              if (userData.isSystemAdmin || isValidSystemAdmin(userData.email)) {
                userRoleFromDb = 'system_admin';
              }
              
              console.log('📊 User role from database:', userRoleFromDb);
            } else {
              console.log('⚠️ No user document found, using default role: employee');
            }
          } catch (dbError) {
            console.warn('⚠️ Database check failed, using default role:', dbError);
            // في حالة فشل قاعدة البيانات، نتحقق مرة أخرى من البريد الإلكتروني
            if (isValidSystemAdmin(user.email)) {
              userRoleFromDb = 'system_admin';
            }
          }
        }

        setUserRole(userRoleFromDb);

        // التحقق من الأذونات
        const accessGranted = checkRoleAccess(userRoleFromDb, requiredRole);
        
        if (accessGranted) {
          console.log('✅ Access granted for role:', userRoleFromDb);
          setHasAccess(true);
        } else {
          console.log('❌ Access denied for role:', userRoleFromDb, 'required:', requiredRole);
          router.push('/');
        }

      } catch (error) {
        console.error('💥 Error checking user access:', error);
        router.push(fallbackPath);
      } finally {
        setIsLoading(false);
      }
    };

    // تحديد timeout للعملية الكاملة
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('⏰ Access check timeout');
        setIsLoading(false);
        router.push(fallbackPath);
      }
    }, AUTH_TIMEOUTS.authCheck);

    checkUserAccess().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, loading, router, requiredRole, fallbackPath, isLoading]);

  // عرض شاشة التحميل
  if (isLoading || loading) {
    if (!showLoader) return null;
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحقق من الصلاحيات...</p>
          {error && (
            <p className="mt-2 text-red-500 text-sm">خطأ في المصادقة: {error.message}</p>
          )}
        </div>
      </div>
    );
  }

  // عرض المحتوى إذا كان المستخدم لديه صلاحية
  if (hasAccess) {
    return <>{children}</>;
  }

  // في حالة عدم وجود صلاحية، لا نعرض شيئاً (سيتم التوجيه)
  return null;
}

/**
 * دالة للتحقق من صلاحيات الدور
 */
function checkRoleAccess(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'employee': 1,
    'supervisor': 2,
    'admin': 3,
    'system_admin': 4
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Higher-Order Component لحماية الصفحات
 */
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  requiredRole?: 'employee' | 'supervisor' | 'admin' | 'system_admin',
  fallbackPath?: string
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedPage requiredRole={requiredRole} fallbackPath={fallbackPath}>
        <WrappedComponent {...props} />
      </ProtectedPage>
    );
  };
}