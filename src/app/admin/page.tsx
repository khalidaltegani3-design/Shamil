"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { withSystemAdminAuth } from '@/lib/system-admin-auth';
import { Crown, Users, Settings, Shield } from 'lucide-react';
import Link from 'next/link';

function AdminDashboard() {
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
            <h1 className="text-2xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
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
                  <span className="font-semibold">مراجعة البلاغات</span>
                </div>
                <div className="flex justify-between">
                  <span>موظف:</span>
                  <span className="font-semibold">إنشاء البلاغات</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إعدادات النظام */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                إعدادات النظام
              </CardTitle>
              <CardDescription>
                إعدادات عامة للنظام والصلاحيات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                قريباً...
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* معلومات مدير النظام */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              معلومات مدير النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">الصلاحيات المتاحة:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>عرض جميع المستخدمين في النظام</li>
                  <li>تغيير أدوار المستخدمين (موظف، مشرف، مدير)</li>
                  <li>تحديد إدارة كل مستخدم</li>
                  <li>حذف المستخدمين من النظام</li>
                  <li>الوصول إلى جميع أجزاء النظام</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">الأدوار المتاحة:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>موظف:</strong> يمكنه إنشاء بلاغات للإدارات الأخرى</li>
                  <li><strong>مشرف:</strong> يمكنه مراجعة وإغلاق البلاغات</li>
                  <li><strong>مدير:</strong> يمكنه إدارة الإدارات والمشرفين</li>
                  <li><strong>مدير النظام:</strong> صلاحيات كاملة على النظام</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default withSystemAdminAuth(AdminDashboard);