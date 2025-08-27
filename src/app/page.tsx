
"use client";

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import LoginPage from "./login/page";
import ChatsPage from "./chats/page";
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.replace('/chats');
      } else {
        setUser(null);
        router.replace('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
        <div className="flex flex-col h-screen w-full items-center justify-center bg-background p-4 space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-12 w-full max-w-sm" />
            <Skeleton className="h-12 w-full max-w-sm" />
        </div>
    )
  }

  // This part will likely not be visible for long due to the redirects,
  // but it's a fallback.
  return user ? <ChatsPage /> : <LoginPage />;
}
