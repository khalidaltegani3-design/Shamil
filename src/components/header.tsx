
"use client";

import { Button } from "@/components/ui/button";
import { Menu, MoreVertical } from "lucide-react";
import React from "react";

interface HeaderProps {
    title: string;
    onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
    return (
        <header className="flex items-center justify-between gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/90 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <Button onClick={onMenuClick} variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold text-primary">{title}</h1>
            </div>
             <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
            </Button>
        </header>
    )
}
