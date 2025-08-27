
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import BottomNavbar from './bottom-navbar';
import ChatsPage from './chats-page';
import StatusPage from '@/app/status/page';
import CallsPage from '@/app/calls/page';
import ViewPage from '@/app/view/page';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const TABS_COUNT = 4;
const TABS = [
    { component: <ChatsPage/>, path: '/' },
    { component: <StatusPage/>, path: '/status' },
    { component: <CallsPage/>, path: '/calls' },
    { component: <ViewPage/>, path: '/view' },
]

const TAB_PATHS = ['/', '/status', '/calls', '/view'];

export default function TabsLayout() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [activeIndex, setActiveIndex] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setActiveIndex(newIndex);
    const newPath = TAB_PATHS[newIndex];
    if (pathname !== newPath) {
        // We only push history state if the path is different
        // to avoid loops and unnecessary history entries.
        router.replace(newPath, { scroll: false });
    }
  }, [emblaApi, router, pathname]);


  const handleTabChange = useCallback((index: number) => {
    if (emblaApi) {
        emblaApi.scrollTo(index);
        setActiveIndex(index);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', handleSelect);
   
    const currentPathIndex = TAB_PATHS.indexOf(pathname);
    let initialTab = currentPathIndex !== -1 ? currentPathIndex : 0;
    
    if (initialTab !== emblaApi.selectedScrollSnap()) {
      emblaApi.scrollTo(initialTab, true);
    }
    setActiveIndex(initialTab);

    return () => {
      emblaApi.off('select', handleSelect);
    };
  }, [emblaApi, handleSelect, pathname]);

  return (
    <div className="h-full w-full flex flex-col">
      <main className="flex-1 overflow-hidden">
          <Carousel setApi={emblaApi} className="h-full">
            <CarouselContent className='h-full'>
              {TABS.map((tab, index) => (
                <CarouselItem key={index} className="h-full overflow-hidden">
                    {tab.component}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
      </main>
      <BottomNavbar activeTab={activeIndex} onTabChange={handleTabChange} />
    </div>
  );
}
