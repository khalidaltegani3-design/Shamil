"use client"

import React, { useRef, useEffect } from 'react';
import { videos as initialVideos, type Video } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Send, Music, Camera } from 'lucide-react';
import Link from 'next/link';

const VideoCard = ({ video }: { video: Video }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play();
                    } else {
                        videoRef.current?.pause();
                    }
                });
            },
            { threshold: 0.5 } // Play when 50% of the video is visible
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    return (
        <div className="relative h-full w-full snap-start flex-shrink-0">
            <video
                ref={videoRef}
                src={video.videoUrl}
                loop
                muted // Muted by default to allow autoplay in browsers
                className="h-full w-full object-cover"
            ></video>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                <div className="flex items-end">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10 border-2 border-white">
                                <AvatarImage src={video.user.avatarUrl} data-ai-hint="avatar user"/>
                                <AvatarFallback>{video.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-bold text-lg">@{video.user.name}</h3>
                        </div>
                        <p className="text-sm">{video.caption}</p>
                        <div className="flex items-center gap-2 text-sm">
                            <Music className="h-4 w-4" />
                            <p>Original Audio - {video.user.name}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <Button variant="ghost" size="icon" className="text-white hover:text-white">
                            <Heart className="h-8 w-8" />
                            <span className="text-xs">{video.likes}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:text-white">
                            <MessageCircle className="h-8 w-8" />
                            <span className="text-xs">{video.comments}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:text-white">
                            <Send className="h-8 w-8" />
                            <span className="text-xs">{video.shares}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function ViewPage() {
    const [videos, setVideos] = React.useState<Video[]>(initialVideos);

    return (
        <div className="h-full w-full bg-black snap-y snap-mandatory overflow-y-scroll overflow-x-hidden scrollbar-hide">
           <div className="absolute top-4 right-4 z-10">
                <Link href="/create">
                    <Button variant="ghost" size="icon" className="text-white bg-white/20 hover:bg-white/30 rounded-full h-12 w-12">
                        <Camera className="h-6 w-6" />
                    </Button>
                </Link>
           </div>
           {videos.map(video => (
               <VideoCard key={video.id} video={video} />
           ))}
        </div>
    );
}
