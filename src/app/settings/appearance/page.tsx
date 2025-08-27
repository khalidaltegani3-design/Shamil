
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Moon, Sun, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function AppearanceSettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Appearance</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-muted-foreground">Theme</h3>
          <RadioGroup defaultValue="system" className="space-y-1">
            <Label htmlFor="light" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <span className="flex items-center gap-3">
                <Sun className="h-5 w-5" />
                Light
              </span>
              <RadioGroupItem value="light" id="light" />
            </Label>
            <Label htmlFor="dark" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <span className="flex items-center gap-3">
                <Moon className="h-5 w-5" />
                Dark
              </span>
              <RadioGroupItem value="dark" id="dark" />
            </Label>
             <Label htmlFor="system" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <span className="flex items-center gap-3">
                <Monitor className="h-5 w-5" />
                System Default
              </span>
              <RadioGroupItem value="system" id="system" />
            </Label>
          </RadioGroup>
        </Card>
      </div>
    </div>
  );
}
