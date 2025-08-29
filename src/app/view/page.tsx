
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { videos as initialVideos } from '@/lib/mock-data';
import type { Video as VideoType } from '@/lib/types';
import VideoCard from '@/components/video-card';
import BottomNavbar from '@/components/bottom-navbar';


export default function ViewPage() {
  const [videos] = useState<VideoType[]>(initialVideos);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full w-full flex flex-col bg-black">
        <header className="absolute top-0 left-0 right-0 z-20 flex justify-center items-center p-4 space-x-6 bg-black/30 backdrop-blur-sm">
            <span className='text-white/70 font-semibold text-lg'>Following</span>
            <span className='text-white font-bold text-xl border-b-2 pb-1'>For You</span>
        </header>
        <main 
            ref={containerRef}
            className="flex-1 w-full overflow-y-auto snap-y snap-mandatory"
        >
            {videos.map((video) => (
                <div key={video.id} className="h-full w-full snap-start relative flex items-center justify-center">
                <VideoCard video={video} />
                </div>
            ))}
        </main>
      
        <BottomNavbar />
    </div>
  );
}
