
"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { ensureSystemAdminExists } from '@/lib/ensure-system-admin';
import Footer from '@/components/footer';

export default function SupervisorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const checkSupervisorPermissions = async (userId: string, userEmail: string) => {
    try {
      // تحقق من كونه مدير النظام أولاً - أولوية قصوى
      const cleanEmail = (userEmail || '').toLowerCase().trim();
      if (cleanEmail === "sweetdream711711@gmail.com") {
        console.log('System admin detected:', userEmail);
        return true;
      }

      // تحقق من بيانات المستخدم في Firestore
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('User document does not exist in Firestore');
        return false;
      }

      const userData = userDoc.data();
      console.log('User data from Firestore:', userData);
      
      // تحقق من كونه مدير نظام
      if (userData.role === 'system_admin' || userData.isSystemAdmin === true) {
        console.log('User is system admin');
        return true;
      }
      
      // تحقق من كونه مدير عام
      if (userData.role === 'admin') {
        console.log('User is admin');
        return true;
      }

      // تحقق من كونه مشرف (من وثيقة المستخدم)
      if (userData.role === 'supervisor') {
        console.log('User is supervisor (from user document)');
        return true;
      }

      // تحقق من كونه مشرف في أي إدارة
      const departmentsSnapshot = await getDocs(collection(db, 'departments'));
      
      for (const deptDoc of departmentsSnapshot.docs) {
        const supervisorSnapshot = await getDocs(collection(db, 'departments', deptDoc.id, 'supervisors'));
        
        for (const supervisorDoc of supervisorSnapshot.docs) {
          if (supervisorDoc.id === userId) {
            console.log('User is supervisor of department:', deptDoc.id);
            return true;
          }
        }
      }

      console.log('User has no supervisor permissions');
      return false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      // في حالة الخطأ، السماح لمدير النظام بالدخول
      const cleanEmail = (userEmail || '').toLowerCase().trim();
      if (cleanEmail === "sweetdream711711@gmail.com") {
        return true;
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase login successful for:', user.email);

      // تحقق خاص لمدير النظام - بأولوية قصوى مع تنظيف البريد الإلكتروني
      const cleanEmail = (user.email || '').toLowerCase().trim();
      const systemAdminEmail = "sweetdream711711@gmail.com";
      
      console.log('Clean email:', cleanEmail);
      console.log('System admin email:', systemAdminEmail);
      console.log('Emails match:', cleanEmail === systemAdminEmail);
      
      if (cleanEmail === systemAdminEmail) {
        console.log('System admin login confirmed, ensuring document exists');
        
        // ضمان وجود وثيقة مدير النظام
        await ensureSystemAdminExists();
        
        console.log('Redirecting system admin to supervisor panel');
        router.push('/supervisor');
        return;
      }

      // تحقق من صلاحيات الإشراف للمستخدمين الآخرين
      console.log('Checking supervisor permissions for:', user.email);
      const hasPermission = await checkSupervisorPermissions(user.uid, user.email || '');

      if (!hasPermission) {
        await auth.signOut(); // تسجيل خروج فوري
        setError('ليس لديك صلاحية للوصول إلى لوحة الإشراف. تواصل مع مدير النظام للحصول على الصلاحيات المطلوبة.');
        setLoading(false);
        return;
      }

      // إذا كان لديه صلاحيات، توجه إلى لوحة المشرف
      console.log('Permissions verified, redirecting to supervisor panel');
      router.push('/supervisor');
      
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('البريد الإلكتروني غير مسجل في النظام');
          break;
        case 'auth/wrong-password':
          setError('كلمة المرور غير صحيحة');
          break;
        case 'auth/invalid-email':
          setError('البريد الإلكتروني غير صالح');
          break;
        case 'auth/user-disabled':
          setError('تم إيقاف هذا الحساب. تواصل مع مدير النظام');
          break;
        case 'auth/too-many-requests':
          setError('تم تجاوز عدد المحاولات المسموحة. حاول مرة أخرى لاحقاً');
          break;
        default:
          setError('حدث خطأ في تسجيل الدخول. تأكد من صحة البيانات');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <div className="flex-1 flex items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">شامل</h1>
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">تسجيل دخول المشرفين</CardTitle>
              <CardDescription>
                قم بتسجيل الدخول للوصول إلى لوحة الإشراف
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
                
                <div className="text-center">
                  <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                
                <div className="text-center">
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                    العودة لتسجيل دخول الموظفين
                  </Link>
                </div>
              </div>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">للحصول على صلاحية الإشراف:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• تواصل مع مدير النظام</li>
                <li>• اطلب إضافتك كمشرف على إدارة معينة</li>
                <li>• أو طلب ترقيتك لمدير عام</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

    