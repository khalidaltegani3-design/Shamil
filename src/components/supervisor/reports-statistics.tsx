"use client";

import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Calendar,
  Building2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { allDepartments } from "@/lib/departments";

type ReportLocation = {
  latitude: number;
  longitude: number;
  source: "manual" | "q-address";
  description?: string;
  zone?: string;
  street?: string;
  building?: string;
};

type Report = {
  id: string;
  reportNumber?: number;
  surveyNumber?: string;
  subject: string;
  description: string;
  status: "open" | "closed";
  submitterId: string;
  submitterName?: string;
  submitterEmployeeId?: string;
  createdAt: any;
  departmentId: string;
  location: ReportLocation;
  closedAt?: any;
};

interface ReportsStatisticsProps {
  reports: Report[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ReportsStatistics({ reports }: ReportsStatisticsProps) {
  const statistics = useMemo(() => {
    const totalReports = reports.length;
    const openReports = reports.filter(r => r.status === 'open').length;
    const closedReports = reports.filter(r => r.status === 'closed').length;

    // إحصائيات الأقسام
    const departmentStats = allDepartments.map(dept => {
      const deptReports = reports.filter(r => r.departmentId === dept.id);
      return {
        name: dept.name,
        total: deptReports.length,
        open: deptReports.filter(r => r.status === 'open').length,
        closed: deptReports.filter(r => r.status === 'closed').length,
      };
    }).filter(stat => stat.total > 0);

    // إحصائيات زمنية (آخر 7 أيام)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayReports = reports.filter(r => {
        const reportDate = r.createdAt?.toDate();
        return reportDate && reportDate >= dayStart && reportDate <= dayEnd;
      });

      dailyStats.push({
        date: dayStart.toLocaleDateString('ar-QA', { month: 'short', day: 'numeric' }),
        count: dayReports.length,
        open: dayReports.filter(r => r.status === 'open').length,
        closed: dayReports.filter(r => r.status === 'closed').length,
      });
    }

    // معدل الإنجاز
    const completionRate = totalReports > 0 ? (closedReports / totalReports) * 100 : 0;

    // إحصائيات هذا الشهر
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonthReports = reports.filter(r => {
      const reportDate = r.createdAt?.toDate();
      return reportDate && reportDate >= startOfMonth;
    });

    // متوسط الإغلاق اليومي (آخر 30 يوم)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentClosedReports = reports.filter(r => {
      const closedDate = r.closedAt?.toDate();
      return closedDate && closedDate >= thirtyDaysAgo;
    });

    const dailyClosureAverage = recentClosedReports.length / 30;

    return {
      totalReports,
      openReports,
      closedReports,
      completionRate,
      departmentStats,
      dailyStats,
      thisMonthReports: thisMonthReports.length,
      dailyClosureAverage,
    };
  }, [reports]);

  const statusData = [
    { name: 'مفتوح', value: statistics.openReports, color: '#FF8042' },
    { name: 'مغلق', value: statistics.closedReports, color: '#00C49F' },
  ];

  return (
    <div className="space-y-6">
      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التقارير</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              جميع التقارير في النظام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقارير المفتوحة</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.openReports}</div>
            <p className="text-xs text-muted-foreground">
              في انتظار المعالجة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقارير المغلقة</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.closedReports}</div>
            <p className="text-xs text-muted-foreground">
              تم إنجازها بنجاح
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإنجاز</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              نسبة التقارير المكتملة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* البطاقات الإضافية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تقارير هذا الشهر</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.thisMonthReports}</div>
            <p className="text-xs text-muted-foreground">
              التقارير الجديدة هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الإغلاق اليومي</CardTitle>
            <AlertCircle className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {statistics.dailyClosureAverage.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              تقرير/يوم (آخر 30 يوم)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأقسام النشطة</CardTitle>
            <Building2 className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{statistics.departmentStats.length}</div>
            <p className="text-xs text-muted-foreground">
              أقسام لديها تقارير
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* رسم بياني للحالات */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع التقارير حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* رسم بياني للأقسام */}
        <Card>
          <CardHeader>
            <CardTitle>التقارير حسب الأقسام</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="open" stackId="a" fill="#FF8042" name="مفتوح" />
                <Bar dataKey="closed" stackId="a" fill="#00C49F" name="مغلق" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* الرسم البياني الزمني */}
      <Card>
        <CardHeader>
          <CardTitle>التقارير اليومية (آخر 7 أيام)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statistics.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="إجمالي التقارير"
              />
              <Line 
                type="monotone" 
                dataKey="open" 
                stroke="#FF8042" 
                strokeWidth={2}
                name="مفتوح"
              />
              <Line 
                type="monotone" 
                dataKey="closed" 
                stroke="#00C49F" 
                strokeWidth={2}
                name="مغلق"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}