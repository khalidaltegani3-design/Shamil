"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CircleDot, Phone, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

const navItems = [
  { href: "/", label: "Chats", icon: MessageSquare },
  { href: "/status", label: "Status", icon: CircleDot },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/view", label: "View", icon: Video },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isVideoPage = pathname === '/view';

  if (pathname === '/create') {
      return null;
  }

  if (isVideoPage && !isExpanded) {
    return (
        <div 
            className="fixed bottom-0 left-0 right-0 h-8 flex justify-center items-center z-20 cursor-pointer bg-gradient-to-t from-black/50 to-transparent"
            onClick={() => setIsExpanded(true)}
        >
            <div className="w-16 h-1 bg-white/70 rounded-full"/>
        </div>
    );
  }

  return (
    <nav className={cn(
        "fixed bottom-0 left-0 right-0 bg-card border-t h-16 z-20",
        isVideoPage && "bg-card/80 backdrop-blur-sm"
    )}>
      {isVideoPage && (
         <button onClick={() => setIsExpanded(false)} className="absolute -top-8 right-2 bg-card/80 text-foreground rounded-full p-1 z-30">
            <X className="h-4 w-4"/>
         </button>
      )}
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link key={label} href={href} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors",
                  isActive && "text-primary"
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
  );
}
