"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
              <div className="flex h-12 w-32 items-center justify-center rounded bg-secondary text-sm font-semibold text-secondary-foreground">
                شعار الوزارة
              </div>
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>
            منصة البلاغات الداخلية للموظفين
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">رقم الموظف</Label>
              <Input id="employeeId" type="text" placeholder="أدخل الرقم الوظيفي" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" placeholder="أدخل كلمة المرور" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit">تسجيل الدخول</Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              تواجه مشكلة؟ <a href="#" className="underline">تواصل مع الدعم الفني</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
