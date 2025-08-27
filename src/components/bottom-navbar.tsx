
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
    <nav className="flex justify-around items-center h-16 border-t bg-background sticky bottom-0 z-50">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
            <Link href={href} key={label} className="flex-1 py-2">
                <div
                    className={cn(
                    "flex flex-col items-center gap-1 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{label}</span>
                </div>
            </Link>
        );
        })}
    </nav>
  );
}
