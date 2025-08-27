"use client"

import React from 'react';
import TopNavbar from './bottom-navbar';
import { usePathname } from 'next/navigation';
import ChatsPage from './chats-page';
import StatusPage from '@/app/status/page';
import CallsPage from '@/app/calls/page';
import ViewPage from '@/app/view/page';
import SettingsPage from '@/app/settings/page';
import ProfilePage from '@/app/profile/[userId]/page';
import CreateVideoPage from '@/app/create/page';

const TABS: Record<string, React.ComponentType> = {
    '/': ChatsPage,
    '/status': StatusPage,
    '/calls': CallsPage,
    '/view': ViewPage,
    '/settings': SettingsPage,
};

// A set of routes where the top navbar should be visible
const NAVBAR_VISIBLE_ROUTES = new Set(Object.keys(TABS));
const FULL_PAGE_ROUTES = ['/create', '/profile'];


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
    <div className="h-full w-full flex flex-col">
        {isNavbarVisible && <TopNavbar />}
        <main className="flex-1 overflow-y-auto">
            <ActiveComponent />
        </main>
    </div>
  );
}
