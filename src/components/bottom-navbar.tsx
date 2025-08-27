"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CircleDot, Phone, Video, User, MoreVertical, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


const mainNavItems = [
  { href: "/", label: "Chats", icon: MessageSquare },
  { href: "/status", label: "Status", icon: CircleDot },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/view", label: "View", icon: Video },
  { href: "/settings", label: "Settings", icon: User },
];

export default function TopNavbar() {
  const pathname = usePathname();

  return (
    <header className="flex flex-col gap-3 p-3 border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Zoliapp</h1>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                <DropdownMenuItem>New Group</DropdownMenuItem>
                    <DropdownMenuItem>New Broadcast</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
        {pathname === "/" && (
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-10" />
            </div>
        )}

        <nav className="flex justify-around items-center h-full -mb-3">
            {mainNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
                <Link href={href} key={label} className="flex-1 pb-2">
                    <div
                        className={cn(
                        "flex flex-col items-center gap-1 transition-colors border-b-2",
                        isActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-primary"
                        )}
                    >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs font-medium sr-only">{label}</span>
                    </div>
                </Link>
            );
            })}
        </nav>
    </header>
  );
}
