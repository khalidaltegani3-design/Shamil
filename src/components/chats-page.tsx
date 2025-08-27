
"use client";

import * as React from 'react';
import { chats as initialChats, users, type Chat, type Message } from '@/lib/mock-data';
import ChatList from '@/components/chat-list';
import ChatView from '@/components/chat-view';
import { MoreVertical, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function ChatsPage() {
  const [chats, setChats] = React.useState<Chat[]>(initialChats);
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const currentUser = users[0]; // Assume the first user is the current user

  const handleSendMessage = (chatId: string, content: string, quotedMessage?: Message) => {
    if (!content.trim() && !quotedMessage) return;

    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          const newMessage: Message = {
            id: `msg-${Date.now()}`,
            sender: currentUser,
            content: content,
            timestamp: new Date().toISOString(),
            quotedMessage: quotedMessage,
            reactions: []
          };
          // Create a new messages array and a new chat object
          const updatedMessages = [...chat.messages, newMessage];
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });
    });
  };

  const selectedChatData = chats.find(c => c.id === selectedChat?.id);

  if (selectedChatData) {
     return (
        <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
            <ChatView
              key={selectedChatData.id}
              chat={selectedChatData}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedChat(null)}
            />
        </div>
     )
  }

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
        <aside className="h-full w-full flex-shrink-0 flex flex-col">
           <header className="flex flex-col gap-3 p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary">Zoliapp</h1>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>New Group</DropdownMenuItem>
                         <DropdownMenuItem>New Broadcast</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search chats..." className="pl-10" />
                </div>
            </header>
            <ChatList
                chats={chats}
                selectedChatId={selectedChat?.id}
                onSelectChat={(chat) => setSelectedChat(chat)}
                currentUser={currentUser}
            />
        </aside>
    </div>
  );
}
