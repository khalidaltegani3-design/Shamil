
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Clapperboard, Music, Sparkles, Type, X, Play, Pause, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { musicTracks as initialMusicTracks, type MusicTrack } from '@/lib/mock-data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const editOptions = [
  { icon: Type, label: 'Text' },
  { icon: Music, label: 'Sound' },
  { icon: Sparkles, label: 'Effects' },
  { icon: Clapperboard, label: 'Clips' },
];

const MusicLibraryDialog = ({ 
    open, 
    onOpenChange, 
    onSelectTrack 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    onSelectTrack: (track: MusicTrack) => void;
}) => {
    const [musicTracks] = useState<MusicTrack[]>(initialMusicTracks);
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPause = (track: MusicTrack) => {
        if (audioRef.current && selectedTrackId === track.id) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const newAudio = new Audio(track.url);
            newAudio.play();
            audioRef.current = newAudio;
            setSelectedTrackId(track.id);
            setIsPlaying(true);
        }
    };
    
    const handleSelect = (track: MusicTrack) => {
        onSelectTrack(track);
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
        onOpenChange(false);
    }

    useEffect(() => {
        const currentAudio = audioRef.current;
        return () => {
            currentAudio?.pause();
        };
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[70vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Add Sound</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {musicTracks.map(track => (
                            <div key={track.id} className="flex items-center p-2 rounded-lg hover:bg-accent/50 transition-colors gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="music album cover" />
                                    <AvatarFallback>{track.artist.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className='flex-1'>
                                    <p className="font-semibold">{track.title}</p>
                                    <p className="text-sm text-muted-foreground">{track.artist}</p>
                                    <p className="text-xs text-muted-foreground">{track.duration}</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => handlePlayPause(track)}>
                                    {selectedTrackId === track.id && isPlaying ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5"/>}
                                </Button>
                                <Button onClick={() => handleSelect(track)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Add
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default function CreateVideoPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMusicLibraryOpen, setIsMusicLibraryOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState<MusicTrack | null>(null);
  
  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };
    getCameraPermission();
  }, [toast]);

  const handleRecord = () => {
    setIsRecording(prev => !prev);
    // Placeholder for actual recording logic
    toast({ title: isRecording ? "Recording Stopped" : "Recording Started" });
  };
  
  const handleSelectTrack = (track: MusicTrack) => {
    setSelectedSound(track);
  }

  return (
    <div className="h-full w-full bg-black text-white flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <Button variant="ghost" size="icon" className="bg-black/30 hover:bg-black/50 rounded-full">
            <X className="h-6 w-6"/>
        </Button>
        <Button onClick={() => setIsMusicLibraryOpen(true)} className="flex items-center gap-2 p-2 rounded-full bg-black/30 h-auto">
            <Music className="h-5 w-5"/>
            <span className="text-sm font-semibold truncate max-w-[150px]">{selectedSound?.title || 'Add sound'}</span>
        </Button>
        <div>{/* Spacer */}</div>
      </header>
      
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
        {!hasCameraPermission && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                <Alert variant="destructive" className="max-w-sm">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser to start creating videos.
                    </AlertDescription>
                </Alert>
            </div>
        )}

        <aside className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-6">
            {editOptions.map(option => (
                <Button key={option.label} variant="ghost" className="flex flex-col items-center h-auto text-white bg-black/30 hover:bg-black/50 p-2 rounded-lg">
                    <option.icon className="h-7 w-7"/>
                    <span className="text-xs mt-1">{option.label}</span>
                </Button>
            ))}
        </aside>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col items-center gap-4">
        <div className='w-full max-w-xs'>
            <Slider defaultValue={[3]} max={5} step={1} />
        </div>
        <div className="flex items-center justify-center gap-8 w-full">
            <Button variant="ghost" className='text-white'>Gallery</Button>
            <Button 
              size="icon"
              onClick={handleRecord}
              className={`h-20 w-20 rounded-full border-4 border-white ${isRecording ? 'bg-red-500' : 'bg-transparent'} ring-4 ring-black/30`}
              disabled={!hasCameraPermission}
            >
              <span className={`h-12 w-12 rounded-full ${isRecording ? 'bg-red-500' : 'bg-white'}`}></span>
            </Button>
             <Button variant="ghost" className='text-white'>Templates</Button>
        </div>
      </footer>
       <MusicLibraryDialog 
        open={isMusicLibraryOpen}
        onOpenChange={setIsMusicLibraryOpen}
        onSelectTrack={handleSelectTrack}
      />
    </div>
  );
}
