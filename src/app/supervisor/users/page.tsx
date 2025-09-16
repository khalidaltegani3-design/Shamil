import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";

const users = [
    { id: "USR-001", name: "خالد الأحمد", email: "k.alahmad@gov.sa", role: "مشرف", status: "نشط" },
    { id: "USR-002", name: "نورة القحطاني", email: "n.alqahtani@gov.sa", role: "موظف", status: "نشط" },
    { id: "USR-003", name: "سلطان العتيبي", email: "s.alotaibi@gov.sa", role: "موظف", status: "غير نشط" },
    { id: "USR-004", name: "أحمد الغامدي", email: "a.alghamdi@gov.sa", role: "رئيس قسم", status: "نشط" },
    { id: "USR-005", name: "فاطمة الزهراني", email: "f.alzahrani@gov.sa", role: "موظف", status: "نشط" },
]

function getStatusVariant(status: string) {
    return status === 'نشط' ? 'default' : 'secondary';
}

function getRoleVariant(role: string): "default" | "secondary" | "destructive" | "outline" | null | undefined {
    switch(role) {
        case 'مشرف': return 'default';
        case 'رئيس قسم': return 'secondary';
        default: return 'outline';
    }
}

export default function UserManagementPage() {
    return (
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="flex items-center">
                 <h1 className="text-lg font-semibold md:text-2xl">إدارة المستخدمين</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        إضافة مستخدم جديد
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
                                <TableHead>البريد الإلكتروني</TableHead>
                                <TableHead>الدور/الصلاحية</TableHead>
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
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
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
                                                <DropdownMenuItem>تعديل الصلاحيات</DropdownMenuItem>
                                                <DropdownMenuItem>إعادة تعيين كلمة المرور</DropdownMenuItem>
                                                <DropdownMenuItem>عرض النشاط</DropdownMenuItem>
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
