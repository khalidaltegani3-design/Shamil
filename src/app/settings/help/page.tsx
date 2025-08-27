
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, FileText, Info, ShieldQuestion } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function HelpSettingsPage() {
  const router = useRouter();

  const helpOptions = [
      { icon: Info, title: "Help Center" },
      { icon: ShieldQuestion, title: "Contact us" },
      { icon: FileText, title: "Terms and Privacy Policy" },
  ]

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Help</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="p-2">
           {helpOptions.map((option, index) => (
            <div key={option.title}>
                <button className="flex items-center w-full gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <option.icon className="w-6 h-6 text-muted-foreground" />
                    <div className="flex-1 text-left">
                        <h3 className="font-medium">{option.title}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                {index < helpOptions.length - 1 && <Separator />}
            </div>
           ))}
        </Card>
        
        <div className="text-center text-muted-foreground text-sm p-4">
            <p>Zoliapp Lite</p>
            <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
