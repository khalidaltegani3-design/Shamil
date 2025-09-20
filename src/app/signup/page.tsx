
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allDepartments } from '@/lib/departments';
import { generateEmployeeId } from '@/lib/employee-utils';

import { checkAuthState } from '@/lib/auth-check';
import Footer from '@/components/footer';

export default function SignupPage() {
  useEffect(() => {
    checkAuthState()
      .then(() => console.log('Auth check completed'))
      .catch(error => console.error('Auth check failed:', error));
  }, []);
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeDepartmentId, setHomeDepartmentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password.length < 6) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
        });
        setIsLoading(false);
        return;
    }

    if (!homeDepartmentId) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى اختيار إدارتك.",
        });
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, { displayName: name });

      try {
        // إنشاء وثيقة المستخدم في Firestore مع الرقم الوظيفي
        const employeeId = generateEmployeeId();
        
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: name,
          email: user.email,
          employeeId: employeeId,
          role: "employee",
          homeDepartmentId: homeDepartmentId,
          createdAt: new Date(),
          status: "active",
        });
        
        console.log(`تم إنشاء المستخدم بالرقم الوظيفي: ${employeeId}`);
      } catch (firestoreError) {
        // حذف المستخدم من Authentication إذا فشل إنشاء الوثيقة في Firestore
        await user.delete();
        throw new Error("فشل في إنشاء بيانات المستخدم. يرجى المحاولة مرة أخرى.");
      }
      
      // تسجيل الخروج بعد إنشاء الحساب بنجاح
      await signOut(auth);
      
      toast({
        title: "تم إنشاء الحساب بنجاح! ✅",
        description: "سيتم توجيهك إلى صفحة تسجيل الدخول...",
        duration: 3000,
      });

      // إضافة تأخير قبل التوجيه
      setTimeout(() => {
        router.push('/login/employee');
      }, 2000);

    } catch (error: any) {
      console.error("Signup error:", error);
      let description = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
      
      if (error.message === "فشل في إنشاء بيانات المستخدم. يرجى المحاولة مرة أخرى.") {
        description = error.message;
      } else if (error.code === 'auth/email-already-in-use') {
        description = "هذا البريد الإلكتروني مستخدم بالفعل.";
      } else if (error.code === 'auth/invalid-email') {
        description = "البريد الإلكتروني الذي أدخلته غير صالح.";
      } else if (error.code === 'auth/weak-password') {
        description = "كلمة المرور ضعيفة جداً. يرجى اختيار كلمة مرور أقوى.";
      } else if (error.code === 'auth/network-request-failed') {
        description = "فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.";
      }
      
      toast({
        variant: "destructive",
        title: "فشل إنشاء الحساب",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="flex flex-col items-center justify-center mb-4">
              <h1 className="text-6xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
            </div>
            <CardTitle className="text-2xl">إنشاء حساب موظف جديد</CardTitle>
            <CardDescription>
              أدخل بياناتك لإنشاء حساب في منصة البلاغات.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4 pt-4">
               <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input id="name" placeholder="أدخل اسمك" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" placeholder="user@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" placeholder="6 أحرف على الأقل" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">الإدارة التي تعمل بها</Label>
                <Select dir="rtl" onValueChange={setHomeDepartmentId} value={homeDepartmentId} required>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="اختر إدارتك" />
                  </SelectTrigger>
                  <SelectContent>
                    {allDepartments.map(dept => (
                       <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
              </Button>
              <Link href="/login/employee" passHref>
                  <Button variant="link" size="sm" className="px-0">
                      لديك حساب بالفعل؟ تسجيل الدخول
                  </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
