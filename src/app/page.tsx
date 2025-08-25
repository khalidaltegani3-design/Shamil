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

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <div className="flex flex-1 h-full">
        <aside
          className={
            `h-full w-full md:w-80 lg:w-96 flex-shrink-0 border-r bg-card/80 backdrop-blur-sm
             md:flex flex-col
             ${selectedChat ? 'hidden' : 'flex'}`
          }
        >
          <ChatList
            chats={chats}
            selectedChatId={selectedChat?.id}
            onSelectChat={(chat) => setSelectedChat(chat)}
            currentUser={currentUser}
          />
        </aside>
        <main
          className={
            `flex-1 flex-col h-full
             md:flex
            ${selectedChat ? 'flex' : 'hidden'}`
          }
        >
          {selectedChatData ? (
            <ChatView
              key={selectedChatData.id}
              chat={selectedChatData}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center p-4">
              <div className="text-center flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold">Welcome to Zoliapp Lite</h2>
                  <p className="text-muted-foreground">Select a conversation to start messaging.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
