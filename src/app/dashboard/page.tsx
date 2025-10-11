"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { FileText, BarChart3, Clock, User, LogOut, KeyRound, Crown, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { allDepartments } from '@/lib/departments';
import { formatReportNumber } from '@/lib/report-utils';
import AppFooter from "@/components/app-footer";
import Logo from "@/components/Logo";
import AppHeader from "@/components/AppHeader";

type Report = {
  id: string;
  reportNumber?: number; // رقم البلاغ الرقمي
  description: string;
  status: 'open' | 'closed';
  departmentId: string;
  createdAt: any;
};

function getStatusVariant(status: string): "default" | "secondary" {
    switch (status) {
        case "open": return "default";
        case "closed": return "secondary";
        default: return "default";
    }
}

function getStatusText(status: string) {
    switch (status) {
        case "open": return "مفتوح";
        case "closed": return "مغلق";
        default: return "غير معروف";
    }
}

function AppHeader() {
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <AppHeader title="لوحة المعلومات">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName || 'علي حمد'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'E-10293'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.email === "Sweetdream711711@gmail.com" && (
              <>
                <Link href="/admin">
                  <DropdownMenuItem>
                    <Crown className="ml-2 h-4 w-4" />
                    لوحة تحكم مدير النظام
                  </DropdownMenuItem>
                </Link>
                <Link href="/supervisor">
                  <DropdownMenuItem>
                    <Shield className="ml-2 h-4 w-4" />
                    لوحة المشرف
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem>
                <KeyRound className="ml-2 h-4 w-4" />
                إعادة ضبط كلمة السر
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <Link href="/" passHref>
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
    </AppHeader>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "reports"), 
        where("createdBy", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reportsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Report[];
        setReports(reportsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const openReportsCount = reports.filter(r => r.status === 'open').length;
  const totalReportsCount = reports.length;
  // Placeholder for average resolution time
  const averageResolutionTime = totalReportsCount > 0 ? "3.5 أيام" : "N/A";

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">لوحة المعلومات</h2>
          <div className="flex items-center gap-2">
            <Link href="/create-report" passHref>
              <Button>إنشاء بلاغ جديد</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <StatCard 
            title="إجمالي البلاغات" 
            value={totalReportsCount.toLocaleString('en-US')} 
            description="جميع البلاغات المقدمة من قبلك"
            icon={FileText} 
          />
          <StatCard 
            title="البلاغات المفتوحة" 
            value={openReportsCount.toLocaleString('en-US')} 
            description="بلاغات قيد المراجعة أو التنفيذ"
            icon={Clock}
          />
          <StatCard 
            title="متوسط وقت الحل" 
            value={averageResolutionTime} 
            description="معدل سرعة إغلاق البلاغات"
            icon={BarChart3}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>أحدث البلاغات</CardTitle>
            <CardDescription>نظرة سريعة على آخر بلاغات قمت بتقديمها.</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
               <div className="overflow-x-auto">
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">رقم البلاغ</TableHead>
                      <TableHead className="min-w-[200px]">وصف مختصر</TableHead>
                      <TableHead className="min-w-[120px]">الإدارة المعنية</TableHead>
                      <TableHead className="min-w-[80px]">الحالة</TableHead>
                      <TableHead className="min-w-[100px]">تاريخ الإنشاء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.slice(0, 5).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium font-mono" style={{direction: 'ltr'}}>
                          {report.reportNumber ? formatReportNumber(report.reportNumber) : `...${report.id.slice(-6)}`}
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <div 
                            className="cursor-pointer transition-all duration-200 hover:bg-gray-50 p-2 rounded"
                            title="انقر لعرض النص كاملاً"
                            onClick={(e) => {
                              const element = e.currentTarget.querySelector('.description-text');
                              if (element) {
                                element.classList.toggle('line-clamp-2');
                                element.classList.toggle('whitespace-normal');
                              }
                            }}
                          >
                            <div className="description-text line-clamp-2 text-sm leading-relaxed">
                              {report.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{allDepartments.find(d => d.id === report.departmentId)?.name || 'غير محدد'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(report.status)}>{getStatusText(report.status)}</Badge>
                        </TableCell>
                         <TableCell style={{direction: 'ltr'}}>
                          {report.createdAt?.toDate().toLocaleDateString('en-US') || 'غير محدد'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               </div>
            ) : (
               <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">لم تقم بتقديم أي بلاغات حتى الآن.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}