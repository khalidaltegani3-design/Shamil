
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { videos as initialVideos, type Video } from '@/lib/mock-data';
import VideoCard from '@/components/video-card';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ViewPage() {
  const [videos] = useState<Video[]>(initialVideos);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Hide hint after user starts scrolling
      if (container.scrollTop > 10) {
        setShowScrollHint(false);
      }
    };

    container.addEventListener('scroll', handleScroll);

    const hintTimeout = setTimeout(() => {
      setShowScrollHint(false);
    }, 5000); // Hide hint after 5 seconds

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(hintTimeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-y-auto snap-y snap-mandatory"
    >
      {videos.map((video) => (
        <div key={video.id} className="h-screen w-full snap-start relative flex items-center justify-center">
          <VideoCard video={video} />
        </div>
      ))}
      
      {showScrollHint && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center text-white z-20 animate-bounce">
            <ArrowUp className="w-6 h-6" />
            <span className="text-sm">Swipe Up</span>
        </div>
      )}
    </div>
  );
}
