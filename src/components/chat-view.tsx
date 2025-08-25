"use client";

import type { Chat, Message, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageComponent from "@/components/message";
import MessageInput from "@/components/message-input";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import * as React from 'react';
import { Button } from "./ui/button";

interface ChatViewProps {
  chat: Chat;
  currentUser: User;
  onSendMessage: (chatId: string, content: string, quotedMessage?: Message) => void;
  onBack: () => void;
}

export default function ChatView({ chat, currentUser, onSendMessage, onBack }: ChatViewProps) {
  const [quotedMessage, setQuotedMessage] = React.useState<Message | undefined>(undefined);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const getChatDisplayInfo = (chat: Chat) => {
    if (chat.type === 'group') {
      return {
        avatarUrl: chat.avatarUrl,
        name: chat.name,
        description: `${chat.members.length} members`,
      };
    } else {
      const otherUser = chat.members.find(member => member.id !== currentUser.id);
      return {
        avatarUrl: otherUser?.avatarUrl,
        name: otherUser?.name || 'Unknown User',
        description: otherUser?.isOnline ? 'Online' : 'Offline',
      };
    }
  };

  const { avatarUrl, name, description } = getChatDisplayInfo(chat);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [chat.messages]);

  const handleReply = (message: Message) => {
    setQuotedMessage(message);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 sticky top-0 bg-card/95 z-10">
        <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={name} data-ai-hint="avatar profile" />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
            </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
         <ScrollArea className="h-full" ref={scrollAreaRef}>
             <div className="p-4 md:p-6 space-y-6">
                {chat.messages.map((message) => (
                    <MessageComponent
                        key={message.id}
                        message={message}
                        isSender={message.sender.id === currentUser.id}
                        onReply={handleReply}
                    />
                ))}
            </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t flex-shrink-0 bg-card/50 sticky bottom-0">
        <MessageInput
          chatId={chat.id}
          onSendMessage={onSendMessage}
          quotedMessage={quotedMessage}
          clearQuotedMessage={() => setQuotedMessage(undefined)}
        />
      </div>
    </div>
  );
}
