"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CircleDot, Phone, Video, User } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

const mainNavItems = [
  { href: "/", label: "Chats", icon: MessageSquare },
  { href: "/status", label: "Status", icon: CircleDot },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/view", label: "View", icon: Video },
  { href: "/settings", label: "Settings", icon: User },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 h-24 z-50 flex items-center justify-center pointer-events-none">
      <div className="w-full max-w-[calc(100%-2rem)] p-1 bg-background/80 backdrop-blur-lg rounded-full border shadow-lg pointer-events-auto">
        <div className="flex justify-around items-center h-full">
            {mainNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
                <Link href={href} key={label} className="flex-1">
                <div
                    className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-full transition-colors",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                    )}
                >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{label}</span>
                </div>
                </Link>
            );
            })}
        </div>
      </div>
    </nav>
  );
}
