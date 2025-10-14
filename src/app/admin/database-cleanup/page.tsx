"use client";

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useEffect } from 'react';
import DatabaseCleanup from '@/components/admin/DatabaseCleanup';
import AppHeader from '@/components/AppHeader';

export default function DatabaseCleanupPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login/employee');
      return;
    }

    // Check if user is admin - إضافة إيميلك للمصادقة
    const adminEmails = [
      "Sweetdream711711@gmail.com",
      "khalidaltegani3@gmail.com"
    ];
    
    if (user && !adminEmails.includes(user.email || "")) {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const adminEmails = [
    "Sweetdream711711@gmail.com",
    "khalidaltegani3@gmail.com"
  ];

  if (!user || !adminEmails.includes(user.email || "")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="تنظيف قاعدة البيانات">
        <div className="text-sm text-muted-foreground">
          فحص وإصلاح مشاكل سلامة البيانات
        </div>
      </AppHeader>
      
      <main className="container mx-auto px-4 py-6">
        <DatabaseCleanup />
      </main>
    </div>
  );
}
