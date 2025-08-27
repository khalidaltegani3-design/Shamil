
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send } from 'lucide-react';
import { users as allUsers } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

interface ShareSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  videoCaption: string;
}

export default function ShareSheet({ isOpen, onOpenChange, videoCaption }: ShareSheetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  // Exclude current user from the list
  const currentUser = allUsers[0];
  const contacts = allUsers.filter(u => u.id !== currentUser.id);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSend = (contact: User) => {
    toast({
      title: 'Sent!',
      description: `Video shared with ${contact.name}.`,
    });
    onOpenChange(false);
    setSearchTerm('');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[65vh] flex flex-col p-0 rounded-2xl">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Share with</DialogTitle>
          <DialogDescription className="sr-only">Share this video with your contacts.</DialogDescription>
        </DialogHeader>

        <div className="p-4 border-b">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search contacts..."
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
                <div key={contact.id} className="flex items-center p-2 rounded-lg hover:bg-accent/50 transition-colors gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <p className="font-semibold">{contact.name}</p>
                  </div>
                  <Button onClick={() => handleSend(contact)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No contacts found.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
