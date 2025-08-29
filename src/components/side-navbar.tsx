
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CircleDot, Phone, Settings, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const mainNavItems = [
  { href: "/chats", label: "Chats", icon: MessageSquare },
  { href: "/view", label: "Discover", icon: Video },
  { href: "/status", label: "Status", icon: CircleDot },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SideNavbarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SideNavbar({ isOpen, onClose }: SideNavbarProps) {
  const pathname = usePathname();

  return (
    <>
        {/* Overlay */}
        <div 
            className={cn(
                "fixed inset-0 bg-black/60 z-30 transition-opacity",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={onClose}
        />

        {/* Sidebar */}
        <aside className={cn(
            "fixed top-0 left-0 h-full w-72 bg-background border-r z-40 transform transition-transform ease-in-out duration-300",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-4 border-b h-16">
                     <Link href="/profile/user-1" onClick={onClose} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="User Name" data-ai-hint="user avatar"/>
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Your Name</p>
                        </div>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </header>

                <nav className="flex-1 p-4 space-y-2">
                    {mainNavItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link href={href} key={label} onClick={onClose}>
                                <div className={cn(
                                    "flex items-center gap-4 p-3 rounded-lg text-base font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-foreground hover:bg-accent/50"
                                )}>
                                    <Icon className="h-6 w-6" />
                                    <span>{label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
                <footer className="p-4 border-t">
                    <Button variant="outline" className="w-full">Log Out</Button>
                </footer>
            </div>
        </aside>
    </>
  );
}
