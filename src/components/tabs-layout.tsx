
"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import ChatsPage from './chats-page';
import StatusPage from '@/app/status/page';
import CallsPage from '@/app/calls/page';
import SettingsPage from '@/app/settings/page';
import ProfilePage from '@/app/profile/[userId]/page';
import CreateVideoPage from '@/app/create/page';
import BottomNavbar from './bottom-navbar';

const TABS: Record<string, { component: React.ComponentType }> = {
    '/': { component: ChatsPage },
    '/status': { component: StatusPage },
    '/calls': { component: CallsPage },
    '/settings': { component: SettingsPage },
};

const fullscreenPages = ['/create'];

export default function TabsLayout() {
  const pathname = usePathname();

  let ActiveComponent: React.ComponentType;

  if (pathname.startsWith('/profile/')) {
    ActiveComponent = ProfilePage;
  } else if (TABS[pathname]) {
    ActiveComponent = TABS[pathname].component;
  } else if (pathname.startsWith('/create')) {
    ActiveComponent = CreateVideoPage;
  }
  else {
     ActiveComponent = TABS['/']?.component || ChatsPage;
  }
  
  const showNavbar = !fullscreenPages.includes(pathname) && !pathname.startsWith('/profile/');

  return (
    <div className="h-full w-full flex flex-col">
        <main className="flex-1 overflow-y-auto">
            <ActiveComponent />
        </main>
        {showNavbar && <BottomNavbar />}
    </div>
  );
}
