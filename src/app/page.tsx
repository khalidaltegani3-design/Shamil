import { FileText, Building2, BarChart3, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// This is the main dashboard for the user after logging in.
// We are skipping the login page for now and going straight to the main app interface.

function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Placeholder for the ministry logo */}
        <div className="flex h-8 w-24 items-center justify-center rounded bg-secondary text-sm font-semibold text-secondary-foreground">
          الشعار
        </div>
        <h1 className="text-lg font-semibold">منصة البلاغات الداخلية</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">الإعدادات</span>
        </Button>
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
            description="جميع البلاغات المقدمة"
            icon={FileText} 
          />
          <StatCard 
            title="البلاغات المفتوحة" 
            value="42" 
            description="بلاغات قيد المراجعة أو التنفيذ"
            icon={Building2}
          />
          <StatCard 
            title="متوسط ​​وقت الحل" 
            value="3.5 يوم" 
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
            {/* Placeholder for a table or list of recent reports */}
            <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">جدول البلاغات الأخيرة سيظهر هنا.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
