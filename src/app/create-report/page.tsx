
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, collection, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateReportNumber, formatReportNumber } from '@/lib/report-utils';
import { ArrowLeft, Paperclip, X, File as FileIcon, Search, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { allDepartments } from '@/lib/departments';
import { useAuthState } from 'react-firebase-hooks/auth';
import Logo from '@/components/Logo';
import AppHeader from '@/components/AppHeader';

function CreateReportHeader() {
  const router = useRouter();
  return (
    <AppHeader title="إنشاء بلاغ جديد">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">رجوع</span>
      </Button>
    </AppHeader>
  );
}


export default function CreateReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [userHomeDepartmentId, setUserHomeDepartmentId] = useState<string | null>(null);
  const [userEmployeeId, setUserEmployeeId] = useState<string | null>(null);

  // التحقق من صلاحيات المستخدم عند تحميل الصفحة
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        router.push('/login/employee');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'employee') {
          toast({ 
            variant: "destructive", 
            title: "غير مصرح", 
            description: "ليس لديك صلاحية لإنشاء بلاغ. هذه الخدمة متاحة للموظفين فقط." 
          });
          router.push('/');
          return;
        }
        
        // تحميل إدارة المستخدم
        const userData = userDoc.data();
        setUserHomeDepartmentId(userData.homeDepartmentId || null);
        setUserEmployeeId(userData.employeeId || null);
      } catch (error) {
        console.error('Error checking user role:', error);
        toast({ 
          variant: "destructive", 
          title: "خطأ", 
          description: "حدث خطأ أثناء التحقق من الصلاحيات" 
        });
        router.push('/');
      }
    };

    if (!loading) {
      checkUserRole();
    }
  }, [user, loading, router, toast]);
  
  // Location state
  const [position, setPosition] = useState<[number, number] | null>([25.2854, 51.5310]); // Default to Doha
  const [locationSource, setLocationSource] = useState<"manual" | "q-address">("manual");
  
  // Qatari Address state
  const [zone, setZone] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [surveyNumber, setSurveyNumber] = useState<string>(''); // الرقم المساحي (اختياري)
  const [subject, setSubject] = useState<string>(''); // الموضوع
  const [departmentId, setDepartmentId] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // إنشاء قائمة الإدارات المتاحة (استثناء إدارة المستخدم)
  const availableDepartments = allDepartments.filter(dept => 
    userHomeDepartmentId ? dept.id !== userHomeDepartmentId : true
  );


  const Map = useMemo(() => dynamic(() => import('@/components/map'), { 
    loading: () => <p className="text-center">جارٍ تحميل الخريطة...</p>,
    ssr: false 
  }), []);

  const uploadFile = async (file: File, reportId: string): Promise<string> => {
    const storageRef = ref(storage, `reports/${reportId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };
  
  const handleFindQAddress = async () => {
    console.log('--- Starting Geocoding ---');
    console.log(`Inputs: Zone=${zone}, Street=${street}, Building=${building}`);

    if (!zone || !street || !building) {
        toast({ 
          variant: "destructive", 
          title: "بيانات غير مكتملة", 
          description: "يرجى إدخال أرقام المنطقة والشارع والمبنى." 
        });
        return;
    }

    // التحقق من صحة الأرقام
    const numbersOnly = /^\d+$/;
    if (!numbersOnly.test(zone) && !/^[٠-٩]+$/.test(zone)) {
        toast({ 
          variant: "destructive", 
          title: "رقم المنطقة غير صالح", 
          description: "يرجى إدخال أرقام صحيحة للمنطقة" 
        });
        return;
    }

    if (!numbersOnly.test(street) && !/^[٠-٩]+$/.test(street)) {
        toast({ 
          variant: "destructive", 
          title: "رقم الشارع غير صالح", 
          description: "يرجى إدخال أرقام صحيحة للشارع" 
        });
        return;
    }

    if (!numbersOnly.test(building) && !/^[٠-٩]+$/.test(building)) {
        toast({ 
          variant: "destructive", 
          title: "رقم المبنى غير صالح", 
          description: "يرجى إدخال أرقام صحيحة للمبنى" 
        });
        return;
    }
    
    setIsGeocoding(true);
    try {
      console.log('[handleFindQAddress] Calling geocode API with:', { zone, street, building });
      
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone, street, building })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to geocode address');
      }
      
      const result = await response.json();
      console.log('[handleFindQAddress] API result:', result);
      
      if (result && typeof result.lat === 'number' && typeof result.lng === 'number') {
        console.log('[handleFindQAddress] Valid coordinates received:', result.lat, result.lng);
        setPosition([result.lat, result.lng]);
        toast({ 
          title: "تم تحديد الموقع", 
          description: `تم تحديد موقع العنوان: منطقة ${zone}، شارع ${street}، مبنى ${building}` 
        });
        console.log(`[Map Update] Position set to [${result.lat}, ${result.lng}]`);
      } else {
        console.error('[handleFindQAddress] Invalid result received:', result);
        throw new Error(`لم نتمكن من الحصول على إحداثيات صحيحة من الخدمة. النتيجة: ${JSON.stringify(result)}`);
      }
    } catch (error: any) {
        console.error('Geocoding Error:', error);
        toast({
            variant: "destructive",
            title: "تعذر تحديد الموقع",
            description: error.message || "يرجى التأكد من صحة الأرقام المدخلة أو تحديد الموقع يدوياً على الخريطة"
        });
    } finally {
        setIsGeocoding(false);
    }
  };
  
  const handleOpenUnwani = () => {
      window.open('https://maps.moi.gov.qa/', '_blank', 'noopener,noreferrer');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
       toast({ variant: "destructive", title: "خطأ", description: "يجب تسجيل الدخول لإنشاء بلاغ." });
      return;
    }

    // التحقق من نوع المستخدم
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'employee') {
      toast({ variant: "destructive", title: "خطأ", description: "ليس لديك صلاحية لإنشاء بلاغ." });
      return;
    }

     if (!position) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى تحديد الموقع على الخريطة." });
      return;
    }
    
    if (locationSource === 'q-address' && (!zone || !street || !building)) {
        toast({ variant: "destructive", title: "خطأ", description: "عند استخدام العنوان القطري، يجب ملء حقول المنطقة والشارع والمبنى."});
        return;
    }

    if (!departmentId || !subject || !description) {
         toast({ variant: "destructive", title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة (الإدارة والموضوع والوصف)." });
        return;
    }

    // التحقق من أن الإدارة المختارة ليست إدارة المستخدم
    if (userHomeDepartmentId && departmentId === userHomeDepartmentId) {
        toast({ variant: "destructive", title: "خطأ", description: "لا يمكنك تقديم بلاغ لإدارتك الخاصة." });
        return;
    }

    setIsSubmitting(true);

    try {
      // توليد رقم البلاغ الرقمي
      const reportNumber = await generateReportNumber();
      
      const newReportRef = doc(collection(db, 'reports'));
      const reportId = newReportRef.id;

      const attachmentUrls = await Promise.all(
        files.map(file => uploadFile(file, reportId))
      );

      const locationData: any = {
        latitude: position[0],
        longitude: position[1],
        source: locationSource,
      };

      if (locationSource === 'q-address') {
          locationData.zone = zone;
          locationData.street = street;
          locationData.building = building;
      }
      
      await setDoc(newReportRef, {
        reportNumber, // إضافة رقم البلاغ الرقمي
        createdBy: user.uid,
        submitterName: user.displayName || user.email,
        submitterId: user.uid,
        submitterEmployeeId: userEmployeeId,
        surveyNumber: surveyNumber.trim() || null, // الرقم المساحي (اختياري)
        subject: subject.trim(), // الموضوع
        description,
        departmentId,
        location: locationData,
        attachments: attachmentUrls,
        status: "open",
        createdAt: serverTimestamp(),
      });
      
      // طباعة تأكيد في وحدة التحكم
      console.log(`✅ تم إنشاء البلاغ بنجاح!`);
      console.log(`📋 رقم البلاغ: ${formatReportNumber(reportNumber)}`);
      console.log(`� الرقم المساحي: ${surveyNumber || 'غير محدد'}`);
      console.log(`📝 الموضوع: ${subject}`);
      console.log(`�👤 المستخدم: ${user.displayName || user.email}`);
      console.log(`🏢 الإدارة المختصة: ${allDepartments.find(d => d.id === departmentId)?.name || departmentId}`);
      console.log(`📍 الموقع: [${position[0].toFixed(6)}, ${position[1].toFixed(6)}]`);
      console.log(`📄 المرفقات: ${attachmentUrls.length} ملف`);
      
      const selectedDepartment = allDepartments.find(d => d.id === departmentId);
      
      // إظهار رسالة نجاح مفصلة
      toast({
        title: "✅ تم إنشاء البلاغ بنجاح!",
        description: `${subject} | رقم البلاغ: ${formatReportNumber(reportNumber)} | الإدارة: ${selectedDepartment?.name || departmentId}`,
        duration: 4000,
      });

      // التوجه إلى لوحة تحكم الموظف بعد تأخير قصير
      setTimeout(() => {
        // إشعار إضافي قبل التوجه
        toast({
          title: "🏠 جارٍ التوجه إلى لوحة التحكم...",
          description: "يمكنك متابعة حالة بلاغك من قسم 'بلاغاتي'",
          duration: 2000,
        });
        
        // التوجه بعد ثانية إضافية
        setTimeout(() => {
          router.push('/employee/dashboard');
        }, 1000);
      }, 3000);

    } catch (error) {
      console.error("❌ خطأ في إنشاء البلاغ:", error);
       toast({
        variant: "destructive",
        title: "❌ فشل في إنشاء البلاغ",
        description: "حدث خطأ أثناء إرسال البلاغ. يرجى التحقق من الاتصال والمحاولة مرة أخرى.",
        duration: 5000,
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <CreateReportHeader />
      <main className="flex-1 p-4 md:p-8">
        <form onSubmit={handleSubmit}>
          <Card className="w-full mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle>تفاصيل البلاغ</CardTitle>
              <CardDescription>
                يرجى ملء الحقول التالية وتحديد الموقع على الخريطة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 1. الرقم المساحي (اختياري) */}
              <div className="space-y-2">
                <Label htmlFor="survey-number">الرقم المساحي (اختياري)</Label>
                <Input 
                  id="survey-number"
                  placeholder="أدخل الرقم المساحي إن وجد"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">يمكن ترك هذا الحقل فارغاً إذا لم يكن متوفراً</p>
              </div>

              {/* 2. الموضوع */}
              <div className="space-y-2">
                <Label htmlFor="subject">الموضوع *</Label>
                <Input 
                  id="subject"
                  placeholder="عنوان مختصر للبلاغ"
                  required 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* 3. الوصف */}
              <div className="space-y-2">
                <Label htmlFor="report-description">الوصف *</Label>
                <Textarea 
                  id="report-description"
                  placeholder="قدّم وصفاً تفصيليًا للمشكلة"
                  className="min-h-[120px]"
                  required 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* 4. المرفقات */}
               <div className="space-y-2">
                <Label htmlFor="attachments">
                  المرفقات {files.length > 0 && `(${files.length})`}
                </Label>
                <Input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} ref={fileInputRef} />
                {files.length === 0 ? (
                  <div className="flex items-center justify-center w-full">
                    <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Paperclip className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">انقر للإرفاق</span> أو قم بالسحب والإفلات</p>
                            <p className="text-xs text-muted-foreground">صور أو مستندات (بحد أقصى 5 ميجابايت)</p>
                        </div>
                    </Label>
                  </div> 
                ) : (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md border p-2.5">
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-8 w-8">
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    ))}
                     <Button type="button" variant="outline" className="w-full" onClick={triggerFileSelect}>
                        إضافة المزيد من المرفقات
                    </Button>
                  </div>
                )}
              </div>

              {/* الإدارة المعنية */}
              <div className="space-y-2">
                <Label htmlFor="report-department">الإدارة المعنية *</Label>
                 <Select dir="rtl" onValueChange={setDepartmentId} value={departmentId} required>
                  <SelectTrigger id="report-department">
                    <SelectValue placeholder="اختر الإدارة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepartments.length > 0 ? (
                      availableDepartments.map(dept => (
                         <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>لا توجد إدارات متاحة</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {userHomeDepartmentId && (
                  <p className="text-sm text-muted-foreground">
                    ملاحظة: لا يمكنك تقديم بلاغ لإدارتك الخاصة.
                  </p>
                )}
              </div>

                <div className="space-y-4">
                  <Label>تحديد موقع البلاغ *</Label>
                   <Tabs defaultValue="manual" className="w-full" onValueChange={(value: string) => setLocationSource(value as "manual" | "q-address")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">تحديد يدوي على الخريطة</TabsTrigger>
                        <TabsTrigger value="q-address">العنوان القطري (عنواني)</TabsTrigger>
                      </TabsList>
                      <TabsContent value="manual" className="mt-4 space-y-4">
                         <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                            <Map 
                              position={position} 
                              setPosition={setPosition}
                            />
                         </div>
                         {position && (
                            <p className="text-sm text-muted-foreground pt-1 text-center dir-ltr">
                                Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
                            </p>
                        )}
                      </TabsContent>
                      <TabsContent value="q-address" className="mt-4 space-y-4">
                        {/* العنوان القطري (عنواني) */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">🏘️</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-900">اللوحة الزرقاء من "عنواني"</h4>
                              <p className="text-xs text-blue-700">استخدم بيانات اللوحة الزرقاء الموجودة في الموقع</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="zone">رقم المنطقة</Label>
                                  <Input id="zone" placeholder="_ _" value={zone} onChange={(e) => setZone(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="street">رقم الشارع</Label>
                                  <Input id="street" placeholder="_ _ _" value={street} onChange={(e) => setStreet(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="building">رقم المبنى</Label>
                                  <Input id="building" placeholder="_ _" value={building} onChange={(e) => setBuilding(e.target.value)} />
                              </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button type="button" className="flex-1" onClick={handleFindQAddress} disabled={isGeocoding}>
                                <Search className="ml-2 h-4 w-4" />
                                {isGeocoding ? 'جارٍ البحث...' : 'اعثر على الموقع'}
                            </Button>
                            <Button type="button" variant="outline" className="flex-1" onClick={handleOpenUnwani}>
                                <ExternalLink className="ml-2 h-4 w-4" />
                                فتح "عنواني" للتحقق
                            </Button>
                        </div>
                         <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                            <Map 
                              position={position} 
                              setPosition={setPosition}
                            />
                         </div>
                      </TabsContent>
                    </Tabs>
                </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting ? 'جارٍ إنشاء البلاغ...' : 'إنشاء البلاغ'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}

