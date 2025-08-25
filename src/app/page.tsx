"use client";

import * as React from 'react';
import { chats as initialChats, users, type Chat, type Message } from '@/lib/mock-data';
import ChatList from '@/components/chat-list';
import ChatView from '@/components/chat-view';
import { MessageSquare } from 'lucide-react';

export default function Home() {
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
           <header className="p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-primary">Chats</h1>
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
