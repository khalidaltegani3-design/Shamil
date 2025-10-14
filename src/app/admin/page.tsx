"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Users, Settings, Shield, Bell, Database, Trash2 } from 'lucide-react';
import Link from 'next/link';

function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (!user) {
        router.push('/login/employee');
        return;
      }

      // Check if user is admin - إضافة إيميلك للمصادقة
      const adminEmails = [
        "sweetdream711711@gmail.com",
        "khalidaltegani3@gmail.com"
      ];
      
      if (!adminEmails.includes(user.email || "")) {
        router.push('/dashboard');
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">غير مصرح لك بالوصول لهذه الصفحة</p>
        </div>
      </div>
    );
  }

  const adminEmails = [
    "sweetdream711711@gmail.com",
    "khalidaltegani3@gmail.com"
  ];

  if (!adminEmails.includes(user.email || "")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">غير مصرح لك بالوصول لهذه الصفحة</p>
          <p className="text-sm text-muted-foreground mt-2">يجب أن تكون مدير نظام للوصول لهذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">لوحة تحكم مدير النظام</h1>
          </div>
          <div className="flex items-center justify-center rounded text-sm font-semibold">
            <h1 className="text-2xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">رياني</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-muted-foreground mb-2">
            مرحباً بك في لوحة تحكم مدير النظام
          </h2>
          <p className="text-muted-foreground">
            يمكنك من هنا إدارة المستخدمين وتحديد أدوارهم وصلاحياتهم في النظام
          </p>
          <div className="mt-2 text-sm text-green-600">
            ✅ تم تسجيل الدخول كمدير: {user.email}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* إدارة المستخدمين */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                إدارة المستخدمين
              </CardTitle>
              <CardDescription>
                عرض وتعديل أدوار المستخدمين وإداراتهم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full">
                  إدارة المستخدمين
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* إدارة الإشعارات */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                إدارة الإشعارات
              </CardTitle>
              <CardDescription>
                إرسال وإدارة رسائل الإشعارات للمستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/notifications">
                <Button className="w-full">
                  إدارة الإشعارات
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* تنظيف قاعدة البيانات */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-orange-600" />
                تنظيف قاعدة البيانات
              </CardTitle>
              <CardDescription>
                فحص وإصلاح مشاكل سلامة البيانات والأرقام الوظيفية المكررة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/database-cleanup">
                <Button className="w-full" variant="outline">
                  تنظيف قاعدة البيانات
                </Button>
              </Link>
            </CardContent>
          </Card>

                 {/* حذف أرقام وظيفية محددة - مخصص لمدير النظام الأساسي فقط */}
                 {user?.email?.toLowerCase() === "sweetdream711711@gmail.com" && (
            <Card className="hover:shadow-lg transition-shadow border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  حذف أرقام وظيفية محددة
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">خاص بمدير النظام</span>
                </CardTitle>
                <CardDescription>
                  حذف أرقام وظيفية مكررة أو ناقصة: 12012354, 12010906, 12001376
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/delete-employee-ids">
                  <Button className="w-full" variant="destructive">
                    حذف الأرقام المحددة
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* إحصائيات النظام */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                الصلاحيات والأدوار
              </CardTitle>
              <CardDescription>
                معلومات حول أدوار المستخدمين والصلاحيات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>مدير النظام:</span>
                  <span className="font-semibold">صلاحيات كاملة</span>
                </div>
                <div className="flex justify-between">
                  <span>مدير:</span>
                  <span className="font-semibold">إدارة الإدارات</span>
                </div>
                <div className="flex justify-between">
                  <span>مشرف:</span>
                  <span className="font-semibold">إدارة البلاغات</span>
                </div>
                <div className="flex justify-between">
                  <span>موظف:</span>
                  <span className="font-semibold">إنشاء البلاغات</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات النظام */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                معلومات النظام
              </CardTitle>
              <CardDescription>
                معلومات عامة حول النظام وإصداره
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>الإصدار:</span>
                  <span className="font-semibold">v4.0</span>
                </div>
                <div className="flex justify-between">
                  <span>البيئة:</span>
                  <span className="font-semibold">التطوير</span>
                </div>
                <div className="flex justify-between">
                  <span>قاعدة البيانات:</span>
                  <span className="font-semibold">Firebase</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;