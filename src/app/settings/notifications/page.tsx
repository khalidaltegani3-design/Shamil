
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BellOff, Music, Vibrate } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

const NotificationSection = ({ title, showToggle = true }: { title: string, showToggle?: boolean }) => {
    const [isEnabled, setIsEnabled] = React.useState(true);

    return (
        <div>
            <div className="flex items-center justify-between p-3">
                <h3 className="font-semibold text-muted-foreground">{title}</h3>
                {showToggle && <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />}
            </div>
            <Separator />
            <div className="p-3 space-y-4">
                 <div className="flex items-center justify-between">
                    <p>Notification tone</p>
                    <Select defaultValue="default" disabled={!isEnabled}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="chime">Chime</SelectItem>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between">
                    <p>Vibrate</p>
                    <Select defaultValue="default" disabled={!isEnabled}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select vibration" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                            <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
};


export default function NotificationsSettingsPage() {
  const router = useRouter();
  const [conversationTones, setConversationTones] = React.useState(true);

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="p-2">
           <div className="flex items-center p-3">
                <div className="flex-1">
                    <h3 className="font-medium">Conversation tones</h3>
                    <p className="text-sm text-muted-foreground">Play sounds for incoming and outgoing messages.</p>
                </div>
                <Switch 
                    id="conversation-tones" 
                    checked={conversationTones}
                    onCheckedChange={setConversationTones}
                />
            </div>
        </Card>

        <Card className="p-0 divide-y">
            <NotificationSection title="Messages" />
            <NotificationSection title="Groups" />
             <div>
                <div className="flex items-center justify-between p-3">
                    <h3 className="font-semibold text-muted-foreground">Calls</h3>
                </div>
                <Separator />
                <div className="p-3 space-y-4">
                     <div className="flex items-center justify-between">
                        <p>Ringtone</p>
                        <Select defaultValue="default">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a ringtone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="marimba">Marimba</SelectItem>
                                <SelectItem value="xylophone">Xylophone</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <p>Vibrate</p>
                        <Select defaultValue="default">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select vibration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="short">Short</SelectItem>
                                <SelectItem value="long">Long</SelectItem>
                                <SelectItem value="off">Off</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
