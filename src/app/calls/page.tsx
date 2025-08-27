
"use client";

import * as React from 'react';
import { calls as initialCalls, type Call } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowDownLeft, ArrowUpRight, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ClientFormattedTime = ({ timestamp, children }: { timestamp: string, children: (formattedTime: string) => React.ReactNode }) => {
  const [formattedTime, setFormattedTime] = React.useState('');

  React.useEffect(() => {
    const update = () => {
        const date = new Date(timestamp);
        const formatted = format(date, "MMMM d, h:mm a");
        setFormattedTime(formatted);
    };
    update();
  }, [timestamp]);

  if (!formattedTime) {
    return null; 
  }

  return <>{children(formattedTime)}</>;
};

export default function CallsPage() {
  const [calls, setCalls] = React.useState<Call[]>(initialCalls);

  const getCallIcon = (call: Call) => {
    const isMissed = call.type === 'missed';
    const isIncoming = call.type === 'incoming';
    
    const iconColor = isMissed ? 'text-destructive' : 'text-muted-foreground';

    if (isIncoming) {
        return <ArrowDownLeft className={cn('h-4 w-4', iconColor)} />;
    }
    return <ArrowUpRight className={cn('h-4 w-4', iconColor)} />;
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {calls.map(call => (
            <div
              key={call.id}
              className="w-full text-left p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                 <Avatar className="h-14 w-14">
                    <AvatarImage src={call.user.avatarUrl} alt={call.user.name} data-ai-hint="avatar person" />
                    <AvatarFallback>{call.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h4 className={cn("font-semibold", call.type === 'missed' && "text-destructive")}>{call.user.name}</h4>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {getCallIcon(call)}
                        <ClientFormattedTime timestamp={call.timestamp}>
                            {(time) => <p>{time}</p>}
                        </ClientFormattedTime>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5 text-primary" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
