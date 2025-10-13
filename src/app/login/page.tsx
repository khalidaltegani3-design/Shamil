
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Shield, User } from "lucide-react";
import Logo from "@/components/Logo";
import HeaderWithImage from "@/components/HeaderWithImage";

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <HeaderWithImage />
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="xl" showText={false} />
          </div>
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
    </div>
  );
}
