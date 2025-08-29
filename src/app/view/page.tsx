
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { videos as initialVideos } from '@/lib/mock-data';
import type { Video as VideoType } from '@/lib/types';
import VideoCard from '@/components/video-card';
import BottomNavbar from '@/components/bottom-navbar';
import { cn } from '@/lib/utils';


export default function ViewPage() {
  const [videos] = useState<VideoType[]>(initialVideos);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollTop = useRef(0);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      // Show header if scrolling up, hide if scrolling down
      setIsHeaderVisible(scrollTop < lastScrollTop.current || scrollTop <= 0);
      lastScrollTop.current = scrollTop;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  return (
    <div className="h-full w-full flex flex-col bg-black">
        <header className={cn(
            "absolute top-0 left-0 right-0 z-20 flex justify-center items-center p-4 space-x-6 bg-black/30 backdrop-blur-sm transition-transform duration-300 ease-in-out",
            isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        )}>
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
