"use client";

import type { Chat, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | undefined;
  onSelectChat: (chat: Chat) => void;
  currentUser: User;
}

const ClientTime = ({ timestamp }: { timestamp: string }) => {
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    const update = () => setTime(new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    update();
  }, [timestamp]);


  if (!time) {
    return null; 
  }

  return (
    <time className="text-xs text-muted-foreground self-start">
      {time}
    </time>
  );
};


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
                  <ClientTime timestamp={lastMessage.timestamp} />
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
