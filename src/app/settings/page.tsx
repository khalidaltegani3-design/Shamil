
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Bell, ChevronRight, HelpCircle, Image as ImageIcon, KeyRound, ListVideo, Lock, Palette, UserCircle } from "lucide-react"
import Link from "next/link"
import React from "react"

const settingsOptions = [
    { icon: UserCircle, title: "Account", description: "Privacy, security, change number", href:"/settings/account" },
    { icon: Palette, title: "Appearance", description: "Theme, wallpaper, chat history", href:"/settings/appearance" },
    { icon: ListVideo, title: "Content Preferences", description: "Customize your discover feed", href:"/settings/content-preferences" },
    { icon: Bell, title: "Notifications", description: "Message, group & call tones", href:"/settings/notifications" },
    { icon: KeyRound, title: "Privacy", description: "Block contacts, disappearing messages", href:"/settings/privacy" },
    { icon: Lock, title: "Security", description: "End-to-end encryption", href:"/settings/security" },
    { icon: ImageIcon, title: "Chat Wallpaper", description: "Change your chat wallpaper", href:"/settings/chat-wallpaper" },
    { icon: HelpCircle, title: "Help", description: "Help center, contact us, privacy policy", href:"/settings/help" },
]

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
                <h1 className="text-xl font-bold">Settings</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <Card className="p-4">
                    <Link href="/profile/user-1" className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="User Name" data-ai-hint="user avatar"/>
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold">Your Name</h2>
                            <p className="text-muted-foreground">Your status goes here...</p>
                        </div>
                    </Link>
                </Card>

                <Card className="p-2">
                    {settingsOptions.map((option, index) => (
                        <React.Fragment key={option.title}>
                            <Link href={option.href} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                <option.icon className="w-6 h-6 text-muted-foreground" />
                                <div className="flex-1">
                                    <h3 className="font-medium">{option.title}</h3>
                                    <p className="text-sm text-muted-foreground">{option.description}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </Link>
                            {index < settingsOptions.length - 1 && <Separator />}
                        </React.Fragment>
                    ))}
                </Card>
            </div>
        </div>
    )
}
