
"use client";

import * as React from 'react';
import { users, statuses as initialStatuses, type Status } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Plus, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { VideoTrimmer } from '@/components/video-trimmer';

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
    return null; 
  }

  return <>{children(timeAgo)}</>;
};

export default function StatusPage() {
  const [statuses] = React.useState<Status[]>(initialStatuses);
  const [selectedStatusIndex, setSelectedStatusIndex] = React.useState<number | null>(null);
  const [statusDraft, setStatusDraft] = React.useState<{file: File, previewUrl: string} | null>(null);
  const [videoToTrim, setVideoToTrim] = React.useState<{file: File, previewUrl: string} | null>(null);
  const { toast } = useToast();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const currentUser = users[0];
  const myStatus = statuses.find(s => s.user.id === currentUser.id);
  const friendsStatuses = statuses.filter(s => s.user.id !== currentUser.id);

  const handleAddStatus = (caption: string) => {
    // This is a placeholder for adding a status.
    console.log("Adding status:", { caption, file: statusDraft?.file.name });
    setStatusDraft(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);

      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 60) {
            setVideoToTrim({ file, previewUrl });
          } else {
            setStatusDraft({ file, previewUrl });
          }
        };
        video.src = previewUrl;
      } else {
         setStatusDraft({ file, previewUrl });
      }
    }
    // Reset the file input so the same file can be selected again
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleTrimComplete = (trimmedVideoFile: File) => {
    const previewUrl = URL.createObjectURL(trimmedVideoFile);
    setStatusDraft({ file: trimmedVideoFile, previewUrl });
    setVideoToTrim(null);
  }

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
          <div className="w-full text-left p-2 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="relative">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={myStatus?.imageUrl || currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*"
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
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-muted-foreground px-1">Recent Updates</h3>
            <div className="space-y-1">
              {friendsStatuses.map((status) => (
                    <button
                      key={status.id}
                      onClick={() => setSelectedStatusIndex(friendsStatuses.indexOf(status))}
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
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <StatusViewer 
        statuses={friendsStatuses} 
        startIndex={selectedStatusIndex}
        onClose={() => setSelectedStatusIndex(null)} 
      />
      <AddStatusDialog 
        statusDraft={statusDraft} 
        onClose={() => setStatusDraft(null)}
        onAddStatus={handleAddStatus}
      />
      {videoToTrim && (
        <VideoTrimmer 
            videoFile={videoToTrim.file}
            onClose={() => setVideoToTrim(null)}
            onTrimComplete={handleTrimComplete}
        />
      )}
    </div>
  );
}

function StatusViewer({ statuses, startIndex, onClose }: { statuses: Status[], startIndex: number | null, onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = React.useState<number | null>(startIndex);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  React.useEffect(() => {
    if (currentIndex === null) return;

    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(p => p + 1);
    }, 100);

    const timer = setTimeout(() => {
      if (currentIndex < statuses.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [currentIndex, statuses.length, onClose]);

  if (currentIndex === null) return null;
  
  const status = statuses[currentIndex];
  if (!status) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-0 m-0 bg-black/90 border-none w-screen h-screen max-w-full max-h-full flex flex-col items-center justify-center rounded-lg">
        <DialogHeader className="absolute top-4 left-4 right-4 z-20">
             <DialogTitle className="sr-only">Status from {status.user.name}</DialogTitle>
             <DialogDescription className="sr-only">{status.caption || "User status"}</DialogDescription>
            <Progress value={progress} className="h-1 bg-white/30" />
            <div className="flex items-center gap-3 mt-2">
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
        </DialogHeader>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-9 w-9 text-white hover:bg-white/20 z-20" onClick={onClose}>
            <X className="h-6 w-6"/>
        </Button>
        <div className="relative w-full h-full flex items-center justify-center">
             <Image 
                src={status.imageUrl} 
                alt={status.caption || 'Status image'} 
                fill
                className="object-contain"
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
    statusDraft: {file: File, previewUrl: string} | null, 
    onClose: () => void, 
    onAddStatus: (caption: string) => void 
}) {
    const [caption, setCaption] = React.useState('');

    React.useEffect(() => {
        if (statusDraft) {
            setCaption('');
        }
    }, [statusDraft]);
    
    const handleSubmit = () => {
        if (statusDraft) {
            onAddStatus(caption);
            onClose();
        }
    };

    if (!statusDraft) return null;

    return (
        <Dialog open={!!statusDraft} onOpenChange={onClose}>
            <DialogContent className="flex flex-col h-[90vh] max-h-[90vh] p-0 gap-0 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="sr-only">Add New Status</DialogTitle>
                    <DialogDescription className="sr-only">Create a new status by adding a caption to your selected image or video.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 relative w-full overflow-hidden">
                    {statusDraft.file.type.startsWith('video/') ? (
                    <video src={statusDraft.previewUrl} className="w-full h-full object-cover" autoPlay loop muted />
                    ) : (
                    <Image src={statusDraft.previewUrl} alt="Image preview" layout="fill" objectFit="cover" />
                    )}
                </div>
                <DialogFooter className="p-4 border-t bg-background">
                    <div className="w-full space-y-3">
                         <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..."/>
                         <Button onClick={handleSubmit} className="w-full">
                            Post Status
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
