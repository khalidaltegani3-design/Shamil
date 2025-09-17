
"use client";

import Link from "next/link";
import {
  Bell,
  Home,
  Users,
  LogOut,
  Settings,
  Menu,
  Search,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User as UserIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { initialUsers } from "@/lib/users";

type User = typeof initialUsers[0];

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // In a real app, you'd get the user from an auth context.
    // Here, we simulate it by finding the admin user from our mock data.
    const user = initialUsers.find(u => u.id === "E-1023"); // Assuming E-1023 is the logged-in admin
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40" dir="rtl">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/supervisor"
                className="group flex h-10 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold text-primary-foreground md:text-base"
              >
                 <div className="flex h-8 w-auto px-4 items-center justify-center rounded text-sm font-semibold">
                    <h1 className="text-3xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
                 </div>
              </Link>
              <Link
                href="/supervisor"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
                لوحة المعلومات
              </Link>
              {isAdmin && (
                 <Link
                  href="/supervisor/users"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  إدارة المستخدمين
                </Link>
              )}
               {isAdmin && (
                <Link
                  href="/supervisor/gamification"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Trophy className="h-5 w-5" />
                  النقاط والمكافآت
                </Link>
              )}
               {isAdmin && (
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                  الإعدادات
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full flex-1 items-center justify-between">
           <div className="flex items-center gap-4">
               <h1 className="text-3xl font-amiri font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-normal">شامل</h1>
               <Separator orientation="vertical" className="h-8" />
               <h2 className="text-xl font-semibold">صندوق البلاغات</h2>
           </div>
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث..."
              className="w-full rounded-lg bg-background pl-8"
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <UserIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">خالد الأحمد</p>
                <p className="text-xs leading-none text-muted-foreground">
                  E-1023
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>الإعدادات</DropdownMenuItem>
            <DropdownMenuItem>إعادة ضبط كلمة السر</DropdownMenuItem>
            <DropdownMenuSeparator />
             <Link href="/login" passHref>
                <DropdownMenuItem>
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
      </main>
    </div>
  );
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator";

