
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Languages, SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ContentPreferencesSettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Content Preferences</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="p-2">
             <button className="flex items-center w-full gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />
                <div className="flex-1 text-left">
                    <h3 className="font-medium">Filter video keywords</h3>
                    <p className="text-sm text-muted-foreground">Mute words to hide videos from your feeds.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
        </Card>
        
        <Card className="p-2">
             <button className="flex items-center w-full gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <Languages className="w-6 h-6 text-muted-foreground" />
                <div className="flex-1 text-left">
                    <h3 className="font-medium">Video languages</h3>
                    <p className="text-sm text-muted-foreground">English, Spanish, and 2 more...</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
        </Card>

        <p className="text-sm text-muted-foreground px-2">
          Your content preferences help us personalize your experience. They will apply to videos in For You, Following, and other feeds.
        </p>
      </div>
    </div>
  );
}
