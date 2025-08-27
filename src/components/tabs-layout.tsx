
"use client"

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import ChatsPage from './chats-page';
import StatusPage from '@/app/status/page';
import CallsPage from '@/app/calls/page';
import SettingsPage from '@/app/settings/page';
import ProfilePage from '@/app/profile/[userId]/page';
import CreateVideoPage from '@/app/create/page';
import ViewPage from '@/app/view/page';
import Header from './header';
import SideNavbar from './side-navbar';

const TABS: Record<string, { component: React.ComponentType }> = {
    '/': { component: ChatsPage },
    '/status': { component: StatusPage },
    '/calls': { component: CallsPage },
    '/settings': { component: SettingsPage },
    '/view': { component: ViewPage },
    '/create': { component: CreateVideoPage },
};

const fullscreenPages = ['/create', '/view'];

export default function TabsLayout() {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  let ActiveComponent: React.ComponentType;

  if (pathname.startsWith('/profile/')) {
    ActiveComponent = ProfilePage;
  } else if (TABS[pathname]) {
    ActiveComponent = TABS[pathname].component;
  }
  else {
     ActiveComponent = TABS['/']?.component || ChatsPage;
  }
  
  const showHeader = !fullscreenPages.includes(pathname);
  
  return (
    <div className="h-full w-full flex flex-col bg-background">
        <SideNavbar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        {showHeader && <Header onMenuClick={() => setSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto">
            <ActiveComponent />
        </main>
    </div>
  );
}
