"use client";

import type { Chat, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, MessageSquarePlus } from "lucide-react";
import { Button } from "./ui/button";

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | undefined;
  onSelectChat: (chat: Chat) => void;
  currentUser: User;
}

export default function ChatList({ chats, selectedChatId, onSelectChat, currentUser }: ChatListProps) {
  const getChatDisplayInfo = (chat: Chat) => {
    if (chat.type === 'group') {
      return {
        avatarUrl: chat.avatarUrl,
        name: chat.name,
      };
    } else {
      const otherUser = chat.members.find(member => member.id !== currentUser.id);
      return {
        avatarUrl: otherUser?.avatarUrl,
        name: otherUser?.name || 'Unknown User',
      };
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Zoliapp Lite</h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search chats..." className="pl-9 bg-background" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {chats.map((chat) => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            const { avatarUrl, name } = getChatDisplayInfo(chat);
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={cn(
                  "flex items-center gap-3 w-full text-left p-2 rounded-lg transition-colors",
                  selectedChatId === chat.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent/50"
                )}
              >
                <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary transition-colors">
                  <AvatarImage src={avatarUrl} alt={name} data-ai-hint="avatar person" />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage?.content || "No messages yet"}
                  </p>
                </div>
                {lastMessage && (
                  <time className="text-xs text-muted-foreground self-start">
                    {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </time>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>
       <div className="p-4 border-t">
        <Button className="w-full" variant="outline">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
    </div>
  );
}
