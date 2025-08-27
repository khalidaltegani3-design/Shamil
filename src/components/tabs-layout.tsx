
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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const TABS_COUNT = 3;
const TABS = [
    { component: <ChatsPage/> },
    { component: <StatusPage/> },
    { component: <CallsPage/> },
]

export default function TabsLayout() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [activeIndex, setActiveIndex] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    const newTab = emblaApi.selectedScrollSnap().toString();
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', newTab);
    router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  }, [emblaApi, pathname, router, searchParams]);

  const handleTabChange = useCallback((index: number) => {
    if (emblaApi) {
        emblaApi.scrollTo(index);
        setActiveIndex(index);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', handleSelect);
    // Initial sync
    const tab = searchParams.get('tab');
    const initialTab = tab ? parseInt(tab, 10) : 0;
    if (initialTab >= 0 && initialTab < TABS_COUNT) {
        emblaApi.scrollTo(initialTab, true);
        setActiveIndex(initialTab);
    }
    return () => {
      emblaApi.off('select', handleSelect);
    };
  }, [emblaApi, handleSelect, searchParams]);

  return (
    <>
      <main className="flex-1 overflow-hidden">
          <Carousel setApi={emblaApi} className="h-full">
            <CarouselContent className='h-full'>
              {TABS.map((tab, index) => (
                <CarouselItem key={index} className="h-full overflow-y-auto">
                    {tab.component}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
      </main>
      <BottomNavbar activeTab={activeIndex} onTabChange={handleTabChange} />
    </>
  );
}
