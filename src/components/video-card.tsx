
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Video } from '@/lib/types';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share, Play, Pause, Music2, MoreHorizontal, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import CommentsSheet from './comments-sheet';
import ShareSheet from './share-sheet';
import type { Comment } from '@/lib/types';
import { users } from '@/lib/mock-data';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video: initialVideo }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [video, setVideo] = useState<Video>(initialVideo);


  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent video from pausing
    if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
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

    const currentVideoRef = videoRef.current;
    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
    };
  }, [video]);

  const handleAddComment = (commentText: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      user: users[0], // Assuming current user is users[0]
      text: commentText,
      timestamp: new Date().toISOString(),
    };
    
    setVideo(prevVideo => {
        const updatedComments = [...(prevVideo.commentsData || []), newComment];
        return {
            ...prevVideo,
            commentsData: updatedComments,
            comments: updatedComments.length,
        }
    });
  };
  
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

  return (
    <div className="relative h-full w-full bg-black rounded-lg overflow-hidden" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={video.videoUrl}
        loop
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
            <Play className="h-20 w-20 text-white/50" />
        </div>
      )}
      
       <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-16 right-4 text-white bg-black/30 hover:bg-black/50 z-20"
            onClick={toggleMute}
        >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>

      <div className="absolute bottom-0 left-0 right-0 text-white z-10 p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none w-full">
        <div className="flex justify-between items-end">
            {/* Left side: Video Info */}
            <div className="flex-1 pr-4 space-y-2 min-w-0">
                <p className="font-bold text-base">@{video.user.name}</p>
                <p className="font-medium text-sm">{video.caption}</p>
                 <div className="flex items-center gap-2">
                    <Music2 className="h-4 w-4" />
                    <p className="text-sm truncate">Original Sound - {video.user.name}</p>
                </div>
            </div>

            {/* Right side: User avatar & Action buttons */}
            <div className="flex flex-col items-center gap-4 pointer-events-auto">
                 <Link href={`/profile/${video.user.id}`} className="flex flex-col items-center gap-2 group mb-2">
                    <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={video.user.avatarUrl} />
                        <AvatarFallback>{video.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
                 <Button variant="ghost" size="icon" className="h-auto p-0 flex-col text-white gap-1" aria-label="Like video">
                    <Heart className="h-8 w-8" />
                    <span className="text-xs font-semibold">{video.likes.toLocaleString()}</span>
                </Button>
                <Button onClick={() => setIsCommentsOpen(true)} variant="ghost" size="icon" className="h-auto p-0 flex-col text-white gap-1" aria-label="Comment on video">
                    <MessageCircle className="h-8 w-8" />
                    <span className="text-xs font-semibold">{video.comments.toLocaleString()}</span>
                </Button>
                <Button onClick={() => setIsShareOpen(true)} variant="ghost" size="icon" className="h-auto p-0 flex-col text-white gap-1" aria-label="Share with contacts">
                    <Share className="h-8 w-8" />
                    <span className="text-xs font-semibold">{video.shares.toLocaleString()}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-auto p-0 text-white" aria-label="Share with external apps">
                    <MoreHorizontal className="h-8 w-8" />
                </Button>
            </div>
        </div>
      </div>
      <CommentsSheet 
        isOpen={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
        comments={video.commentsData || []}
        commentCount={video.comments}
        onAddComment={handleAddComment}
      />
      <ShareSheet
        isOpen={isShareOpen}
        onOpenChange={setIsShareOpen}
        videoCaption={video.caption}
      />
    </div>
  );
}
