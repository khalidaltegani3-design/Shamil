
"use client";

import Link from "next/link";
import {
  Bell,
  Home,
  Users,
  LogOut,
  Settings,
  Menu,
  Search,
  Trophy,
  KeyRound,
  Crown,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User as UserIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SupervisorAuth, checkUserSupervisorPermissions } from '@/lib/supervisor-auth';
import AppFooter from "@/components/app-footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/footer";


interface UserData {
  role?: string;
  email?: string;
  displayName?: string;
  homeDepartmentId?: string;
}

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [hasNotification, setHasNotification] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState({
    isSystemAdmin: false,
    isAdmin: false,
    supervisedDepartments: [] as string[]
  });

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      try {
        // تحقق من الصلاحيات
        const permissions = await checkUserSupervisorPermissions(user.uid);
        setUserPermissions(permissions);

        // جلب بيانات المستخدم
        if (permissions.isSystemAdmin) {
          setUserData({
            role: 'system_admin',
            email: user.email || '',
            displayName: user.displayName || 'مدير النظام'
          });
        } else {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
      }
    }

    loadUserData();
  }, [user]);

  const isAdmin = userPermissions.isSystemAdmin || userPermissions.isAdmin;
  const displayName = userData?.displayName || user?.displayName || 'المستخدم';
  const userEmail = userData?.email || user?.email || 'غير محدد';

  return (
    <SupervisorAuth>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]" dir="rtl">
      <div className="hidden border-l bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/supervisor" className="flex items-center gap-2 font-semibold">
              <h1 className="text-2xl md:text-3xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
            </Link>
             <div className="mr-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 relative" onClick={() => setHasNotification(false)}>
                      <Bell className="h-4 w-4" />
                       {hasNotification && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />}
                      <span className="sr-only">Toggle notifications</span>
                    </Button>
                  </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                    <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <div className="flex flex-col">
                            <p className="font-semibold">بلاغ جديد</p>
                            <p className="text-xs text-muted-foreground">تم إنشاء بلاغ جديد في قسم الصيانة.</p>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/supervisor"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                لوحة المعلومات
              </Link>
              {userPermissions.isSystemAdmin && (
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Crown className="h-4 w-4" />
                  إدارة المستخدمين (مدير النظام)
                </Link>
              )}
              {isAdmin && !userPermissions.isSystemAdmin && (
                 <Link
                  href="/supervisor/users"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Users className="h-4 w-4" />
                  إدارة المستخدمين
                </Link>
              )}
               {isAdmin && (
                <Link
                  href="/supervisor/gamification"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Trophy className="h-4 w-4" />
                  النقاط والمكافآت
                </Link>
              )}
               {isAdmin && (
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </Link>
              )}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>تحتاج مساعدة؟</CardTitle>
                <CardDescription>
                  تواصل مع الدعم الفني لأي استفسارات.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  تواصل معنا
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col min-h-screen">
         <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Collapsible
              open={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
              className="md:hidden"
            >
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <nav className="absolute right-4 left-4 mt-2 grid gap-2 text-lg font-medium bg-card p-4 border rounded-lg shadow-lg z-50">
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                      <h1 className="text-2xl md:text-3xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
                    </Link>
                    <Link
                        href="/supervisor"
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                         onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Home className="h-5 w-5" />
                        لوحة المعلومات
                    </Link>
                    {userPermissions.isSystemAdmin && (
                    <Link
                        href="/admin/users"
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                         onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Crown className="h-5 w-5" />
                        إدارة المستخدمين (مدير النظام)
                    </Link>
                    )}
                    {isAdmin && !userPermissions.isSystemAdmin && (
                    <Link
                        href="/supervisor/users"
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                         onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Users className="h-5 w-5" />
                        إدارة المستخدمين
                    </Link>
                    )}
                    {isAdmin && (
                    <Link
                        href="/supervisor/gamification"
                        className="mx-[-0.65den] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                         onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Trophy className="h-5 w-5" />
                        النقاط والمكافآت
                    </Link>
                    )}
                    {isAdmin && (
                    <Link
                        href="#"
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                         onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Settings className="h-5 w-5" />
                        الإعدادات
                    </Link>
                    )}
                </nav>
              </CollapsibleContent>
            </Collapsible>


            <div className="w-full flex-1">
                 <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold hidden md:block">صندوق البلاغات</h1>
                </div>
            </div>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                    </p>
                    {userPermissions.isSystemAdmin && (
                      <p className="text-xs text-primary font-medium">مدير النظام</p>
                    )}
                    {userPermissions.isAdmin && !userPermissions.isSystemAdmin && (
                      <p className="text-xs text-primary font-medium">مدير عام</p>
                    )}
                    {userPermissions.supervisedDepartments.length > 0 && !userPermissions.isAdmin && (
                      <p className="text-xs text-primary font-medium">مشرف</p>
                    )}
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <KeyRound className="ml-2 h-4 w-4" />
                    إعادة ضبط كلمة السر
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => auth.signOut()}>
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
        </main>
        <AppFooter />
      </div>
    </div>
    </SupervisorAuth>
  );
}

    