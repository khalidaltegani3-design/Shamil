
"use client";

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
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
        // User is logged in, redirect to chats
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
  
  // Based on the auth state, the router will redirect.
  // We can return a generic loader or null here as the user will be quickly navigated away.
  return null;
}
