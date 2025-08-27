
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
import BottomNavbar from './bottom-navbar';
import Header from './header';
import GenericSettingsPage from './generic-settings-page';

const TABS: Record<string, { component: React.ComponentType, hasHeader: boolean }> = {
    '/': { component: ChatsPage, hasHeader: true },
    '/status': { component: StatusPage, hasHeader: true },
    '/calls': { component: CallsPage, hasHeader: true },
    '/settings': { component: SettingsPage, hasHeader: false }, // Header is now part of the page
    '/view': { component: ViewPage, hasHeader: false },
    '/create': { component: CreateVideoPage, hasHeader: false },
};

// A simple way to get the title for the generic settings page
function getSettingsPageTitle(pathname: string): string {
    const parts = pathname.split('/');
    const slug = parts[parts.length - 1];
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function TabsLayout() {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  let ActiveComponent: React.ComponentType<any>;
  let showHeader = false;
  let showNavbar = true;
  let pageProps = {};

  if (pathname.startsWith('/profile/')) {
    ActiveComponent = ProfilePage;
    showHeader = false;
    showNavbar = false;
  } else if (pathname.startsWith('/settings/') && pathname !== '/settings') {
    ActiveComponent = GenericSettingsPage;
    showHeader = false; // Header is in the component itself
    showNavbar = false;
    pageProps = { title: getSettingsPageTitle(pathname) };
  } else if (TABS[pathname]) {
    ActiveComponent = TABS[pathname].component;
    showHeader = TABS[pathname].hasHeader;
    showNavbar = !['/view', '/create'].includes(pathname)
  }
  else {
     ActiveComponent = TABS['/']?.component || ChatsPage;
     showHeader = TABS['/']?.hasHeader ?? true;
     showNavbar = true;
  }
  
  return (
    <div className="h-full w-full flex flex-col bg-background">
        {showHeader && <Header onMenuClick={() => setSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto">
            <ActiveComponent {...pageProps} />
        </main>
        {showNavbar && <BottomNavbar />}
    </div>
  );
}
