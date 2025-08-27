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
  { href: "/view", label: "View", icon: Video },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  if (pathname.startsWith('/profile/') || pathname === '/create') {
      return null;
  }

  return (
    <nav className="bg-card border-t h-16 z-20 w-full flex-shrink-0">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link href={href} key={label} className="flex-1">
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
  );
}
