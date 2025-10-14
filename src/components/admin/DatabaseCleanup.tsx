"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Trash2, CheckCircle, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { UserCreationService } from '@/lib/user-creation-service';

export default function DatabaseCleanup() {
  const [loading, setLoading] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<any>(null);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const checkDatabaseIntegrity = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await UserCreationService.checkDatabaseIntegrity();
      setIntegrityResult(result);
      setSuccess('تم فحص قاعدة البيانات بنجاح');
    } catch (err: any) {
      setError(`فشل في فحص قاعدة البيانات: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cleanupDuplicateData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await UserCreationService.cleanupDuplicateEmployeeIds();
      setCleanupResult(result);
      setSuccess(`تم تنظيف ${result.cleaned} سجل مكرر`);
      
      if (result.errors.length > 0) {
        setError(`بعض الأخطاء حدثت: ${result.errors.join(', ')}`);
      }
    } catch (err: any) {
      setError(`فشل في تنظيف البيانات: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrityStatus = () => {
    if (!integrityResult) return 'unknown';
    
    const hasIssues = integrityResult.incompleteUsers > 0 || 
                     integrityResult.duplicateEmployeeIds > 0 ||
                     integrityResult.issues.length > 0;
    
    return hasIssues ? 'warning' : 'healthy';
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تنظيف قاعدة البيانات</h1>
          <p className="text-muted-foreground">فحص وإصلاح مشاكل سلامة البيانات</p>
        </div>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="integrity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrity">فحص السلامة</TabsTrigger>
          <TabsTrigger value="cleanup">تنظيف البيانات</TabsTrigger>
          <TabsTrigger value="logs">سجل المشاكل</TabsTrigger>
        </TabsList>

        <TabsContent value="integrity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                فحص سلامة قاعدة البيانات
              </CardTitle>
              <CardDescription>
                فحص البيانات المكررة والناقصة في قاعدة البيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={checkDatabaseIntegrity} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'جاري الفحص...' : 'فحص قاعدة البيانات'}
              </Button>

              {integrityResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{integrityResult.totalUsers}</div>
                        <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          {integrityResult.incompleteUsers}
                        </div>
                        <p className="text-sm text-muted-foreground">مستخدمين ناقصي البيانات</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">
                          {integrityResult.duplicateEmployeeIds}
                        </div>
                        <p className="text-sm text-muted-foreground">أرقام وظيفية مكررة</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {integrityResult.orphanedAuthAccounts}
                        </div>
                        <p className="text-sm text-muted-foreground">حسابات معزولة</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">حالة قاعدة البيانات:</span>
                    {getIntegrityStatus() === 'healthy' ? (
                      <Badge className="bg-green-500">سليمة</Badge>
                    ) : (
                      <Badge variant="destructive">تحتاج تنظيف</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                تنظيف البيانات المكررة
              </CardTitle>
              <CardDescription>
                حذف المستخدمين المكررين والناقصي البيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>تحذير:</strong> هذه العملية ستحذف البيانات المكررة نهائياً. 
                  تأكد من عمل نسخة احتياطية قبل المتابعة.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={cleanupDuplicateData} 
                disabled={loading || !integrityResult}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                {loading ? 'جاري التنظيف...' : 'تنظيف البيانات المكررة'}
              </Button>

              {cleanupResult && (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      تم حذف {cleanupResult.cleaned} سجل مكرر بنجاح
                    </AlertDescription>
                  </Alert>

                  {cleanupResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>أخطاء أثناء التنظيف:</strong>
                        <ul className="mt-2 list-disc list-inside">
                          {cleanupResult.errors.map((error: string, index: number) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                سجل المشاكل المكتشفة
              </CardTitle>
              <CardDescription>
                عرض تفاصيل المشاكل الموجودة في قاعدة البيانات
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrityResult && integrityResult.issues.length > 0 ? (
                <div className="space-y-2">
                  {integrityResult.issues.map((issue: string, index: number) => (
                    <Alert key={index} variant="outline">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{issue}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : integrityResult ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    لا توجد مشاكل في قاعدة البيانات
                  </AlertDescription>
                </Alert>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  قم بفحص قاعدة البيانات أولاً لعرض المشاكل
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>معلومات إضافية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• فحص السلامة يتحقق من البيانات المكررة والناقصة</p>
          <p>• تنظيف البيانات يحذف السجلات المكررة ويحتفظ بالأحدث</p>
          <p>• يُنصح بعمل نسخة احتياطية قبل أي عملية تنظيف</p>
          <p>• يمكن تكرار العملية حتى يتم حل جميع المشاكل</p>
        </CardContent>
      </Card>
    </div>
  );
}
