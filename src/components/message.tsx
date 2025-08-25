"use client";

import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { CornerDownLeft, Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";

interface MessageProps {
  message: Message;
  isSender: boolean;
  onReply: (message: Message) => void;
}

export default function MessageComponent({ message, isSender, onReply }: MessageProps) {
  const emojis = ['❤️', '👍', '😂', '😮', '😢', '🙏'];
  
  return (
    <div className={cn("group flex items-start gap-3 w-full", isSender && "flex-row-reverse")}>
      {!isSender && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} data-ai-hint="avatar user"/>
          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col max-w-xs md:max-w-md", isSender ? "items-end" : "items-start")}>
        <div
          className={cn(
            "relative rounded-xl px-4 py-3 shadow-sm",
            isSender
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-card text-card-foreground rounded-bl-none"
          )}
        >
          {!isSender && <p className="text-xs font-semibold text-primary mb-1">{message.sender.name}</p>}
          
          {message.quotedMessage && (
            <div className="mb-2 p-2 bg-black/10 rounded-md border-l-2 border-primary/50 text-sm">
              <p className="font-semibold">{message.quotedMessage.sender.name}</p>
              <p className="truncate opacity-80">{message.quotedMessage.content}</p>
            </div>
          )}

          <p className="whitespace-pre-wrap">{message.content}</p>

           <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-card border rounded-full shadow-sm"
            style={isSender ? { left: '-1rem', transform: 'translateX(-100%)' } : { right: '-1rem', transform: 'translateX(100%)' }}>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1">
                 <div className="flex gap-1">
                    {emojis.map(emoji => (
                        <button key={emoji} className="text-lg p-1 rounded-md hover:bg-accent transition-colors">{emoji}</button>
                    ))}
                 </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onReply(message)}>
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </div>

        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
             {/* This is a simplified reaction display. A real app would group them. */}
            {message.reactions.slice(0, 3).map((reaction, index) => (
              <Badge key={index} variant="secondary" className="text-xs py-0.5 px-1.5 cursor-pointer">
                {reaction.emoji} 1
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </p>
      </div>
    </div>
  );
}
