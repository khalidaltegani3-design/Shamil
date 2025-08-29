
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { videos as initialVideos } from '@/lib/mock-data';
import type { Video as VideoType } from '@/lib/types';
import VideoCard from '@/components/video-card';
import { MessageSquare, CircleDot, Phone, Settings, Video, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const bottomNavItems = [
    { href: "/chats", label: "Home", icon: Home },
    { href: "/view", label: "Discover", icon: Video },
    { href: "/create", label: "Create", icon: "add" },
    { href: "/calls", label: "Inbox", icon: MessageSquare },
    { href: "/profile/user-1", label: "Me", icon: Settings },
];

export default function ViewPage() {
  const [videos] = useState<VideoType[]>(initialVideos);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-y-auto snap-y snap-mandatory bg-black"
    >
        <header className="absolute top-0 left-0 right-0 z-20 flex justify-center items-center p-4 space-x-6">
            <span className='text-white/70 font-semibold text-lg'>Following</span>
            <span className='text-white font-bold text-xl border-b-2 pb-1'>For You</span>
        </header>

      {videos.map((video) => (
        <div key={video.id} className="h-screen w-full snap-start relative flex items-center justify-center">
          <VideoCard video={video} />
        </div>
      ))}
      
        <footer className="absolute bottom-0 w-full bg-black z-10">
          <nav className="flex items-center justify-around h-16 text-white">
             {bottomNavItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                if (label === 'Create') {
                    return (
                        <Link href="/create" key={label} className="flex-1">
                             <div className='h-10 w-16 bg-white rounded-lg flex items-center justify-center mx-auto'>
                                <Video className="h-6 w-6 text-black" />
                            </div>
                        </Link>
                    )
                }
                 return (
                    <Link href={href} key={label} className="flex-1 flex flex-col items-center gap-1 text-xs">
                        <Icon className={cn("h-6 w-6", isActive ? 'text-white' : 'text-white/70')} />
                        <span className={cn(isActive ? 'font-bold' : 'font-normal')}>{label}</span>
                    </Link>
                 )
             })}
          </nav>
        </footer>
    </div>
  );
}
