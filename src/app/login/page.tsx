
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Shield, User } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4" dir="rtl">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="text-center space-y-2">
           <h1 className="text-6xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
            <p className="text-xl font-semibold text-muted-foreground">بلدية الريان</p>
        </div>
        
        <div className="w-full space-y-4">
            <p className="text-center text-muted-foreground">
                يرجى تحديد الواجهة التي تريد الدخول إليها
            </p>
            <div className="grid gap-4">
                <Button size="lg" onClick={() => router.push('/login/supervisor')}>
                    <Shield className="ml-2 h-5 w-5" />
                    واجهة المشرف
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/login/employee')}>
                     <User className="ml-2 h-5 w-5" />
                    واجهة الموظف
                </Button>
            </div>
        </div>
      </div>
    </main>
  );
}
