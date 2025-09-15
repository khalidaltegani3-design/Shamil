import { FileText, BarChart3, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-24 items-center justify-center rounded bg-secondary text-sm font-semibold text-secondary-foreground">
          الشعار
        </div>
        <h1 className="text-lg font-semibold">منصة البلاغات</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground"/>
            <span className="text-sm font-medium">علي حمد</span>
        </div>
        <div className="h-10 w-10 rounded-full bg-secondary" />
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
          <Link href="/create-report">
            <Button>إنشاء بلاغ جديد</Button>
          </Link>
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
