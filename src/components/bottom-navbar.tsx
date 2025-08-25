"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, CircleDot, Settings, Phone, Clapperboard, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Chats", icon: MessageSquare },
  { href: "/status", label: "Status", icon: CircleDot },
  { href: "/create", label: "Create", icon: PlusSquare },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  
  if (pathname === '/create' || pathname === '/view') {
      return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t h-16 md:hidden z-20">
      <div className="flex justify-around items-center h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          if (href === "/view") return null;

          if(href === "/create"){
            return (
                 <Link key={label} href={href} className="flex-1">
                    <div className="flex justify-center">
                         <div className="h-10 w-14 flex items-center justify-center bg-primary text-primary-foreground rounded-lg">
                            <Icon className="h-6 w-6" />
                        </div>
                    </div>
                 </Link>
            )
          }

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
