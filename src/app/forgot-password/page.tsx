"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال عنوان البريد الإلكتروني"
      });
      return;
    }

    setIsLoading(true);

    try {
      // إعدادات مخصصة لرابط إعادة التعيين
      const actionCodeSettings = {
        url: `${window.location.origin}/login`, // رابط العودة بعد إعادة التعيين
        handleCodeInApp: false
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setIsEmailSent(true);
      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني من نظام شامل"
      });
    } catch (error: any) {
      console.error("خطأ في إرسال البريد الإلكتروني:", error);
      
      let errorMessage = "حدث خطأ في إرسال البريد الإلكتروني";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "لا يوجد حساب مسجل بهذا البريد الإلكتروني";
          break;
        case 'auth/invalid-email':
          errorMessage = "عنوان البريد الإلكتروني غير صحيح";
          break;
        case 'auth/too-many-requests':
          errorMessage = "تم إرسال العديد من الطلبات. يرجى المحاولة بعد قليل";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      toast({
        variant: "destructive",
        title: "خطأ",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">تم الإرسال بنجاح</CardTitle>
            <CardDescription>
              تم إرسال رابط إعادة تعيين كلمة المرور من نظام شامل إلى بريدك الإلكتروني
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                تحقق من صندوق الوارد وصندوق الرسائل المرفوضة في بريدك الإلكتروني
                <br />
                <strong className="block mt-1">الإيميل: {email}</strong>
                <span className="text-xs text-muted-foreground block mt-1">
                  الرسالة مرسلة من نظام شامل للبلاغات
                </span>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button 
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail("");
                }}
                variant="outline" 
                className="w-full"
              >
                إرسال رابط جديد
              </Button>
              <Button 
                onClick={() => router.back()}
                className="w-full"
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة لتسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">نسيت كلمة المرور؟</CardTitle>
          <CardDescription>
            أدخل عنوان بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Mail className="ml-2 h-4 w-4" />
                    إرسال رابط الإعادة
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => router.back()}
                className="w-full"
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة لتسجيل الدخول
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">تعليمات مهمة:</p>
                <ul className="space-y-1 text-xs">
                  <li>• تحقق من صندوق الرسائل المرفوضة</li>
                  <li>• الرابط صالح لمدة ساعة واحدة فقط</li>
                  <li>• يمكنك طلب رابط جديد إذا انتهت الصلاحية</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}