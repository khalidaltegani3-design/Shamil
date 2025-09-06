
"use client";

import BottomNavbar from "@/components/bottom-navbar";
import Header from "@/components/header";
import SideNavbar from "@/components/side-navbar";
import { useState } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <SideNavbar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomNavbar />
    </div>
  );
}
