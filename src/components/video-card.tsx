
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Video } from '@/lib/types';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share, Play, Pause, Music2, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };
  
  // This effect will try to play the video when it becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
            videoRef.current?.play().then(() => {
                setIsPlaying(true);
            }).catch(e => {
                // Autoplay was prevented.
                setIsPlaying(false);
            });
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
      },
      { threshold: 0.5 } // 50% of the video should be visible to play
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [video]);


  return (
    <div className="relative h-full w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={video.videoUrl}
        loop
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Play className="h-20 w-20 text-white/50" />
        </div>
      )}

      <div className="absolute bottom-16 left-0 right-0 text-white z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex justify-between items-end">
            {/* Left side: Video Info */}
            <div className="flex-1 pr-4 space-y-2">
                <p className="font-bold text-base">{video.caption}</p>
                 <div className="flex items-center gap-2">
                    <Music2 className="h-4 w-4" />
                    <p className="text-sm truncate">Original Sound - {video.user.name}</p>
                </div>
            </div>

            {/* Right side: User avatar & Action buttons */}
            <div className="flex flex-col items-center gap-4">
                 <Link href={`/profile/${video.user.id}`} className="flex flex-col items-center gap-2 group mb-2">
                    <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={video.user.avatarUrl} />
                        <AvatarFallback>{video.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <p className="font-bold text-sm">@{video.user.name}</p>
                </Link>
                 <Button variant="ghost" size="icon" className="h-auto p-0 flex-col text-white gap-1" aria-label="Like video">
                    <Heart className="h-8 w-8" />
                    <span className="text-xs font-semibold">{video.likes.toLocaleString()}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-auto p-0 flex-col text-white gap-1" aria-label="Comment on video">
                    <MessageCircle className="h-8 w-8" />
                    <span className="text-xs font-semibold">{video.comments.toLocaleString()}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-auto p-0 flex-col text-white gap-1" aria-label="Share with contacts">
                    <Share className="h-8 w-8" />
                    <span className="text-xs font-semibold">{video.shares.toLocaleString()}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-auto p-0 text-white" aria-label="Share with external apps">
                    <MoreHorizontal className="h-8 w-8" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
