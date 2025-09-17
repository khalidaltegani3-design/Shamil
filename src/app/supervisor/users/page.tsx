import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";

const users = [
    { id: "E-1023", name: "خالد الأحمد", email: "k.ahmed@example.com", role: "admin", status: "نشط", homeDepartment: "الإدارة العليا", supervisorOf: ["it-support", "maintenance"] },
    { id: "E-1029", name: "نورة القحطاني", email: "n.qahtani@example.com", role: "supervisor", status: "نشط", homeDepartment: "الدعم الفني", supervisorOf: ["it-support"] },
    { id: "E-1035", name: "سلطان العتيبي", email: "s.otaibi@example.com", role: "employee", status: "غير نشط", homeDepartment: "الخدمات العامة", supervisorOf: [] },
    { id: "E-1041", name: "أحمد الغامدي", email: "a.ghamdi@example.com", role: "supervisor", status: "نشط", homeDepartment: "الصيانة", supervisorOf: ["maintenance"] },
    { id: "E-1048", name: "فاطمة الزهراني", email: "f.zahrani@example.com", role: "employee", status: "نشط", homeDepartment: "الموارد البشرية", supervisorOf: [] },
]

function getStatusVariant(status: string) {
    return status === 'نشط' ? 'default' : 'secondary';
}

function getRoleVariant(role: string): "default" | "secondary" | "destructive" | "outline" | null | undefined {
    switch(role) {
        case 'admin': return 'destructive';
        case 'supervisor': return 'secondary';
        default: return 'outline';
    }
}
const roleNames: {[key: string]: string} = {
    admin: 'مدير نظام',
    supervisor: 'مشرف',
    employee: 'موظف'
}

export default function UserManagementPage() {
    // In a real app, this page would be protected and only visible to admins.
    // The `users` data would be fetched from Firestore.
    // Admin actions would call the Cloud Functions.
    return (
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="flex items-center">
                 <h1 className="text-lg font-semibold md:text-2xl">إدارة المستخدمين والصلاحيات</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        إنشاء مستخدم
                        </span>
                    </Button>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>قائمة المستخدمين</CardTitle>
                    <CardDescription>عرض وتعديل صلاحيات وأدوار المستخدمين في النظام.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم</TableHead>
                                <TableHead>الدور/الصلاحية</TableHead>
                                <TableHead>الإدارة التابع لها</TableHead>
                                <TableHead>مشرف على</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleVariant(user.role)}>{roleNames[user.role]}</Badge>
                                    </TableCell>
                                    <TableCell>{user.homeDepartment}</TableCell>
                                     <TableCell>
                                        {user.supervisorOf.length > 0 ? user.supervisorOf.join(', ') : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                                                <DropdownMenuItem>تحديث الدور والإدارة</DropdownMenuItem>
                                                <DropdownMenuItem>تعيين كـ مشرف</DropdownMenuItem>
                                                <DropdownMenuItem>إعادة تعيين كلمة المرور</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    تعطيل الحساب
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
