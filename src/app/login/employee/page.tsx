
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";


export default function EmployeeLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "تم تسجيل الدخول بنجاح.",
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      });
    } finally {
        setIsLoading(false);
    }
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
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="أدخل البريد الإلكتروني" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" placeholder="أدخل كلمة المرور" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
            <div className="flex justify-between w-full">
                <Button variant="link" size="sm" className="px-0" onClick={() => router.back()}>
                    الرجوع
                </Button>
                 <Link href="/signup" passHref>
                    <Button variant="link" size="sm" className="px-0">
                        إنشاء حساب جديد
                    </Button>
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
