"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CircleDot, Phone, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

const mainNavItems = [
  { href: "/", label: "Chats", icon: MessageSquare },
  { href: "/status", label: "Status", icon: CircleDot },
  { href: "/calls", label: "Calls", icon: Phone },
];

const allNavItems = [...mainNavItems, { href: "/view", label: "View", icon: Video }];

interface BottomNavbarProps {
    activeTab?: number;
    onTabChange?: (index: number) => void;
}

export default function BottomNavbar({ activeTab, onTabChange }: BottomNavbarProps) {
  const pathname = usePathname();

  // Don't show navbar on specific pages
  if (pathname.startsWith('/profile/') || pathname === '/create') {
      return null;
  }
  
  // Standalone pages like /view have their own nav bar logic
  if (pathname === '/view') {
      return (
         <nav className="fixed bottom-0 left-0 right-0 bg-card border-t h-16 z-20 max-w-md mx-auto">
            <div className="flex justify-around items-center h-full max-w-md mx-auto">
                {allNavItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                    <Link key={label} href={href} className="flex-1">
                    <div
                        className={cn(
                        "flex flex-col items-center gap-1 p-2 transition-colors",
                         isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs font-medium">{label}</span>
                    </div>
                    </Link>
                );
                })}
            </div>
        </nav>
      )
  }

  // Swipeable Tabs Nav
  return (
    <nav className="bg-card border-t h-16 z-20 w-full flex-shrink-0">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {mainNavItems.map(({ label, icon: Icon }, index) => {
          const isActive = activeTab === index;
          return (
            <button key={label} onClick={() => onTabChange?.(index)} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            </button>
          );
        })}
         <Link key="View" href="/view" className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors"
                )}
              >
                <Video className="h-6 w-6" />
                <span className="text-xs font-medium">View</span>
              </div>
        </Link>
      </div>
    </nav>
  );
}
