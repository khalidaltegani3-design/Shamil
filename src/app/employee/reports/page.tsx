"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Clock, Loader2, RefreshCw } from "lucide-react";
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const reportsCacheRef = useRef<Report[]>([]);
  const storageKey = useMemo(() => (user ? `employee-reports-${user.uid}` : null), [user]);

  useEffect(() => {
    const pathsToPrefetch = ["/create-report", "/employee/dashboard"];
    pathsToPrefetch.forEach((path) => {
      try {
        router.prefetch(path);
      } catch (error) {
        console.warn(`تعذر تنفيذ prefetch للمسار ${path}:`, error);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") {
      reportsCacheRef.current = [];
      setReports([]);
      setIsLoading(true);
      return;
    }

    try {
      const cachedData = sessionStorage.getItem(storageKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData) as Report[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          reportsCacheRef.current = parsed;
          setReports(parsed);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.warn("⚠️ تعذّر قراءة بيانات البلاغات المخزنة مؤقتاً:", error);
    }
  }, [storageKey]);

  const navigateWithLoader = useCallback(
    (action: () => Promise<void> | void) => {
      if (isNavigating) return;
      setIsNavigating(true);
      try {
        const result = action();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error("Navigation error:", error);
            setIsNavigating(false);
          });
        }
      } catch (error) {
        console.error("Navigation error:", error);
        setIsNavigating(false);
      }
    },
    [isNavigating]
  );

  const loadReports = useCallback(
    async ({ forceSkeleton = false }: { forceSkeleton?: boolean } = {}) => {
      if (!user || !storageKey) return;

      const shouldShowSkeleton = forceSkeleton || reportsCacheRef.current.length === 0;

      if (shouldShowSkeleton) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const reportsQuery = query(
          collection(db, "reports"),
          where("createdBy", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(50)
        );

        const querySnapshot = await getDocs(reportsQuery);
        const reportsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Report[];

        reportsCacheRef.current = reportsData;

        if (typeof window !== "undefined") {
          sessionStorage.setItem(storageKey, JSON.stringify(reportsData));
        }

        startTransition(() => {
          setReports(reportsData);
        });
      } catch (error) {
        console.error("❌ خطأ في جلب التقارير:", error);
      } finally {
        if (shouldShowSkeleton) {
          setIsLoading(false);
        }
        setIsRefreshing(false);
      }
    },
    [storageKey, user]
  );

  useEffect(() => {
    const ensureReports = async () => {
      console.log('🔍 بداية فحص تقارير الموظف...');
      console.log('📊 حالة التحميل:', loading);
      console.log('👤 المستخدم:', user?.email);
      
      if (loading) {
        console.log('⏳ ما زال يتم تحميل بيانات المصادقة...');
        return;
      }
      
      if (!user) {
        console.log('❌ لا يوجد مستخدم مسجل دخول، توجيه إلى صفحة تسجيل الدخول...');
        navigateWithLoader(() => {
          router.push("/login/employee");
        });
        return;
      }

      loadReports({ forceSkeleton: reportsCacheRef.current.length === 0 });
    };

    ensureReports();
  }, [user, loading, router, navigateWithLoader, loadReports]);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigateWithLoader(() => {
                router.push("/employee/dashboard");
              })
            }
          >
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
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>قائمة البلاغات</CardTitle>
              <CardDescription>جميع البلاغات التي قمت بإنشائها</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {isRefreshing && (
                <span className="text-center text-xs text-muted-foreground sm:text-right">
                  جارٍ تحديث البيانات...
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => loadReports({ forceSkeleton: reportsCacheRef.current.length === 0 })}
                disabled={isRefreshing || isLoading}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>تحديث القائمة</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg font-medium">لا توجد بلاغات</p>
                <p className="text-sm text-muted-foreground">لم تقم بإنشاء أي بلاغات حتى الآن</p>
                <Button
                  className="mt-4"
                  onClick={() =>
                    navigateWithLoader(() => {
                      router.push("/create-report");
                    })
                  }
                >
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
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          navigateWithLoader(() => {
                            router.push(`/reports/${report.id}`);
                          })
                        }
                      >
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
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
          <p className="text-white text-sm md:text-base">جارٍ تحميل البيانات...</p>
        </div>
      )}
    </div>
  );
}
