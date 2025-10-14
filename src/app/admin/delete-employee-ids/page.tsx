"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { EmployeeIdDeletionService, DeleteResult } from '@/lib/delete-employee-ids';
import { AdvancedSearchService } from '@/lib/advanced-search';
import { ComprehensiveSearchService } from '@/lib/comprehensive-search';
import { DeepSearchService } from '@/lib/deep-search';
import { Trash2, Search, CheckCircle, XCircle, AlertTriangle, Database } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function DeleteEmployeeIdsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [advancedSearchResults, setAdvancedSearchResults] = useState<any>(null);
  const [isAdvancedSearching, setIsAdvancedSearching] = useState(false);
  const [comprehensiveSearchResults, setComprehensiveSearchResults] = useState<any>(null);
  const [isComprehensiveSearching, setIsComprehensiveSearching] = useState(false);
  const [deepSearchResults, setDeepSearchResults] = useState<any>(null);
  const [isDeepSearching, setIsDeepSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<string>('');
  const [deleteResults, setDeleteResults] = useState<DeleteResult | null>(null);
  const [employeeIdsInput, setEmployeeIdsInput] = useState<string>('');
  const [employeeIdsToSearch, setEmployeeIdsToSearch] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (!user) {
        router.push('/login/employee');
        return;
      }

      // Check if user is admin or system admin
      try {
        const userDoc = await import('@/lib/firebase').then(m => m.db);
        const { doc, getDoc } = await import('firebase/firestore');
        const userDocRef = doc(userDoc, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const role = userData.role;
          
          console.log('🔍 التحقق من الصلاحيات:');
          console.log(`المستخدم: ${user.email}`);
          console.log(`الدور: ${role}`);
          
          // السماح للمديرين (admin) ومديري النظام (system_admin) بالوصول
          if (role !== 'admin' && role !== 'system_admin') {
            console.log('❌ غير مصرح - توجيه إلى لوحة المعلومات');
            toast({
              variant: "destructive",
              title: "غير مصرح",
              description: "هذه الصفحة متاحة للمديرين فقط"
            });
            router.push('/dashboard');
            return;
          }
          
          // حفظ دور المستخدم للاستخدام في عمليات الحذف
          setUserRole(role);
          console.log('✅ مصرح - يمكن الوصول للصفحة');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('خطأ في التحقق من الصلاحيات:', error);
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleParseEmployeeIds = () => {
    // تحليل النص المدخل وتحويله إلى مصفوفة من الأرقام الوظيفية
    const ids = employeeIdsInput
      .split(/[\n,،;؛\s]+/) // فصل بواسطة فواصل، أسطر جديدة، أو مسافات
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    setEmployeeIdsToSearch(ids);
    
    if (ids.length > 0) {
      toast({
        title: "تم تحليل الأرقام الوظيفية",
        description: `تم العثور على ${ids.length} رقم وظيفي للبحث`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال أرقام وظيفية صحيحة",
      });
    }
  };

  const handleSearch = async () => {
    if (employeeIdsToSearch.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال أرقام وظيفية للبحث",
      });
      return;
    }
    
    setIsSearching(true);
    setSelectedDocuments(new Set()); // إعادة تعيين التحديدات
    try {
      const results = await EmployeeIdDeletionService.searchEmployeeIds(employeeIdsToSearch);
      setSearchResults(results);
      
      toast({
        title: "تم البحث بنجاح",
        description: `وُجد ${Object.keys(results.found).length} رقم وظيفي، ولم يُوجد ${results.notFound.length} رقم`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في البحث",
        description: error.message,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdvancedSearch = async () => {
    if (employeeIdsToSearch.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال أرقام وظيفية للبحث",
      });
      return;
    }
    
    setIsAdvancedSearching(true);
    setSelectedDocuments(new Set());
    try {
      const results = await AdvancedSearchService.searchAllCollections(employeeIdsToSearch);
      setAdvancedSearchResults(results);
      
      toast({
        title: "تم البحث المتقدم بنجاح",
        description: `فحص ${results.summary.totalCollections} مجموعة، وُجد ${results.summary.foundIds.length} رقم وظيفي`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في البحث المتقدم",
        description: error.message,
      });
    } finally {
      setIsAdvancedSearching(false);
    }
  };

  const handleComprehensiveSearch = async () => {
    if (employeeIdsToSearch.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال أرقام وظيفية للبحث",
      });
      return;
    }
    
    setIsComprehensiveSearching(true);
    setSelectedDocuments(new Set());
    try {
      const results = await ComprehensiveSearchService.searchEverywhere(employeeIdsToSearch);
      setComprehensiveSearchResults(results);
      
      toast({
        title: "تم البحث الشامل بنجاح",
        description: `فحص ${results.summary.totalCollections} مجموعة، وُجد ${results.summary.foundIds.length} رقم وظيفي في ${results.summary.totalDocuments} مستند`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في البحث الشامل",
        description: error.message,
      });
    } finally {
      setIsComprehensiveSearching(false);
    }
  };

  const handleDeepSearch = async () => {
    if (employeeIdsToSearch.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال أرقام وظيفية للبحث",
      });
      return;
    }
    
    setIsDeepSearching(true);
    setSearchProgress('بدء البحث العميق...');
    setSelectedDocuments(new Set());
    
    try {
      // إضافة تأخير بين العمليات لتجنب الحمل الزائد
      setSearchProgress('البحث في المجموعات الأساسية...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchProgress('البحث في المستندات المتداخلة...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchProgress('البحث في مجموعات النظام...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchProgress('البحث في مستندات التكوين...');
      const results = await DeepSearchService.deepSearchEverywhere(employeeIdsToSearch);
      setDeepSearchResults(results);
      
      setSearchProgress('انتهاء البحث...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "تم البحث العميق بنجاح",
        description: `فحص شامل في جميع المجموعات، وُجد ${results.summary.foundIds.length} رقم وظيفي في ${results.summary.totalDocuments} مستند`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في البحث العميق",
        description: error.message,
      });
    } finally {
      setIsDeepSearching(false);
      setSearchProgress('');
    }
  };

  const handleToggleDocument = (docId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    const allDocIds = new Set<string>();
    
    // جمع جميع معرفات المستندات من نتائج البحث
    if (searchResults) {
      Object.values(searchResults.found).forEach((docs: any) => {
        docs.forEach((doc: any) => allDocIds.add(doc.id));
      });
    }
    
    if (advancedSearchResults) {
      advancedSearchResults.results.forEach((result: any) => {
        result.documents.forEach((doc: any) => allDocIds.add(doc.id));
      });
    }
    
    if (comprehensiveSearchResults) {
      comprehensiveSearchResults.results.forEach((result: any) => {
        allDocIds.add(result.documentId);
      });
    }
    
    if (deepSearchResults) {
      deepSearchResults.results.forEach((result: any) => {
        allDocIds.add(result.documentId);
      });
    }
    
    setSelectedDocuments(allDocIds);
  };

  const handleDeselectAll = () => {
    setSelectedDocuments(new Set());
  };

  const handleDelete = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار مستند واحد على الأقل للحذف",
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      const result = await EmployeeIdDeletionService.deleteSpecificDocuments(
        Array.from(selectedDocuments),
        user?.email,
        userRole
      );
      setDeleteResults(result);
      
      if (result.success) {
        toast({
          title: "تم الحذف بنجاح! ✅",
          description: `تم حذف ${result.deletedCount} مستند بنجاح`,
        });
        // إعادة تعيين التحديدات والنتائج
        setSelectedDocuments(new Set());
        setSearchResults(null);
        setAdvancedSearchResults(null);
        setComprehensiveSearchResults(null);
        setDeepSearchResults(null);
      } else {
        toast({
          variant: "destructive",
          title: "فشل في الحذف",
          description: `تم حذف ${result.deletedCount} مستند، ولكن حدثت ${result.errors.length} أخطاء`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const systemAdminEmail = "sweetdream711711@gmail.com";
  const userEmail = user?.email?.toLowerCase();

  console.log('🔍 التحقق النهائي من الصلاحيات:');
  console.log(`المستخدم: ${userEmail}`);
  console.log(`مدير النظام: ${systemAdminEmail.toLowerCase()}`);
  console.log(`مطابق: ${userEmail === systemAdminEmail.toLowerCase()}`);

  if (!user || userEmail !== systemAdminEmail.toLowerCase()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">غير مصرح لك بالوصول</h1>
          <p className="text-muted-foreground">هذه الميزة مخصصة فقط لمدير النظام الأساسي</p>
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <p><strong>البريد الحالي:</strong> {user?.email || 'غير محدد'}</p>
            <p><strong>البريد المطلوب:</strong> {systemAdminEmail}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="حذف أرقام وظيفية محددة">
        <div className="text-sm text-muted-foreground">
          مرحباً، {user?.displayName || user?.email}
        </div>
      </AppHeader>
      
      <main className="container mx-auto p-6 space-y-6">
        
        {/* إدخال الأرقام الوظيفية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              إدخال الأرقام الوظيفية
            </CardTitle>
            <CardDescription>
              أدخل الأرقام الوظيفية التي تريد البحث عنها (سطر واحد لكل رقم، أو افصل بفواصل)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <textarea
                  className="w-full min-h-32 p-3 border rounded-md font-mono text-sm resize-y"
                  placeholder="مثال:&#10;12012354&#10;12010906&#10;12001376&#10;&#10;أو: 12012354, 12010906, 12001376"
                  value={employeeIdsInput}
                  onChange={(e) => setEmployeeIdsInput(e.target.value)}
                />
              </div>
              <Button onClick={handleParseEmployeeIds} className="w-full">
                تحليل الأرقام الوظيفية
              </Button>
              
              {/* عرض الأرقام المحللة */}
              {employeeIdsToSearch.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    الأرقام الوظيفية للبحث ({employeeIdsToSearch.length}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {employeeIdsToSearch.map((id, index) => (
                      <span key={index} className="bg-blue-100 border border-blue-300 rounded px-2 py-1 text-sm font-mono text-blue-800">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* أزرار البحث والحذف */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات الحذف</CardTitle>
            <CardDescription>
              ابحث عن الأرقام أولاً للتأكد من وجودها، ثم احذفها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || isAdvancedSearching}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {isSearching ? 'جاري البحث...' : 'البحث العادي'}
              </Button>

              <Button 
                onClick={handleAdvancedSearch} 
                disabled={isSearching || isAdvancedSearching || isComprehensiveSearching}
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Database className="h-4 w-4" />
                {isAdvancedSearching ? 'جاري البحث المتقدم...' : 'البحث المتقدم'}
              </Button>

              <Button 
                onClick={handleComprehensiveSearch} 
                disabled={isSearching || isAdvancedSearching || isComprehensiveSearching || isDeepSearching}
                variant="outline"
                className="flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <Search className="h-4 w-4" />
                {isComprehensiveSearching ? 'جاري البحث الشامل...' : 'البحث الشامل'}
              </Button>

              <Button 
                onClick={handleDeepSearch} 
                disabled={isSearching || isAdvancedSearching || isComprehensiveSearching || isDeepSearching}
                variant="outline"
                className="flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                <Database className="h-4 w-4" />
                {isDeepSearching ? 'جاري البحث العميق...' : 'البحث العميق'}
              </Button>
            </div>
            
            {/* مؤشر التقدم */}
            {isDeepSearching && searchProgress && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700 font-medium">{searchProgress}</span>
                </div>
              </div>
            )}
            
            {/* إحصائيات التحديد */}
            {(searchResults || advancedSearchResults || comprehensiveSearchResults || deepSearchResults) && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">
                    المستندات المحددة للحذف: {selectedDocuments.size}
                  </h4>
                  <div className="flex gap-2">
                    <Button onClick={handleSelectAll} size="sm" variant="outline">
                      تحديد الكل
                    </Button>
                    <Button onClick={handleDeselectAll} size="sm" variant="outline">
                      إلغاء التحديد
                    </Button>
                  </div>
                </div>
                {selectedDocuments.size > 0 && (
                  <div className="text-sm text-gray-600">
                    <strong>المستندات المحددة:</strong>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Array.from(selectedDocuments).map(docId => (
                        <span key={docId} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-mono">
                          {docId.substring(0, 8)}...
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-4 flex-wrap mt-4">
              <Button 
                onClick={handleDelete} 
                disabled={isDeleting || selectedDocuments.size === 0}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'جاري الحذف...' : `حذف ${selectedDocuments.size} مستند`}
              </Button>
            </div>
            
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه. تأكد من أن هذه الأرقام مكررة أو ناقصة.
                <br />
                🔒 هذه الميزة مخصصة فقط لمدير النظام الأساسي: sweetdream711711@gmail.com
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* نتائج البحث */}
        {searchResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-600" />
                نتائج البحث المتقدم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* إحصائيات عامة */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">إحصائيات البحث:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">إجمالي المستخدمين:</span>
                      <span className="ml-2">{searchResults.allUsers?.length || 0}</span>
                    </div>
                    <div>
                      <span className="font-semibold">الأرقام الموجودة:</span>
                      <span className="ml-2 text-green-600">{Object.keys(searchResults.found).length}</span>
                    </div>
                    <div>
                      <span className="font-semibold">الأرقام غير الموجودة:</span>
                      <span className="ml-2 text-red-600">{searchResults.notFound?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* الأرقام الموجودة */}
                {Object.keys(searchResults.found).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">
                      الأرقام الموجودة ({Object.keys(searchResults.found).length}):
                    </h4>
                    {Object.entries(searchResults.found).map(([employeeId, docs]) => (
                      <div key={employeeId} className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                        <div className="font-mono font-semibold text-green-800 mb-2">{employeeId}</div>
                        {(docs as any[]).map((doc: any) => (
                          <div key={doc.id} className="flex items-start gap-2 p-2 bg-white rounded mb-1 hover:bg-gray-50">
                            <Checkbox
                              checked={selectedDocuments.has(doc.id)}
                              onCheckedChange={() => handleToggleDocument(doc.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="text-sm text-green-700">
                                <strong>ID:</strong> <span className="font-mono text-xs">{doc.id}</span>
                              </div>
                              <div className="text-xs text-green-600">
                                <strong>البريد:</strong> {doc.email || 'غير محدد'}
                              </div>
                              {doc.name && (
                                <div className="text-xs text-green-600">
                                  <strong>الاسم:</strong> {doc.name}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* الأرقام غير الموجودة */}
                {searchResults.notFound && searchResults.notFound.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">
                      الأرقام غير الموجودة ({searchResults.notFound.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.notFound.map((id: string) => (
                        <span key={id} className="bg-red-100 border border-red-200 rounded px-2 py-1 text-sm font-mono text-red-800">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* معلومات التشخيص */}
                {searchResults.debugInfo && searchResults.debugInfo.length > 0 && (
                  <details className="bg-gray-50 border border-gray-200 rounded p-3">
                    <summary className="font-semibold text-gray-700 cursor-pointer">
                      معلومات التشخيص ({searchResults.debugInfo.length} سطر)
                    </summary>
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs font-mono text-gray-600">
                      {searchResults.debugInfo.map((info: string, index: number) => (
                        <div key={index} className="py-1 border-b border-gray-100 last:border-b-0">
                          {info}
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* جميع المستخدمين (مختصر) */}
                {searchResults.allUsers && searchResults.allUsers.length > 0 && (
                  <details className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <summary className="font-semibold text-yellow-700 cursor-pointer">
                      جميع المستخدمين ({searchResults.allUsers.length} مستخدم)
                    </summary>
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs">
                      {searchResults.allUsers.map((user: any, index: number) => (
                        <div key={index} className="py-1 border-b border-yellow-100 last:border-b-0 flex justify-between">
                          <span className="font-mono">{user.employeeId || 'بدون رقم وظيفي'}</span>
                          <span className="text-gray-500">{user.email || user.id}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* نتائج البحث المتقدم */}
        {advancedSearchResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                نتائج البحث المتقدم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* ملخص البحث المتقدم */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">ملخص البحث المتقدم:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">المجموعات المفحوصة:</span>
                      <span className="ml-2">{advancedSearchResults.summary.totalCollections}</span>
                    </div>
                    <div>
                      <span className="font-semibold">إجمالي المستندات:</span>
                      <span className="ml-2">{advancedSearchResults.summary.totalDocuments}</span>
                    </div>
                    <div>
                      <span className="font-semibold">الأرقام الموجودة:</span>
                      <span className="ml-2 text-green-600">{advancedSearchResults.summary.foundIds.length}</span>
                    </div>
                    <div>
                      <span className="font-semibold">الأرقام غير الموجودة:</span>
                      <span className="ml-2 text-red-600">{advancedSearchResults.summary.notFoundIds.length}</span>
                    </div>
                  </div>
                </div>

                {/* الأرقام الموجودة */}
                {advancedSearchResults.summary.foundIds.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">
                      الأرقام الموجودة ({advancedSearchResults.summary.foundIds.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {advancedSearchResults.summary.foundIds.map((id: string) => (
                        <span key={id} className="bg-green-100 border border-green-300 rounded px-2 py-1 text-sm font-mono text-green-800">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* الأرقام غير الموجودة */}
                {advancedSearchResults.summary.notFoundIds.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">
                      الأرقام غير الموجودة ({advancedSearchResults.summary.notFoundIds.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {advancedSearchResults.summary.notFoundIds.map((id: string) => (
                        <span key={id} className="bg-red-100 border border-red-200 rounded px-2 py-1 text-sm font-mono text-red-800">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* تفاصيل المجموعات */}
                {advancedSearchResults.results.map((result: any, index: number) => (
                  <details key={index} className="bg-gray-50 border border-gray-200 rounded p-3">
                    <summary className="font-semibold text-gray-700 cursor-pointer">
                      {result.collection} ({result.totalCount} مستند)
                    </summary>
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs">
                      {result.documents.slice(0, 10).map((doc: any, docIndex: number) => (
                        <div key={docIndex} className="py-1 border-b border-gray-100 last:border-b-0">
                          <div className="font-mono text-gray-600">
                            {doc.employeeId || 'بدون رقم وظيفي'} - {doc.email || doc.id}
                          </div>
                        </div>
                      ))}
                      {result.documents.length > 10 && (
                        <div className="text-gray-500 text-center py-2">
                          ... و {result.documents.length - 10} مستند آخر
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* نتائج البحث الشامل */}
        {comprehensiveSearchResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-600" />
                نتائج البحث الشامل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* ملخص البحث الشامل */}
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h4 className="font-semibold text-purple-800 mb-2">ملخص البحث الشامل:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">المجموعات المفحوصة:</span>
                      <span className="ml-2">{comprehensiveSearchResults.summary.totalCollections}</span>
                    </div>
                    <div>
                      <span className="font-semibold">المستندات المطابقة:</span>
                      <span className="ml-2">{comprehensiveSearchResults.summary.totalDocuments}</span>
                    </div>
                    <div>
                      <span className="font-semibold">المجموعات التي تحتوي على بيانات:</span>
                      <span className="ml-2">{comprehensiveSearchResults.summary.collectionsWithData.length}</span>
                    </div>
                    <div>
                      <span className="font-semibold">الأرقام الموجودة:</span>
                      <span className="ml-2 text-green-600">{comprehensiveSearchResults.summary.foundIds.length}</span>
                    </div>
                  </div>
                </div>

                {/* الأرقام الموجودة */}
                {comprehensiveSearchResults.summary.foundIds.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">
                      الأرقام الموجودة ({comprehensiveSearchResults.summary.foundIds.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {comprehensiveSearchResults.summary.foundIds.map((id: string) => (
                        <span key={id} className="bg-green-100 border border-green-300 rounded px-2 py-1 text-sm font-mono text-green-800">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* الأرقام غير الموجودة */}
                {comprehensiveSearchResults.summary.notFoundIds.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">
                      الأرقام غير الموجودة ({comprehensiveSearchResults.summary.notFoundIds.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {comprehensiveSearchResults.summary.notFoundIds.map((id: string) => (
                        <span key={id} className="bg-red-100 border border-red-200 rounded px-2 py-1 text-sm font-mono text-red-800">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* المجموعات التي تحتوي على بيانات */}
                {comprehensiveSearchResults.summary.collectionsWithData.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">
                      المجموعات التي تحتوي على بيانات ({comprehensiveSearchResults.summary.collectionsWithData.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {comprehensiveSearchResults.summary.collectionsWithData.map((collection: string) => (
                        <span key={collection} className="bg-blue-100 border border-blue-300 rounded px-2 py-1 text-sm font-mono text-blue-800">
                          {collection}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* تفاصيل النتائج */}
                {comprehensiveSearchResults.results.map((result: any, index: number) => (
                  <details key={index} className="bg-gray-50 border border-gray-200 rounded p-3">
                    <summary className="font-semibold text-gray-700 cursor-pointer">
                      {result.collection}/{result.documentId} - {result.matchType}
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div className="text-sm">
                        <strong>الحقول المطابقة:</strong>
                        <div className="ml-4 mt-1">
                          {Object.entries(result.foundFields).map(([field, value]) => (
                            <div key={field} className="font-mono text-xs bg-yellow-50 p-1 rounded mb-1">
                              {field}: "{String(value)}"
                            </div>
                          ))}
                        </div>
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600">عرض البيانات الكاملة</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* نتائج البحث العميق */}
        {deepSearchResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-red-600" />
                نتائج البحث العميق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* ملخص البحث العميق */}
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <h4 className="font-semibold text-red-800 mb-2">ملخص البحث العميق:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">المجموعات المفحوصة:</span>
                      <span className="ml-2">{deepSearchResults.summary.totalCollections}</span>
                    </div>
                    <div>
                      <span className="font-semibold">المستندات المطابقة:</span>
                      <span className="ml-2">{deepSearchResults.summary.totalDocuments}</span>
                    </div>
                    <div>
                      <span className="font-semibold">المجموعات التي تحتوي على بيانات:</span>
                      <span className="ml-2">{deepSearchResults.summary.collectionsWithData.length}</span>
                    </div>
                    <div>
                      <span className="font-semibold">الأرقام الموجودة:</span>
                      <span className="ml-2 text-green-600">{deepSearchResults.summary.foundIds.length}</span>
                    </div>
                  </div>
                </div>

                {/* الأرقام الموجودة */}
                {deepSearchResults.summary.foundIds.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">
                      الأرقام الموجودة ({deepSearchResults.summary.foundIds.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {deepSearchResults.summary.foundIds.map((id: string) => (
                        <span key={id} className="bg-green-100 border border-green-300 rounded px-2 py-1 text-sm font-mono text-green-800">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* الأرقام غير الموجودة */}
                {deepSearchResults.summary.notFoundIds.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">
                      الأرقام غير الموجودة ({deepSearchResults.summary.notFoundIds.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {deepSearchResults.summary.notFoundIds.map((id: string) => (
                        <span key={id} className="bg-red-100 border border-red-200 rounded px-2 py-1 text-sm font-mono text-red-800">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* تفاصيل البحث العميق */}
                {deepSearchResults.results.map((result: any, index: number) => (
                  <details key={index} className="bg-gray-50 border border-gray-200 rounded p-3">
                    <summary className="font-semibold text-gray-700 cursor-pointer">
                      {result.collection}/{result.documentId} - {result.matchType} ({result.searchDepth})
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div className="text-sm">
                        <strong>الحقول المطابقة:</strong>
                        <div className="ml-4 mt-1">
                          {Object.entries(result.foundFields).map(([field, value]) => (
                            <div key={field} className="font-mono text-xs bg-yellow-50 p-1 rounded mb-1">
                              {field}: "{String(value)}"
                            </div>
                          ))}
                        </div>
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600">عرض البيانات الكاملة</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* نتائج الحذف */}
        {deleteResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {deleteResults.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                نتائج الحذف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* إحصائيات الحذف */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="text-green-800 font-semibold">تم الحذف بنجاح</div>
                    <div className="text-green-600">{deleteResults.deletedCount} مستند</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="text-red-800 font-semibold">الأخطاء</div>
                    <div className="text-red-600">{deleteResults.errors.length} خطأ</div>
                  </div>
                </div>

                {/* الأرقام المحذوفة */}
                {deleteResults.deletedIds.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">الأرقام المحذوفة:</h4>
                    <div className="flex flex-wrap gap-2">
                      {deleteResults.deletedIds.map((id: string) => (
                        <span key={id} className="bg-green-100 border border-green-300 rounded px-2 py-1 text-sm font-mono text-green-800">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* تفاصيل الأخطاء */}
                {deleteResults.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">تفاصيل الأخطاء:</h4>
                    <div className="space-y-2">
                      {deleteResults.errors.map((error: string, index: number) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}
