"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { allDepartments } from "@/lib/departments";
import { formatReportNumber } from '@/lib/report-utils';

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
  closedBy?: string;
};

interface ExportReportsProps {
  reports: Report[];
  filteredCount?: number;
  totalCount?: number;
}

function formatLocation(location: ReportLocation): string {
  if (location.source === 'q-address' && location.zone && location.street && location.building) {
    return `عنواني: ${location.zone}/${location.street}/${location.building}`;
  }
  if (location.description) {
    return location.description;
  }
  return `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`;
}

function getStatusText(status: string) {
  switch (status) {
    case "open": return "مفتوح";
    case "closed": return "مغلق";
    default: return "غير معروف";
  }
}

export function ExportReports({ reports, filteredCount, totalCount }: ExportReportsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToExcel = async (format: 'basic' | 'detailed' = 'basic') => {
    if (reports.length === 0) {
      toast({
        variant: "destructive",
        title: "لا توجد بيانات للتصدير",
        description: "لا توجد تقارير لتصديرها"
      });
      return;
    }

    setIsExporting(true);

    try {
      // إعداد البيانات للتصدير
      let exportData;
      
      if (format === 'basic') {
        // تصدير أساسي - البيانات الأساسية فقط
        exportData = reports.map((report, index) => ({
          'الرقم التسلسلي': index + 1,
          'رقم البلاغ': report.reportNumber ? formatReportNumber(report.reportNumber) : `...${report.id.slice(-6)}`,
          'اسم الموظف': report.submitterName || 'غير محدد',
          'الرقم الوظيفي': report.submitterEmployeeId || 'غير محدد',
          'الرقم المساحي': report.surveyNumber || 'غير محدد',
          'الموضوع': report.subject || 'بلاغ عام',
          'الحالة': getStatusText(report.status),
          'القسم المختص': allDepartments.find(d => d.id === report.departmentId)?.name || 'غير محدد',
          'الموقع': formatLocation(report.location),
          'تاريخ الإنشاء': report.createdAt?.toDate().toLocaleDateString('ar-QA') || 'غير محدد',
          'تاريخ الإغلاق': report.closedAt?.toDate().toLocaleDateString('ar-QA') || '-',
        }));
      } else {
        // تصدير مفصل - جميع البيانات
        exportData = reports.map((report, index) => ({
          'الرقم التسلسلي': index + 1,
          'معرف البلاغ': report.id,
          'رقم البلاغ': report.reportNumber ? formatReportNumber(report.reportNumber) : `...${report.id.slice(-6)}`,
          'اسم الموظف': report.submitterName || 'غير محدد',
          'الرقم الوظيفي': report.submitterEmployeeId || 'غير محدد',
          'معرف المُبلغ': report.submitterId,
          'الرقم المساحي': report.surveyNumber || 'غير محدد',
          'الموضوع': report.subject || 'بلاغ عام',
          'الوصف': report.description,
          'الحالة': getStatusText(report.status),
          'القسم المختص': allDepartments.find(d => d.id === report.departmentId)?.name || 'غير محدد',
          'معرف القسم': report.departmentId,
          'الموقع': formatLocation(report.location),
          'خط العرض': report.location.latitude,
          'خط الطول': report.location.longitude,
          'مصدر الموقع': report.location.source === 'manual' ? 'يدوي' : 'عنواني',
          'تاريخ الإنشاء': report.createdAt?.toDate().toLocaleDateString('ar-QA') || 'غير محدد',
          'وقت الإنشاء': report.createdAt?.toDate().toLocaleTimeString('ar-QA') || 'غير محدد',
          'تاريخ الإغلاق': report.closedAt?.toDate().toLocaleDateString('ar-QA') || '-',
          'وقت الإغلاق': report.closedAt?.toDate().toLocaleTimeString('ar-QA') || '-',
          'مُغلق بواسطة': report.closedBy || '-',
        }));
      }

      // إنشاء workbook جديد
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // تحسين عرض الأعمدة
      const colWidths = Object.keys(exportData[0] || {}).map(() => ({ width: 20 }));
      ws['!cols'] = colWidths;

      // إضافة الورقة إلى الملف
      XLSX.utils.book_append_sheet(wb, ws, "تقارير بلدية الريان");

      // إضافة ورقة إحصائيات
      const stats = [
        { 'الإحصائية': 'إجمالي التقارير', 'القيمة': reports.length },
        { 'الإحصائية': 'التقارير المفتوحة', 'القيمة': reports.filter(r => r.status === 'open').length },
        { 'الإحصائية': 'التقارير المغلقة', 'القيمة': reports.filter(r => r.status === 'closed').length },
        { 'الإحصائية': 'تاريخ التصدير', 'القيمة': new Date().toLocaleDateString('ar-QA') },
        { 'الإحصائية': 'وقت التصدير', 'القيمة': new Date().toLocaleTimeString('ar-QA') },
      ];

      // إضافة إحصائيات الأقسام
      allDepartments.forEach(dept => {
        const deptCount = reports.filter(r => r.departmentId === dept.id).length;
        if (deptCount > 0) {
          stats.push({
            'الإحصائية': `تقارير ${dept.name}`,
            'القيمة': deptCount
          });
        }
      });

      const statsWs = XLSX.utils.json_to_sheet(stats);
      statsWs['!cols'] = [{ width: 30 }, { width: 15 }];
      XLSX.utils.book_append_sheet(wb, statsWs, "الإحصائيات");

      // تحديد اسم الملف
      const fileName = `تقارير-بلدية-الريان-${format === 'detailed' ? 'مفصل' : 'أساسي'}-${new Date().toISOString().split('T')[0]}.xlsx`;

      // تصدير الملف
      XLSX.writeFile(wb, fileName);

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${reports.length} تقرير إلى ملف Excel`
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات. يرجى المحاولة مرة أخرى."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportSummaryReport = async () => {
    setIsExporting(true);

    try {
      // إعداد تقرير ملخص الإحصائيات
      const totalReports = reports.length;
      const openReports = reports.filter(r => r.status === 'open').length;
      const closedReports = reports.filter(r => r.status === 'closed').length;

      // إحصائيات الأقسام
      const departmentStats = allDepartments.map(dept => {
        const deptReports = reports.filter(r => r.departmentId === dept.id);
        const deptOpen = deptReports.filter(r => r.status === 'open').length;
        const deptClosed = deptReports.filter(r => r.status === 'closed').length;

        return {
          'القسم': dept.name,
          'إجمالي التقارير': deptReports.length,
          'المفتوحة': deptOpen,
          'المغلقة': deptClosed,
          'نسبة الإنجاز': deptReports.length > 0 ? `${((deptClosed / deptReports.length) * 100).toFixed(1)}%` : '0%'
        };
      }).filter(stat => stat['إجمالي التقارير'] > 0);

      // إحصائيات زمنية (آخر 30 يوم)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentReports = reports.filter(r => {
        const reportDate = r.createdAt?.toDate();
        return reportDate && reportDate >= thirtyDaysAgo;
      });

      const monthlyStats = [
        { 'الفترة': 'آخر 30 يوم', 'عدد التقارير': recentReports.length },
        { 'الفترة': 'المفتوحة (آخر 30 يوم)', 'عدد التقارير': recentReports.filter(r => r.status === 'open').length },
        { 'الفترة': 'المغلقة (آخر 30 يوم)', 'عدد التقارير': recentReports.filter(r => r.status === 'closed').length },
      ];

      // إنشاء workbook
      const wb = XLSX.utils.book_new();

      // ورقة الملخص العام
      const summary = [
        { 'البيان': 'إجمالي التقارير', 'العدد': totalReports },
        { 'البيان': 'التقارير المفتوحة', 'العدد': openReports },
        { 'البيان': 'التقارير المغلقة', 'العدد': closedReports },
        { 'البيان': 'نسبة الإنجاز العامة', 'العدد': totalReports > 0 ? `${((closedReports / totalReports) * 100).toFixed(1)}%` : '0%' },
        { 'البيان': 'تاريخ التقرير', 'العدد': new Date().toLocaleDateString('ar-QA') },
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summary);
      summaryWs['!cols'] = [{ width: 25 }, { width: 15 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, "الملخص العام");

      // ورقة إحصائيات الأقسام
      if (departmentStats.length > 0) {
        const deptWs = XLSX.utils.json_to_sheet(departmentStats);
        deptWs['!cols'] = [{ width: 20 }, { width: 15 }, { width: 12 }, { width: 12 }, { width: 15 }];
        XLSX.utils.book_append_sheet(wb, deptWs, "إحصائيات الأقسام");
      }

      // ورقة الإحصائيات الزمنية
      const monthlyWs = XLSX.utils.json_to_sheet(monthlyStats);
      monthlyWs['!cols'] = [{ width: 25 }, { width: 15 }];
      XLSX.utils.book_append_sheet(wb, monthlyWs, "الإحصائيات الزمنية");

      const fileName = `ملخص-تقارير-بلدية-الريان-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "تم إنشاء التقرير التحليلي",
        description: "تم تصدير تقرير ملخص الإحصائيات بنجاح"
      });

    } catch (error) {
      console.error('Summary export error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء التقرير",
        description: "حدث خطأ أثناء إنشاء التقرير التحليلي"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          تصدير ({reports.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>تصدير التقارير</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => exportToExcel('basic')}
          disabled={isExporting || reports.length === 0}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          تصدير أساسي (Excel)
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => exportToExcel('detailed')}
          disabled={isExporting || reports.length === 0}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          تصدير مفصل (Excel)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={exportSummaryReport}
          disabled={isExporting || reports.length === 0}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          تقرير تحليلي
        </DropdownMenuItem>
        
        {filteredCount !== undefined && totalCount !== undefined && filteredCount < totalCount && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              سيتم تصدير {filteredCount} من أصل {totalCount} تقرير
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}