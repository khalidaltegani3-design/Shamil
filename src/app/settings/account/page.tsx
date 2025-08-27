
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, KeyRound, Shield, FileText, UserX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [securityNotifications, setSecurityNotifications] = React.useState(true);

  const handleFeatureClick = (featureName: string) => {
    toast({
      title: 'Coming Soon!',
      description: `${featureName} will be available soon.`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Account</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="p-2">
            <div className="flex items-center p-3">
                <Shield className="w-6 h-6 text-muted-foreground mr-4" />
                <div className="flex-1">
                    <Label htmlFor="security-notifications" className="font-medium cursor-pointer">Security notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when your security code changes for a contact.</p>
                </div>
                <Switch 
                    id="security-notifications" 
                    checked={securityNotifications}
                    onCheckedChange={setSecurityNotifications}
                />
            </div>
        </Card>
        
        <Card className="p-2">
             <button onClick={() => handleFeatureClick('Two-step verification')} className="flex items-center w-full gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <KeyRound className="w-6 h-6 text-muted-foreground" />
                <div className="flex-1 text-left">
                    <h3 className="font-medium">Two-step verification</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
        </Card>

         <Card className="p-2">
             <button onClick={() => handleFeatureClick('Request account info')} className="flex items-center w-full gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <FileText className="w-6 h-6 text-muted-foreground" />
                <div className="flex-1 text-left">
                    <h3 className="font-medium">Request account info</h3>
                    <p className="text-sm text-muted-foreground">Get a report of your account information.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
        </Card>
        
        <Card className="p-2">
             <button onClick={() => handleFeatureClick('Delete my account')} className="flex items-center w-full gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors text-destructive">
                <UserX className="w-6 h-6" />
                <div className="flex-1 text-left">
                    <h3 className="font-medium">Delete my account</h3>
                </div>
                <ChevronRight className="w-5 h-5" />
            </button>
        </Card>
      </div>
    </div>
  );
}
