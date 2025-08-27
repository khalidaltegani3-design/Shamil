
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Scissors } from 'lucide-react';

interface VideoTrimmerProps {
  videoFile: File;
  onClose: () => void;
  onTrimComplete: (trimmedFile: File) => void;
}

const MAX_DURATION = 60; // 60 seconds

export function VideoTrimmer({ videoFile, onClose, onTrimComplete }: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimRange, setTrimRange] = useState([0, MAX_DURATION]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      // Initialize trim range, ensuring not to exceed video duration
      const end = Math.min(videoDuration, MAX_DURATION);
      setTrimRange([0, end]);
    }
  };
  
  const handlePlayPause = () => {
    if (videoRef.current) {
        if(isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
  }

  const handleTimeUpdate = () => {
     if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      // Enforce trimming boundaries during playback
      if (current >= trimRange[1]) {
        videoRef.current.pause();
        videoRef.current.currentTime = trimRange[0];
        setIsPlaying(false);
      }
    }
  };

  const handleRangeChange = (value: number[]) => {
     if (videoRef.current && value[1] - value[0] <= MAX_DURATION) {
        setTrimRange(value);
        videoRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
     } else if (value[1] - value[0] > MAX_DURATION) {
        // If user tries to select more than 60s, adjust the end handle
        const newEnd = value[0] + MAX_DURATION;
        setTrimRange([value[0], newEnd > duration ? duration : newEnd]);
        videoRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
     }
  };

  const handleTrim = () => {
    // Client-side video trimming is very complex and requires libraries like ffmpeg.js
    // which is very heavy. For this prototype, we'll simulate the trim by
    // simply passing the original file back.
    // In a real application, you would implement actual trimming logic here.
    console.log(`Simulating trim from ${trimRange[0].toFixed(2)}s to ${trimRange[1].toFixed(2)}s`);
    onTrimComplete(videoFile);
  };
  
   const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full flex flex-col h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Trim Video</DialogTitle>
          <DialogDescription>Select a 60 second clip to use for your status.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 bg-black flex items-center justify-center p-2 relative">
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="max-h-full max-w-full"
            />
          )}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Button size="icon" className="rounded-full h-12 w-12 bg-black/50" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="h-6 w-6 text-white"/> : <Play className="h-6 w-6 text-white"/>}
                </Button>
            </div>
        </div>

        <div className="p-4 space-y-4 bg-background border-t">
          <div className="w-full">
            <Slider
                min={0}
                max={duration}
                step={0.1}
                value={trimRange}
                onValueChange={handleRangeChange}
                minStepsBetweenThumbs={1}
                className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{formatTime(trimRange[0])}</span>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Selected duration: {formatTime(trimRange[1] - trimRange[0])}
          </p>
          <Button onClick={handleTrim} className="w-full">
            <Scissors className="mr-2 h-4 w-4" />
            Trim & Use Video
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
