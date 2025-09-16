import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Gavel, HelpCircle, Send, User, MapPin, Building, Calendar, Paperclip, XCircle, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Mock data for a single report
const reportDetails = {
  id: "BL-8564",
  title: "عطل في نظام التكييف المركزي",
  description: "نواجه مشكلة مستمرة في نظام التكييف بالطابق الخامس من مبنى 3. النظام يتوقف عن العمل بشكل متكرر خلال اليوم، مما يؤثر على بيئة العمل وإنتاجية الموظفين. قمنا بمحاولة إعادة تشغيله عدة مرات ولكن دون جدوى. نرجو إرسال فريق الصيانة بشكل عاجل.",
  status: "جديد",
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
    { action: "قبول البلاغ", user: "خالد الأحمد", date: "2023-06-23 11:00 ص" },
    { action: "تحويل البلاغ", user: "خالد الأحمد", date: "2023-06-23 11:01 ص" },
  ]
};

function getStatusVariant(status: string) {
    switch (status) {
        case "جديد": return "default";
        case "قيد المراجعة": return "secondary";
        case "تم الحل": return "outline";
        case "مرفوض": return "destructive";
        default: return "default";
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
  "قبول البلاغ": <CheckCircle className="h-4 w-4 text-green-500" />,
  "رفض البلاغ": <XCircle className="h-4 w-4 text-red-500" />,
  "طلب معلومات إضافية": <HelpCircle className="h-4 w-4 text-primary" />,
  "تحويل البلاغ": <Send className="h-4 w-4 text-muted-foreground" />,
  "إضافة رد": <Gavel className="h-4 w-4 text-gray-500" />,
};


export default function ReportDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold">تفاصيل البلاغ: {reportDetails.id}</h1>

      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px] lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{reportDetails.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Badge variant={getStatusVariant(reportDetails.status)}>{reportDetails.status}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={getImportanceVariant(reportDetails.importance)}>{reportDetails.importance}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{reportDetails.date}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                    <h3 className="font-semibold mb-2">الوصف التفصيلي</h3>
                    <p className="text-muted-foreground leading-relaxed">{reportDetails.description}</p>
                </div>
                {reportDetails.location && (
                    <div>
                        <h3 className="font-semibold mb-2">الموقع</h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{reportDetails.location}</span>
                        </div>
                    </div>
                )}
                {reportDetails.attachments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">المرفقات ({reportDetails.attachments.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {reportDetails.attachments.map((file, index) => (
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
              <CardTitle>سجل القرارات (Timeline)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6">
                <div className="absolute right-0 top-0 h-full w-px bg-border translate-x-1/2"></div>
                {reportDetails.timeline.map((item, index) => (
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
                {/* Placeholder for the next action */}
                 <div className="flex items-start gap-4">
                    <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-dashed">
                      <Gavel className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-semibold text-muted-foreground">الإجراء التالي...</p>
                    </div>
                  </div>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>الإجراءات</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <Button><CheckCircle className="ml-2 h-4 w-4"/> قبول البلاغ</Button>
                    <Button variant="destructive"><XCircle className="ml-2 h-4 w-4"/> رفض البلاغ</Button>
                    <Button variant="outline"><HelpCircle className="ml-2 h-4 w-4"/> طلب معلومات إضافية</Button>
                    <Button variant="secondary"><Send className="ml-2 h-4 w-4"/> تحويل لجهة مختصة</Button>
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
                            <p className="font-semibold">{reportDetails.submitter.name}</p>
                            <p className="text-sm text-muted-foreground">{reportDetails.submitter.id}</p>
                        </div>
                    </div>
                    <Separator />
                     <div className="grid gap-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">الإدارة</span>
                            <span>{reportDetails.submitter.department}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">تاريخ التعيين</span>
                            <span>{reportDetails.submitter.joinDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">إجمالي البلاغات</span>
                            <Badge variant="secondary">{reportDetails.submitter.reportsCount}</Badge>
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
