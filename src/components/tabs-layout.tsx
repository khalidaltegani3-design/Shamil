
"use client"

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import ChatsPage from './chats-page';
import StatusPage from '@/app/status/page';
import CallsPage from '@/app/calls/page';
import ViewPage from '@/app/view/page';
import SettingsPage from '@/app/settings/page';
import ProfilePage from '@/app/profile/[userId]/page';
import CreateVideoPage from '@/app/create/page';
import { cn } from '@/lib/utils';
import Header from './header';
import SideNavbar from './side-navbar';

const TABS: Record<string, { component: React.ComponentType, label: string }> = {
    '/': { component: ChatsPage, label: 'Zoliapp' },
    '/status': { component: StatusPage, label: 'Status' },
    '/calls': { component: CallsPage, label: 'Calls' },
    '/view': { component: ViewPage, label: 'View' },
    '/settings': { component: SettingsPage, label: 'Settings' },
};

const pageLabels: Record<string, string> = {
    ...Object.fromEntries(Object.entries(TABS).map(([path, { label }]) => [path, label])),
    '/create': 'Create Video',
}

export default function TabsLayout() {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  let ActiveComponent: React.ComponentType;
  let pageTitle = "Profile";

  if (pathname.startsWith('/profile/')) {
    ActiveComponent = ProfilePage;
  } else if (pageLabels[pathname]) {
    ActiveComponent = TABS[pathname]?.component || ChatsPage;
    pageTitle = pageLabels[pathname];
  } else {
     ActiveComponent = TABS['/']?.component;
     pageTitle = TABS['/']?.label;
  }

  if (pathname.startsWith('/create')) {
    ActiveComponent = CreateVideoPage;
    pageTitle = 'Create';
    return (
        <main className="h-full w-full">
            <ActiveComponent />
        </main>
    )
  }

  return (
    <div className="h-full w-full flex flex-col">
        <Header title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />
        <SideNavbar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 h-full w-full overflow-y-auto">
            <ActiveComponent />
        </main>
    </div>
  );
}
