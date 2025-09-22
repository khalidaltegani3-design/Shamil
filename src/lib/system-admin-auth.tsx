import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { 
  SYSTEM_ADMIN_EMAIL, 
  isValidSystemAdmin, 
  validateAuthEnvironment, 
  AUTH_TIMEOUTS 
} from '@/lib/auth-config';

export function useSystemAdminCheck() {
  const [user, loading, error] = useAuthState(auth);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // التحقق من صحة البيئة عند التحميل
    validateAuthEnvironment();
    
    const checkSystemAdminStatus = async () => {
      if (loading) return;

      // إذا لم يكن هناك مستخدم مصادق عليه
      if (!user) {
        console.log('🚫 No authenticated user found, redirecting to login');
        setIsSystemAdmin(false);
        setAuthLoading(false);
        router.push('/login/employee');
        return;
      }

      try {
        console.log('🔍 Checking system admin status for user:', {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        });

        // التحقق الأولي من البريد الإلكتروني
        const isValidEmail = isValidSystemAdmin(user.email);
        console.log('📧 Email validation result:', isValidEmail);

        if (isValidEmail) {
          console.log('✅ Email match found - user is system admin');
          setIsSystemAdmin(true);
          setAuthLoading(false);
          return;
        }

        // التحقق من قاعدة البيانات مع timeout
        console.log('🔍 Checking database for additional permissions...');
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database check timeout')), AUTH_TIMEOUTS.documentLoad)
        );

        const docPromise = getDoc(doc(db, 'users', user.uid));
        const userDoc = await Promise.race([docPromise, timeoutPromise]) as any;

        if (userDoc && userDoc.exists()) {
          const userData = userDoc.data();
          console.log('📊 User data from database:', {
            role: userData.role,
            isSystemAdmin: userData.isSystemAdmin,
            email: userData.email
          });
          
          // التحقق من الدور أو العلامة في قاعدة البيانات
          if (userData.role === 'system_admin' || userData.isSystemAdmin === true) {
            console.log('✅ System admin confirmed from database');
            setIsSystemAdmin(true);
            setAuthLoading(false);
            return;
          }

          // التحقق الإضافي من البريد الإلكتروني في قاعدة البيانات
          if (isValidSystemAdmin(userData.email)) {
            console.log('✅ System admin confirmed via database email');
            setIsSystemAdmin(true);
            setAuthLoading(false);
            return;
          }
        } else {
          console.log('⚠️ No user document found in database');
        }

        // إذا لم يكن مدير نظام، توجيه للصفحة الرئيسية
        console.log('❌ User is not system admin, redirecting to home...');
        setIsSystemAdmin(false);
        setAuthLoading(false);
        router.push('/');
        
      } catch (error) {
        console.error('💥 Error checking system admin status:', error);
        setIsSystemAdmin(false);
        setAuthLoading(false);
        router.push('/');
      }
    };

    // استخدام timeout للتحقق الكامل
    const timeoutId = setTimeout(() => {
      if (authLoading) {
        console.warn('⏰ Auth check timeout, falling back to non-admin');
        setIsSystemAdmin(false);
        setAuthLoading(false);
      }
    }, AUTH_TIMEOUTS.authCheck);

    checkSystemAdminStatus().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, loading, router, authLoading]);

  return {
    user,
    loading: loading || authLoading,
    error,
    isSystemAdmin,
    isAuthenticated: !!user && isSystemAdmin
  };
}

export function withSystemAdminAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function SystemAdminAuthComponent(props: T) {
    const { isAuthenticated, loading } = useSystemAdminCheck();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري التحقق من الصلاحيات...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // سيتم التوجيه في useSystemAdminCheck
    }

    return <WrappedComponent {...props} />;
  };
}