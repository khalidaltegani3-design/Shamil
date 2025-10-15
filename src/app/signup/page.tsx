
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

import { checkAuthState } from '@/lib/auth-check';
import Logo from '@/components/Logo';
import HeaderWithImage from '@/components/HeaderWithImage';

export default function SignupPage() {
  useEffect(() => {
    checkAuthState()
      .then(() => console.log('Auth check completed'))
      .catch(error => console.error('Auth check failed:', error));
  }, []);
  const router = useRouter();
  const { toast } = useToast();

  const handleContactAdmin = () => {
    toast({
      title: "معلومات التواصل",
      description: "يرجى التواصل مع مدير النظام لإنشاء حسابك: sweetdream711711@gmail.com",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <HeaderWithImage />
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex flex-col items-center justify-center mb-4">
              <Logo size="xl" showText={false} />
            </div>
            <CardTitle className="text-2xl">إنشاء حساب موظف جديد</CardTitle>
            <CardDescription>
              لإنشاء حساب جديد في منصة البلاغات، يرجى التواصل مع مدير النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">📧 كيفية إنشاء حساب جديد</h3>
                <p className="text-sm text-muted-foreground">
                  لإنشاء حساب جديد في النظام، يرجى التواصل مع مدير النظام عبر البريد الإلكتروني
                </p>
              </div>
              
              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                <h4 className="font-medium mb-2">👨‍💼 مدير النظام</h4>
                <p className="text-sm font-mono bg-background p-2 rounded border">
                  sweetdream711711@gmail.com
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  سيتم إنشاء حسابك وإرسال بيانات تسجيل الدخول إليك
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900">ℹ️ معلومات إضافية</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• تأكد من إرسال اسمك الكامل</li>
                  <li>• تأكد من إرسال البريد الإلكتروني المطلوب</li>
                  <li>• تأكد من إرسال القسم الذي تعمل به</li>
                  <li>• الرقم الوظيفي اختياري ويمكن إضافته لاحقاً</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              onClick={handleContactAdmin}
              className="w-full bg-primary hover:bg-primary/90"
            >
              📧 عرض معلومات التواصل
            </Button>
            <Link href="/login/employee" passHref>
              <Button variant="link" size="sm" className="px-0">
                لديك حساب بالفعل؟ تسجيل الدخول
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
