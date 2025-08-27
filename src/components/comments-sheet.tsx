
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '@/lib/types';

interface CommentsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  comments: Comment[];
  commentCount: number;
  onAddComment: (commentText: string) => void;
}

const ClientTimeAgo = ({ timestamp, children }: { timestamp: string, children: (formattedTime: string) => React.ReactNode }) => {
  const [timeAgo, setTimeAgo] = React.useState('');

  React.useEffect(() => {
    const update = () => {
        try {
            setTimeAgo(formatDistanceToNow(new Date(timestamp), { addSuffix: true }))
        } catch (e) {
            // ignore invalid date error
        }
    };
    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timestamp]);

  if (!timeAgo) {
    return null; 
  }

  return <>{children(timeAgo)}</>;
};


export default function CommentsSheet({ isOpen, onOpenChange, comments, commentCount, onAddComment }: CommentsSheetProps) {
  const [newComment, setNewComment] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  useEffect(() => {
    if(isOpen) {
        setTimeout(() => {
            if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
                if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                }
            }
        }, 100)
    }
  }, [isOpen, comments.length])

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75vh] flex flex-col p-0 rounded-t-2xl">
        <SheetHeader className="text-center p-4 border-b">
          <SheetTitle>{commentCount.toLocaleString()} Comments</SheetTitle>
          <SheetDescription className="sr-only">A list of comments for the video.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">@{comment.user.name}</p>
                    <p className="text-sm font-medium">{comment.text}</p>
                     <ClientTimeAgo timestamp={comment.timestamp}>
                        {(time) =>  <p className="text-xs text-muted-foreground mt-1">{time}</p>}
                    </ClientTimeAgo>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No comments yet.</p>
                <p className="text-sm">Be the first to comment!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Your avatar" />
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newComment.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
