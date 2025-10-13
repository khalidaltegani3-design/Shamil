"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Save, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { allDepartments } from '@/lib/departments';
import { validateEmployeeId, checkEmployeeIdUniqueness } from '@/lib/employee-utils';
import Logo from "@/components/Logo";

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  employeeId?: string;
  role: string;
  homeDepartmentId: string;
  status: string;
  createdAt: any;
}

export default function EmployeeProfile() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [homeDepartmentId, setHomeDepartmentId] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔍 تحميل بيانات المستخدم في البروفايل...');
      
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

        const data = userDoc.data() as UserData;
        console.log('👤 بيانات المستخدم:', { role: data.role, displayName: data.displayName });
        
        if (data.role !== "employee") {
          console.log('❌ المستخدم ليس موظف، تسجيل خروج وتوجيه...');
          await signOut(auth);
          router.push("/login/employee");
          return;
        }

        console.log('✅ تحميل بيانات الموظف بنجاح');
        setUserData(data);
        setDisplayName(data.displayName || "");
        setEmployeeId(data.employeeId || "");
        setHomeDepartmentId(data.homeDepartmentId || "");
        
      } catch (error) {
        console.error('❌ خطأ في تحميل بيانات المستخدم:', error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في تحميل بيانات المستخدم"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, loading, router, toast]);

  const handleSave = async () => {
    if (!user || !userData) return;

    // التحقق من البيانات
    if (!displayName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال الاسم الكامل"
      });
      return;
    }

    if (!homeDepartmentId) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار الإدارة"
      });
      return;
    }

    // التحقق من الرقم الوظيفي إذا تم إدخاله أو تم تغييره
    if (employeeId.trim()) {
      if (!validateEmployeeId(employeeId.trim())) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "الرقم الوظيفي غير صحيح. يجب أن يحتوي على أرقام وحروف فقط."
        });
        return;
      }

      // التحقق من التفرد إذا تم تغيير الرقم الوظيفي
      if (employeeId.trim() !== userData.employeeId) {
        const isUnique = await checkEmployeeIdUniqueness(employeeId.trim());
        if (!isUnique) {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "هذا الرقم الوظيفي مستخدم بالفعل. يرجى إدخال رقم وظيفي آخر."
          });
          return;
        }
      }
    }

    setIsSaving(true);

    try {
      const updateData: any = {
        displayName: displayName.trim(),
        homeDepartmentId: homeDepartmentId,
      };

      // إضافة الرقم الوظيفي فقط إذا تم إدخاله
      if (employeeId.trim()) {
        updateData.employeeId = employeeId.trim();
      }

      await updateDoc(doc(db, "users", user.uid), updateData);
      
      // تحديث البيانات المحلية
      setUserData(prev => prev ? { ...prev, ...updateData } : null);

      toast({
        title: "تم الحفظ بنجاح! ✅",
        description: "تم تحديث بياناتك الشخصية"
      });

    } catch (error) {
      console.error('❌ خطأ في حفظ البيانات:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حفظ البيانات. يرجى المحاولة مرة أخرى."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login/employee");
  };

  const handleBackToDashboard = () => {
    router.push("/employee/dashboard");
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">خطأ في تحميل البيانات</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">العودة للوحة التحكم</span>
          </Button>
          <h1 className="text-lg font-semibold">الملف الشخصي</h1>
        </div>
        <div className="flex items-center justify-center">
          <Logo size="md" />
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">تسجيل الخروج</span>
        </Button>
      </header>

      <main className="container mx-auto p-4 md:p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              بياناتي الشخصية
            </CardTitle>
            <CardDescription>
              يمكنك تحديث بياناتك الشخصية وإضافة رقمك الوظيفي إذا لم يكن موجوداً
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email" 
                value={userData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">الاسم الكامل</Label>
              <Input 
                id="displayName" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">الرقم الوظيفي</Label>
              <Input 
                id="employeeId" 
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder={userData.employeeId ? "موجود بالفعل" : "أدخل رقمك الوظيفي"}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {userData.employeeId 
                  ? "يمكنك تحديث رقمك الوظيفي إذا لزم الأمر"
                  : "أدخل رقمك الوظيفي كما يظهر في كشوف المرتبات"
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">الإدارة التي تعمل بها</Label>
              <Select 
                dir="rtl" 
                onValueChange={setHomeDepartmentId} 
                value={homeDepartmentId}
              >
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

            <div className="space-y-2">
              <Label>معلومات إضافية</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">الدور:</span>
                  <span className="mr-2 font-medium">موظف</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الحالة:</span>
                  <span className="mr-2 font-medium text-green-600">نشط</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                  <span className="mr-2 font-medium">
                    {userData.createdAt?.toDate?.()?.toLocaleDateString('ar-SA') || 'غير محدد'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                <Save className="h-4 w-4 ml-2" />
                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
              <Button variant="outline" onClick={handleBackToDashboard}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}