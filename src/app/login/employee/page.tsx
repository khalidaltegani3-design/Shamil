
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import HeaderWithImage from "@/components/HeaderWithImage";
import { handleFirebaseError } from "@/lib/firebase-error-handler";
import { useLoginNotifications } from "@/hooks/useLoginNotifications";


export default function EmployeeLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { trackLoginAttempt, sendCriticalLoginNotification } = useLoginNotifications();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false); // تهيئة افتراضية

  // تحديث حالة الاتصال عند تحميل المكون في المتصفح
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }
  }, []);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);

  // مراقبة حالة الاتصال والتحقق من وقت القفل
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // التحقق من وقت القفل المخزن
    const storedLockoutEnd = localStorage.getItem('loginLockoutEnd');
    if (storedLockoutEnd) {
      const lockoutEnd = parseInt(storedLockoutEnd);
      if (lockoutEnd > Date.now()) {
        setLockoutEndTime(lockoutEnd);
      } else {
        localStorage.removeItem('loginLockoutEnd');
        localStorage.removeItem('loginAttempts');
      }
    }

    // استرجاع عدد المحاولات المخزن
    const storedAttempts = localStorage.getItem('loginAttempts');
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من وقت القفل
    if (lockoutEndTime && Date.now() < lockoutEndTime) {
      const remainingTime = Math.ceil((lockoutEndTime - Date.now()) / 1000);
      toast({
        variant: "destructive",
        title: "الحساب مقفل مؤقتاً",
        description: `يرجى الانتظار ${remainingTime} ثانية قبل المحاولة مرة أخرى`,
      });
      return;
    }

    setIsLoading(true);
    let userDoc;

    try {
      // التحقق من الاتصال بالإنترنت
      if (!navigator.onLine) {
        throw new Error("لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.");
      }

      // محاولة تسجيل الدخول
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // محاولة الوصول إلى Firestore مع استراتيجية إعادة المحاولة متقدمة
      const maxRetries = 5; // زيادة عدد المحاولات
      let retryCount = 0;
      let lastError: any;

      const retryStrategy = (attempt: number) => {
        // استراتيجية انتظار تصاعدية مع عنصر عشوائي
        const baseDelay = 1000; // تأخير أساسي 1 ثانية
        const maxDelay = 10000; // الحد الأقصى للتأخير 10 ثواني
        const jitter = Math.random() * 1000; // عنصر عشوائي لتجنب تزامن الطلبات
        return Math.min(Math.pow(2, attempt) * baseDelay + jitter, maxDelay);
      };

      while (retryCount < maxRetries) {
        try {
          if (retryCount > 0) {
            // إظهار رسالة للمستخدم عن إعادة المحاولة
            toast({
              title: "جاري إعادة المحاولة",
              description: `محاولة الاتصال بقاعدة البيانات (${retryCount + 1}/${maxRetries})`,
              duration: 3000,
            });
          }

          userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          break; // إذا نجحت العملية، نخرج من الحلقة

        } catch (firestoreError: any) {
          lastError = firestoreError;
          retryCount++;

          // التحقق من نوع الخطأ
          const errorCode = firestoreError?.code;
          if (errorCode === 'permission-denied' || errorCode === 'unauthenticated') {
            // لا داعي لإعادة المحاولة في حالة أخطاء الصلاحيات
            throw new Error("ليس لديك صلاحية الوصول إلى هذه البيانات");
          }

          if (retryCount === maxRetries) {
            console.error("Firestore connection attempts failed:", lastError);
            throw new Error("فشل الاتصال بقاعدة البيانات. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.");
          }

          // حساب وقت الانتظار قبل المحاولة التالية
          const delay = retryStrategy(retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      if (!userDoc || !userDoc.exists()) {
        await signOut(auth);
        throw new Error("لم يتم العثور على بيانات المستخدم");
      }

      const userData = userDoc.data();
      
      if (userData.role !== 'employee') {
        await signOut(auth);
        throw new Error("هذا الحساب غير مصرح له كموظف");
      }

      // نجاح تسجيل الدخول
      console.log('✅ نجح تسجيل الدخول للموظف:', userData.displayName || userData.email);
      
      // مسح عدد المحاولات الفاشلة عند النجاح
      setLoginAttempts(0);
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginLockoutEnd');
      
      toast({
        title: "تم تسجيل الدخول بنجاح ✅",
        description: `مرحباً بك ${userData.displayName || 'في منصة بلدية الريان'}`,
        duration: 2000,
      });

      // إضافة تأخير أطول قبل التوجيه للتأكد من اكتمال العملية
      setTimeout(() => {
        console.log('🔄 توجيه إلى لوحة تحكم الموظف...');
        router.push('/employee/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error("Login error:", error);
      
      // استخدام معالج الأخطاء الجديد
      const errorInfo = handleFirebaseError(error);
      let errorMessage = errorInfo.userFriendlyMessage;
      let isCredentialsError = false;
      
      // تحديد ما إذا كان الخطأ متعلقاً بالبيانات
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-email' ||
          error.code === 'auth/invalid-credential') {
        isCredentialsError = true;
      }

      // تحديث عدد المحاولات الفاشلة إذا كان الخطأ متعلقاً بالبيانات
      if (isCredentialsError) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        // تتبع محاولة تسجيل الدخول الفاشلة (معطل مؤقتاً)
        // await trackLoginAttempt(email, false);

        // تفعيل القفل المؤقت بعد 3 محاولات فاشلة
        if (newAttempts >= 3) {
          const lockoutDuration = Math.min(Math.pow(2, newAttempts - 3) * 30, 1800); // تزايد تصاعدي مع حد أقصى 30 دقيقة
          const lockoutEnd = Date.now() + (lockoutDuration * 1000);
          setLockoutEndTime(lockoutEnd);
          localStorage.setItem('loginLockoutEnd', lockoutEnd.toString());
          
          errorMessage = `تم قفل تسجيل الدخول مؤقتاً لمدة ${Math.floor(lockoutDuration / 60)} دقيقة و ${lockoutDuration % 60} ثانية`;
          
          // إرسال إشعار عاجل للمستخدم (معطل مؤقتاً)
          // await sendCriticalLoginNotification(email, 0);
        } else {
          const remainingAttempts = 3 - newAttempts;
          errorMessage += `. المحاولات المتبقية: ${remainingAttempts}`;
          
          // إرسال إشعار إذا تبقى محاولة واحدة فقط (معطل مؤقتاً)
          // if (remainingAttempts === 1) {
          //   await sendCriticalLoginNotification(email, remainingAttempts);
          // }
        }
      }

      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <HeaderWithImage />
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/')}
                className="self-start"
                title="العودة لاختيار نوع الحساب"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="flex flex-col items-center justify-center flex-1">
                <Logo size="xl" showText={false} />
              </div>
              <div className="w-10"></div> {/* للمحاذاة */}
            </div>
            <CardTitle>تسجيل دخول الموظف</CardTitle>
            <CardDescription>
              منصة البلاغات الداخلية
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" placeholder="أدخل البريد الإلكتروني" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" placeholder="أدخل كلمة المرور" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
              
              <div className="text-center">
                <Link href="/forgot-password" passHref>
                  <Button variant="link" size="sm" className="text-sm text-muted-foreground hover:text-primary">
                    نسيت كلمة المرور؟
                  </Button>
                </Link>
              </div>
              
              <div className="flex justify-between w-full">
                  <Link href="/signup" passHref>
                      <Button variant="link" size="sm" className="px-0">
                          إنشاء حساب جديد
                      </Button>
                  </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
