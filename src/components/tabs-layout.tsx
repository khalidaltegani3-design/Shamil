"use client"

import React from 'react';
import BottomNavbar from './bottom-navbar';
import { usePathname } from 'next/navigation';
import ChatsPage from './chats-page';
import StatusPage from '@/app/status/page';
import CallsPage from '@/app/calls/page';
import ViewPage from '@/app/view/page';
import SettingsPage from '@/app/settings/page';

const TABS: Record<string, React.ComponentType> = {
    '/': ChatsPage,
    '/status': StatusPage,
    '/calls': CallsPage,
    '/view': ViewPage,
    '/settings': SettingsPage,
};

// A set of routes where the bottom navbar should be visible
const NAVBAR_VISIBLE_ROUTES = new Set(Object.keys(TABS));


export default function TabsLayout() {
  const pathname = usePathname();
  const ActiveComponent = TABS[pathname] || ChatsPage;
  const isNavbarVisible = NAVBAR_VISIBLE_ROUTES.has(pathname);

  return (
    <div className="h-full w-full relative">
      <main className="h-full overflow-y-auto pb-24">
        <ActiveComponent />
      </main>
      {isNavbarVisible && <BottomNavbar />}
    </div>
  );
}
