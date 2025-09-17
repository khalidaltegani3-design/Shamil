
"use client";

import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Send, User, MapPin, Calendar, Paperclip, PlusCircle, Clock, Gavel } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';

// Mock data for a single report
const initialReportDetails = {
  id: "BL-8564",
  title: "عطل في نظام التكييف المركزي",
  description: "نواجه مشكلة مستمرة في نظام التكييف بالطابق الخامس من مبنى 3. النظام يتوقف عن العمل بشكل متكرر خلال اليوم، مما يؤثر على بيئة العمل وإنتاجية الموظفين. قمنا بمحاولة إعادة تشغيله عدة مرات ولكن دون جدوى. نرجو إرسال فريق الصيانة بشكل عاجل.",
  status: "open",
  importance: "عاجل",
  date: "2023-06-23",
  attachments: [
    { name: "صورة لوحدة التحكم.jpg", size: "1.2MB" },
    { name: "فيديو قصير للعطل.mp4", size: "4.5MB" },
  ],
  submitter: {
    name: "نورة القحطاني",
    id: "E-10293",
    department: "إدارة الموارد البشرية",
    joinDate: "2019-08-15",
    reportsCount: 23,
    profilePic: "/avatars/01.png"
  },
  location: "مبنى 3، الطابق 5، مكتب 501",
  timeline: [
    { action: "إنشاء البلاغ", user: "نورة القحطاني", date: "2023-06-23 10:30 ص" },
  ],
  receivedBy: null,
  receivedAt: null,
};

type Report = typeof initialReportDetails;

function getStatusVariant(status: string): "default" | "secondary" {
    switch (status) {
        case "open": return "default";
        case "closed": return "secondary";
        default: return "default";
    }
}

function getStatusText(status: string) {
    switch (status) {
        case "open": return "مفتوح";
        case "closed": return "مغلق";
        default: return "غير معروف";
    }
}


function getImportanceVariant(importance: string) {
    switch (importance) {
        case "عاجل": return "destructive";
        case "متوسط": return "secondary";
        case "منخفض": return "outline";
        default: return "default";
    }
}

const timelineIcons: { [key: string]: React.ReactNode } = {
  "إنشاء البلاغ": <PlusCircle className="h-4 w-4" />,
  "تم استلام البلاغ": <CheckCircle className="h-4 w-4 text-green-500" />,
};


export default function ReportDetailsPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<Report>(initialReportDetails);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const markAsReceived = async (reportId: string) => {
    const uid = auth.currentUser?.uid;
    // if (!uid) {
    //   toast({ variant: "destructive", title: "خطأ", description: "يجب تسجيل الدخول أولاً." });
    //   return;
    // }
    
    // Optimistic UI Update
    const now = new Date();
    const originalReport = { ...report };
    const updatedReport = {
        ...report,
        status: "closed" as "closed",
        receivedBy: "خالد الأحمد (مؤقت)", // Mock supervisor name
        receivedAt: now.toLocaleString('ar-QA'),
        timeline: [
            ...report.timeline,
            { action: "تم استلام البلاغ" as const, user: "خالد الأحمد (مؤقت)", date: now.toLocaleString('ar-QA', { dateStyle: 'short', timeStyle: 'short' }) }
        ]
    };
    setReport(updatedReport);
    setIsSubmitting(true);

    try {
      const ref = doc(db, "reports", reportId);
      await updateDoc(ref, {
        status: "closed",
        receivedBy: uid || "unknown_supervisor", // Use actual UID
        receivedAt: serverTimestamp(),
      });
      toast({
          title: "تم استلام البلاغ بنجاح",
          description: `تم إشعار الموظف ${report.submitter.name} بذلك.`,
      });
    } catch (error) {
      console.error("Error marking report as received:", error);
      // Revert UI on failure
      setReport(originalReport);
      toast({
        variant: "destructive",
        title: "فشل تحديث البلاغ",
        description: "حدث خطأ أثناء محاولة إغلاق البلاغ. يرجى المحاولة مرة أخرى.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold">تفاصيل البلاغ: {report.id}</h1>

      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px] lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Badge variant={getStatusVariant(report.status)}>{getStatusText(report.status)}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={getImportanceVariant(report.importance)}>{report.importance}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{report.date}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                    <h3 className="font-semibold mb-2">الوصف التفصيلي</h3>
                    <p className="text-muted-foreground leading-relaxed">{report.description}</p>
                </div>
                {report.location && (
                    <div>
                        <h3 className="font-semibold mb-2">الموقع</h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{report.location}</span>
                        </div>
                    </div>
                )}
                {report.attachments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">المرفقات ({report.attachments.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {report.attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                           <Button variant="outline" size="sm">تحميل</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>سجل الإجراءات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6">
                <div className="absolute right-0 top-0 h-full w-px bg-border translate-x-1/2"></div>
                {report.timeline.map((item, index) => (
                  <div key={index} className="mb-8 flex items-start gap-4">
                    <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border">
                      {timelineIcons[item.action] || <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        بواسطة {item.user} - <time>{item.date}</time>
                      </p>
                    </div>
                  </div>
                ))}
                {report.status === 'open' && !isSubmitting && (
                 <div className="flex items-start gap-4">
                    <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-dashed">
                      <Gavel className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-semibold text-muted-foreground">الإجراء التالي...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>الإجراء</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    {report.status === 'open' ? (
                        <Button onClick={() => markAsReceived(report.id)} disabled={isSubmitting}>
                            <CheckCircle className="ml-2 h-4 w-4"/> 
                            {isSubmitting ? 'جارٍ الإغلاق...' : 'تم الاستلام'}
                        </Button>
                    ) : (
                        <div className="text-sm text-center text-muted-foreground p-4 bg-muted rounded-md">
                            <p className="font-semibold">تم إغلاق هذا البلاغ</p>
                            {report.receivedBy && <p>بواسطة: {report.receivedBy}</p>}
                            {report.receivedAt && <p>في: {report.receivedAt}</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>بيانات المُبلِّغ</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground"/>
                        </div>
                        <div>
                            <p className="font-semibold">{report.submitter.name}</p>
                            <p className="text-sm text-muted-foreground">{report.submitter.id}</p>
                        </div>
                    </div>
                    <Separator />
                     <div className="grid gap-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">الإدارة</span>
                            <span>{report.submitter.department}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">تاريخ التعيين</span>
                            <span>{report.submitter.joinDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">إجمالي البلاغات</span>
                            <Badge variant="secondary">{report.submitter.reportsCount}</Badge>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">عرض الملف الشخصي الكامل</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
