
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  ListFilter,
  MoreHorizontal,
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

type Report = {
    id: string;
    title?: string;
    description: string;
    status: "open" | "closed";
    user?: string; // submitter name (optional)
    submitterId: string;
    submitterDepartment?: string;
    location: string;
    createdAt: any; // Firestore timestamp
    departmentId: string;
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
          description: `تم إغلاق البلاغ رقم ${report.id.slice(-6)}...`,
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
                    <TableHead>الوصف</TableHead>
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
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">...{report.id.slice(-6)}</TableCell>
                      <TableCell>{report.description.substring(0, 50)}...</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(report.status)}>{getStatusText(report.status)}</Badge>
                      </TableCell>
                       <TableCell>{allDepartments.find(d => d.id === report.departmentId)?.name || 'غير محدد'}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell>{report.createdAt?.toDate().toLocaleDateString('ar-QA')}</TableCell>
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
  const [reports, setReports] = useState<Report[]>([]);
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    // In a real app, you would also filter by the supervisor's departments
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reportsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Report[];
        setReports(reportsData);
    });

    return () => unsubscribe();
  }, [user]);

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
            <TabsTrigger value="all">الكل ({reports.length})</TabsTrigger>
            <TabsTrigger value="open">مفتوح ({openReports.length})</TabsTrigger>
            <TabsTrigger value="closed">مغلق ({closedReports.length})</TabsTrigger>
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

    