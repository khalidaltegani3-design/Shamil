"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Clock } from "lucide-react";
import { formatReportNumber } from '@/lib/report-utils';
import Logo from "@/components/Logo";

interface Report {
  id: string;
  reportNumber?: number; // رقم البلاغ الرقمي
  description: string;
  status: string;
  createdAt: any;
  departmentId: string;
  location?: {
    latitude: number;
    longitude: number;
    source: string;
    zone?: string;
    street?: string;
    building?: string;
  };
}

export default function EmployeeReports() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      console.log('🔍 بداية فحص تقارير الموظف...');
      console.log('📊 حالة التحميل:', loading);
      console.log('👤 المستخدم:', user?.email);
      
      if (loading) {
        console.log('⏳ ما زال يتم تحميل بيانات المصادقة...');
        return;
      }
      
      if (!user) {
        console.log('❌ لا يوجد مستخدم مسجل دخول، توجيه إلى صفحة تسجيل الدخول...');
        router.push("/login/employee");
        return;
      }

      try {
        console.log('🔄 جاري جلب التقارير للمستخدم:', user.uid);
        const q = query(
          collection(db, "reports"),
          where("createdBy", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const reportsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Report[];

        console.log('✅ تم جلب التقارير بنجاح:', reportsData.length);
        setReports(reportsData);
      } catch (error) {
        console.error("❌ خطأ في جلب التقارير:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user, loading, router]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/20 text-yellow-600";
      case "in-progress":
        return "bg-blue-500/20 text-blue-600";
      case "completed":
        return "bg-green-500/20 text-green-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("ar-QA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "قيد الانتظار";
      case "in-progress":
        return "قيد المعالجة";
      case "completed":
        return "مكتمل";
      default:
        return status;
    }
  };

  if (loading || isLoading) {
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
          <Button variant="ghost" size="icon" onClick={() => router.push("/employee/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">رجوع</span>
          </Button>
          <h1 className="text-lg font-semibold">بلاغاتي</h1>
        </div>
        <div className="flex items-center justify-center">
          <Logo size="md" />
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>قائمة البلاغات</CardTitle>
            <CardDescription>جميع البلاغات التي قمت بإنشائها</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg font-medium">لا توجد بلاغات</p>
                <p className="text-sm text-muted-foreground">لم تقم بإنشاء أي بلاغات حتى الآن</p>
                <Button className="mt-4" onClick={() => router.push("/create-report")}>
                  إنشاء بلاغ جديد
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم البلاغ</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/reports/${report.id}`)}>
                        <TableCell className="font-medium font-mono" style={{direction: 'ltr'}}>
                          {report.reportNumber ? formatReportNumber(report.reportNumber) : report.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div 
                            className="cursor-pointer transition-all duration-200 hover:bg-gray-50 p-2 rounded"
                            title="انقر لعرض النص كاملاً"
                            onClick={(e) => {
                              e.stopPropagation(); // منع تشغيل النقر على الصف
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
                        <TableCell className="max-w-[200px]">
                          <div className="text-sm">
                            {report.location ? (
                              report.location.source === 'q-address' && report.location.zone && report.location.street && report.location.building ? (
                                <div className="space-y-1">
                                  <div className="font-medium text-blue-600">
                                    العنوان القطري
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    المنطقة: {report.location.zone}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    الشارع: {report.location.street}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    المبنى: {report.location.building}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="font-medium text-green-600">
                                    الموقع اليدوي
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Lat: {report.location.latitude.toFixed(6)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Lng: {report.location.longitude.toFixed(6)}
                                  </div>
                                </div>
                              )
                            ) : (
                              <span className="text-muted-foreground text-xs">غير محدد</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(report.status)}`}>
                            {getStatusText(report.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(report.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
