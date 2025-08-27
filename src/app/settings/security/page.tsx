
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import React from 'react';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = React.useState(true);

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Security</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="p-4 flex flex-col items-center text-center">
            <ShieldCheck className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-muted-foreground">
                Your chats and calls are private. Zoliapp secures your conversations with end-to-end encryption. This means Zoliapp and third parties can't read or listen to them.
            </p>
        </Card>

         <Card className="p-2">
            <div className="flex items-center p-3">
                <div className="flex-1">
                    <Label htmlFor="security-notifications" className="font-medium cursor-pointer">Show security notifications on this device</Label>
                    <p className="text-sm text-muted-foreground">Get notified when your security code changes for a contact in an end-to-end encrypted chat.</p>
                </div>
                <Switch 
                    id="security-notifications" 
                    checked={showNotifications}
                    onCheckedChange={setShowNotifications}
                />
            </div>
        </Card>
      </div>
    </div>
  );
}
