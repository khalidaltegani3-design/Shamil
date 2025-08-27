
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { users as allUsers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NewChatPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Exclude current user from the list
  const currentUser = allUsers[0];
  const contacts = allUsers.filter(u => u.id !== currentUser.id);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact as any).phone?.includes(searchTerm) // Assuming contacts might have phone numbers
  );

  const handleSelectContact = (contact: any) => {
    // In a real app, you would check if a chat with this contact
    // already exists. If not, create a new one. Then navigate to the chat.
    // For this prototype, we'll just navigate back to the chats page.
    router.push('/chats');
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="flex items-center gap-3 p-3 border-b h-16 flex-shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">New Chat</h1>
          <p className="text-sm text-muted-foreground">{contacts.length} contacts</p>
        </div>
      </header>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search contacts or enter number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">Hey there! I am using Zoliapp.</p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>No contacts found.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
