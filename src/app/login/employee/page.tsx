
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function EmployeeLoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual employee authentication
    router.push('/');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
           <div className="flex flex-col items-center justify-center mb-4">
              <h1 className="text-6xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
              <p className="text-muted-foreground font-semibold">بلدية الريان</p>
          </div>
          <CardDescription>
            منصة البلاغات الداخلية
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
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
            <div className="flex justify-between w-full">
                <Button variant="link" size="sm" className="px-0" onClick={() => router.back()}>
                    الرجوع
                </Button>
                <Button variant="link" size="sm" className="px-0">
                    تواجه مشكلة؟
                </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
