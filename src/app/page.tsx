
import { FileText, BarChart3, Clock, User, LogOut, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">علي حمد</p>
                <p className="text-xs leading-none text-muted-foreground">
                  E-10293
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <KeyRound className="ml-2 h-4 w-4" />
                إعادة ضبط كلمة السر
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <Link href="/login" passHref>
                <DropdownMenuItem>
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">لوحة المعلومات</h2>
          <div className="flex items-center gap-2">
            <Link href="/create-report" passHref>
              <Button>إنشاء بلاغ جديد</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <StatCard 
            title="إجمالي البلاغات" 
            value="1,250" 
            description="جميع البلاغات المقدمة من قبلك"
            icon={FileText} 
          />
          <StatCard 
            title="البلاغات المفتوحة" 
            value="42" 
            description="بلاغات قيد المراجعة أو التنفيذ"
            icon={Clock}
          />
          <StatCard 
            title="متوسط وقت الحل" 
            value="3.5 أيام" 
            description="معدل سرعة إغلاق البلاغات"
            icon={BarChart3}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>أحدث البلاغات</CardTitle>
            <CardDescription>نظرة سريعة على آخر 5 بلاغات قمت بتقديمها.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">جدول البلاغات الأخيرة سيظهر هنا.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
