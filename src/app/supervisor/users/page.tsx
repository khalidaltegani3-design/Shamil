
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { allDepartments } from "@/lib/departments";
import { initialUsers } from "@/lib/users";


type User = typeof initialUsers[0] & {
    supervisorOf: string[];
};

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
    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    // States for dialogs
    const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isSupervisorDialogOpen, setIsSupervisorDialogOpen] = useState(false);
    const [isPasswordResetAlertOpen, setIsPasswordResetAlertOpen] = useState(false);
    const [isDeactivateAlertOpen, setIsDeactivateAlertOpen] = useState(false);
    const [isActivateAlertOpen, setIsActivateAlertOpen] = useState(false);
    
    const handleActionClick = (user: User, action: "role" | "supervisor" | "password" | "deactivate" | "activate") => {
        setSelectedUser(user);
        if (action === "role") setIsRoleDialogOpen(true);
        if (action === "supervisor") setIsSupervisorDialogOpen(true);
        if (action === "password") setIsPasswordResetAlertOpen(true);
        if (action === "deactivate") setIsDeactivateAlertOpen(true);
        if (action === "activate") setIsActivateAlertOpen(true);
    };

    const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newUser = {
            id: formData.get('employeeId') as string,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as "admin" | "supervisor" | "employee",
            status: "نشط" as "نشط" | "غير نشط",
            homeDepartmentId: formData.get('department') as string,
            supervisorOf: [] as string[]
        };
        // TODO: Call actual cloud function `adminCreateUser(newUser)`
        setUsers([newUser as User, ...users]);
        toast({
            title: "تم إنشاء المستخدم بنجاح",
            description: `تم إرسال رابط تفعيل الحساب إلى ${newUser.email}.`,
        });
        setIsCreateUserDialogOpen(false);
    };

    const handlePasswordReset = () => {
        if (!selectedUser) return;
        // TODO: Call actual cloud function `adminSendPasswordReset(selectedUser.uid)`
        toast({
            title: "تم إرسال الرابط",
            description: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${selectedUser.email}.`,
        });
        setIsPasswordResetAlertOpen(false);
    }
    
    const handleDeactivateAccount = () => {
         if (!selectedUser) return;
        // TODO: Call actual cloud function `adminDeactivateUser(selectedUser.uid)`
         setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'غير نشط' } : u));
         toast({
            title: "تم تعطيل الحساب",
            description: `تم تعطيل حساب المستخدم ${selectedUser.name} بنجاح.`,
            variant: "destructive"
        });
        setIsDeactivateAlertOpen(false);
    }
    
    const handleActivateAccount = () => {
        if (!selectedUser) return;
        // TODO: Call actual cloud function `adminActivateUser(selectedUser.uid)`
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'نشط' } : u));
        toast({
            title: "تم تنشيط الحساب",
            description: `تم تنشيط حساب المستخدم ${selectedUser.name} بنجاح.`,
        });
        setIsActivateAlertOpen(false);
    };

    return (
        <>
            <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">إدارة المستخدمين والصلاحيات</h1>
                    <div className="ml-auto flex items-center gap-2">
                         <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="h-8 gap-1">
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        إنشاء مستخدم
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>إنشاء مستخدم جديد</DialogTitle>
                                    <DialogDescription>أدخل بيانات المستخدم لإضافته للنظام وإرسال دعوة له.</DialogDescription>
                                </DialogHeader>
                                <form id="createUserForm" onSubmit={handleCreateUser} className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">الاسم</Label>
                                        <Input id="name" name="name" className="col-span-3" placeholder="الاسم الكامل" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                                        <Input id="email" name="email" type="email" className="col-span-3" placeholder="user@example.com" required />
                                    </div>
                                     <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="employeeId" className="text-right">الرقم الوظيفي</Label>
                                        <Input id="employeeId" name="employeeId" className="col-span-3" placeholder="E-1234" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="password" className="text-right">كلمة مرور أولية</Label>
                                        <Input id="password" name="password" type="password" className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="role" className="text-right">الدور</Label>
                                        <Select dir="rtl" name="role" required defaultValue="employee">
                                            <SelectTrigger id="role" className="col-span-3"><SelectValue placeholder="اختر الدور" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="employee">موظف</SelectItem>
                                                <SelectItem value="supervisor">مشرف</SelectItem>
                                                <SelectItem value="admin">مدير نظام</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="department" className="text-right">الإدارة</Label>
                                        <Select dir="rtl" name="department" required>
                                            <SelectTrigger id="department" className="col-span-3"><SelectValue placeholder="اختر الإدارة" /></SelectTrigger>
                                            <SelectContent>
                                                {allDepartments.map(dept => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </form>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>إلغاء</Button>
                                    <Button type="submit" form="createUserForm">إنشاء مستخدم</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                                                    <DropdownMenuItem onSelect={() => handleActionClick(user, "password")}>إعادة تعيين كلمة المرور</DropdownMenuItem>
                                                    <DropdownMenuSeparator/>
                                                    {user.status === 'نشط' ? (
                                                        <DropdownMenuItem className="text-destructive" onSelect={() => handleActionClick(user, "deactivate")}>
                                                            تعطيل الحساب
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onSelect={() => handleActionClick(user, "activate")}>
                                                            تنشيط الحساب
                                                        </DropdownMenuItem>
                                                    )}
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
            
            {/* Dialogs and Alerts */}
            {selectedUser && (
                <>
                    {/* Role Dialog */}
                    <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>تحديث الدور والإدارة لـ "{selectedUser.name}"</DialogTitle>
                                <DialogDescription>اختر الدور الجديد والإدارة الأساسية التي يتبع لها المستخدم.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right">الدور</Label>
                                    <Select dir="rtl" defaultValue={selectedUser.role}>
                                        <SelectTrigger id="role" className="col-span-3"><SelectValue placeholder="اختر الدور" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="employee">موظف</SelectItem>
                                            <SelectItem value="supervisor">مشرف</SelectItem>
                                            <SelectItem value="admin">مدير نظام</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="department" className="text-right">الإدارة</Label>
                                    <Select dir="rtl" defaultValue={selectedUser.homeDepartmentId}>
                                        <SelectTrigger id="department" className="col-span-3"><SelectValue placeholder="اختر الإدارة" /></SelectTrigger>
                                        <SelectContent>
                                            {allDepartments.map(dept => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>إلغاء</Button>
                                <Button type="submit" onClick={() => { setIsRoleDialogOpen(false); toast({ title: "تم التحديث بنجاح" })}}>حفظ التغييرات</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Supervisor Dialog */}
                    <Dialog open={isSupervisorDialogOpen} onOpenChange={setIsSupervisorDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>تعيين كـ مشرف لـ "{selectedUser.name}"</DialogTitle>
                                <DialogDescription>حدد الإدارات التي سيشرف عليها هذا المستخدم.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    {allDepartments.map(dept => (
                                        <div key={dept.id} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox id={`dept-${dept.id}`} defaultChecked={selectedUser.supervisorOf && Array.isArray(selectedUser.supervisorOf) && selectedUser.supervisorOf.includes(dept.id)} />
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
                    <AlertDialog open={isPasswordResetAlertOpen} onOpenChange={setIsPasswordResetAlertOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                <AlertDialogDescription>سيتم إرسال بريد إلكتروني لإعادة تعيين كلمة المرور إلى {selectedUser.email}. لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={handlePasswordReset}>متابعة وإرسال</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Deactivate Account Alert */}
                    <AlertDialog open={isDeactivateAlertOpen} onOpenChange={setIsDeactivateAlertOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد تعطيل الحساب</AlertDialogTitle>
                                <AlertDialogDescription>هل أنت متأكد من رغبتك في تعطيل حساب {selectedUser.name}؟ سيتم منع المستخدم من تسجيل الدخول.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeactivateAccount} className="bg-destructive hover:bg-destructive/90">نعم، قم بالتعطيل</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    {/* Activate Account Alert */}
                    <AlertDialog open={isActivateAlertOpen} onOpenChange={setIsActivateAlertOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد تنشيط الحساب</AlertDialogTitle>
                                <AlertDialogDescription>هل أنت متأكد من رغبتك في تنشيط حساب {selectedUser.name}؟ سيتمكن المستخدم من تسجيل الدخول مرة أخرى.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={handleActivateAccount}>نعم، قم بالتنشيط</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </>
    )
}

    