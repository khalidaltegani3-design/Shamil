"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CircleDot, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Chats", icon: MessageSquare },
  { href: "/status", label: "Status", icon: CircleDot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t h-16 md:hidden">
      <div className="flex justify-around items-center h-full">
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
