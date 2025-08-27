
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { videos as initialVideos } from '@/lib/mock-data';
import type { Video as VideoType } from '@/lib/types';
import VideoCard from '@/components/video-card';
import { ArrowUp, ArrowDown, Camera, Video } from 'lucide-react';
import Link from 'next/link';

export default function ViewPage() {
  const [videos] = useState<VideoType[]>(initialVideos);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-y-auto snap-y snap-mandatory bg-black"
    >
        <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
            <div className='text-white font-semibold text-lg'>
                Discover
            </div>
            <Link href="/create">
                <Camera className="h-7 w-7 text-white"/>
            </Link>
        </header>

      {videos.map((video) => (
        <div key={video.id} className="h-screen w-full snap-start relative flex items-center justify-center">
          <VideoCard video={video} />
        </div>
      ))}
      
        <footer className="absolute bottom-0 w-full bg-transparent z-10">
          <nav className="flex items-center justify-around h-16 text-white">
             <Link href="/" className="flex flex-col items-center gap-1 text-sm">
                <span>Chats</span>
              </Link>
              <Link href="/status" className="flex flex-col items-center gap-1 text-sm">
                <span>Status</span>
              </Link>
               <Link href="/create" className="flex flex-col items-center gap-1 text-sm">
                <div className='h-10 w-10 bg-white rounded-full flex items-center justify-center'>
                    <Video className="h-6 w-6 text-black" />
                </div>
              </Link>
              <Link href="/calls" className="flex flex-col items-center gap-1 text-sm">
                <span>Calls</span>
              </Link>
              <Link href="/settings" className="flex flex-col items-center gap-1 text-sm">
                <span>Settings</span>
              </Link>
          </nav>
        </footer>
    </div>
  );
}
