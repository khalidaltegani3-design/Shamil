"use client"

import React from 'react';
import BottomNavbar from './bottom-navbar';
import { usePathname } from 'next/navigation';
import ChatsPage from './chats-page';
import StatusPage from '@/app/status/page';
import CallsPage from '@/app/calls/page';
import ViewPage from '@/app/view/page';
import SettingsPage from '@/app/settings/page';
import ProfilePage from '@/app/profile/[userId]/page';
import CreateVideoPage from '@/app/create/page';
import { cn } from '@/lib/utils';

const TABS: Record<string, React.ComponentType> = {
    '/': ChatsPage,
    '/status': StatusPage,
    '/calls': CallsPage,
    '/view': ViewPage,
    '/settings': SettingsPage,
};

const NAVBAR_VISIBLE_ROUTES = new Set(Object.keys(TABS));


export default function TabsLayout() {
  const pathname = usePathname();

  let ActiveComponent: React.ComponentType;
  let isNavbarVisible = NAVBAR_VISIBLE_ROUTES.has(pathname);

  if (pathname.startsWith('/profile/')) {
    ActiveComponent = ProfilePage;
    isNavbarVisible = false;
  } else if(pathname.startsWith('/create')) {
     ActiveComponent = CreateVideoPage;
     isNavbarVisible = false;
  }
  else {
    ActiveComponent = TABS[pathname] || ChatsPage;
  }


  return (
    <div className={cn("h-full w-full", pathname === '/view' && 'pb-16')}>
        <main className="h-full w-full">
            <ActiveComponent />
        </main>
        {isNavbarVisible && <BottomNavbar />}
    </div>
  );
}

    