
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, UserCheck, EyeOff, Clock, UserX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const PrivacyOption = ({ icon: Icon, title, description, value, onClick }: { icon: React.ElementType, title: string, description: string, value: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex items-center w-full gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
        <Icon className="w-6 h-6 text-muted-foreground" />
        <div className="flex-1 text-left">
            <h3 className="font-medium">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{value}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
    </button>
);

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const handleOptionClick = (optionName: string) => {
      toast({
          title: "Coming Soon!",
          description: `You'll be able to customize '${optionName}' soon.`
      });
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Privacy</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="p-2">
            <h3 className="font-semibold text-muted-foreground p-3">Who can see my personal info</h3>
            <Separator />
            <PrivacyOption icon={EyeOff} title="Last seen & online" description="" value="Everyone" onClick={() => handleOptionClick('Last seen & online')} />
            <PrivacyOption icon={UserCheck} title="Profile photo" description="" value="Everyone" onClick={() => handleOptionClick('Profile photo')} />
            <PrivacyOption icon={Clock} title="Status" description="" value="My contacts" onClick={() => handleOptionClick('Status')} />
        </Card>

         <Card className="p-2">
            <h3 className="font-semibold text-muted-foreground p-3">Manage who can contact you</h3>
            <Separator />
            <PrivacyOption icon={UserX} title="Blocked contacts" description="" value="3" onClick={() => handleOptionClick('Blocked contacts')} />
        </Card>
      </div>
    </div>
  );
}

