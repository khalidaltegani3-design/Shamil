
"use client";

import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Send, User, MapPin, Calendar, Paperclip, PlusCircle, Clock, Gavel, AlertTriangle, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import dynamic from 'next/dynamic';
import { allDepartments } from '@/lib/departments';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';


type ReportLocation = {
  latitude: number;
  longitude: number;
  source: "manual" | "q-address";
  description?: string;
  zone?: string;
  street?: string;
  building?: string;
};

type TimelineEvent = {
  action: string;
  user: string;
  date: string; 
};

type Report = {
  id: string;
  description: string;
  status: 'open' | 'closed';
  departmentId: string;
  createdAt: any;
  attachments: string[];
  submitterId: string;
  submitterName: string;
  location: ReportLocation;
  timeline?: TimelineEvent[]; // Optional for now
};

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

function formatLocation(location: ReportLocation): string {
    if (location.source === 'q-address' && location.zone && location.street && location.building) {
      return `عنواني: ${location.zone}/${location.street}/${location.building}`;
    }
    if (location.description) {
      return location.description;
    }
    return `إحداثيات: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

const timelineIcons: { [key: string]: React.ReactNode } = {
  "إنشاء البلاغ": <PlusCircle className="h-4 w-4" />,
  "تم استلام البلاغ": <CheckCircle className="h-4 w-4 text-green-500" />,
};


export default function ReportDetailsPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const Map = useMemo(() => dynamic(() => import('@/components/map'), { 
    loading: () => <Skeleton className="h-full w-full" />,
    ssr: false 
  }), []);


  useEffect(() => {
    if (params.id) {
      const fetchReport = async () => {
        setLoading(true);
        try {
          const reportRef = doc(db, "reports", params.id);
          const reportSnap = await getDoc(reportRef);

          if (reportSnap.exists()) {
            setReport({ id: reportSnap.id, ...reportSnap.data() } as Report);
          } else {
            setError("لم يتم العثور على البلاغ.");
          }
        } catch (err) {
          setError("حدث خطأ أثناء تحميل تفاصيل البلاغ.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px] lg:gap-8">
           <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
           </div>
           <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
           </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">حدث خطأ</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Link href="/supervisor">
            <Button variant="outline" className="mt-4">العودة إلى لوحة التحكم</Button>
          </Link>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const mapPosition: [number, number] = [report.location.latitude, report.location.longitude];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold">تفاصيل البلاغ: ...{report.id.slice(-6)}</h1>

      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px] lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>
                {allDepartments.find(d => d.id === report.departmentId)?.name || 'بلاغ عام'}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Badge variant={getStatusVariant(report.status)}>{getStatusText(report.status)}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{report.createdAt?.toDate().toLocaleDateString('ar-QA')}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                    <h3 className="font-semibold mb-2">الوصف التفصيلي</h3>
                    <p className="text-muted-foreground leading-relaxed">{report.description}</p>
                </div>
                
                <div>
                    <h3 className="font-semibold mb-2">الموقع</h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{formatLocation(report.location)}</span>
                    </div>
                     <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                        <Map position={mapPosition} setPosition={() => {}} />
                     </div>
                </div>

                {report.attachments && report.attachments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">المرفقات ({report.attachments.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {report.attachments.map((url, index) => (
                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border p-2 hover:bg-muted transition-colors">
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">مرفق {index + 1}</p>
                          </div>
                           <Button variant="outline" size="sm" asChild><span className="cursor-pointer">عرض</span></Button>
                        </a>
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
                <div className="mb-8 flex items-start gap-4">
                  <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border">
                    {timelineIcons["إنشاء البلاغ"]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">إنشاء البلاغ</p>
                    <p className="text-sm text-muted-foreground">
                      بواسطة {report.submitterName} - <time>{report.createdAt?.toDate().toLocaleString('ar-QA')}</time>
                    </p>
                  </div>
                </div>

                 <div className="flex items-start gap-4">
                    <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-dashed">
                      <Gavel className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-semibold text-muted-foreground">
                        {report.status === 'open' ? 'الإجراء التالي مطلوب' : 'اكتملت الإجراءات'}
                      </p>
                    </div>
                  </div>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
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
                            <p className="font-semibold">{report.submitterName}</p>
                            <p className="text-sm text-muted-foreground">{report.submitterId.slice(0, 10)}...</p>
                        </div>
                    </div>
                    <Separator />
                     <div className="grid gap-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">الإدارة</span>
                            <span>{allDepartments.find(d => d.id === report.departmentId)?.name || 'غير محدد'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    