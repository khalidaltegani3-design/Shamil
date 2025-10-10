import { useState, useMemo } from 'react';

export interface ReportFilters {
  status?: string;
  departmentId?: string;
  startDate?: Date;
  endDate?: Date;
  reportNumber?: string;
  submitterName?: string;
  subject?: string;
}

type Report = {
  id: string;
  reportNumber?: number;
  surveyNumber?: string;
  subject: string;
  description: string;
  status: "open" | "closed";
  submitterId: string;
  submitterName?: string;
  createdAt: any;
  departmentId: string;
  location: any;
  closedAt?: any;
  closedBy?: string;
};

export function useReportFilters(reports: Report[]) {
  const [filters, setFilters] = useState<ReportFilters>({});

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // فلترة حسب الحالة
      if (filters.status && report.status !== filters.status) return false;
      
      // فلترة حسب القسم
      if (filters.departmentId && report.departmentId !== filters.departmentId) return false;
      
      // فلترة حسب رقم البلاغ
      if (filters.reportNumber) {
        const reportNumberStr = report.reportNumber?.toString() || report.id;
        if (!reportNumberStr.toLowerCase().includes(filters.reportNumber.toLowerCase())) return false;
      }
      
      // فلترة حسب الموضوع
      if (filters.subject && !report.subject.toLowerCase().includes(filters.subject.toLowerCase())) return false;
      
      // فلترة حسب اسم المُبلغ
      if (filters.submitterName && report.submitterName && 
          !report.submitterName.toLowerCase().includes(filters.submitterName.toLowerCase())) return false;
      
      // فلترة حسب التاريخ
      if (filters.startDate || filters.endDate) {
        const reportDate = report.createdAt?.toDate();
        if (!reportDate) return false;
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (reportDate < startDate) return false;
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (reportDate > endDate) return false;
        }
      }
      
      return true;
    });
  }, [reports, filters]);

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof ReportFilters];
    return value !== undefined && value !== null && value !== '';
  }).length;

  const handleFiltersChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return {
    filters,
    filteredReports,
    activeFiltersCount,
    handleFiltersChange,
    handleResetFilters,
  };
}