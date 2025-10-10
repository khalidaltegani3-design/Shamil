
"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, orderBy, getDoc, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from 'react-firebase-hooks/auth';
import { checkUserSupervisorPermissions } from "@/lib/supervisor-auth";
import { signOut } from "firebase/auth";
import {
  ListFilter,
  MoreHorizontal,
  Crown,
  Users,
  Settings,
  AlertTriangle,
  BarChart3,
  Download,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { allDepartments } from "@/lib/departments";
import { formatReportNumber } from '@/lib/report-utils';
import { ExpandableCell } from '@/components/ui/expandable-cell';
import { AdvancedFilters, type ReportFilters } from '@/components/supervisor/advanced-filters';
import { ExportReports } from '@/components/supervisor/export-reports';
import { ReportsStatistics } from '@/components/supervisor/reports-statistics';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';

type ReportLocation = {
  latitude: number;
  longitude: number;
  source: "manual" | "q-address";
  description?: string;
  zone?: string;
  street?: string;
  building?: string;
};

type Report = {
    id: string;
    reportNumber?: number; // رقم البلاغ الرقمي
    surveyNumber?: string; // الرقم المساحي (اختياري)
    subject: string; // الموضوع
    description: string;
    status: "open" | "closed";
    submitterId: string;
    submitterName?: string; // اسم المُبلغ للفلترة والتصدير
    submitterEmployeeId?: string; // الرقم الوظيفي للموظف
    createdAt: any; // Firestore timestamp
    departmentId: string;
    location: ReportLocation;
    closedAt?: any; // تاريخ الإغلاق
    closedBy?: string; // من قام بالإغلاق
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

function formatLocation(location: ReportLocation): string {
    if (location.source === 'q-address' && location.zone && location.street && location.building) {
      return `عنواني: ${location.zone}/${location.street}/${location.building}`;
    }
    if (location.description) {
      return location.description;
    }
    return `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`;
}


function ReportActions({ report, onUpdate }: { report: Report, onUpdate: (reportId: string, newStatus: "closed") => void }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const markAsClosed = async () => {
    if (loading || report.status !== "open" || !user) {
        if (!user) {
             toast({
                variant: "destructive",
                title: "خطأ",
                description: "يجب تسجيل الدخول أولاً."
            });
        }
        return;
    }
    
    setLoading(true);

    try {
      const reportRef = doc(db, "reports", report.id);
      await updateDoc(reportRef, {
        status: "closed",
        closedBy: user.uid, 
        closedAt: serverTimestamp(),
      });
      
      onUpdate(report.id, "closed"); // This updates the local state
      
      toast({
          variant: "default",
          title: "تم بنجاح",
          description: `تم إغلاق البلاغ رقم ${report.reportNumber ? formatReportNumber(report.reportNumber) : `...${report.id.slice(-6)}`}`,
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "فشل",
        description: "تعذّر إغلاق البلاغ. قد لا تملك الصلاحية أو حدث خطأ في الشبكة.",
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-haspopup="true"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
         <Link href={`/supervisor/report/${report.id}`} passHref>
            <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
         </Link>
         {report.status === 'open' && (
            <DropdownMenuItem
              disabled={loading}
              onClick={markAsClosed}
            >
              {loading ? 'جارٍ الإغلاق...' : 'إغلاق البلاغ'}
            </DropdownMenuItem>
         )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function ReportTable({ reports, onUpdate }: { reports: Report[], onUpdate: (reportId: string, newStatus: "closed") => void }) {
    const itemsPerPage = 20;
    const shouldPaginate = reports.length > itemsPerPage;
    
    const {
      currentPage,
      totalPages,
      paginatedData,
      hasNextPage,
      hasPreviousPage,
      goToPage,
      totalItems,
      startIndex,
      endIndex
    } = usePagination({
      data: reports,
      itemsPerPage,
      enabled: shouldPaginate
    });
    
    if (reports.length === 0) {
        return (
             <div className="flex h-48 items-center justify-center rounded-md border border-dashed mt-4">
                <p className="text-muted-foreground">لا توجد بلاغات في هذا القسم.</p>
            </div>
        )
    }

    return (
        <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم البلاغ</TableHead>
                    <TableHead>الموضوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإدارة المعنية</TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead>تاريخ التقديم</TableHead>
                    <TableHead>
                      <span className="sr-only">إجراءات</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium font-mono" style={{direction: 'ltr'}}>
                        {report.reportNumber ? formatReportNumber(report.reportNumber) : `...${report.id.slice(-6)}`}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <Link href={`/supervisor/report/${report.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {report.subject || 'بلاغ عام'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(report.status)}>{getStatusText(report.status)}</Badge>
                      </TableCell>
                       <TableCell>{allDepartments.find(d => d.id === report.departmentId)?.name || 'غير محدد'}</TableCell>
                      <TableCell>{formatLocation(report.location)}</TableCell>
                      <TableCell>{report.createdAt?.toDate().toLocaleDateString('ar-QA')}</TableCell>
                      <TableCell>
                        <ReportActions report={report} onUpdate={onUpdate} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-xs text-muted-foreground text-center">
                عرض <strong>{shouldPaginate ? startIndex : 1}</strong> إلى <strong>{shouldPaginate ? endIndex : reports.length}</strong> من <strong>{totalItems}</strong> بلاغ
              </div>
              {shouldPaginate && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  totalItems={totalItems}
                  startIndex={startIndex}
                  endIndex={endIndex}
                />
              )}
            </CardFooter>
          </Card>
    )
}


export default function SupervisorDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [user, loading] = useAuthState(auth);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [userPermissions, setUserPermissions] = useState<{
    isSystemAdmin: boolean;
    isAdmin: boolean;
    isSupervisor: boolean;
    supervisedDepartments: string[];
  } | null>(null); // تغيير لـ null ليدل على عدم تحميل البيانات بعد
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [filters, setFilters] = useState<ReportFilters>({});
  const [userName, setUserName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    async function checkSystemAdminStatus() {
      if (!user) {
        setLoadingPermissions(false);
        return;
      }
      
      setLoadingPermissions(true);
      
      const cleanEmail = (user.email || '').toLowerCase().trim();
      const systemAdminEmail = "sweetdream711711@gmail.com";
      
      if (cleanEmail === systemAdminEmail) {
        setIsSystemAdmin(true);
        setUserPermissions({
          isSystemAdmin: true,
          isAdmin: true,
          isSupervisor: false,
          supervisedDepartments: []
        });
        setLoadingPermissions(false);
        return;
      }

      // تحقق من صلاحيات المستخدم
      try {
        const permissions = await checkUserSupervisorPermissions(user.uid);
        setUserPermissions({
          isSystemAdmin: permissions.isSystemAdmin,
          isAdmin: permissions.isAdmin,
          isSupervisor: permissions.supervisedDepartments.length > 0,
          supervisedDepartments: permissions.supervisedDepartments || []
        });
        setIsSystemAdmin(permissions.isSystemAdmin);
        
        // جلب بيانات المستخدم للاسم والرقم الوظيفي
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.displayName || userData.name || user.displayName || user.email || "");
          setEmployeeId(userData.employeeId || "");
        }
      } catch (error) {
        console.error('Error checking user permissions:', error);
        // في حالة الخطأ، اعتبر المستخدم بدون صلاحيات
        setUserPermissions({
          isSystemAdmin: false,
          isAdmin: false,
          isSupervisor: false,
          supervisedDepartments: []
        });
      } finally {
        setLoadingPermissions(false);
      }
    }

    checkSystemAdminStatus();
  }, [user]);

  useEffect(() => {
    if (!user || !userPermissions || loadingPermissions) {
      console.log('🔍 Skip reports listener - missing data:', { 
        hasUser: !!user, 
        hasPermissions: !!userPermissions, 
        loadingPermissions 
      });
      return;
    }
    
    console.log('🔍 Setting up reports listener for user permissions:', userPermissions);
    console.log('🔍 User info:', { uid: user.uid, email: user.email });
    
    // إذا كان مدير نظام أو مدير عام، يرى جميع البلاغات
    if (userPermissions.isSystemAdmin || userPermissions.isAdmin) {
      console.log('👑 System admin or admin - showing all reports');
      const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log('📋 Raw snapshot size:', querySnapshot.size);
        const reportsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Report[];
        console.log('📋 Loaded all reports for admin:', reportsData.length);
        setReports(reportsData);
      }, (error) => {
        console.error("❌ Error fetching reports: ", error);
        console.error("❌ Error code:", error.code);
        console.error("❌ Error message:", error.message);
        toast({
          variant: "destructive",
          title: "خطأ في جلب البيانات",
          description: "لم نتمكن من تحميل قائمة البلاغات. يرجى تحديث الصفحة.",
        });
        setReports([]);
      });

      return () => unsubscribe();
    }
    
    // إذا كان مشرف، فلترة البلاغات حسب الإدارات المُعين عليها
    if (userPermissions.isSupervisor && userPermissions.supervisedDepartments && userPermissions.supervisedDepartments.length > 0) {
      console.log('👨‍💼 Supervisor - filtering reports for departments:', userPermissions.supervisedDepartments);
      
      // إنشاء listener واحد للبلاغات مع فلترة متقدمة
      const q = query(
        collection(db, "reports"), 
        orderBy("createdAt", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log('📋 Raw supervisor snapshot size:', querySnapshot.size);
        // فلترة البلاغات للإدارات المُشرف عليها فقط
        const filteredReports = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }) as Report)
          .filter(report => {
            const isIncluded = userPermissions.supervisedDepartments.includes(report.departmentId);
            console.log(`📊 Report ${report.id} (${report.departmentId}): ${isIncluded ? 'INCLUDED' : 'EXCLUDED'}`);
            return isIncluded;
          });
        
        console.log(`📁 Filtered reports for supervised departments: ${filteredReports.length} reports`);
        console.log('📋 Departments filter:', userPermissions.supervisedDepartments);
        console.log('📊 Report department IDs:', filteredReports.map(r => r.departmentId));
        
        setReports(filteredReports);
      }, (error) => {
        console.error("❌ Error fetching filtered reports:", error);
        console.error("❌ Error code:", error.code);
        console.error("❌ Error message:", error.message);
        toast({
          variant: "destructive",
          title: "خطأ في جلب البيانات",
          description: "لم نتمكن من تحميل قائمة البلاغات. يرجى تحديث الصفحة.",
        });
        setReports([]); // تعيين قائمة فارغة في حالة الخطأ
      });
      
      return () => unsubscribe();
    }
    
    // إذا لم يكن له أي صلاحيات، عرض قائمة فارغة
    console.log('❌ No permissions found - showing empty list');
    setReports([]);
    
  }, [user, userPermissions, loadingPermissions, toast]);

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  // تطبيق الفلاتر على التقارير
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // فلترة حسب الحالة
      if (filters.status && report.status !== filters.status) return false;
      
      // فلترة حسب القسم
      if (filters.departmentId && report.departmentId !== filters.departmentId) return false;
      
      // فلترة حسب رقم البلاغ
      if (filters.reportNumber) {
        const reportNumberStr = report.reportNumber ? formatReportNumber(report.reportNumber) : report.id;
        if (!reportNumberStr.toLowerCase().includes(filters.reportNumber.toLowerCase())) return false;
      }
      
      // فلترة حسب الموضوع
      if (filters.subject && !report.subject.toLowerCase().includes(filters.subject.toLowerCase())) return false;
      
      // فلترة حسب اسم المُبلغ
      if (filters.submitterName && report.submitterName && 
          !report.submitterName.toLowerCase().includes(filters.submitterName.toLowerCase())) return false;
      
      // فلترة حسب التاريخ
      if (filters.startDate || filters.endDate) {
        const reportDate = report.createdAt?.toDate();
        if (!reportDate) return false;
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (reportDate < startDate) return false;
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (reportDate > endDate) return false;
        }
      }
      
      return true;
    });
  }, [reports, filters]);

  const handleUpdateReport = (reportId: string, newStatus: "closed") => {
    setReports(prevReports => 
        prevReports.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
    );
  };

  const handleFiltersChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof ReportFilters];
    return value !== undefined && value !== null && value !== '';
  }).length;
  
  const openReports = filteredReports.filter(r => r.status === 'open');
  const closedReports = filteredReports.filter(r => r.status === 'closed');

  // عرض حالة التحميل
  if (loading || loadingPermissions) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جارٍ تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل دخول
  if (!user) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">يرجى تسجيل الدخول للوصول إلى هذه الصفحة</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">لوحة تحكم المشرف</h1>
          {userName && (
            <div className="text-sm text-muted-foreground">
              {userName}
              {employeeId && <span className="font-mono mr-2">({employeeId})</span>}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">رياني</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">تسجيل الخروج</span>
          </Button>
        </div>
      </header>
      
      <div className="py-8 px-4 md:px-8">
      {/* بطاقة خاصة لمدير النظام */}
      {isSystemAdmin && (
        <Card className="mb-6 border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">مرحباً مدير النظام</h3>
                  <p className="text-sm text-muted-foreground">
                    لديك صلاحيات كاملة لإدارة النظام والمستخدمين
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/users">
                  <Button className="gap-2">
                    <Users className="h-4 w-4" />
                    إدارة المستخدمين
                  </Button>
                </Link>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  إعدادات النظام
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* بطاقة تحذير للمشرفين الذين لم يتم تعيين أقسام لهم */}
      {userPermissions && !userPermissions.isSystemAdmin && !userPermissions.isAdmin && userPermissions.isSupervisor && userPermissions.supervisedDepartments.length === 0 && (
        <Card className="mb-6 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">لم يتم تعيين أقسام للإشراف</h3>
                <p className="text-sm text-orange-700">
                  تم ترقيتك إلى مشرف ولكن لم يتم تحديد الأقسام التي ستشرف عليها بعد. 
                  يرجى التواصل مع مدير النظام لتحديد صلاحياتك.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs text-orange-600 font-medium">
                  تواصل مع مدير النظام
                </p>
                <p className="text-xs text-orange-500">
                  sweetdream711711@gmail.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* بطاقة معلومات للمشرفين مع الأقسام المُعينة */}
      {userPermissions && !userPermissions.isSystemAdmin && !userPermissions.isAdmin && userPermissions.isSupervisor && userPermissions.supervisedDepartments.length > 0 && (
        <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800">مشرف الأقسام</h3>
                <p className="text-sm text-blue-700 mb-3">
                  تم تعيينك للإشراف على الأقسام التالية وستظهر لك البلاغات الخاصة بها فقط:
                </p>
                <div className="flex flex-wrap gap-2">
                  {userPermissions.supervisedDepartments.map(deptId => {
                    const department = allDepartments.find(d => d.id === deptId);
                    return (
                      <Badge key={deptId} variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                        {department?.name || deptId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {reports.length}
                </p>
                <p className="text-xs text-blue-500">
                  بلاغ في أقسامك
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              لوحة التحكم
            </TabsTrigger>
            <TabsTrigger value="all">الكل ({filteredReports.length})</TabsTrigger>
            <TabsTrigger value="open">مفتوح ({openReports.length})</TabsTrigger>
            <TabsTrigger value="closed">مغلق ({closedReports.length})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <ExportReports 
              reports={filteredReports} 
              filteredCount={filteredReports.length}
              totalCount={reports.length}
            />
          </div>
        </div>

        {/* فلترة متقدمة - تظهر في جميع التبويبات عدا لوحة التحكم */}
        {currentTab !== "dashboard" && (
          <AdvancedFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
            activeFiltersCount={activeFiltersCount}
          />
        )}

        <TabsContent value="dashboard">
          <ReportsStatistics reports={reports} />
        </TabsContent>
        <TabsContent value="all">
            <ReportTable reports={filteredReports} onUpdate={handleUpdateReport} />
        </TabsContent>
        <TabsContent value="open">
            <ReportTable reports={openReports} onUpdate={handleUpdateReport} />
        </TabsContent>
        <TabsContent value="closed">
             <ReportTable reports={closedReports} onUpdate={handleUpdateReport} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

    