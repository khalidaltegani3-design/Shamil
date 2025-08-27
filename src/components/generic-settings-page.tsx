
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

interface GenericSettingsPageProps {
  title: string;
}

export default function GenericSettingsPage({ title }: GenericSettingsPageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{title}</h1>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">{title} settings will be available here.</p>
      </div>
    </div>
  );
}
