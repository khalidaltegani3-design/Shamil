
"use client";

import * as React from 'react';
import { users, statuses as initialStatuses, type Status, type User } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

const ClientTimeAgo = ({ timestamp, children }: { timestamp: string, children: (formattedTime: string) => React.ReactNode }) => {
  const [timeAgo, setTimeAgo] = React.useState('');

  React.useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(timestamp)));
  }, [timestamp]);

  if (!timeAgo) {
    return null; 
  }

  return <>{children(timeAgo)}</>;
};


export default function StatusPage() {
  const [statuses, setStatuses] = React.useState<Status[]>(initialStatuses);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(null);
  const [isAddStatusOpen, setIsAddStatusOpen] = React.useState(false);
  
  const currentUser = users[0];
  const myStatus = statuses.find(s => s.user.id === currentUser.id);
  const friendsStatuses = statuses.filter(s => s.user.id !== currentUser.id);

  const handleAddStatus = (caption: string, imageUrl: string) => {
    const newStatus: Status = {
      id: `status-${Date.now()}`,
      user: currentUser,
      caption,
      imageUrl,
      timestamp: new Date().toISOString(),
    };
    setStatuses(prev => [newStatus, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Status</h1>
      </header>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-dashed border-primary">
                  <AvatarImage src={myStatus?.imageUrl || currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                 <button 
                  onClick={() => setIsAddStatusOpen(true)}
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90 transition-colors">
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
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-2 font-semibold text-muted-foreground px-2">Recent Updates</h3>
            <div className="space-y-1">
              {friendsStatuses.map(status => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status)}
                  className="w-full text-left p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                     <Avatar className="h-14 w-14 border-2 border-accent">
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
        status={selectedStatus} 
        onClose={() => setSelectedStatus(null)} 
      />
      <AddStatusDialog 
        isOpen={isAddStatusOpen} 
        onClose={() => setIsAddStatusOpen(false)}
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
                layout="fill"
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


function AddStatusDialog({ isOpen, onClose, onAddStatus }: { isOpen: boolean, onClose: () => void, onAddStatus: (caption: string, imageUrl: string) => void }) {
    const [caption, setCaption] = React.useState('');
    const [image, setImage] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = () => {
        // In a real app, you'd upload the image and get a URL.
        // For this mock, we'll just use the preview URL.
        if (preview) {
            onAddStatus(caption, preview);
            onClose();
            setCaption('');
            setImage(null);
            setPreview(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="picture">Picture</Label>
                        <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                    {preview && (
                        <div className="relative w-full aspect-[9/16] rounded-md overflow-hidden border">
                            <Image src={preview} alt="Image preview" layout="fill" objectFit="cover" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="caption">Caption (optional)</Label>
                        <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..."/>
                    </div>
                    <Button onClick={handleSubmit} disabled={!image} className="w-full">
                        Post Status
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
