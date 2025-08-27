"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
    onMenuClick: () => void;
}

const routeTitles: { [key: string]: string } = {
    '/chats': 'Zoliapp',
    '/status': 'Status',
    '/calls': 'Calls',
    '/settings': 'Settings',
};

const getTitle = (path: string) => {
    if (path.startsWith('/chats')) return 'Zoliapp';
    return routeTitles[path] || 'Zoliapp';
}

export default function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();
    const title = getTitle(pathname);

    return (
        <header className="flex items-center justify-between gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/95 backdrop-blur-sm sticky top-0 z-20">
            <div className='flex items-center gap-2'>
                <Button variant="ghost" size="icon" onClick={onMenuClick}>
                    <Menu className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold text-primary">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon">
                    <Search className="h-5 w-5" />
                </Button>
                 <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
