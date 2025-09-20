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
        setAuthLoading(false);
        router.push('/login/employee');
        return;
      }

      try {
        // تحقق من البريد الإلكتروني مع تنظيف النص
        const cleanEmail = (user.email || '').toLowerCase().trim();
        console.log('Checking system admin status for:', cleanEmail);
        console.log('Expected email:', SYSTEM_ADMIN_EMAIL);
        
        if (cleanEmail === SYSTEM_ADMIN_EMAIL) {
          console.log('Email match found - user is system admin');
          setIsSystemAdmin(true);
          setAuthLoading(false);
          return;
        }

        // تحقق إضافي من قاعدة البيانات
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data from database:', userData);
          
          if (userData.role === 'system_admin' || userData.isSystemAdmin === true) {
            console.log('System admin confirmed from database');
            setIsSystemAdmin(true);
            setAuthLoading(false);
            return;
          }
        }

        // إذا لم يكن مدير نظام، توجيه للصفحة الرئيسية
        console.log('User is not system admin, redirecting...');
        setIsSystemAdmin(false);
        setAuthLoading(false);
        router.push('/');
        
      } catch (error) {
        console.error('Error checking system admin status:', error);
        setIsSystemAdmin(false);
        setAuthLoading(false);
        router.push('/');
      }
    };

    checkSystemAdminStatus();
  }, [user, loading, router]);

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