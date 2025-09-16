"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";

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
       <div className="flex h-8 w-24 items-center justify-center rounded bg-secondary text-sm font-semibold text-secondary-foreground">
          الشعار
        </div>
    </header>
  );
}


export default function CreateReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <form onSubmit={handleSubmit}>
          <Card className="w-full mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle>تفاصيل البلاغ</CardTitle>
              <CardDescription>
                يرجى ملء الحقول التالية بدقة ووضوح.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="report-title">عنوان البلاغ</Label>
                <Input id="report-title" placeholder="أدخل عنوانًا واضحًا للبلاغ" required />
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
                <Label htmlFor="attachments">المرفقات (اختياري)</Label>
                <div className="flex items-center justify-center w-full">
                  <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Paperclip className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">انقر للإرفاق</span> أو قم بالسحب والإفلات</p>
                          <p className="text-xs text-muted-foreground">صور أو مستندات (بحد أقصى 5 ميجابايت)</p>
                      </div>
                      <Input id="dropzone-file" type="file" className="hidden" />
                  </Label>
                </div> 
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
