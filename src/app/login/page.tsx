
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Shield, User } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
              <div className="flex h-12 w-auto px-6 items-center justify-center rounded bg-secondary text-sm font-semibold text-secondary-foreground">
                بلدية الريان
              </div>
          </div>
          <CardTitle className="text-2xl">اختيار الواجهة</CardTitle>
          <CardDescription>
            يرجى تحديد الواجهة التي تريد الدخول إليها
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
            <Button size="lg" onClick={() => router.push('/login/supervisor')}>
                <Shield className="ml-2 h-5 w-5" />
                واجهة المشرف
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login/employee')}>
                 <User className="ml-2 h-5 w-5" />
                واجهة الموظف
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
