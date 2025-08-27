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

export default function TabsLayout() {
  const pathname = usePathname();
  const ActiveComponent = TABS[pathname] || ChatsPage;

  return (
    <div className="h-full grid grid-rows-[1fr_auto]">
      <main className="overflow-y-auto">
        <ActiveComponent />
      </main>
      <BottomNavbar />
    </div>
  );
}
