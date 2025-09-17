

import Link from "next/link";
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

const reports = [
    { id: "BL-1597", title: "مشكلة في الوصول للشبكة الداخلية", status: "open", user: "علي حمد", location: "مبنى 1، الطابق 2", date: "2023-06-24", departmentId: "it-support" },
    { id: "BL-8564", title: "مخالفة بناء في منطقة الوكرة", status: "open", user: "نورة القحطاني", location: "الوكرة، شارع 320", date: "2023-06-23", departmentId: "municipal-inspections" },
    { id: "BL-2651", title: "تجمع مياه أمطار في بن محمود", status: "open", user: "أحمد الغامدي", location: "بن محمود، قرب محطة المترو", date: "2023-06-22", departmentId: "public-works" },
    { id: "BL-7531", title: "اقتراح لتحسين إشارات المرور", status: "open", user: "سارة المطيري", location: "الدحيل, تقاطع الجامعة", date: "2023-06-19", departmentId: "public-works" },
    { id: "BL-3214", title: "طلب صيانة إنارة شارع", status: "closed", user: "فاطمة الزهراني", location: "الريان الجديد", date: "2023-06-21", departmentId: "maintenance" },
    { id: "BL-9574", title: "سيارة مهملة في اللؤلؤة", status: "closed", user: "سلطان العتيبي", location: "اللؤلؤة، بورتو أرابيا", date: "2023-06-20", departmentId: "municipal-inspections" },
];

type Report = typeof reports[0];

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

function ReportTable({ reportsToShow }: { reportsToShow: Report[] }) {
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
                    <TableHead>الموقع/الإدارة</TableHead>
                    <TableHead>تاريخ التقديم</TableHead>
                    <TableHead>
                      <span className="sr-only">إجراءات</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsToShow.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(report.status)}>{getStatusText(report.status)}</Badge>
                      </TableCell>
                      <TableCell>{report.user}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                عرض <strong>{reportsToShow.length}</strong> من <strong>{reports.length}</strong> بلاغ
              </div>
            </CardFooter>
          </Card>
    )
}


export default function SupervisorDashboard() {
  const openReports = reports.filter(r => r.status === 'open');
  const closedReports = reports.filter(r => r.status === 'closed');

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">صندوق البلاغات</h1>
      </div>
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
            <ReportTable reportsToShow={reports} />
        </TabsContent>
        <TabsContent value="open">
            <ReportTable reportsToShow={openReports} />
        </TabsContent>
        <TabsContent value="closed">
             <ReportTable reportsToShow={closedReports} />
        </TabsContent>
      </Tabs>
    </>
  );
}
