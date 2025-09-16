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
  { id: "بل-8564", title: "عطل في نظام التكييف المركزي", status: "جديد", user: "نورة القحطاني", location: "مبنى 3، الطابق 5", date: "2023-06-23" },
  { id: "بل-2651", title: "تأخر في صرف المستحقات المالية", status: "قيد المراجعة", user: "أحمد الغامدي", location: "الإدارة المالية", date: "2023-06-22" },
  { id: "بل-3214", title: "طلب تجديد رخصة برمجيات", status: "تم الحل", user: "فاطمة الزهراني", location: "قسم نظم المعلومات", date: "2023-06-21" },
  { id: "بل-9574", title: "احتياج أجهزة حاسب جديدة", status: "مرفوض", user: "سلطان العتيبي", location: "إدارة المشاريع", date: "2023-06-20" },
  { id: "بل-1597", title: "مشكلة في الوصول للشبكة الداخلية", status: "جديد", user: "علي حمد", location: "مبنى 1، الطابق 2", date: "2023-06-24" },
  { id: "بل-7531", title: "اقتراح لتحسين إجراءات العمل", status: "قيد المراجعة", user: "سارة المطيري", location: "إدارة التطوير", date: "2023-06-19" },
];

function getStatusVariant(status: string) {
    switch (status) {
        case "جديد": return "default";
        case "قيد المراجعة": return "secondary";
        case "تم الحل": return "outline";
        case "مرفوض": return "destructive";
        default: return "default";
    }
}


export default function SupervisorDashboard() {
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
              <CardTitle>البلاغات الواردة</CardTitle>
              <CardDescription>
                قائمة بجميع البلاغات المقدمة من الموظفين.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  {reports.map((report) => (
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
                             <Link href={`/supervisor/report/${report.id.replace('بل-','')}`} passHref>
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
                عرض <strong>{reports.length}</strong> من <strong>{reports.length}</strong> بلاغ
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
