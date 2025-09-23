"use client";

import { useState } from "react";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { allDepartments } from "@/lib/departments";

export interface ReportFilters {
  status?: string;
  departmentId?: string;
  startDate?: Date;
  endDate?: Date;
  reportNumber?: string;
  submitterName?: string;
  subject?: string;
}

interface AdvancedFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  activeFiltersCount,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilter = (key: keyof ReportFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* أزرار التحكم */}
      <div className="flex items-center gap-2">
        <Button
          variant={isOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          فلترة متقدمة
          {activeFiltersCount > 0 && (
            <span className="bg-primary-foreground text-primary px-2 py-1 rounded-full text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="gap-2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* الفلاتر النشطة السريعة */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
              <span>الحالة: {filters.status === 'open' ? 'مفتوح' : 'مغلق'}</span>
              <button
                onClick={() => clearFilter('status')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.departmentId && (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
              <span>القسم: {allDepartments.find(d => d.id === filters.departmentId)?.name}</span>
              <button
                onClick={() => clearFilter('departmentId')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {(filters.startDate || filters.endDate) && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
              <span>
                التاريخ: {filters.startDate ? format(filters.startDate, "dd/MM/yyyy", { locale: ar }) : "البداية"} - {filters.endDate ? format(filters.endDate, "dd/MM/yyyy", { locale: ar }) : "النهاية"}
              </span>
              <button
                onClick={() => {
                  clearFilter('startDate');
                  clearFilter('endDate');
                }}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* لوحة الفلاتر المتقدمة */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">فلترة متقدمة للتقارير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* فلترة حسب الحالة */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">الحالة</Label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    <SelectItem value="open">مفتوح</SelectItem>
                    <SelectItem value="closed">مغلق</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* فلترة حسب القسم */}
              <div className="space-y-2">
                <Label htmlFor="department-filter">القسم</Label>
                <Select
                  value={filters.departmentId || ""}
                  onValueChange={(value) => handleFilterChange('departmentId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأقسام" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأقسام</SelectItem>
                    {allDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* البحث بالموضوع */}
              <div className="space-y-2">
                <Label htmlFor="subject-filter">الموضوع</Label>
                <Input
                  id="subject-filter"
                  placeholder="البحث في موضوع البلاغ..."
                  value={filters.subject || ""}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                />
              </div>

              {/* البحث برقم البلاغ */}
              <div className="space-y-2">
                <Label htmlFor="report-number-filter">رقم البلاغ</Label>
                <Input
                  id="report-number-filter"
                  placeholder="البحث برقم البلاغ..."
                  value={filters.reportNumber || ""}
                  onChange={(e) => handleFilterChange('reportNumber', e.target.value)}
                />
              </div>

              {/* البحث باسم المُبلغ */}
              <div className="space-y-2">
                <Label htmlFor="submitter-filter">اسم المُبلغ</Label>
                <Input
                  id="submitter-filter"
                  placeholder="البحث باسم المُبلغ..."
                  value={filters.submitterName || ""}
                  onChange={(e) => handleFilterChange('submitterName', e.target.value)}
                />
              </div>

            </div>

            {/* فلترة التاريخ */}
            <div className="space-y-4">
              <Label>فترة التقرير</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* تاريخ البداية */}
                <div className="space-y-2">
                  <Label htmlFor="start-date">من تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDate ? (
                          format(filters.startDate, "PPP", { locale: ar })
                        ) : (
                          <span>اختر تاريخ البداية</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date) => handleFilterChange('startDate', date)}
                        initialFocus
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* تاريخ النهاية */}
                <div className="space-y-2">
                  <Label htmlFor="end-date">إلى تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.endDate ? (
                          format(filters.endDate, "PPP", { locale: ar })
                        ) : (
                          <span>اختر تاريخ النهاية</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date) => handleFilterChange('endDate', date)}
                        initialFocus
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* أزرار العمل */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={onResetFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                مسح جميع الفلاتر
              </Button>
              
              <Button
                onClick={() => setIsOpen(false)}
                className="gap-2"
              >
                تطبيق الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}