"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkUserRole = async () => {
      console.log('🔍 فحص دور المستخدم في لوحة تحكم الموظف...');
      
      if (loading) {
        console.log('⏳ جاري تحميل بيانات المصادقة...');
        return;
      }
      
      if (!user) {
        console.log('❌ لا يوجد مستخدم مسجل دخول، توجيه إلى صفحة تسجيل الدخول...');
        router.push("/login/employee");
        return;
      }

      try {
        console.log('🔄 جاري جلب بيانات المستخدم من Firestore...');
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          console.log('❌ لم يتم العثور على بيانات المستخدم في قاعدة البيانات');
          await signOut(auth);
          router.push("/login/employee");
          return;
        }

        const userData = userDoc.data();
        console.log('👤 بيانات المستخدم:', { role: userData.role, displayName: userData.displayName });
        
        if (userData.role !== "employee") {
          console.log('❌ المستخدم ليس موظف، تسجيل خروج وتوجيه...');
          await signOut(auth);
          router.push("/login/employee");
          return;
        }

        console.log('✅ تأكد دور الموظف، تحديث اسم المستخدم...');
        setUserName(userData.displayName || userData.name || user.displayName || user.email || "");
        
      } catch (error) {
        console.error('❌ خطأ في فحص بيانات المستخدم:', error);
        await signOut(auth);
        router.push("/login/employee");
      }
    };

    checkUserRole();
  }, [user, loading, router]);

  const handleCreateReport = () => {
    router.push("/create-report");
  };

  const handleViewReports = () => {
    router.push("/employee/reports");
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login/employee");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">لوحة تحكم الموظف</h1>
        </div>
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">تسجيل الخروج</span>
        </Button>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>مرحباً، {userName}</CardTitle>
            <CardDescription>يمكنك إنشاء وإدارة البلاغات من هنا</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={handleCreateReport}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                إنشاء بلاغ جديد
              </CardTitle>
              <CardDescription>قم بإنشاء بلاغ جديد وتحديد موقعه على الخريطة</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={handleViewReports}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                بلاغاتي
              </CardTitle>
              <CardDescription>عرض وإدارة البلاغات التي قمت بإنشائها</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}