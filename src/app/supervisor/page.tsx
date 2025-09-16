
import Link from "next/link";
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
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
import { Input } from "@/components/ui/input";

const reports = [
    { id: "BL-1597", title: "مشكلة في الوصول للشبكة الداخلية", status: "جديد", user: "علي حمد", location: "مبنى 1، الطابق 2", date: "2023-06-24" },
    { id: "BL-8564", title: "مخالفة بناء في منطقة الوكرة", status: "جديد", user: "نورة القحطاني", location: "الوكرة، شارع 320", date: "2023-06-23" },
    { id: "BL-2651", title: "تجمع مياه أمطار في بن محمود", status: "قيد المراجعة", user: "أحمد الغامدي", location: "بن محمود، قرب محطة المترو", date: "2023-06-22" },
    { id: "BL-7531", title: "اقتراح لتحسين إشارات المرور", status: "قيد المراجعة", user: "سارة المطيري", location: "الدحيل، تقاطع الجامعة", date: "2023-06-19" },
    { id: "BL-3214", title: "طلب صيانة إنارة شارع", status: "تم الحل", user: "فاطمة الزهراني", location: "الريان الجديد", date: "2023-06-21" },
    { id: "BL-9574", title: "سيارة مهملة في اللؤلؤة", status: "تم الحل", user: "سلطان العتيبي", location: "اللؤلؤة، بورتو أرابيا", date: "2023-06-20" },
    { id: "BL-4821", title: "عطل في نظام التكييف المركزي", status: "مرفوض", user: "مريم عبدالله", location: "الإدارة المالية", date: "2023-06-18" },
];

type Report = typeof reports[0];

function getStatusVariant(status: string) {
    switch (status) {
        case "جديد": return "default";
        case "قيد المراجعة": return "secondary";
        case "تم الحل": return "outline";
        case "مرفوض": return "destructive";
        default: return "default";
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
                        <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
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
                            <DropdownMenuItem>تحويل</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              حذف
                            </DropdownMenuItem>
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
  const newReports = reports.filter(r => r.status === 'جديد');
  const inProgressReports = reports.filter(r => r.status === 'قيد المراجعة');
  const resolvedReports = reports.filter(r => r.status === 'تم الحل' || r.status === 'مرفوض');

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">صندوق البلاغات</h1>
      </div>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="new">جديد</TabsTrigger>
            <TabsTrigger value="in-progress">قيد المراجعة</TabsTrigger>
            <TabsTrigger value="resolved">تم الحل</TabsTrigger>
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
                  الحالة
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>التاريخ</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  الموقع
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="بحث بالرقم أو العنوان..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-card" />
            </div>
          </div>
        </div>
        <TabsContent value="all">
            <Card>
                <CardHeader>
                    <CardTitle>كافة البلاغات</CardTitle>
                    <CardDescription>قائمة بجميع البلاغات المقدمة من الموظفين.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportTable reportsToShow={reports} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="new">
            <Card>
                <CardHeader>
                    <CardTitle>البلاغات الجديدة</CardTitle>
                    <CardDescription>البلاغات التي لم تتم مراجعتها بعد.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportTable reportsToShow={newReports} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="in-progress">
             <Card>
                <CardHeader>
                    <CardTitle>بلاغات قيد المراجعة</CardTitle>
                    <CardDescription>البلاغات التي يتم العمل عليها حالياً.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportTable reportsToShow={inProgressReports} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="resolved">
             <Card>
                <CardHeader>
                    <CardTitle>البلاغات المغلقة</CardTitle>
                    <CardDescription>البلاغات التي تم حلها أو رفضها.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportTable reportsToShow={resolvedReports} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
