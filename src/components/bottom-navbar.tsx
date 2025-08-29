
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CircleDot, Phone, Settings, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

const mainNavItems = [
  { href: "/chats", label: "Chats", icon: MessageSquare },
  { href: "/status", label: "Status", icon: CircleDot },
  { href: "/view", label: "Discover", icon: Video },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  const isLoginPage = pathname === '/login' || pathname === '/';

  if (isLoginPage) {
    return null;
  }
  
  if (pathname === '/create') {
      // Special bar for create page can be handled here if needed, for now we hide it.
      return null;
  }

  return (
    <footer className="sticky bottom-0 w-full bg-transparent p-3 z-10">
      <nav className="flex items-center justify-around h-16 bg-card rounded-xl shadow-lg">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          if (href === '/create') return null; 
          const isActive = pathname === href;
          return (
            <Link href={href} key={label} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors h-full",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                )}
              >
                <Icon className="h-6 w-6" />
                <span>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
