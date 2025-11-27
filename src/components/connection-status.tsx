"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, WifiOff, Wifi } from 'lucide-react';
import { pingDatabase } from '@/lib/firebase';

function isClient() {
  return typeof window !== 'undefined';
}

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(isClient() ? navigator.onLine : true);
  const [isDBConnected, setIsDBConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // التحقق من الاتصال بقاعدة البيانات
  const checkDatabaseConnection = async () => {
    if (!isClient() || isChecking) return;

    setIsChecking(true);
    try {
      const isConnected = await pingDatabase();
      setIsDBConnected(Boolean(isConnected));
      setLastChecked(new Date());
    } catch (error) {
      console.error('فشل التحقق من الاتصال:', error);
      setIsDBConnected(false);
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  // مراقبة اتصال الإنترنت والتحقق من الاتصال بقاعدة البيانات
  useEffect(() => {
    if (!isClient()) return;

    setIsMounted(true);
    
    let connectionCheckInterval: NodeJS.Timeout;
    let isCheckingRef = false; // استخدام ref لتجنب dependency issues
    
    const performDatabaseCheck = async () => {
      if (isCheckingRef) return;
      
      isCheckingRef = true;
      setIsChecking(true);
      try {
        const isConnected = await pingDatabase();
        setIsDBConnected(Boolean(isConnected));
        setLastChecked(new Date());
      } catch (error) {
        console.error('فشل التحقق من الاتصال:', error);
        setIsDBConnected(false);
        setLastChecked(new Date());
      } finally {
        isCheckingRef = false;
        setIsChecking(false);
      }
    };
    
    const startConnectionCheck = () => {
      // التحقق الفوري عند بدء المراقبة
      performDatabaseCheck();
      
      // إعداد فحص دوري كل 30 ثانية
      connectionCheckInterval = setInterval(() => {
        if (navigator.onLine && !isCheckingRef) {
          performDatabaseCheck();
        }
      }, 30000);
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (!isCheckingRef) {
        performDatabaseCheck();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsDBConnected(false);
      clearInterval(connectionCheckInterval);
    };

    // تحديث الحالة الأولية وبدء المراقبة
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      startConnectionCheck();
    }

    // إضافة مراقبة أحداث الاتصال
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // تنظيف عند إزالة المكون
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
      setIsMounted(false);
    };
  }, []); // dependency array فارغ - يعمل مرة واحدة فقط

  // عدم عرض أي شيء حتى يتم تحميل المكون في المتصفح
  if (!isMounted) {
    return null;
  }

  const renderAlert = () => {
    if (!isOnline) {
      return (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>لا يوجد اتصال بالإنترنت</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.</p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>آخر محاولة اتصال: {lastChecked ? new Date(lastChecked).toLocaleTimeString() : 'لم يتم التحقق بعد'}</span>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (!isDBConnected) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>مشكلة في الاتصال بقاعدة البيانات</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>لا يمكن الوصول إلى قاعدة البيانات. يرجى التحقق من اتصالك وإعادة المحاولة.</p>
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (isChecking) return;
                  checkDatabaseConnection();
                }}
                disabled={isChecking}
                className="flex items-center gap-2"
              >
                {isChecking ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <span>⟳</span>
                    إعادة المحاولة
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                آخر محاولة: {lastChecked ? new Date(lastChecked).toLocaleTimeString() : 'لم يتم التحقق بعد'}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  const content = renderAlert();
  
  if (!content) {
    // إظهار مؤشر صغير للاتصال الناجح
    return (
      <div className="fixed top-2 left-2 bg-green-100 dark:bg-green-900 p-2 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity">
        <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }

  return content;
}