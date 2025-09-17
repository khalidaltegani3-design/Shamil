
"use client";

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Paperclip, MapPin, X, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';

function AppHeader() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="h-5 w-5" />
          <span className="sr-only">رجوع</span>
        </Button>
        <h1 className="text-lg font-semibold">إنشاء بلاغ جديد</h1>
      </div>
       <div className="flex h-8 w-auto px-4 items-center justify-center rounded bg-secondary text-sm font-semibold text-secondary-foreground">
          بلدية الريان
        </div>
    </header>
  );
}


export default function CreateReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>([25.2854, 51.5310]); // Default to Doha
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const Map = useMemo(() => dynamic(() => import('@/components/map'), { 
    loading: () => <p className="text-center">جارٍ تحميل الخريطة...</p>,
    ssr: false 
  }), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!position) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى تحديد الموقع على الخريطة.",
      });
      return;
    }
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "تم إرسال البلاغ بنجاح.",
        description: "سيتم مراجعته من قبل القسم المختص.",
      });
      router.push('/');
    }, 1500);
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
      <AppHeader />
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
               <div className="space-y-4">
                <Label htmlFor="report-location">تحديد الموقع على الخريطة</Label>
                <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <Map position={position} setPosition={setPosition} />
                </div>
                 {position && (
                    <p className="text-sm text-muted-foreground pt-1 text-center dir-ltr">
                        Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
                    </p>
                )}
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="location-description">وصف الموقع (اختياري)</Label>
                  <Input id="location-description" placeholder="مثال: مبنى 5، بالقرب من المدخل الرئيسي" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-department">الإدارة المعنية</Label>
                <Select dir="rtl">
                  <SelectTrigger id="report-department">
                    <SelectValue placeholder="اختر الإدارة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general-supervision">الرقابة العامة</SelectItem>
                    <SelectItem value="health-supervision">الرقابة الصحية</SelectItem>
                    <SelectItem value="technical-supervision">الرقابة الفنية</SelectItem>
                    <SelectItem value="other-violations">مخالفات اخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-description">وصف البلاغ</Label>
                <Textarea 
                  id="report-description"
                  placeholder="قدّم وصفًا تفصيليًا للمشكلة"
                  className="min-h-[120px]"
                  required 
                />
              </div>

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

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال البلاغ'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}
