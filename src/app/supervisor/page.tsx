

"use client";

import Link from "next/link";
import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

const initialReports = [
    { id: "BL-1597", title: "مشكلة في الوصول للشبكة الداخلية", status: "open" as const, user: "علي حمد", submitterDepartment: "الموارد البشرية", location: "مبنى 1، الطابق 2", date: "2023-06-24", departmentId: "it-support" },
    { id: "BL-8564", title: "مخالفة بناء في منطقة الوكرة", status: "open" as const, user: "نورة القحطاني", submitterDepartment: "الخدمات العامة", location: "الوكرة، شارع 320", date: "2023-06-23", departmentId: "municipal-inspections" },
    { id: "BL-2651", title: "تجمع مياه أمطار في بن محمود", status: "open" as const, user: "أحمد الغامدي", submitterDepartment: "الصيانة", location: "بن محمود، قرب محطة المترو", date: "2023-06-22", departmentId: "public-works" },
    { id: "BL-7531", title: "اقتراح لتحسين إشارات المرور", status: "open" as const, user: "سارة المطيري", submitterDepartment: "الدعم الفني", location: "الدحيل, تقاطع الجامعة", date: "2023-06-19", departmentId: "public-works" },
    { id: "BL-3214", title: "طلب صيانة إنارة شارع", status: "closed" as const, user: "فاطمة الزهراني", submitterDepartment: "الموارد البشرية", location: "الريان الجديد", date: "2023-06-21", departmentId: "maintenance" },
    { id: "BL-9574", title: "سيارة مهملة في اللؤلؤة", status: "closed" as const, user: "سلطان العتيبي", submitterDepartment: "الخدمات العامة", location: "اللؤلؤة، بورتو أرابيا", date: "2023-06-20", departmentId: "municipal-inspections" },
];


type Report = typeof initialReports[0];

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

function ReportActions({ report, onUpdate }: { report: Report, onUpdate: (reportId: string, newStatus: "closed") => void }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const markAsReceived = async () => {
    if (loading || report.status !== "open") return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يجب تسجيل الدخول أولاً."
        });
        return;
    }
    
    setLoading(true);

    try {
      const reportRef = doc(db, "reports", report.id);
      await updateDoc(reportRef, {
        status: "closed",
        receivedBy: uid, 
        receivedAt: serverTimestamp(),
      });
       // Optimistic update in parent component
      onUpdate(report.id, "closed");
      toast({
          variant: "default",
          title: "تم بنجاح",
          description: `تم إغلاق البلاغ رقم ${report.id} وإشعار صاحبه.`,
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
         <Link href={`/supervisor/report/${report.id.replace('BL-','')}`} passHref>
            <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
         </Link>
         {report.status === 'open' && (
            <DropdownMenuItem
              disabled={loading}
              onClick={markAsReceived}
            >
              {loading ? 'جارٍ الإغلاق...' : 'إغلاق البلاغ'}
            </DropdownMenuItem>
         )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function ReportTable({ reports, onUpdate }: { reports: Report[], onUpdate: (reportId: string, newStatus: "closed") => void }) {
    return (
        <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم البلاغ</TableHead>
                    <TableHead>عنوان البلاغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>مقدم البلاغ</TableHead>
                    <TableHead>إدارة مقدم البلاغ</TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead>تاريخ التقديم</TableHead>
                    <TableHead>
                      <span className="sr-only">إجراءات</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(report.status)}>{getStatusText(report.status)}</Badge>
                      </TableCell>
                      <TableCell>{report.user}</TableCell>
                      <TableCell>{report.submitterDepartment}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <ReportActions report={report} onUpdate={onUpdate} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                عرض <strong>{reports.length}</strong> من <strong>{reports.length}</strong> بلاغ
              </div>
            </CardFooter>
          </Card>
    )
}


export default function SupervisorDashboard() {
  const [reports, setReports] = useState<Report[]>(initialReports);

  const handleUpdateReport = (reportId: string, newStatus: "closed") => {
    setReports(prevReports => 
        prevReports.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
    );
  };
  
  const openReports = reports.filter(r => r.status === 'open');
  const closedReports = reports.filter(r => r.status === 'closed');

  return (
    <div className="py-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="open">مفتوح</TabsTrigger>
            <TabsTrigger value="closed">مغلق</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    فلترة
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>فلترة حسب</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  التاريخ
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  الإدارة
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <TabsContent value="all">
            <ReportTable reports={reports} onUpdate={handleUpdateReport} />
        </TabsContent>
        <TabsContent value="open">
            <ReportTable reports={openReports} onUpdate={handleUpdateReport} />
        </TabsContent>
        <TabsContent value="closed">
             <ReportTable reports={closedReports} onUpdate={handleUpdateReport} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
