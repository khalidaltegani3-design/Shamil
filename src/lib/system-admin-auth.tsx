import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

const SYSTEM_ADMIN_EMAIL = "sweetdream711711@gmail.com";

export function useSystemAdminCheck() {
  const [user, loading, error] = useAuthState(auth);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSystemAdminStatus = async () => {
      if (loading) return;

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
        const cleanEmail = (user.email || '').toLowerCase().trim();
        const isValidEmail = cleanEmail === SYSTEM_ADMIN_EMAIL;
        console.log('📧 Email validation result:', isValidEmail);

        if (isValidEmail) {
          console.log('✅ Email match found - user is system admin');
          setIsSystemAdmin(true);
          setAuthLoading(false);
          return;
        }

        // التحقق من قاعدة البيانات
        console.log('🔍 Checking database for additional permissions...');
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));

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
            const dbEmailClean = (userData.email || '').toLowerCase().trim();
            if (dbEmailClean === SYSTEM_ADMIN_EMAIL) {
              console.log('✅ System admin confirmed via database email');
              setIsSystemAdmin(true);
              setAuthLoading(false);
              return;
            }
          } else {
            console.log('⚠️ No user document found in database');
          }
        } catch (dbError) {
          console.error('💥 Database error:', dbError);
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
    }, 15000); // 15 ثانية

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