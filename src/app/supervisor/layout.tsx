import Link from "next/link";
import {
  Bell,
  Home,
  Users,
  LogOut,
  Settings,
  Menu,
  Search,
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


export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40" dir="rtl">
      <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/supervisor"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                 <div className="flex h-8 w-24 items-center justify-center rounded bg-secondary text-sm font-semibold text-secondary-foreground">
                    الشعار
                 </div>
              </Link>
              <Link
                href="/supervisor"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
                لوحة المعلومات
              </Link>
              <Link
                href="/supervisor/users"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Users className="h-5 w-5" />
                إدارة المستخدمين
              </Link>
              <Link
                href="#"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-5 w-5" />
                الإعدادات
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="بحث..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          />
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
            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>الإعدادات</DropdownMenuItem>
            <DropdownMenuItem>الدعم</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>تسجيل الخروج</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <aside className="fixed inset-y-0 right-0 z-10 hidden w-14 flex-col border-l bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 py-4">
            <Link
              href="#"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <div className="flex h-8 w-24 items-center justify-center rounded bg-secondary text-sm font-semibold text-secondary-foreground transition-all group-hover:scale-110">
                الشعار
              </div>
              <span className="sr-only">منصة البلاغات</span>
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/supervisor"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  >
                    <Home className="h-5 w-5" />
                    <span className="sr-only">لوحة المعلومات</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left">لوحة المعلومات</TooltipContent>
              </Tooltip>
            </TooltipProvider>
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/supervisor/users"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  >
                    <Users className="h-5 w-5" />
                    <span className="sr-only">إدارة المستخدمين</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left">إدارة المستخدمين</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
            <TooltipProvider>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">الإعدادات</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="left">الإعدادات</TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </nav>
        </aside>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
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

