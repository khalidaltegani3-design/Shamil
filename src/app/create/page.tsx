"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Clapperboard, Music, Sparkles, Type, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';

const editOptions = [
  { icon: Type, label: 'Text' },
  { icon: Music, label: 'Sound' },
  { icon: Sparkles, label: 'Effects' },
  { icon: Clapperboard, label: 'Clips' },
];

export default function CreateVideoPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
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

  return (
    <div className="h-full w-full bg-black text-white flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <Button variant="ghost" size="icon" className="bg-black/30 hover:bg-black/50 rounded-full">
            <X className="h-6 w-6"/>
        </Button>
        <div className="flex items-center gap-2 p-2 rounded-full bg-black/30">
            <Music className="h-5 w-5"/>
            <span className="text-sm font-semibold">Add sound</span>
        </div>
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
    </div>
  );
}
