"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function TestPage() {
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebaseConnection = async () => {
    try {
      // تحقق من حالة المستخدم
      if (!user) {
        addResult("❌ لا يوجد مستخدم مسجل الدخول");
        return;
      }

      addResult(`✅ تم العثور على المستخدم: ${user.email}`);

      // محاولة الوصول إلى Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          addResult(`✅ تم العثور على وثيقة المستخدم: ${JSON.stringify(userDoc.data())}`);
        } else {
          addResult("❌ لم يتم العثور على وثيقة المستخدم");
        }
      } catch (error: any) {
        addResult(`❌ خطأ في الوصول إلى Firestore: ${error.message}`);
      }

    } catch (error: any) {
      addResult(`❌ خطأ: ${error.message}`);
      toast({
        variant: "destructive",
        title: "خطأ في الاختبار",
        description: error.message
      });
    }
  };

  useEffect(() => {
    if (!loading) {
      addResult(user ? "✅ تم تحميل حالة المستخدم" : "❌ لا يوجد مستخدم");
    }
  }, [loading, user]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>اختبار الاتصال بـ Firebase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={testFirebaseConnection}
              disabled={loading}
            >
              بدء الاختبار
            </Button>

            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">نتائج الاختبار:</h3>
              <div className="bg-muted p-4 rounded-lg space-y-1">
                {testResults.map((result, index) => (
                  <p key={index} className="text-sm font-mono">
                    {result}
                  </p>
                ))}
                {testResults.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    اضغط على زر "بدء الاختبار" لبدء الاختبار
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}