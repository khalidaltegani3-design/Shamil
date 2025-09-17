
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const users = [
    { id: "E-1023", name: "خالد الأحمد", email: "k.ahmed@example.com", role: "admin" as const, status: "نشط", homeDepartmentId: "executive-management", supervisorOf: ["it-support", "maintenance"] },
    { id: "E-1029", name: "نورة القحطاني", email: "n.qahtani@example.com", role: "supervisor" as const, status: "نشط", homeDepartmentId: "it-support", supervisorOf: ["it-support"] },
    { id: "E-1035", name: "سلطان العتيبي", email: "s.otaibi@example.com", role: "employee" as const, status: "غير نشط", homeDepartmentId: "general-services", supervisorOf: [] },
    { id: "E-1041", name: "أحمد الغامدي", email: "a.ghamdi@example.com", role: "supervisor" as const, status: "نشط", homeDepartmentId: "maintenance", supervisorOf: ["maintenance"] },
    { id: "E-1048", name: "فاطمة الزهراني", email: "f.zahrani@example.com", role: "employee" as const, status: "نشط", homeDepartmentId: "human-resources", supervisorOf: [] },
];

const allDepartments = [
  { id: "executive-management", name: "الإدارة العليا" },
  { id: "it-support", name: "الدعم الفني" },
  { id: "maintenance", name: "الصيانة" },
  { id: "general-services", name: "الخدمات العامة" },
  { id: "human-resources", name: "الموارد البشرية" },
];


type User = typeof users[0];

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
    const { toast } = useToast();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    // States for dialogs
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isSupervisorDialogOpen, setIsSupervisorDialogOpen] = useState(false);
    
    const handleActionClick = (user: User, action: "role" | "supervisor") => {
        setSelectedUser(user);
        if (action === "role") setIsRoleDialogOpen(true);
        if (action === "supervisor") setIsSupervisorDialogOpen(true);
    };

    const handlePasswordReset = () => {
        if (!selectedUser) return;
        // TODO: Call actual cloud function `adminSendPasswordReset(selectedUser.uid)`
        toast({
            title: "تم إرسال الرابط",
            description: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${selectedUser.email}.`,
        });
    }
    
    const handleDeactivateAccount = () => {
         if (!selectedUser) return;
        // TODO: Call actual cloud function `adminDeactivateUser(selectedUser.uid)`
         toast({
            title: "تم تعطيل الحساب",
            description: `تم تعطيل حساب المستخدم ${selectedUser.name} بنجاح.`,
            variant: "destructive"
        });
    }

    return (
        <>
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
                                        <span className="sr-only">إجراءات</span>
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
                                        <TableCell>{allDepartments.find(d => d.id === user.homeDepartmentId)?.name || 'غير محدد'}</TableCell>
                                        <TableCell>
                                            {user.supervisorOf.length > 0 
                                                ? user.supervisorOf.map(id => allDepartments.find(d => d.id === id)?.name || id).join(', ') 
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                             <AlertDialog>
                                                <Dialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button aria-haspopup="true" size="icon" variant="ghost" onClick={() => setSelectedUser(user)}>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Toggle menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                                                            <DropdownMenuSeparator/>
                                                            <DropdownMenuItem onSelect={() => handleActionClick(user, "role")}>تحديث الدور والإدارة</DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleActionClick(user, "supervisor")}>تعيين كـ مشرف</DropdownMenuItem>
                                                            
                                                            <AlertDialogTrigger asChild>
                                                                 <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSelectedUser(user); }}>إعادة تعيين كلمة المرور</DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            
                                                            <DropdownMenuSeparator/>
                                                            
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-destructive" onSelect={(e) => { e.preventDefault(); setSelectedUser(user); }}>
                                                                    تعطيل الحساب
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>

                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    {/* Role Dialog */}
                                                    <DialogContent onOpenChange={setIsRoleDialogOpen} open={isRoleDialogOpen && selectedUser?.id === user.id}>
                                                        <DialogHeader>
                                                            <DialogTitle>تحديث الدور والإدارة لـ "{selectedUser?.name}"</DialogTitle>
                                                            <DialogDescription>
                                                                اختر الدور الجديد والإدارة الأساسية التي يتبع لها المستخدم.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="role" className="text-right">الدور</Label>
                                                                <Select dir="rtl" defaultValue={selectedUser?.role}>
                                                                    <SelectTrigger id="role" className="col-span-3">
                                                                        <SelectValue placeholder="اختر الدور" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="employee">موظف</SelectItem>
                                                                        <SelectItem value="supervisor">مشرف</SelectItem>
                                                                        <SelectItem value="admin">مدير نظام</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="department" className="text-right">الإدارة</Label>
                                                                 <Select dir="rtl" defaultValue={selectedUser?.homeDepartmentId}>
                                                                    <SelectTrigger id="department" className="col-span-3">
                                                                        <SelectValue placeholder="اختر الإدارة" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {allDepartments.map(dept => (
                                                                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>إلغاء</Button>
                                                            <Button type="submit" onClick={() => { setIsRoleDialogOpen(false); toast({ title: "تم التحديث بنجاح" })}}>حفظ التغييرات</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                    {/* Supervisor Dialog */}
                                                     <DialogContent onOpenChange={setIsSupervisorDialogOpen} open={isSupervisorDialogOpen && selectedUser?.id === user.id}>
                                                        <DialogHeader>
                                                            <DialogTitle>تعيين كـ مشرف لـ "{selectedUser?.name}"</DialogTitle>
                                                            <DialogDescription>
                                                                حدد الإدارات التي سيشرف عليها هذا المستخدم.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="space-y-2">
                                                                {allDepartments.map(dept => (
                                                                     <div key={dept.id} className="flex items-center space-x-2 space-x-reverse">
                                                                        <Checkbox id={`dept-${dept.id}`} defaultChecked={selectedUser?.supervisorOf.includes(dept.id)} />
                                                                        <Label htmlFor={`dept-${dept.id}`} className="flex-1">{dept.name}</Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsSupervisorDialogOpen(false)}>إلغاء</Button>
                                                            <Button type="submit" onClick={() => {setIsSupervisorDialogOpen(false); toast({ title: "تم تحديث صلاحيات الإشراف" })}}>حفظ</Button>
                                                        </DialogFooter>
                                                    </DialogContent>

                                                </Dialog>
                                                {/* Password Reset Alert */}
                                                 <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            سيتم إرسال بريد إلكتروني لإعادة تعيين كلمة المرور إلى {selectedUser?.email}. لا يمكن التراجع عن هذا الإجراء.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handlePasswordReset}>متابعة وإرسال</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>

                                                {/* Deactivate Account Alert */}
                                                 <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>تأكيد تعطيل الحساب</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                           هل أنت متأكد من رغبتك في تعطيل حساب {selectedUser?.name}؟ سيتم منع المستخدم من تسجيل الدخول.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDeactivateAccount} className="bg-destructive hover:bg-destructive/90">نعم، قم بالتعطيل</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

    