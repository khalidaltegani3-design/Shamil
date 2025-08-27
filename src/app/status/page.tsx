
"use client";

import * as React from 'react';
import { users, statuses as initialStatuses, type Status } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Plus, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

const ClientTimeAgo = ({ timestamp, children }: { timestamp: string, children: (formattedTime: string) => React.ReactNode }) => {
  const [timeAgo, setTimeAgo] = React.useState('');

  React.useEffect(() => {
    const update = () => {
        try {
            setTimeAgo(formatDistanceToNow(new Date(timestamp)))
        } catch (e) {
            // ignore invalid date error
        }
    };
    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timestamp]);

  if (!timeAgo) {
    // Render a placeholder or nothing on the server
    return null; 
  }

  return <>{children(timeAgo)}</>;
};

export default function StatusPage() {
  const [statuses] = React.useState<Status[]>(initialStatuses);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(null);
  const [statusDraft, setStatusDraft] = React.useState<{image: File, previewUrl: string} | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const currentUser = users[0];
  const myStatus = statuses.find(s => s.user.id === currentUser.id);
  const friendsStatuses = statuses.filter(s => s.user.id !== currentUser.id);

  const handleAddStatus = (caption: string, imageUrl: string) => {
    // This is a placeholder for adding a status.
    // In a real app this would update a global state or call an API.
    console.log("Adding status:", { caption, imageUrl });
    setStatusDraft(null); // Clear draft after posting
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setStatusDraft({ image: file, previewUrl });
    }
  };

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center justify-between gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold">Status</h1>
        <Button variant="ghost" size="icon" onClick={handlePlusClick}>
            <Camera className="h-5 w-5"/>
        </Button>
      </header>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-4 p-2">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary/50 p-0.5">
                  <AvatarImage src={myStatus?.imageUrl || currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                 <button 
                  onClick={handlePlusClick}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 border-2 border-background hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h2 className="font-semibold text-lg">My Status</h2>
                <p className="text-sm text-muted-foreground">
                  {myStatus ? (
                     <ClientTimeAgo timestamp={myStatus.timestamp}>
                        {(time) => `Updated ${time} ago`}
                    </ClientTimeAgo>
                  ) : "Add to your status"}
                </p>
              </div>
            </div>

          <div>
            <h3 className="mb-3 font-semibold text-muted-foreground px-1">Recent Updates</h3>
            <div className="space-y-2">
              {friendsStatuses.map((status, index) => (
                <React.Fragment key={status.id}>
                    <button
                      onClick={() => setSelectedStatus(status)}
                      className="w-full text-left p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                         <Avatar className="h-14 w-14 border-2 border-primary/50 p-0.5">
                            <AvatarImage src={status.user.avatarUrl} alt={status.user.name} data-ai-hint="avatar person" />
                            <AvatarFallback>{status.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-semibold">{status.user.name}</h4>
                            <p className="text-sm text-muted-foreground">
                               <ClientTimeAgo timestamp={status.timestamp}>
                                    {(time) => `${time} ago`}
                               </ClientTimeAgo>
                            </p>
                        </div>
                      </div>
                    </button>
                    {index < friendsStatuses.length - 1 && <Separator className="my-1" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <StatusViewer 
        status={selectedStatus} 
        onClose={() => setSelectedStatus(null)} 
      />
      <AddStatusDialog 
        statusDraft={statusDraft} 
        onClose={() => setStatusDraft(null)}
        onAddStatus={handleAddStatus}
      />
    </div>
  );
}

function StatusViewer({ status, onClose }: { status: Status | null, onClose: () => void }) {
  if (!status) return null;

  return (
    <Dialog open={!!status} onOpenChange={onClose}>
      <DialogContent className="p-0 m-0 bg-black/90 border-none w-screen h-screen max-w-full max-h-full rounded-none flex flex-col items-center justify-center">
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={status.user.avatarUrl} alt={status.user.name} />
                <AvatarFallback>{status.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-white">{status.user.name}</p>
                <p className="text-xs text-gray-300">
                    <ClientTimeAgo timestamp={status.timestamp}>
                        {(time) => `${time} ago`}
                    </ClientTimeAgo>
                </p>
            </div>
        </div>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-9 w-9 text-white hover:bg-white/20 z-20" onClick={onClose}>
            <X className="h-6 w-6"/>
        </Button>
        <div className="relative w-full h-full flex items-center justify-center">
             <Image 
                src={status.imageUrl} 
                alt={status.caption} 
                fill
                objectFit="contain"
                data-ai-hint="status background"
             />
             {status.caption && (
                <div className="absolute bottom-10 left-0 right-0 p-4 text-center z-10">
                    <p className="bg-black/50 text-white text-lg rounded-full px-4 py-2 inline-block">
                        {status.caption}
                    </p>
                </div>
             )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


function AddStatusDialog({ statusDraft, onClose, onAddStatus }: { 
    statusDraft: {image: File, previewUrl: string} | null, 
    onClose: () => void, 
    onAddStatus: (caption: string, imageUrl: string) => void 
}) {
    const [caption, setCaption] = React.useState('');

    React.useEffect(() => {
        if (statusDraft) {
            setCaption('');
        }
    }, [statusDraft]);
    
    const handleSubmit = () => {
        if (statusDraft) {
            onAddStatus(caption, statusDraft.previewUrl);
            onClose();
        }
    };

    if (!statusDraft) return null;

    return (
        <Dialog open={!!statusDraft} onOpenChange={onClose}>
            <DialogContent className="flex flex-col h-[90vh] max-h-[90vh] rounded-2xl">
                <div className="flex-1 flex flex-col justify-between gap-4 pt-6">
                    <div className="flex-1 relative w-full rounded-md overflow-hidden border">
                        <Image src={statusDraft.previewUrl} alt="Image preview" layout="fill" objectFit="cover" />
                    </div>
                    <div className="space-y-2">
                        <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..."/>
                    </div>
                     <Button onClick={handleSubmit} className="w-full">
                        Post Status
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
